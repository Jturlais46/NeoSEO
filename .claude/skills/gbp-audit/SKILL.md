---
name: gbp-audit
description: Turn raw Google Business Profile listing data for one local business (plus its nearby competitors) into the prospect JSON that tools/audit-visual renders, including an honest, specific improvement proposal. Use when auditing a prospect or preparing a new client's setup.
---

# GBP audit and proposal

## Input
- **Listing record** from Outscraper or DataForSEO: name, categories, rating, review count, reviews (with dates and owner answers), photo count, hours, website, description, posts, claimed or verified flag.
- **Up to 3 competitor records:** the businesses shown above this one for its main query in the same area.
- **Optional:** text from the business's website (About, Services, Menu pages).

## Output
One JSON object matching `tools/audit-visual/samples/trattoria-olivo.json`:

- `prospect`: facts only, mapped from the listing.
  - Set `primary_category_specific` to false when the category is a generic parent ("Restaurant", "Store", "Contractor") and a more specific Google category plainly fits.
  - `reviews_last_90d` and `owner_reply_rate` are computed from review dates and owner answers.
  - `last_update_days_ago` is taken from the most recent post; use null if the business has never posted.
- `competitors`: `{name, review_count, rating}` for each.
- `proposal`:
  - `primary_category` and up to 3 `secondary_categories`. Use real Google category names only, and only categories the business demonstrably offers (from its website or reviews).
  - `description`: at most 750 characters. Factual, in the owner's voice, and covering what they do, where, and what's distinctive. **No keyword stuffing, no superlatives we can't prove, no phone numbers or URLs.**
  - `services`: 4-8 items taken from the website or menu. Never invented.
  - `photo_shot_list`: 6 short labels suited to the vertical.
  - `update_ideas`: 4 dated ideas for the first month. Use seasonal or real items from their website where possible.
  - `sample_review_reply`: pick the most recent review without an owner reply (prefer 3-4 stars). Include a `review_excerpt` of up to 160 characters, **with no reviewer name**, and a `reply` that follows the `review-reply` skill. Omit it if no review is suitable.
  - `setup_photo_count`: 20.
- `confidence`: `"high"` or `"low"`, plus a list of `low_confidence_reasons`, such as:
  - the category is ambiguous;
  - there's no website;
  - the data conflicts;
  - the business may be closed.

## Rules
1. **Facts only.** Every number and claim in `prospect` must come from the input. If a field is missing, use null. Never estimate a number.
2. **Never change the business name.** Don't add keywords or locations to it (this gets profiles suspended).
3. **Service-area businesses** (no storefront): note it, and never propose showing an address.
4. **Health or legal businesses:** set `confidence: low`, and don't write a sample review reply that references care or outcomes.
5. **No Google trademarks** in any text we generate for display, apart from the plain words "Google" or "Google Business Profile".
6. After producing the JSON, run `node tools/audit-visual/src/render.js <file>` and check the score looks plausible. A score above 75 means we skip this lead.
