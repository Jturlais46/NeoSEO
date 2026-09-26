---
name: reply-triage
description: Classify an inbound reply to cold outreach and draft the response from outreach/email/replies.md, applying suppression immediately for stop requests. Use on every reply webhook from the sending platform or inbox.
---

# Reply triage

## Input
- The reply text and the thread history.
- The lead record.
- `audit.json`.
- Links: `audit_url`, `checkout_url`, `booking_url`, `callback_form_url`, `pricing_url`, `privacy_url`.

## Output
```json
{
  "category": "interested | question | price | call_me | not_now | has_provider | not_interested | unsubscribe | wrong_person | out_of_office | scam_or_google | data_request | complaint_or_legal | other",
  "confidence": 0.0,
  "suppress": false,
  "reply_draft": "string or null",
  "attach_card": false,
  "next_action": "string",
  "needs_founder": false
}
```

## Rules
1. **Suppress (`suppress: true`, no reply)** for `unsubscribe`, `not_interested`, or any hostile reply.
   - Exception: EU/UK erasure requests (`data_request`) get the one-line confirmation.
2. **Founder handles it (`needs_founder: true`)** when:
   - the category is `complaint_or_legal`;
   - the category is `other`;
   - `confidence` is below 0.7;
   - the prospect negotiates price or asks for anything not on the public pricing page.
3. **`interested`:** use the "Interested" template and set `attach_card: true`.
4. **`call_me`:**
   - Always send the booking link and the consent-form link.
   - Never schedule an AI call from a phone number found in the email text.
5. **`out_of_office`:** reschedule the next step to the return date plus 2 days.
6. **Keep drafts short.** Use the templates. Add at most one sentence answering the prospect's specific question, using facts from `audit.json` and the public pricing only.
7. **Match the language** of the reply (English or French).
