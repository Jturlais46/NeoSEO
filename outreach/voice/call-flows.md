# Call flows (one Bland Pathway each)

**How to read these specs.** Node names are in `CAPS`. Variables in `{{ }}` come from `request_data`, which is built from `audit.json` and the lead record. Tools are n8n webhooks.

**Global nodes** (reachable from any node):
- `STOP`: the caller asks not to be called. `add_to_do_not_contact`, then "Understood, you won't hear from us again. Have a good day." End.
- `HUMAN`: the caller asks for a person, or sounds upset. Transfer to the founder during working hours; otherwise `schedule_callback`.
- `GATEKEEPER`: a staff member answers. "Hi! Is {{first_name}} or the owner around? It's about the shop's Google listing, two minutes." If not available: "When's a good time to catch them?" Then `schedule_callback`. Leave no pitch with staff.

**Voicemail:** `leave_message` with the flow's voicemail text. Use `leave_message_and_sms` only when `sms_consent` is true.

---

## 1. First call (`first_call`)

- **Trigger:** day 1 after email 1, or first touch when there's no email.
- **Goal:** the owner agrees to see the visual. Best case, they take the checkout link or book a call.

1. `OPEN`
   > "Hi, is this {{first_name}}? It's Kit from Mapkeeper. Quick one about {{business_name}}'s Google listing, have you got a minute?"

   - If `disclose_ai_in_opener` is on: "It's Kit, Mapkeeper's AI assistant."
   - Busy: "No problem, when's better?" Then `schedule_callback`.
2. `HOOK`
   > "I was looking at the places people see when they search for {{service}} near you. You've got {{reviews_today}} reviews; {{competitor_1}} has {{competitor_1_reviews}}. And {{finding_1}}."
3. `QUESTION`
   > "Who looks after your Google profile at the moment?"

   - **Me / nobody:** "Makes sense, it's one more thing on a long list."
   - **An agency / staff:** "Got it. Are you happy with how it's going?" If they're happy, go to `SOFT_EXIT`.
4. `VISION`
   > "We put together what your profile would look like after 90 days with us: about {{reviews_projected}} reviews, rating around {{rating_projected}}, real photos, weekly posts, every review answered. Can I text or email it to you? It takes a minute to look at."

   - Yes: `send_visual` (text only if `sms_consent`, otherwise email). Confirm it was received if possible.
5. `OFFER`
   > "It's {{price_keep}} a month, no contract, and you stay the owner. If it looks good, I can send you the link to get started, or book ten minutes with {{founder_first_name}}. Which would you prefer?"

   - **Link:** `send_checkout_link`.
   - **Call:** `book_meeting`.
   - **Objection:** answer from `persona.md` once, then ask again. There's no third ask.
6. `END`
   > "Perfect. You'll have it in a minute. Thanks {{first_name}}!"
7. `SOFT_EXIT`
   > "No problem at all. I'll email you the visual anyway, it's yours to keep. Have a good day."

**Voicemail:**
> "Hi {{first_name}}, it's Kit from Mapkeeper. I put together what {{business_name}}'s Google profile could look like in 90 days: around {{reviews_projected}} reviews and a full profile. I'll email it over. Have a look, and call me back on this number if you have questions."

---

## 2. Follow-up (`follow_up`)

- **Trigger:** day 5 with no decision, or within 2 hours of an audit-page view.
- **Goal:** turn interest into the link or a booked call.

1. `OPEN`
   > "Hi {{first_name}}, Kit from Mapkeeper again. Did you get a chance to look at your 90-day Google profile?"
2. Branch on the answer:
   - **Yes:** "What did you think?" Listen, handle objections, then go to `OFFER` (as in `first_call`).
   - **No:** "No worries. The short version is {{reviews_today}} reviews today, about {{reviews_projected}} in 90 days, and a profile that answers customers' questions. Want me to resend it?" Then `send_visual`, then `OFFER`.
3. `END` / `SOFT_EXIT`, as in `first_call`.

**Voicemail:**
> "Hi {{first_name}}, Kit from Mapkeeper, following up on your 90-day Google profile. The link is in your email. Call back on this number anytime."

---

## 3. Walkthrough and close (`walkthrough_close`)

- **Trigger:** a "call me" reply, an engaged lead (2+ page views or a checkout click), or a booked slot.
- **Goal:** checkout.

1. `OPEN`
   > "Hi {{first_name}}, Kit from Mapkeeper. You asked us to walk you through your Google profile plan. Is now still good?"
2. `CONTEXT`: "Have you got the page open? If not, I'll send it now." Use `send_visual` if needed.
3. `WALK`
   > "On the left is today: {{finding_1}}, {{finding_2}}. On the right is day 90: new categories, description, 20+ photos, weekly posts, every review answered, and about {{reviews_projected}} reviews from the stand and follow-up texts."
4. `QUESTION`: "Anything there that doesn't fit how you run the place?" Adjust the plan and note it for the founder.
5. `OFFER`: "Shall I send the link to start? Setup begins this week."
   - Yes: `send_checkout_link`, then go to `NEXT_STEPS`.
6. `NEXT_STEPS`
   > "Once you're signed up, you'll get a one-minute guide to invite us on Google. That's the only technical step."
7. `END`

---

## 4. Inbound line (`inbound_line`)

- **Trigger:** any call to our number.

1. `GREET`
   > "Thanks for calling Mapkeeper, this is Kit. How can I help?"
2. `IDENTIFY`: `lookup_lead` by caller ID. If there's no match, ask for the business name.
3. Route by intent:
   - **About my profile / you called me / got your email:** jump to `walkthrough_close` at `CONTEXT`.
   - **Client support** (hours change, photo, question): answer from the knowledge base, or `create_ticket`. Hours changes are confirmed back and ticketed with priority `high`.
   - **Stop contacting me:** go to `STOP`.
   - **Anything else:** take a message with `create_ticket`.
4. `END`: summarize what happens next.

---

## 5. Onboarding verification coach (`onboarding_verification`)

- **Trigger:** a new client books it, or chooses "call me to help" when the access nudge goes out on day 3.
- **Goal:** the profile is verified or claimed, and we are added as Manager.

1. `OPEN`
   > "Hi {{first_name}}, it's Kit from Mapkeeper for your Google setup call, about 10 minutes. Are you at {{business_name}} with your phone or computer handy?"

   - Not at the business and the profile is unclaimed: video verification usually has to be filmed on site, so reschedule with `schedule_callback`.
2. `CHECK_ACCESS`: `check_manager_access`. If we're already a manager, go to `DONE`.
3. `CLAIM_OR_INVITE`
   - **Claimed profile:** walk through "Business Profile → ⋮ menu → Business Profile settings → People and access → Add → {{agency_email}} → Manager". Wait at each step.
   - **Unclaimed profile:** "Search your business on Google Maps, tap 'Own this business?' and follow the steps. If Google asks for a video, film your sign outside, the inside, your equipment, and something that shows you run it, like keys or the till. It has to be one continuous clip."
4. `VERIFY_WAIT`: if Google says review takes days: "That's normal. We'll check daily and let you know."
5. `DONE`: `check_manager_access`, confirm, and explain the 7-day setup timeline.
   - After 2 failed attempts: `create_ticket` for the founder with priority `high`.

---

## 6. Client check-in (`client_checkin`)

- **Trigger:** day 30, day 90, and 14 days before an annual renewal.
- **Goal:** collect changes, measure satisfaction, catch churn early, and upsell when it fits.

1. `OPEN`: "Hi {{first_name}}, Kit from Mapkeeper for your {{period}} check-in, three minutes. Good time?"
2. `CHANGES`: "Anything new we should put on your profile? Services, prices, hours, holidays, events?" Confirm each change, then `create_ticket`.
3. `PHOTOS`: "Any recent photos you'd like us to add? I can text you the upload link."
4. `REPORT`: one highlight. For example: "Calls from your profile were up {{calls_delta}} last month, and you got {{new_reviews}} new reviews."
5. `CSAT`: "From 1 to 5, how happy are you with us?"
   - **3 or less:** "What would make it a 5?" Then `create_ticket` for the founder with priority `high`.
   - **4 or 5:** at most one add-on offer that fits what they said.
6. `END`

---

## Tools (n8n webhooks)

| Tool | Input | Effect |
|---|---|---|
| `lookup_lead` | `phone_e164` or `business_name` | Returns the lead or client record and its `request_data` |
| `send_visual` | `lead_id`, `channel` | Sends `comparison.png` + the audit link by email (or text if `sms_consent`) |
| `send_checkout_link` | `lead_id`, `plan` | Sends a pre-filled Stripe Checkout link |
| `book_meeting` | `lead_id`, preferred time | Books with the founder on Cal.com |
| `schedule_callback` | `lead_id`, time | Queues a callback inside the market's calling window |
| `add_to_do_not_contact` | `phone_e164`, `lead_id` | Global do-not-contact list, all channels |
| `create_ticket` | `lead_id`, text, priority | Adds the item to the approval queue |
| `check_manager_access` | `client_id` | Checks the GBP admin list |
