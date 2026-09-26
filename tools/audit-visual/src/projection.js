// Projects what the profile looks like after N months with us: setup fixes plus the review
// pace from the stand, cards and follow-up requests. Drives the "after" panel and score.

import { competitorMedian } from './score.js';

const STARS = [5, 4, 3, 2, 1];
// Mix of new reviews when every customer is asked (mostly happy regulars).
const NEW_REVIEW_MIX = { 5: 0.85, 4: 0.1, 3: 0.03, 2: 0.01, 1: 0.01 };
// Share of non-5-star reviews by star (Google distributions are bimodal).
const NON_FIVE_MIX = { 4: 0.2, 3: 0.15, 2: 0.15, 1: 0.5 };

// Split `total` across keys by weight, keeping integers that sum exactly to `total`.
function allocate(total, weights) {
  const raw = STARS.map((s) => [s, total * (weights[s] || 0)]);
  const out = Object.fromEntries(raw.map(([s, v]) => [s, Math.floor(v)]));
  let left = total - Object.values(out).reduce((a, b) => a + b, 0);
  raw.sort((a, b) => (b[1] % 1) - (a[1] % 1));
  for (let i = 0; left > 0; i = (i + 1) % raw.length, left--) out[raw[i][0]] += 1;
  return out;
}

// Estimate a star distribution from rating and count when the data has none.
export function estimateDistribution(rating, count) {
  if (!count) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const nonFive = Math.max(0, Math.min(1, (5 - rating) / (5 - 2.05)));
  const weights = { 5: 1 - nonFive };
  for (const s of [4, 3, 2, 1]) weights[s] = nonFive * NON_FIVE_MIX[s];
  return allocate(count, weights);
}

export function averageOf(dist) {
  const n = STARS.reduce((a, s) => a + (dist[s] || 0), 0);
  if (!n) return null;
  return STARS.reduce((a, s) => a + s * (dist[s] || 0), 0) / n;
}

// Default pace: close the gap to the local median over the window, within 8-30 a month.
export function defaultReviewsPerMonth(profile, competitors = []) {
  const median = competitorMedian(competitors);
  const current = profile.review_count ?? 0;
  if (!median || median <= current) return 8;
  return Math.max(8, Math.min(30, Math.round((median - current) / 3)));
}

export function projectProfile(profile, proposal = {}, competitors = [], { months = 3 } = {}) {
  const perMonth = proposal.projected_reviews_per_month ?? defaultReviewsPerMonth(profile, competitors);
  const added = perMonth * months;
  const count = profile.review_count ?? 0;
  const before = profile.rating_distribution || estimateDistribution(profile.rating ?? 0, count);
  const fresh = allocate(added, NEW_REVIEW_MIX);
  const dist = Object.fromEntries(STARS.map((s) => [s, (before[s] || 0) + fresh[s]]));
  const rating = Math.round(Math.max(profile.rating ?? 0, averageOf(dist)) * 10) / 10;

  return {
    ...profile,
    is_claimed: true,
    primary_category: proposal.primary_category ?? profile.primary_category,
    primary_category_specific: proposal.primary_category ? true : profile.primary_category_specific,
    secondary_categories: proposal.secondary_categories?.length ? proposal.secondary_categories : profile.secondary_categories,
    has_description: Boolean(proposal.description) || Boolean(profile.has_description),
    has_hours: true,
    hours_today: proposal.hours_today ?? profile.hours_today,
    has_website: Boolean(proposal.website_url || profile.has_website),
    website: proposal.website_url ?? profile.website,
    has_services_or_menu: Boolean(proposal.services?.length) || Boolean(profile.has_services_or_menu),
    photo_count: Math.max(profile.photo_count ?? 0, (proposal.setup_photo_count ?? 20) + 8 * months),
    review_count: count + added,
    rating,
    rating_distribution: dist,
    reviews_last_90d: perMonth * Math.min(months, 3),
    owner_reply_rate: 1,
    last_update_days_ago: 2,
    months,
    reviews_per_month: perMonth,
  };
}
