// Proposals are written by Claude Code itself (the `warm-pipeline` skill, on your subscription),
// not through the API. This module holds the contract: the schema a proposal must satisfy,
// a validator, `finalize` (shapes it for audit-visual), and an offline stub for tests/demo.

const str = { type: 'string' };
const strArr = { type: 'array', items: str };
const obj = (properties, optional = []) => ({ type: 'object', properties, required: Object.keys(properties).filter((k) => !optional.includes(k)) });

export const PROPOSAL_SCHEMA = obj({
  primary_category: str,
  secondary_categories: strArr,
  description: str,
  services: strArr,
  hours_today: str,
  website_url: str,
  photo_labels: strArr,
  posts: { type: 'array', items: obj({ text: str, when: str }) },
  illustrative_reviews: {
    type: 'array',
    items: obj({ author: str, meta: str, rating: { type: 'integer' }, when: str, text: str, owner_reply: str, owner_reply_when: str }),
  },
  sample_review_reply: obj({ review_excerpt: str, reply: str }),
  photo_shot_list: strArr,
  update_ideas: strArr,
  projected_reviews_per_month: { type: 'integer' },
  confidence: { type: 'string', enum: ['high', 'low'] },
  low_confidence_reasons: strArr,
}, ['website_url', 'sample_review_reply', 'projected_reviews_per_month', 'low_confidence_reasons']);

// Minimal JSON-schema check (types, required, enums, array items). Returns a list of problems.
export function validate(value, schema = PROPOSAL_SCHEMA, at = 'proposal') {
  const errs = [];
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value === 'number' && Number.isInteger(value) ? 'integer' : typeof value;
  const want = schema.type;
  if (want && !(type === want || (want === 'number' && type === 'integer'))) return [`${at}: expected ${want}, got ${type}`];
  if (schema.enum && !schema.enum.includes(value)) errs.push(`${at}: must be one of ${schema.enum.join(', ')}`);
  if (want === 'object') {
    for (const k of schema.required || []) if (value[k] === undefined) errs.push(`${at}.${k}: missing`);
    for (const [k, sub] of Object.entries(schema.properties || {})) if (value[k] !== undefined) errs.push(...validate(value[k], sub, `${at}.${k}`));
  }
  if (want === 'array' && schema.items) value.forEach((v, i) => errs.push(...validate(v, schema.items, `${at}[${i}]`)));
  return errs;
}

// Extra checks the schema can't express.
export function checkProposal(p) {
  const errs = validate(p);
  if (errs.length) return errs;
  if ((p.posts || []).length < 2) errs.push('proposal.posts: need 2');
  if ((p.illustrative_reviews || []).length < 2) errs.push('proposal.illustrative_reviews: need 2');
  if (p.description.length > 750) errs.push('proposal.description: over 750 characters');
  if ((p.secondary_categories || []).length > 3) errs.push('proposal.secondary_categories: max 3');
  return errs;
}

// Shape a proposal into audit-visual's format, attaching the business's own photos
// (topped up from the vertical's photo library when it has fewer than 4).
export function finalize(p, prospect, photoLibrary = []) {
  // Few own photos (<3): lead with the vertical's library so the 90-day side shows the photo upgrade.
  const own = prospect.photos || [];
  const pool = (own.length < 3 && photoLibrary.length ? [...photoLibrary, ...own] : [...own, ...photoLibrary]).slice(0, 4);
  const photos = pool.map((ph, i) => ({ src: ph.src, ...(i > 0 && p.photo_labels?.[i - 1] ? { label: p.photo_labels[i - 1] } : {}) }));
  return {
    primary_category: p.primary_category,
    secondary_categories: (p.secondary_categories || []).slice(0, 3),
    description: p.description,
    services: p.services,
    hours_today: p.hours_today || prospect.hours_today,
    website_url: p.website_url || prospect.website || undefined,
    photos,
    posts: (p.posts || []).slice(0, 2).map((po, i) => ({ ...po, photo: pool[i + 1]?.src || pool[0]?.src })),
    illustrative_reviews: (p.illustrative_reviews || []).slice(0, 2),
    sample_review_reply: p.sample_review_reply?.reply ? p.sample_review_reply : undefined,
    photo_shot_list: p.photo_shot_list,
    update_ideas: p.update_ideas,
    ...(p.projected_reviews_per_month ? { projected_reviews_per_month: p.projected_reviews_per_month } : {}),
    setup_photo_count: 20,
    confidence: p.confidence,
    low_confidence_reasons: p.low_confidence_reasons || [],
  };
}

// Offline stand-in used by `demo` and tests: deterministic, built from the facts only.
export function stubProposal(prospect, competitors) {
  const cat = prospect.primary_category_specific ? prospect.primary_category : (competitors[0]?.category || prospect.primary_category);
  const firstReview = prospect.recent_reviews?.find((r) => !r.owner_reply);
  return {
    primary_category: cat,
    secondary_categories: [...new Set(competitors.map((c) => c.category).filter((c) => c && c !== cat))].slice(0, 3),
    description: `${prospect.business_name} in ${prospect.city}. [Stub: Claude Code writes this from the listing, reviews and website.]`,
    services: ['[Stub] Service 1', '[Stub] Service 2', '[Stub] Service 3'],
    hours_today: prospect.hours_today || 'Closes 6 PM',
    website_url: prospect.website || '',
    photo_labels: ['Latest', 'Menu', 'Vibe'],
    posts: [{ text: "[Stub] This week's offer.", when: '2 days ago' }, { text: '[Stub] Opening hours news.', when: '1 week ago' }],
    illustrative_reviews: [
      { author: 'Aisyah R.', meta: 'Local Guide · 64 reviews', rating: 5, when: '2 weeks ago', text: '[Stub] A glowing review mentioning a real item.', owner_reply: '[Stub] Thank you!', owner_reply_when: '2 weeks ago' },
      { author: 'Jason T.', meta: '12 reviews', rating: 5, when: '1 month ago', text: '[Stub] Another review about the service.', owner_reply: '[Stub] See you soon!', owner_reply_when: '1 month ago' },
    ],
    sample_review_reply: firstReview ? { review_excerpt: firstReview.text.slice(0, 160), reply: '[Stub] Owner reply.' } : { review_excerpt: '', reply: '' },
    photo_shot_list: ['Storefront', 'Signature item', 'Team', 'Interior'],
    update_ideas: ['Week 1: offer', 'Week 2: news', 'Week 3: behind the scenes', 'Week 4: new item'],
    projected_reviews_per_month: 0,
    confidence: 'high',
    low_confidence_reasons: [],
  };
}
