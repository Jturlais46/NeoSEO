import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { WEIGHTS, scoreProfile, leadPriority, competitorMedian } from './score.js';
import { projectProfile, estimateDistribution, averageOf, defaultReviewsPerMonth } from './projection.js';
import { capturePanel } from './capture.js';

const perfect = {
  is_claimed: true, primary_category: 'Italian restaurant', primary_category_specific: true,
  secondary_categories: ['a', 'b', 'c'], has_description: true, has_hours: true, has_website: true,
  has_services_or_menu: true, photo_count: 40, review_count: 300, rating: 4.8, reviews_last_90d: 20,
  owner_reply_rate: 1, last_update_days_ago: 3,
};
const sum = (d) => Object.values(d).reduce((a, b) => a + b, 0);

test('weights sum to 100', () => {
  assert.equal(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 100);
});

test('a complete, active profile scores 100 with no findings', () => {
  const { score, findings } = scoreProfile(perfect, { competitors: [{ review_count: 100 }] });
  assert.equal(score, 100);
  assert.deepEqual(findings, []);
});

test('an empty profile scores 0', () => {
  assert.equal(scoreProfile({}).score, 0);
});

test('estimated distribution sums to the count and averages near the rating', () => {
  const d = estimateDistribution(4.2, 31);
  assert.equal(sum(d), 31);
  assert.ok(Math.abs(averageOf(d) - 4.2) < 0.15);
});

test('projection adds reviews at the chosen pace and keeps the distribution consistent', () => {
  const p = { review_count: 31, rating: 4.2 };
  const after = projectProfile(p, { projected_reviews_per_month: 20 }, [], { months: 3 });
  assert.equal(after.review_count, 91);
  assert.equal(sum(after.rating_distribution), 91);
  assert.equal(after.rating, Math.round(averageOf(after.rating_distribution) * 10) / 10);
});

test('projected rating never drops below today', () => {
  const after = projectProfile({ review_count: 50, rating: 4.9 }, { projected_reviews_per_month: 10 }, []);
  assert.ok(after.rating >= 4.9);
});

test('default pace closes the gap to the local median within 8-30 a month', () => {
  const comps = [{ review_count: 264 }, { review_count: 187 }, { review_count: 142 }];
  assert.equal(defaultReviewsPerMonth({ review_count: 31 }, comps), 30);
  assert.equal(defaultReviewsPerMonth({ review_count: 170 }, comps), 8);
  assert.equal(defaultReviewsPerMonth({ review_count: 500 }, comps), 8);
});

test('projected profile scores at least as high as today', () => {
  const p = { rating: 4.0, review_count: 5, photo_count: 30, owner_reply_rate: 0.5 };
  assert.ok(scoreProfile(projectProfile(p, {})).score >= scoreProfile(p).score);
});

test('competitor median handles even and odd counts', () => {
  assert.equal(competitorMedian([{ review_count: 10 }, { review_count: 30 }, { review_count: 20 }]), 20);
  assert.equal(competitorMedian([{ review_count: 10 }, { review_count: 30 }]), 20);
  assert.equal(competitorMedian([]), null);
});

test('closed businesses and uncontactable leads are deprioritized', () => {
  assert.equal(leadPriority({ ...perfect, permanently_closed: true }), 0);
  const weak = { review_count: 20, email: 'a@b.c' };
  assert.ok(leadPriority(weak) > leadPriority({ review_count: 20 }));
});

test('capture screenshots the labelled main panel of a page', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cap-'));
  const html = path.join(dir, 'maps.html');
  await writeFile(html, '<body style="margin:0"><div role="main" aria-label="Ember &amp; Oak Coffee" style="width:408px;height:600px;background:#fff">panel</div><div style="width:800px;height:600px;background:#ccc">map</div></body>');
  const out = path.join(dir, 'shot.png');
  await capturePanel({ url: pathToFileURL(html).href, out, height: 700 });
  assert.ok((await stat(out)).size > 0);
});
