import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WEIGHTS, scoreProfile, leadPriority, competitorMedian } from './score.js';
import { applyProposal } from './proposal.js';

const perfect = {
  is_claimed: true, primary_category: 'Italian restaurant', primary_category_specific: true,
  secondary_categories: ['a', 'b', 'c'], has_description: true, has_hours: true, has_website: true,
  has_services_or_menu: true, photo_count: 40, review_count: 300, rating: 4.8, reviews_last_90d: 20,
  owner_reply_rate: 1, last_update_days_ago: 3,
};

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

test('setup never changes review metrics (no promised ratings)', () => {
  const before = { rating: 4.1, review_count: 12, reviews_last_90d: 1 };
  const after = applyProposal(before, { primary_category: 'Bakery', description: 'x' });
  assert.equal(after.rating, 4.1);
  assert.equal(after.review_count, 12);
  assert.equal(after.reviews_last_90d, 1);
});

test('after-setup score is at least the current score', () => {
  const p = { rating: 4.0, review_count: 5, photo_count: 30, owner_reply_rate: 0.5 };
  assert.ok(scoreProfile(applyProposal(p, {})).score >= scoreProfile(p).score);
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
