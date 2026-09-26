import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { phoneFormats, parseDistribution, closingText, relativeTime, toProspect, pickCompetitors, shortName } from '../src/normalize.js';
import { qualify } from '../src/qualify.js';
import { withinCallingWindow } from '../src/window.js';
import { callBlocker, callPayload } from '../src/bland.js';
import { checkProposal, stubProposal, finalize } from '../src/propose.js';
import { loadConfig, marketOf, ROOT } from '../src/config.js';

const fx = JSON.parse(await readFile(path.join(ROOT, 'tools/pipeline/fixtures/maps-search.json'), 'utf8'));
const my = fx.searches.find((s) => s.market === 'MY').places;
const config = await loadConfig();
const MY = marketOf(config, 'MY');
const US = marketOf(config, 'US');

test('phone formats: E.164 and local display', () => {
  assert.deepEqual(phoneFormats('+60 3-7800 0012', '60'), { e164: '+60378000012', display: '03-7800 0012' });
  assert.equal(phoneFormats('+1 512-555-0104', '1').e164, '+15125550104');
});

test('review distribution parses object and legacy string shapes', () => {
  assert.deepEqual(parseDistribution({ 1: 2, 5: 9 }), { 1: 2, 5: 9 });
  assert.deepEqual(parseDistribution('1: 6, 2: 0, 5: 40'), { 1: 6, 2: 0, 5: 40 });
});

test('closing time handles narrow spaces and locales', () => {
  const hours = { Tuesday: '7 AM–3 PM' };
  assert.equal(closingText(hours, 'Tuesday', 'en'), 'Closes 3 PM');
  assert.equal(closingText(hours, 'Tuesday', 'ms'), 'Tutup pada 3 PTG');
  assert.equal(closingText({ Tuesday: 'Closed' }, 'Tuesday'), null);
});

test('relative dates and short names', () => {
  const now = 1_800_000_000;
  assert.equal(relativeTime(now - 14 * 86400, now, 'en'), '2 weeks ago');
  assert.equal(relativeTime(now - 150 * 86400, now, 'zh'), '5 个月前');
  assert.equal(shortName('Mei Ling Chan'), 'Mei L.');
});

test('prospect facts come from the listing; competitors are those ranked above', () => {
  const place = my.find((p) => p.name === 'Kopitiam Seri Mawar');
  const p = toProspect(place, { reviews: place.reviews_data, rank: 7, now: new Date(fx.now).getTime() / 1000 });
  assert.equal(p.review_count, 27);
  assert.equal(p.has_hours, false);
  assert.equal(p.primary_category_specific, false);
  assert.equal(p.owner_reply_rate, 0);
  const comps = pickCompetitors(my, place.place_id);
  assert.deepEqual(comps.map((c) => c.name), ['Restoran Wah Seng', 'Kopi Kaki SS2', 'Nasi Lemak Kak Yah']);
});

test('qualification gates strong, tiny and closed listings', () => {
  const now = new Date(fx.now).getTime() / 1000;
  const check = (name) => {
    const place = my.find((p) => p.name === name);
    return qualify(toProspect(place, { reviews: place.reviews_data, now }), pickCompetitors(my, place.place_id));
  };
  assert.equal(check('Kopitiam Seri Mawar').ok, true);
  assert.equal(check('Uncle Tan Kopi').reason, 'too_few_reviews');
  assert.equal(check('Old SS2 Canteen').reason, 'closed');
  assert.equal(check('Kafe Bunga Raya').segment, 'unclaimed');
});

test('Malaysian calling windows: between rushes, never Friday prayers, state weekends', () => {
  assert.equal(withinCallingWindow(MY, { date: new Date('2026-09-29T07:30:00Z') }), true);   // Tue 15:30
  assert.equal(withinCallingWindow(MY, { date: new Date('2026-09-29T04:30:00Z') }), false);  // Tue 12:30 lunch rush
  assert.equal(withinCallingWindow(MY, { date: new Date('2026-10-02T05:00:00Z') }), false);  // Fri 13:00 prayers
  assert.equal(withinCallingWindow(MY, { date: new Date('2026-10-04T02:30:00Z') }), false);  // Sun 10:30
  assert.equal(withinCallingWindow(MY, { date: new Date('2026-10-04T02:30:00Z'), state: 'Kelantan' }), true); // Sun is a workday
});

const readyLead = (over = {}) => ({
  lead_id: 'x', business_name: 'Test', market: 'MY', locale: 'en', consent_status: 'none', call_attempts: 0,
  prospect: { phone: '+60378000012', time_zone: 'Asia/Kuala_Lumpur' },
  audit: { reviews_today: 27, reviews_projected: 117, rating_today: 3.9, rating_projected: 4.6, photos_projected: 44, top_findings: ['a'] },
  ...over,
});

test('calls need a call approval on the lead; US calls need a landline', () => {
  const inWindow = new Date('2026-09-29T07:30:00Z');
  assert.equal(callBlocker(readyLead(), MY, { now: inWindow }), 'no_call_approval');
  assert.equal(callBlocker(readyLead({ consent_status: 'client' }), MY, { now: inWindow }), null);
  const us = readyLead({ market: 'US', consent_status: 'client', line_type: 'mobile', prospect: { phone: '+15125550104', time_zone: 'America/Chicago' } });
  assert.equal(callBlocker(us, US, { now: new Date('2026-09-29T15:00:00Z') }), 'line_type_mobile');
});

test('call payload carries the lead language, local time zone and personalized data', () => {
  const p = callPayload(readyLead({ locale: 'ms' }), readyLead().audit, MY);
  assert.equal(p.language, 'ms');
  assert.equal(p.timezone, 'Asia/Kuala_Lumpur');
  assert.equal(p.request_data.reviews_projected, 117);
  assert.match(p.voicemail.message, /ulasan/);
});

test('proposal contract: stub passes, broken proposal is rejected', () => {
  const place = my.find((p) => p.name === 'Kopitiam Seri Mawar');
  const prospect = toProspect(place, { reviews: place.reviews_data });
  const good = stubProposal(prospect, pickCompetitors(my, place.place_id));
  assert.deepEqual(checkProposal(good), []);
  const bad = { ...good, posts: [{ text: 'only one' }] };
  assert.ok(checkProposal(bad).length > 0);
});

test('weak profiles lead with library photos on the 90-day side', () => {
  const prospect = { photos: [{ src: 'own.png' }] };
  const out = finalize(stubProposal({ ...prospect, business_name: 'X', city: 'Y', recent_reviews: [] }, []), prospect, [{ src: 'lib1.png' }, { src: 'lib2.png' }]);
  assert.equal(out.photos[0].src, 'lib1.png');
});

test('offline daily run prepares warm leads for both markets', { timeout: 120000 }, async () => {
  process.env.PIPELINE_DATA_DIR = await mkdtemp(path.join(os.tmpdir(), 'pipe-'));
  const { daily, status } = await import('../src/cli.js');
  const cfg = await loadConfig();
  cfg.targets = fx.searches.map((s) => ({ ...cfg.targetDefaults, ...s }));
  const rows = await daily(cfg, { search: async (q) => fx.searches.find((s) => s.query === q).places, propose: stubProposal, now: new Date(fx.now) });
  const by = await status();
  assert.equal(by.MY.ready, 5);
  assert.equal(by.US.ready, 4);
  assert.equal(rows.length, 9);
  assert.ok(rows.every((r) => r.lead.audit.images.includes('v-phones-portrait.png') && r.lead.audit.images.includes('v-swipe.png')));
});
