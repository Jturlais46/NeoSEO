---
name: outreach-email
description: Fill the cold email sequence for one prospect from its audit.json and lead record, writing only the tailored sentence and the plain-language findings, and reject anything that breaks the banned-phrases or honesty rules. Use when preparing a prospect for the sending platform.
---

# Outreach email

## Input
- **Lead record:** `first_name` (may be null), `business_name`, `country`, `segment`, `email`.
- **`audit.json`** from the renderer: `score_today`, `score_after_setup`, `top_findings`, `card_rows`.
- **Competitor names and review counts.**
- **The template set:** `outreach/email/sequence-en.md` or `sequence-fr.md`.

## Output
A JSON object with:
- `subject_1`
- `body_1` … `body_4`
- `email3_variant`: A, B or C
- `variables`: the values used
- `flags`

## Steps
1. **Pick the email-3 variant** from `segment`:
   - `behind_on_reviews`: A
   - `unclaimed`: B
   - `neglected`: C in the US, A in France
2. **Rewrite the 3 top findings for an owner.** Short, concrete, lowercase, no jargon. Examples:
   - "0 replies to your 38 reviews"
   - "your category is just 'Restaurant'"
   - "7 photos, none from this year"
3. **Write `{{tailored}}`:** one sentence, at most 25 words, stating a verifiable fact about a named competitor or the business's own website. No compliments, no questions.
4. **Fill the templates word-for-word.** If `first_name` is null, use "Hi there," (EN) or "Bonjour," (FR).
5. **Self-check.** Set `flags` if any of these is true:
   - a banned phrase appears (listed at the bottom of `sequence-en.md`);
   - a number isn't in the input;
   - email 1 is over 80 words (90 in French);
   - email 1 contains a link.

   If `flags` isn't empty, **don't send**. Route it to the approval queue.

## Never
- Mention that we saw them open or view anything.
- Imply we're Google, or that their listing is at risk of removal.
- Use their customers' names or review authors' names.
