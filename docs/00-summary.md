# Executive summary

**Status:** plan v3, 2026-09-26: US and Malaysia, visuals 5 and 9, Claude Code as the bot. Built on the research in [01-research.md](01-research.md). Prices tagged *unverified* there need a check before you commit money.

## The business in one paragraph

A productized, done-for-you Google Business Profile (GBP) service for independent local businesses.

- **Markets:** the **US** and **Malaysia** (Klang Valley first).
- **Price:** **$99/month in the US**, **RM199/month in Malaysia**. Both sit between DIY software (US $30-60, MY RM50) and human agencies (US $125-700+, MY RM800-3,500).
- **How it sells:** we show each owner their profile today next to their profile in 90 days, with more reviews, a higher rating, real photos, fresh posts and a complete listing.
- **How it's delivered:** the pitch goes out by email with the visual, and Bland AI calls prospects directly. AI agents do the prospecting, audits, calls, inbox, fulfillment and reporting. You approve and handle exceptions for about 5-15 hours a week.

**The two visuals every prospect gets** (Visual 5, two phones; Visual 9, swipe card), built from their own listing:

| Visual 5 | Visual 9 |
|---|---|
| ![Visual 5](visual-options/kopitiam-seri-mawar/v-phones-portrait.png) | ![Visual 9](visual-options/kopitiam-seri-mawar/v-swipe.png) |

All 11 options: [visual-options/contact-sheet.png](visual-options/contact-sheet.png). Malay and Chinese versions: [visual-options/](visual-options/).

## Strategic calls in this plan

1. **Proof by visual, pushed by voice.**
   - Every prospect gets their own before/after: the real profile today, next to the 90-day version.
   - Bland calls to walk the owner through it and ask for the yes; email (US) or WhatsApp (Malaysia) delivers it.
   - Calls go to leads marked `prior_approval`, with the approval obtained by you.
2. **Make claimed-but-neglected profiles the primary segment. Unclaimed profiles are secondary.**
   - Established businesses with 15-150 reviews and a clear gap to the businesses shown next to them buy faster.
   - Unclaimed owners must verify with Google themselves, often by video, and deals stall there. Use "we'll help you claim it" as the entry offer for that segment.
3. **Sell the levers that move rankings.**
   - **What works:** primary category choice, a steady flow of reviews, and a complete profile (services, hours, website).
   - **What doesn't:** keywords in the business name get profiles suspended. Posting frequency and keywords in descriptions showed no ranking effect in controlled tests.
   - **How we use updates:** about 4 posts a month, because they help people choose you, not because they move rankings.
4. **The review kit is the physical hook.** A counter stand with NFC and QR, take-home cards, and a follow-up text after each visit, all pointing to our short link. That link sends customers straight to the Google review form.
5. **The value is accountability, not posting.**
   - Semrush Local's $30 plan includes an AI agent for Google profiles, and Google itself is testing AI review replies.
   - What owners pay for:
     - someone who owns the result;
     - the review engine;
     - protection against bad edits and suspensions;
     - honest reporting on calls and directions.
   - **The 2026 hook.** Google's Ask Maps answers "best X near me" from profiles and reviews. It's live in the US.
6. **Muse (Meta's personal agent, launched 2026-09-08) fits later as your operator console, not as the campaign engine.**
   - Bland publishes setup docs for Muse, but Muse's phone plan is one call at a time and 500 a day.
   - The repo is built so switching is a configuration change: skill files, one call module, and a Sheet mirror of the lead list.

## Recommendations

| Decision | Recommendation | Why |
|---|---|---|
| First market | **United States**, with Bland calls from day 1 | Bland works out of the box with US numbers; highest prices; Ask Maps is live |
| Second market | **Malaysia**: warm pipeline now, Bland calls once a local carrier line is connected | Bland Enterprise can call from a genuine 03 number only through your own licensed Malaysian carrier over SIP. See [10-malaysia-launch.md](10-malaysia-launch.md), section 3 |
| Verticals to pilot | US: **auto repair**, **salons/barbers**, **cafés**. Malaysia: **kopitiams and restaurants**, **workshops**, **salons** | Walk-in customers (the kit works), trust-driven choices, "near me" searches |
| Name | **Mapkeeper** (alternatives: Mapfront, Wellpinned) | Says what we do, frames the subscription, and is easy to say on a call |
| Price | US: Keep $99/mo, Grow $179/mo, setup $149. Malaysia: RM199 / RM399 / RM699, setup RM390 waived on 12 months | Above DIY software, below human agencies |
| Sales process | Call first, then the visual by email or WhatsApp, a walkthrough call and a payment link | Full walkthrough with every scenario: [11-sales-playbook.md](11-sales-playbook.md) |
| Warm pipeline | **Claude Code on your subscription** runs the bot ([tools/pipeline/](../tools/pipeline/)): Google Maps scan, qualification, a tailored proposal per lead, visuals 5 and 9, a ranked call sheet | No Anthropic API bill and no data vendor |
| Fulfillment | Localo Pro or a similar white-label tool first, then our own GBP API integration once Google approves access | API approval reportedly needs a verified profile active for 60+ days, so apply now |

## Map of this repo

| Path | What it is |
|---|---|
| [docs/01-research.md](01-research.md) | Research with sources and confidence levels |
| [docs/02-positioning-and-brand.md](02-positioning-and-brand.md) | Markets (including Malaysia), ideal customer, positioning, names, messaging |
| [docs/03-service-offering.md](03-service-offering.md) | Plans, deliverables, review kit, pricing, unit economics |
| [docs/04-outbound-engine.md](04-outbound-engine.md) | Lead sourcing, scoring, visuals, email + Bland sequence, infrastructure, funnel |
| [docs/05-fulfillment.md](05-fulfillment.md) | Onboarding, monthly operations, review engine, reporting |
| [docs/06-ai-operating-model.md](06-ai-operating-model.md) | Every function mapped to an agent and a human checkpoint; Muse compatibility |
| [docs/07-website.md](07-website.md) | Sitemap, page copy, stack, audit page |
| [docs/08-roadmap-budget-kpis.md](08-roadmap-budget-kpis.md) | Phases, budget, KPIs, kill criteria |
| [docs/10-malaysia-launch.md](10-malaysia-launch.md) | Malaysia: pricing, languages, calling hours, Bland over a local carrier line, WhatsApp |
| [docs/11-sales-playbook.md](11-sales-playbook.md) | The sales process end to end: materials, sequences, every scenario, closing, onboarding, operations |
| [tools/pipeline/](../tools/pipeline/) | Warm pipeline bot, run by Claude Code |
| [tools/audit-visual/](../tools/audit-visual/) | Google-style before/after panels, real-screenshot capture, comparison image, email card, audit page |
| [outreach/email/](../outreach/email/) | Sequences (EN, FR) and reply playbook |
| [outreach/messages/](../outreach/messages/) | Message templates M1-M11: WhatsApp for Malaysia (EN, BM, 中文), text and email for the US |
| [outreach/voice/](../outreach/voice/) | Bland persona, call flows, API payload, post-call schema |
| [.claude/skills/](../.claude/skills/) | Agent playbooks as `SKILL.md` |
| [config/](../config/) | Market settings and the lead schema |
