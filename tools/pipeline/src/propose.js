// Writes the tailored 90-day proposal for one prospect with Claude (structured output),
// following the gbp-audit playbook. `stubProposal` gives a deterministic offline version for tests/demo.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { ROOT } from './config.js';

export const MODEL = process.env.PIPELINE_MODEL || 'claude-opus-5';
const LANG = { en: 'English', ms: 'Bahasa Malaysia', zh: 'Simplified Chinese', fr: 'French' };

const str = { type: 'string' };
const strArr = { type: 'array', items: str };
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

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
});

let playbook;
async function systemPrompt() {
  playbook ??= await readFile(path.join(ROOT, '.claude/skills/gbp-audit/SKILL.md'), 'utf8');
  return `${playbook}

## Output for this call
Return only the proposal fields defined by the JSON schema (the pipeline already holds the listing facts).
- Write every customer-facing text field in the language requested, in the voice of a real local owner.
- hours_today: the closing time as Google shows it in that language (e.g. "Closes 3 PM", "Tutup pada 3 PTG", "下午3点打烊"). Use the listing hours if present, otherwise infer from the website text; if unknown, a typical closing time for this kind of business.
- website_url: the business's own site if one exists in the facts, otherwise "".
- photo_labels: labels for the 2nd-4th photos in the listing's language (e.g. "Latest", "Menu", "Vibe").
- posts: exactly 2, short, about real items or news for this business; "when" like "2 days ago" in that language.
- illustrative_reviews: exactly 2 five-star reviews typical of this business's real customers, mentioning real items from its menu, services or existing reviews, each with a short owner reply signed with the owner's first name if known.
- sample_review_reply: reply to the most recent review that has no owner answer; if none, empty strings.
- projected_reviews_per_month: 0 to use the default pace, or 8-30 if the business clearly has more or fewer customers than average.`;
}

function userContent(prospect, competitors, { locale, vertical, websiteText }) {
  const facts = {
    business_name: prospect.business_name, city: prospect.city, address: prospect.address, vertical,
    primary_category: prospect.primary_category, secondary_categories: prospect.secondary_categories,
    rating: prospect.rating, review_count: prospect.review_count, has_hours: prospect.has_hours, hours_today: prospect.hours_today,
    website: prospect.website, description: prospect.description, price_level: prospect.price_level,
    photo_count: prospect.photo_count, reviews: prospect.review_texts,
  };
  return `Language for all customer-facing text: ${LANG[locale] || 'English'} (${locale}).

<listing_facts>
${JSON.stringify(facts, null, 2)}
</listing_facts>

<competitors_shown_above_it>
${JSON.stringify(competitors, null, 2)}
</competitors_shown_above_it>
${websiteText ? `\n<website_text>\n${websiteText.slice(0, 12000)}\n</website_text>\n` : ''}
Write the 90-day proposal for this business.`;
}

export async function generateProposal(prospect, competitors, { locale = 'en', vertical, websiteText, client = new Anthropic() } = {}) {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default', // re-run on Anthropic's recommended model if a safety classifier declines
    system: await systemPrompt(),
    messages: [{ role: 'user', content: userContent(prospect, competitors, { locale, vertical, websiteText }) }],
    output_config: { format: { type: 'json_schema', schema: PROPOSAL_SCHEMA } },
  });
  if (response.stop_reason === 'refusal') throw new Error(`Proposal refused for ${prospect.business_name}`);
  if (response.stop_reason === 'max_tokens') throw new Error(`Proposal truncated for ${prospect.business_name}`);
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return finalize(JSON.parse(text), prospect);
}

// Shape the model output into audit-visual's proposal format.
export function finalize(p, prospect, photoLibrary = []) {
  const own = prospect.photos || [];
  const pool = [...own, ...photoLibrary].slice(0, 4);
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
    low_confidence_reasons: p.low_confidence_reasons,
  };
}

// Offline stand-in used by `demo` and tests: plausible, deterministic, built from the facts only.
export function stubProposal(prospect, competitors, { locale = 'en' } = {}, photoLibrary = []) {
  const cat = prospect.primary_category_specific ? prospect.primary_category : (competitors[0]?.category || prospect.primary_category);
  const firstReview = prospect.recent_reviews?.find((r) => !r.owner_reply);
  return finalize({
    primary_category: cat,
    secondary_categories: [...new Set(competitors.map((c) => c.category).filter((c) => c && c !== cat))],
    description: `${prospect.business_name} in ${prospect.city}. [Stub text: the live run writes this from the listing, reviews and website.]`,
    services: ['[Stub] Service 1', '[Stub] Service 2', '[Stub] Service 3'],
    hours_today: prospect.hours_today || 'Closes 6 PM',
    website_url: prospect.website || '',
    photo_labels: ['Latest', 'Menu', 'Vibe'],
    posts: [{ text: '[Stub] This week\'s offer.', when: '2 days ago' }, { text: '[Stub] Opening hours news.', when: '1 week ago' }],
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
  }, prospect, photoLibrary);
}
