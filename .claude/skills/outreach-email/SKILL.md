---
name: outreach-email
description: Fill the email sequence for one prospect from its audit.json and lead record, writing only the tailored sentence and the plain-language findings. Use when preparing a prospect for the sending platform.
---

# Outreach email

## Input

- **Lead record:** `first_name` (may be null), `business_name`, `country`, `segment`, `email`.
- **`audit.json`** from the renderer:
  - `reviews_today`, `reviews_projected`, `rating_today`, `rating_projected`, `photos_projected`;
  - `score_today`, `score_projected`;
  - `top_findings`.
- **Competitors:** their names and review counts.
- **Templates:** `outreach/email/sequence-en.md` or `sequence-fr.md`.

## Output

A JSON object with these fields:
- `subject_1`;
- `body_1` … `body_4`;
- `email3_variant`;
- `variables`;
- `flags`.

## Steps

1. **Pick the email-3 variant** from `segment`:

   | `segment` | Variant |
   |---|---|
   | `behind_on_reviews` | A |
   | `unclaimed` | B |
   | `neglected` | C in the US, A in France |

2. **Rewrite the 3 top findings for an owner.** Make them short, concrete and lowercase, with no jargon. Examples:
   - "no hours on Google, so you show as closed"
   - "0 replies to your 31 reviews"
3. **Write `{{tailored}}`.** One sentence, 25 words or fewer, about a named competitor or something on the business's own website. No compliments and no questions.
4. **Fill the templates word for word.**
   - If `first_name` is null, open with "Hi there," (EN) or "Bonjour," (FR).
   - Round `reviews_projected` to the nearest 10 in the copy ("around 120").
5. **Self-check, then set `flags`** if any of these is true:
   - email 1 is over 80 words (90 in French);
   - email 1 contains a link;
   - an email uses a word from the "Words to avoid" list;
   - a number about today isn't in the input.

   Flagged emails go to the approval queue instead of sending.
