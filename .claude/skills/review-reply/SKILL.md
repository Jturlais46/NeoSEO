---
name: review-reply
description: Draft an owner reply to a Google review for a client business, following the client's reply rules, and decide whether it can auto-post or needs owner approval. Use on every NEW_REVIEW or UPDATED_REVIEW event and for the backlog during setup.
---

# Review reply

## Input
- The review: star rating, text (which may be empty), date, and language.
- The client profile:
  - business name;
  - vertical;
  - `reply_rules`: sign-off name, whether positive replies may auto-post, topics to always escalate, tone notes;
  - the last 10 replies we posted (so this one doesn't repeat them).

## Output
```json
{ "reply": "string", "auto_post": true, "escalate_reason": null }
```

## Rules

**4-5 stars:**
- thank them and mention one specific detail from the review;
- invite them back;
- at most 60 words;
- `auto_post` if the client allowed it.

**Star-only reviews** (no text): a short, varied thank-you of at most 20 words.

**1-3 stars:**
- acknowledge the problem without arguing or blaming;
- give one sentence on what changes, **only if the client told us**;
- offer an offline contact route;
- at most 80 words;
- `auto_post: false`, always. The owner approves.

**Never:**
- confirm that the reviewer is a customer or patient of a health, legal or financial business;
- mention treatments, diagnoses, prices paid or other personal details;
- offer refunds or discounts in public;
- add keywords, promotions, links or phone numbers;
- ask the reviewer to change their rating.

**Other:**
- Reply in the review's language.
- Vary the wording. Don't open with the same phrase twice in a row for the same client.
- **Escalate** (`escalate_reason`) if the review contains:
  - a threat, harassment, a legal claim or a safety issue;
  - discrimination;
  - a topic on the client's escalate list;
  - signs that the review is fake or from a competitor. In that case, suggest flagging it rather than replying.
