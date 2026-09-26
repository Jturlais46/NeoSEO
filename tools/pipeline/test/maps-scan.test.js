import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '../../audit-visual/node_modules/playwright/index.mjs';
import { extractPlace, extractReviews, parseRelative, parseAddress } from '../src/maps-scan.js';
import { toProspect } from '../src/normalize.js';
import { ROOT } from '../src/config.js';

test('relative review dates and addresses parse for both markets', () => {
  const now = 1_800_000_000;
  assert.equal(parseRelative('2 weeks ago', now), now - 14 * 86400);
  assert.equal(parseRelative('a month ago', now), now - 30 * 86400);
  assert.equal(parseRelative('Edited 3 days ago', now), now - 3 * 86400);
  assert.deepEqual(parseAddress('12, Jalan SS 2/24, SS 2, 47300 Petaling Jaya, Selangor, Malaysia', 'MY'), { city: 'Petaling Jaya', state: 'Selangor' });
  assert.deepEqual(parseAddress('1200 E 6th St, Austin, TX 78702, United States', 'US'), { city: 'Austin', state: 'Texas' });
});

test('place panel extraction reads the listing and feeds toProspect', { timeout: 60000 }, async () => {
  const html = await readFile(path.join(ROOT, 'tools/pipeline/fixtures/maps-place.html'), 'utf8');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html);
    const p = await extractPlace(page);
    assert.equal(p.name, 'Kopitiam Seri Mawar');
    assert.equal(p.category, 'Restaurant');
    assert.equal(p.rating, 3.9);
    assert.equal(p.reviews, 27);
    assert.equal(p.photos_count, 9);
    assert.equal(p.phone, '03-7800 0012');
    assert.equal(p.verified, false); // "Own this business?" link present = unclaimed
    assert.equal(p.working_hours.Monday, '7 AM–3 PM');
    assert.equal(p.place_id_in_page, 'ChIJ0000KopitiamSeriMawar0000');
    assert.equal(p.photo_urls.length, 2);
    assert.match(p.photo_urls[0], /=w900-h600-k-no$/);

    const reviews = await extractReviews(page);
    assert.equal(reviews.length, 2); // duplicate review node dropped
    assert.equal(reviews[0].review_rating, 5);
    assert.equal(reviews[0].author_reviews_count, 64);
    assert.equal(reviews[0].owner_answer, 'Terima kasih Aisyah!');
    assert.equal(reviews[1].owner_answer, null);

    const now = 1_800_000_000;
    const prospect = toProspect(
      { ...p, place_id: 'x', time_zone: 'Asia/Kuala_Lumpur', reviews_data: [] },
      { reviews: reviews.map((r) => ({ ...r, review_timestamp: parseRelative(r.review_when, now) })), now, weekday: 'Tuesday' },
    );
    assert.equal(prospect.phone, '+60378000012');
    assert.equal(prospect.is_claimed, false);
    assert.equal(prospect.reviews_last_90d, 1);
    assert.equal(prospect.owner_reply_rate, 0.5);
    assert.equal(prospect.hours_today, 'Closes 3 PM');
  } finally {
    await browser.close();
  }
});
