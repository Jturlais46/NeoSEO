---
name: reply-triage
description: Classify an inbound reply to outreach, draft the response from outreach/email/replies.md, and trigger the right Bland call or suppression. Use on every reply webhook from the sending platform or inbox.
---

# Reply triage

## Input

- The reply text, plus the thread history.
- The lead record.
- `audit.json`.
- Links: `audit_url`, `checkout_url`, `booking_url`, `pricing_url`.

## Output

```json
{
  "category": "interested | question | price | call_me | not_now | has_provider | not_interested | stop | wrong_person | out_of_office | is_this_google | data_request | complaint | other",
  "confidence": 0.0,
  "suppress": false,
  "reply_draft": "string or null",
  "attach": "comparison.png | null",
  "schedule_call": { "flow": "walkthrough_close", "at": "ISO time or next_slot" },
  "needs_founder": false
}
```

## Rules

1. **Stop.** If `stop` or `not_interested`, or the reply is hostile: set `suppress: true`, `reply_draft: null`, and no call.
2. **Founder review.** Set `needs_founder: true` if any of these is true:
   - `complaint`
   - `other`
   - `confidence` below 0.7
   - the prospect is negotiating price
3. **Interested, question or price:**
   - Use the matching template.
   - Attach `comparison.png` for `interested`.
   - Schedule a `walkthrough_close` call for the next slot if we have their number.
4. **Call me:** schedule `walkthrough_close` at the time they asked for, or the next slot in the market's calling window.
5. **Out of office:** move the next step to their return date plus 2 days.
6. **Keep drafts short.**
   - Use the templates.
   - Add at most one sentence that answers their specific question.
   - Answer in the language of their reply.
