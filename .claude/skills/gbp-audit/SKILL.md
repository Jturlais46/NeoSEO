---
name: gbp-audit
description: Turn raw Google Business Profile listing data for one local business (plus its nearby competitors) into the prospect JSON that tools/audit-visual renders, including today's facts, the 90-day proposal, photos, posts and illustrative reviews. Use when auditing a prospect or preparing a new client's setup.
---

# GBP audit and 90-day proposal

## Input

- **Listing record** from the pipeline's Google Maps scan (`tools/pipeline`, see `data/leads/<id>.json`): `place_id`, name, address, phone, categories, rating, review count, star distribution, recent reviews (with dates and owner answers), photos and photo count, hours, website, description, posts, claimed flag.
- **Up to 3 competitor records:** the businesses shown above this one for its main query in the same area.
- **Optional:** website text (About, Services, Menu) and website or Instagram photo URLs.

## Output

One JSON object in the format of `tools/audit-visual/samples/ember-oak-coffee.json`.

### `prospect` (today, from the data)

- **Scoring fields.** Map them straight from the listing.
  - Set `primary_category_specific: false` when the category is a generic parent ("Restaurant", "Store", "Contractor") and a more specific one clearly fits.
  - Compute `reviews_last_90d` and `owner_reply_rate` from the review dates and owner answers.
- **Panel fields:**
  - `address`, `phone_display` (local format), `price_level`, `hours_today`, `open_now`;
  - `photos`: the listing's photos, best first;
  - `recent_reviews`: the 2 most recent reviews, as `{author, meta, rating, when, text, owner_reply}`;
  - `rating_distribution`, if the data has it.
- **`screenshot`:** set it after running `node tools/audit-visual/src/capture.js --place-id <place_id> --out <file>`.

### `competitors`

- `{name, review_count, rating}` for each.

### `proposal` (the profile in 90 days)

- **Categories:** `primary_category` plus up to 3 `secondary_categories`. Use real Google category names that fit what the business offers.
- **`description`:** up to 750 characters, in the owner's voice.
  - Cover what they do, where, and what's distinctive.
  - Don't add phone numbers or URLs; Google strips them.
- **`services`:** 4-8 items, taken from the website or menu.
- **Hours and website:**
  - `hours_today`: from the website if the listing has none.
  - `website_url`: if they have a site that isn't on the listing.
- **`photos`:** 4, as `{src, label}`. The first is the hero, then "Latest", "Menu" or "Services", and "Vibe". Take them from the website, Instagram or their best listing photos.
- **`posts`:** 2 short posts, as `{text, when, photo}`. Base them on real items from the website: a menu item, a service, opening hours news.
- **`illustrative_reviews`:** 2 reviews showing the kind of review the business will attract, as `{author, meta, rating, when, text, owner_reply, owner_reply_when}`.
  - Reference real products or services.
  - Use a common first name and a last initial.
  - Keep them to 25-45 words, with a short owner reply signed with the owner's first name if known.
- **`sample_review_reply`:** a reply to their most recent review that has no owner answer. Use the `review-reply` skill rules.
- **Optional overrides:**
  - `projected_reviews_per_month`: use it when the business clearly has more or fewer customers than the default pace assumes. The default is gap-to-median over 3 months, bounded at 8-30. As a rough guide:
    - a busy café or restaurant: 20-30;
    - a salon or garage: 8-15.
  - `setup_photo_count`: defaults to 20.
- **Page content:**
  - `photo_shot_list`: 6 short labels suited to the vertical.
  - `update_ideas`: 4 week-by-week ideas.

### `confidence`

- `"high"` or `"low"`.
- `low_confidence_reasons`, for example: an ambiguous category, no website, conflicting data, or the business may be closed.

## Rules

1. **Today's side is factual.** Every number in `prospect` comes from the input. If a field is missing, set it to null.
2. **Never add keywords or locations to the business name,** in the proposal or the panel. That gets real profiles suspended, and owners know it.
3. **Service-area businesses** (no storefront): leave `address` empty in the proposal.
4. **After producing the JSON,** run `node tools/audit-visual/src/render.js <file>` and look at `card.png` before it goes out.
