// Profile Health Score: a transparent 0-100 checklist score for a Google Business Profile.
// Used in three places: lead scoring (who to contact first), the before/after visual,
// and monthly client reports (the "after" number must be earned, not projected).
//
// Weights follow the evidence: primary category and review velocity/recency move rankings
// (Whitespark 2026, Sterling Sky tests); replies, photos and completeness move conversion;
// posting frequency has no measured ranking effect, so it carries little weight.
// Tune them in one place; every consumer reads this module.

export const WEIGHTS = {
  claimed: 15,            // Unclaimed = owner cannot reply, edit, or fight bad edits.
  primaryCategory: 10,    // Specific primary category is the strongest on-profile lever.
  secondaryCategories: 5,
  description: 5,
  hours: 5,
  website: 5,
  servicesOrMenu: 5,
  photos: 10,
  reviewVolume: 10,       // Relative to the local competitors shown in the map pack.
  rating: 5,
  reviewRecency: 10,
  replyRate: 10,          // Conversion and trust, not a ranking factor.
  recentUpdates: 5,
};

import { STRINGS } from './i18n.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Each check returns a fraction in [0, 1] of its weight, plus `detail` when something is
// missing. Wording lives in i18n.js so every locale describes the same facts.
const CHECKS = {
  claimed: (p) => ({ value: p.is_claimed ? 1 : 0, detail: p.is_claimed ? null : {} }),
  primaryCategory: (p) => ({
    value: p.primary_category_specific ? 1 : p.primary_category ? 0.4 : 0,
    detail: p.primary_category_specific ? null : { category: p.primary_category },
  }),
  secondaryCategories: (p) => {
    const n = (p.secondary_categories || []).length;
    return { value: clamp01(n / 3), detail: n >= 3 ? null : { n } };
  },
  description: (p) => ({ value: p.has_description ? 1 : 0, detail: p.has_description ? null : {} }),
  hours: (p) => ({ value: p.has_hours ? 1 : 0, detail: p.has_hours ? null : {} }),
  website: (p) => ({ value: p.has_website ? 1 : 0, detail: p.has_website ? null : {} }),
  servicesOrMenu: (p) => ({ value: p.has_services_or_menu ? 1 : 0, detail: p.has_services_or_menu ? null : {} }),
  photos: (p) => {
    const n = p.photo_count ?? 0;
    return { value: clamp01(n / 20), detail: n >= 20 ? null : { n } };
  },
  reviewVolume: (p, ctx) => {
    const n = p.review_count ?? 0;
    const bench = ctx.competitorMedianReviews;
    if (!bench) return { value: clamp01(n / 100), detail: null };
    return { value: clamp01(n / bench), detail: n >= bench ? null : { n, bench: Math.round(bench) } };
  },
  rating: (p) => {
    const r = p.rating ?? 0;
    return { value: clamp01((r - 3.5) / 1.2), detail: r >= 4.5 ? null : { rating: r } };
  },
  reviewRecency: (p) => {
    const n = p.reviews_last_90d ?? 0;
    return { value: clamp01(n / 10), detail: n >= 10 ? null : { n } };
  },
  replyRate: (p) => {
    const r = p.owner_reply_rate ?? 0;
    return { value: clamp01(r), detail: r >= 0.9 ? null : { pct: Math.round(r * 100) } };
  },
  recentUpdates: (p) => {
    const d = p.last_update_days_ago;
    const v = d == null ? 0 : d <= 30 ? 1 : d <= 90 ? 0.5 : 0;
    return { value: v, detail: v === 1 ? null : { days: d ?? null } };
  },
};

export function competitorMedian(competitors = []) {
  const counts = competitors.map((c) => c.review_count).filter(Number.isFinite).sort((a, b) => a - b);
  if (!counts.length) return null;
  const mid = Math.floor(counts.length / 2);
  return counts.length % 2 ? counts[mid] : (counts[mid - 1] + counts[mid]) / 2;
}

export function scoreProfile(profile, { competitors = [], weights = WEIGHTS, locale = 'en' } = {}) {
  const ctx = { competitorMedianReviews: competitorMedian(competitors) };
  const say = STRINGS[locale].findings;
  const breakdown = [];
  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const { value, detail } = CHECKS[key](profile, ctx);
    const points = Math.round(weight * value * 10) / 10;
    total += points;
    breakdown.push({ key, weight, points, detail, finding: detail ? say[key](detail) : null });
  }
  const findings = breakdown
    .filter((b) => b.finding)
    .sort((a, b) => (b.weight - b.points) - (a.weight - a.points))
    .map((b) => b.finding);
  return { score: Math.round(total), breakdown, findings };
}

// Lead priority for outbound: a weak profile is only a good lead if the business is real,
// operating, and has something to gain. Returns 0-100; higher = contact sooner.
export function leadPriority(profile, { competitors = [] } = {}) {
  if (profile.permanently_closed) return 0;
  const { score } = scoreProfile(profile, { competitors });
  const gap = 100 - score;
  const hasContact = profile.email || profile.phone ? 1 : 0;
  const established = clamp01((profile.review_count ?? 0) / 5); // some customer footprint
  return Math.round(gap * 0.8 * hasContact + 20 * established);
}
