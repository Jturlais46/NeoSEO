// Decide whether a prospect is worth calling, and how urgently.
import { scoreProfile, leadPriority } from '../../audit-visual/src/score.js';

export const DEFAULT_RULES = {
  min_reviews: 3,        // some real customer footprint
  max_reviews: 400,      // above this they rarely need us
  min_rating: 3.3,       // below this the business itself is the problem
  max_score: 75,         // a strong profile leaves little to sell
  require_phone: true,
};

export function segmentOf(prospect, competitors, score) {
  if (!prospect.is_claimed) return 'unclaimed';
  const median = competitors.map((c) => c.review_count).sort((a, b) => a - b)[Math.floor(competitors.length / 2)] || 0;
  if (median && prospect.review_count < 0.6 * median && prospect.reviews_last_90d < 5) return 'behind_on_reviews';
  return score < 60 ? 'neglected' : 'behind_on_reviews';
}

export function qualify(prospect, competitors, rules = {}) {
  const r = { ...DEFAULT_RULES, ...rules };
  const { score, findings } = scoreProfile(prospect, { competitors });
  const out = (reason) => ({ ok: false, reason, score, segment: 'skip', priority: 0, findings });
  if (prospect.permanently_closed) return out('closed');
  if (r.require_phone && !prospect.phone) return out('no_phone');
  if ((prospect.review_count ?? 0) < r.min_reviews) return out('too_few_reviews');
  if ((prospect.review_count ?? 0) > r.max_reviews) return out('too_many_reviews');
  if (prospect.rating != null && prospect.rating < r.min_rating) return out('low_rating');
  if (score > r.max_score) return out('profile_already_strong');
  return { ok: true, reason: null, score, segment: segmentOf(prospect, competitors, score), priority: leadPriority(prospect, { competitors }), findings };
}
