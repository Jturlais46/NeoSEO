#!/usr/bin/env node
// Warm pipeline bot.
//   node src/cli.js daily [--send]        keep the ready-to-call queue full, prepare leads, build today's call sheet (and call)
//   node src/cli.js source [--target id]  pull listings from Google Maps (Outscraper) for the targets in config/targets.yaml
//   node src/cli.js prepare [--limit N]   qualify, write the tailored proposal (Claude), render visuals
//   node src/cli.js callsheet             rank ready leads into data/callsheets/<date>.csv/.json
//   node src/cli.js call [--send] [--max N]  place Bland calls for callable leads (dry-run by default)
//   node src/cli.js status                counts per stage
//   node src/cli.js demo                  full run on fixtures, offline, stub proposals, dry-run calls
// Env: OUTSCRAPER_API_KEY, ANTHROPIC_API_KEY (or `ant auth login`), BLAND_API_KEY, BLAND_PATHWAY_FIRST_CALL,
//      BLAND_FROM_NUMBER, BLAND_VOICE, BLAND_WEBHOOK_URL, FOUNDER_FIRST_NAME, PIPELINE_MODEL, PIPELINE_DATA_DIR

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '../../audit-visual/node_modules/playwright/index.mjs';
import { renderProspect, copyFonts } from '../../audit-visual/src/render.js';
import { ROOT, DATA_DIR, loadConfig, marketOf } from './config.js';
import * as outscraper from './outscraper.js';
import { toProspect, pickCompetitors } from './normalize.js';
import { qualify } from './qualify.js';
import { generateProposal, stubProposal } from './propose.js';
import { listLeads, saveLead, addEvent, upsertSourced } from './store.js';
import { callBlocker, callPayload, placeCall } from './bland.js';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : dflt);
const compact = (p) => ({ place_id: p.place_id, name: p.name, reviews: p.reviews, rating: p.rating, category: p.category || p.type, photo: p.photo, business_status: p.business_status });

// Source: search each target's query; everything returned becomes a lead at stage "sourced".
export async function source(config, { targetId, search = outscraper.searchPlaces } = {}) {
  let added = 0;
  for (const target of config.targets.filter((t) => !targetId || t.id === targetId)) {
    const market = marketOf(config, target.market);
    const places = await search(target.query, { limit: target.limit || 40, language: target.locale, region: market.region });
    const compactList = places.map(compact);
    for (const [i, place] of places.entries()) {
      if (!place.place_id) continue;
      await upsertSourced({ place, rank: i + 1, target, searchPlaces: compactList });
      added++;
    }
    console.log(`source ${target.id}: ${places.length} listings for "${target.query}"`);
  }
  return added;
}

async function photoLibrary(vertical) {
  const dir = path.join(ROOT, 'assets/photo-library', vertical || 'default');
  try {
    return (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => ({ src: path.join(dir, f) }));
  } catch { return []; }
}

// Prepare: listing -> facts -> qualify -> tailored proposal -> visuals. Leads end "ready" or "gated_out".
export async function prepare(config, { limit = 50, fetchReviews = outscraper.fetchReviews, fetchPhotos = outscraper.fetchPhotos, propose, now } = {}) {
  const brandBase = JSON.parse(await readFile(path.join(ROOT, 'tools/audit-visual/brand.json'), 'utf8'));
  const leads = (await listLeads((l) => l.stage === 'sourced' && !l.suppressed)).slice(0, limit);
  if (!leads.length) { console.log('prepare: nothing to prepare'); return []; }
  const ids = leads.map((l) => l.place_id);
  const [reviews, photos] = await Promise.all([fetchReviews(ids), fetchPhotos(ids)]);
  const outDir = path.join(DATA_DIR, 'audits');
  await copyFonts(outDir);
  const browser = await chromium.launch();
  const ready = [];
  try {
    for (const lead of leads) {
      const target = config.targets.find((t) => t.id === lead.target_id) || config.targetDefaults;
      const market = marketOf(config, lead.market);
      const prospect = toProspect(lead.raw, {
        reviews: reviews[lead.place_id] || [], photos: photos[lead.place_id] || [], rank: lead.rank_today,
        locale: lead.locale, countryCode: market.phone_country_code, now,
      });
      prospect.vertical = lead.vertical;
      const competitors = pickCompetitors(lead.search_places || [], lead.place_id);
      const q = qualify(prospect, competitors, target.rules);
      Object.assign(lead, { prospect, competitors, score: q.score, segment: q.segment, priority: q.priority, state: lead.raw.state || null });
      if (!q.ok) {
        lead.stage = 'gated_out'; lead.gated_reason = q.reason;
        await saveLead(addEvent(lead, 'gated_out', { reason: q.reason, score: q.score }));
        continue;
      }
      const library = await photoLibrary(lead.vertical);
      try {
        lead.proposal = propose
          ? await propose(prospect, competitors, { locale: lead.locale, vertical: lead.vertical }, library)
          : await generateProposal(prospect, competitors, { locale: lead.locale, vertical: lead.vertical, photoLibrary: library });
      } catch (err) {
        await saveLead(addEvent(lead, 'proposal_failed', { error: err.message }));
        console.error(`prepare ${lead.business_name}: ${err.message}`);
        continue;
      }
      const data = {
        token: lead.lead_id.replace(/[^\w-]/g, '').slice(0, 40), locale: lead.locale, market: lead.market,
        audit_date: new Date().toLocaleDateString(lead.locale === 'zh' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        projection_months: 3, search_query: lead.search_query, prospect, competitors, proposal: lead.proposal, links: target.links || {},
      };
      const brand = { ...brandBase, price: market.price_label?.keep || brandBase.price, locale: lead.locale };
      const audit = await renderProspect({ browser, data, baseDir: ROOT, outDir, brand, locale: lead.locale, variants: target.variants });
      Object.assign(lead, { audit, stage: 'ready', needs_review: lead.proposal.confidence === 'low' });
      await saveLead(addEvent(lead, 'ready', { score: q.score, reviews_projected: audit.reviews_projected }));
      ready.push(lead);
      console.log(`ready: ${lead.business_name} [${q.segment}] score ${audit.score_today}->${audit.score_projected}, reviews ${audit.reviews_today}->${audit.reviews_projected}`);
    }
  } finally {
    await browser.close();
  }
  return ready;
}

// Call sheet: callable leads ranked by priority, with the reason any lead cannot be called now.
export async function callsheet(config, { now = new Date() } = {}) {
  const leads = await listLeads((l) => ['ready', 'called'].includes(l.stage) && !l.suppressed);
  const rows = leads.map((lead) => {
    const market = marketOf(config, lead.market);
    return { lead, blocker: callBlocker(lead, market, { now }), market };
  }).sort((a, b) => (a.blocker ? 1 : 0) - (b.blocker ? 1 : 0) || (b.lead.priority || 0) - (a.lead.priority || 0));
  const day = now.toISOString().slice(0, 10);
  const dir = path.join(DATA_DIR, 'callsheets');
  await mkdir(dir, { recursive: true });
  const csv = ['priority,business,phone,segment,score_today,reviews_today,reviews_projected,rating_today,rating_projected,attempts,status,card']
    .concat(rows.map(({ lead, blocker }) => [lead.priority, `"${lead.business_name.replace(/"/g, '""')}"`, lead.prospect?.phone, lead.segment,
      lead.audit?.score_today, lead.audit?.reviews_today, lead.audit?.reviews_projected, lead.audit?.rating_today, lead.audit?.rating_projected,
      lead.call_attempts || 0, blocker || 'callable', lead.audit ? path.relative(ROOT, path.join(lead.audit.dir, 'card.png')) : ''].join(',')));
  await writeFile(path.join(dir, `${day}.csv`), csv.join('\n'));
  await writeFile(path.join(dir, `${day}.json`), JSON.stringify(rows.map(({ lead, blocker, market }) => ({
    lead_id: lead.lead_id, business_name: lead.business_name, blocker, payload: blocker ? null : callPayload(lead, lead.audit, market),
  })), null, 2));
  console.log(`callsheet ${day}: ${rows.filter((r) => !r.blocker).length} callable of ${rows.length} (data/callsheets/${day}.csv)`);
  return rows;
}

export async function call(config, { send = false, max = 50, now = new Date() } = {}) {
  const rows = (await callsheet(config, { now })).filter((r) => !r.blocker).slice(0, max);
  for (const { lead, market } of rows) {
    const payload = callPayload(lead, lead.audit, market);
    if (!send) { console.log(`[dry-run] would call ${lead.business_name} ${payload.phone_number} (${payload.pathway_id ? 'pathway' : 'task'})`); continue; }
    try {
      const res = await placeCall(payload);
      Object.assign(lead, { stage: 'called', call_attempts: (lead.call_attempts || 0) + 1, last_call_at: new Date().toISOString(), last_call_id: res.call_id });
      await saveLead(addEvent(lead, 'call_placed', { call_id: res.call_id, flow: 'first_call' }));
      console.log(`called ${lead.business_name}: ${res.call_id}`);
    } catch (err) {
      await saveLead(addEvent(lead, 'call_failed', { error: err.message }));
      console.error(`call ${lead.business_name}: ${err.message}`);
    }
  }
  return rows.length;
}

export async function status() {
  const leads = await listLeads();
  const by = leads.reduce((m, l) => ({ ...m, [l.stage]: (m[l.stage] || 0) + 1 }), {});
  console.log(JSON.stringify(by, null, 2));
  return by;
}

export async function daily(config, deps = {}) {
  for (const target of config.targets) {
    const ready = (await listLeads((l) => l.target_id === target.id && l.stage === 'ready')).length;
    if (ready < (target.ready_buffer ?? 100)) await source(config, { targetId: target.id, search: deps.search });
  }
  await prepare(config, { limit: config.targetDefaults.per_run_limit || 50, ...deps });
  return call(config, { send: deps.send, now: deps.now });
}

// Offline end-to-end run on fixtures: no API keys, stub proposals, dry-run calls.
async function demo() {
  process.env.PIPELINE_DATA_DIR ||= path.join(ROOT, 'data/demo');
  const fx = (f) => readFile(path.join(ROOT, 'tools/pipeline/fixtures/outscraper', f), 'utf8').then(JSON.parse);
  const [search, reviews, photos] = await Promise.all([fx('search.json'), fx('reviews.json'), fx('photos.json')]);
  const config = await loadConfig();
  config.targets = [{ ...config.targetDefaults, id: 'demo-pj-kopitiam', market: 'MY', locale: 'en', vertical: 'cafe', query: search.query, consent_status: 'prior_approval', ready_buffer: 100 }];
  const now = new Date(search.now);
  await daily(config, {
    search: async () => search.places,
    fetchReviews: async (ids) => Object.fromEntries(ids.map((id) => [id, reviews[id] || []])),
    fetchPhotos: async (ids) => Object.fromEntries(ids.map((id) => [id, photos[id] || []])),
    propose: async (p, c, o, lib) => stubProposal(p, c, o, lib),
    now,
  });
  await status();
}

async function main() {
  const [cmd] = args;
  if (cmd === 'demo') return demo();
  const config = await loadConfig();
  if (cmd === 'source') return source(config, { targetId: opt('target') });
  if (cmd === 'prepare') return prepare(config, { limit: Number(opt('limit', 50)) });
  if (cmd === 'callsheet') return callsheet(config);
  if (cmd === 'call') return call(config, { send: flag('send'), max: Number(opt('max', 50)) });
  if (cmd === 'daily') return daily(config, { send: flag('send') });
  if (cmd === 'status') return status();
  console.log(await readFile(new URL(import.meta.url), 'utf8').then((s) => s.split('\n').slice(1, 12).join('\n')));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
