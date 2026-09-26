# Executive summary

**Status:** plan v1, 2026-09-26. Built on the research in [01-research.md](01-research.md). Items marked *unverified* in that file need a check before money is committed.

## The business in one paragraph

A productized, done-for-you Google Business Profile (GBP) service for independent local businesses. It costs about **$99/month in the US** (about 69 € HT/month in France), sits between DIY software ($30-60) and human agencies ($125-700+), and is sold with a **personalized "your profile, fixed" audit** that shows the owner exactly what will change before they pay. AI agents do the prospecting, audits, copy, inbox handling, voice follow-ups, fulfillment and reporting. You work an approval queue and handle exceptions for about 5-15 hours a week.

![Sample before/after card](assets/sample-card-en.png)

## Where I think the original plan needs to change

You asked me to challenge the approach where it has flaws. Six changes, in order of importance:

### 1. AI cold calls through Bland cannot be the first touch

- **Bland forbids it.** Bland's own blog post is titled *"Why Bland Can't Be Used for AI Outbound Cold Calling Campaigns"*. Its terms put compliance on you, and repeated violations can close your account.
- **The law is mostly red.**
  - **US:** AI voices count as "artificial" under the TCPA (FCC 24-17, Feb 2024). Calls to mobile numbers need prior express written consent, with **no business-to-business exemption**. Many owners list their mobile on GBP. Damages are $500-1,500 per call, and class actions are possible.
  - **UK, Germany and Canada:** consent is required, even for calls to businesses.
  - **France:** unsettled for automated calls.
- **It reads as a scam.** Robocalls about "your Google listing" are a known fraud pattern. The FTC shut one down (Pointbreak Media), and Google warns owners about these calls on its own help pages. An AI voice calling a salon owner about their Google profile sounds exactly like that scam.

**Redesign:**
- **The advantage moves from the phone to the proof.** The personalized audit and visual go out by email. Direct-mail postcards are optional. Every channel is legal and hard to ignore.
- **Bland is still used where it is legal and welcome:**
  - calling back prospects who ask for a call (with consent captured);
  - answering our inbound line;
  - walking new clients through Google verification;
  - client check-ins.

See [04-outbound-engine.md](04-outbound-engine.md).

### 2. Muse is Meta's consumer agent, not a sales platform

- **What Muse is.** Meta launched Muse on 2026-09-08. It's a personal AI agent for consumers, available in the US on iOS, Android, the web and WhatsApp.
- **How it connects to Bland.** On 2026-09-10 Bland published setup docs for Muse, plus a $29.99/month "Agent Phone Plan". That plan allows one call at a time, 500 calls a day, US and Canada only.
- **What it isn't.** I found no Meta announcement naming Bland, and no agency, CRM or GBP features in Muse. It's built for personal-assistant scale, not campaigns, and the calling laws above apply to it too.
- **What "Muse-compatible" means in practice:**
  - an API-first system of record;
  - playbooks written as `SKILL.md` files;
  - Bland assets referenced by ID;
  - a Google Sheets mirror of the lead list.

  The repo is built that way. See [06-ai-operating-model.md](06-ai-operating-model.md).

### 3. Unclaimed profiles should be a secondary segment, not the main one

- **The owner has to verify.** Only the owner can claim and verify an unclaimed profile; an agency cannot do it for them. Verification is often by video. That's the step where deals will die.
- **Probably weaker buyers.** Unclaimed often signals an owner who isn't engaged online. This is my hypothesis, to be tested.
- **Better primary segment:** established businesses whose profile is claimed but neglected. That means 15-150 reviews, a rating of 4.0 or higher, a clear gap against the businesses shown next to them, few owner replies and stale photos.
- **Unclaimed profiles become an entry offer:** "we'll help you claim it for free."

### 4. "Keyword optimization" has to mean the right thing

- **Keywords in the business name get profiles suspended.** It is the #1 cause of suspensions, and there was a wave of them in Feb-Apr 2026.
- **Keywords elsewhere don't move rankings.** Keywords in descriptions, posts, replies or customer reviews showed no measurable effect in controlled tests (Sterling Sky).
- **Posting frequency doesn't move rankings either.** A 9-week test across 441 keywords showed no change.
- **What we sell instead:**
  - **Primary category choice** against the top 3 businesses in the map pack. This is the strongest lever on the profile.
  - A **steady flow of reviews**.
  - **A complete profile**: services, attributes, hours and website relevance.
  - **Protection**: watching for suggested edits, duplicates and suspensions.

  We post about 4 updates a month, for conversion and freshness, not rankings.

### 5. Review stands: design them to stay clearly inside Google's policy

- **Google's rules:** no review stations or kiosks on the premises, no review gating, no incentives, and (since April 2026) no staff quotas or asking customers to name staff in reviews.
- **What's fine:** a passive QR/NFC display that customers use on their own phones is common. Google's own marketing kit ships QR stickers.
- **The product is therefore a review kit:**
  - take-home cards first;
  - a passive counter display second;
  - post-visit email or SMS requests as the real engine;
  - everything points to our redirect link, which sends every customer straight to Google, with no filtering.

  See [03-service-offering.md](03-service-offering.md).

### 6. The easy parts are being commoditized, so the value has to be elsewhere

- **The easy parts are cheap or free now.** Semrush Local's $30 plan includes an AI GBP agent. Google is testing AI review replies and gives away AI description suggestions and review QR codes for free.
- **"We post for you" is no longer worth $99.** What is:
  - accountability;
  - judgment about categories and suspensions;
  - a policy-safe review engine;
  - the physical kit;
  - honest reporting (calls, directions);
  - a trustworthy brand in a market full of scams.
- **One new 2026 angle.** Google's Ask Maps (Gemini in Maps, launched 2026-03-12 in the US) answers "best X near me" from profile fields, reviews and websites. A complete profile now also means being quotable by AI.

## Recommendations

| Decision | Recommendation | Why |
|---|---|---|
| First market | **United States**, English | Cold email to businesses is legal under CAN-SPAM, prices are highest, Ask Maps is live, and Bland and Muse are strongest in English. |
| Second market | **France** (make it first if you are based there and prefer to sell locally) | Cold email to businesses is allowed if relevant to their profession, and phone prospecting of businesses is opt-out. Partoo charges 149 €/month on 12-month contracts, which we can undercut. |
| Avoid for outbound | Germany, UK, Canada | Consent is required for email and/or calls to businesses. |
| Verticals to pilot | **Auto repair** + one of **salons/barbers** or **independent restaurants** | Walk-in customers (so the kit works), trust-driven decisions, and "near me" searches. Vendasta found that focusing on one vertical improves client retention by 34%. |
| Name | **Mapkeeper** (alternatives: Mapfront, Wellpinned) | It says what we do: we keep your map listing. "Keeper" frames a subscription. It's easy to say on a call. Avoid "SEO": it's the word used in scam calls. |
| Price | Keep $99/mo, Grow $179/mo, setup $149 (waived for the first 25 clients) | Above the price of DIY software and below the cheapest human agency. Month to month. |
| Primary channel | Personalized audit by email: plain-text opener, then the audit page and visual | Deliverability: images and links in the first email hurt inbox placement. |
| Bland | Consented callbacks, inbound line, onboarding and retention calls | Legal, welcome, and what Bland supports. |
| Fulfillment | Localo Pro or a similar white-label tool first, then our own GBP API integration once Google approves access | API approval requires a verified profile active 60+ days (commonly reported, unverified), so apply now. |
| Orchestration | Self-hosted n8n + Claude API + skills in this repo | Cheap, portable, and compatible with Muse. |

## What you need to decide or do (in order)

1. **Confirm the first market and verticals.** Everything downstream (legal review, copy, price) depends on this.
2. **Pick a name.** Then run trademark searches (USPTO; plus EUIPO and INPI if you go to France) and buy domains. My search quota ran out before I could check trademarks.
3. **Book 1-2 hours with a lawyer** in your first market, using the questions in [09-compliance-checklist.md](09-compliance-checklist.md). Do this before any call that isn't inbound.
4. **Create a legal entity, Stripe account and business bank account.** Selling to US clients from outside the US may call for a US LLC; tell me where you're based and I'll research it.
5. **Create and verify a GBP for the agency itself**, then apply for GBP API access.
6. **Approve the budget** in [08-roadmap-budget-kpis.md](08-roadmap-budget-kpis.md): about $2.5-4.5k over the first 3 months.

## Map of this repo

| Path | What it is |
|---|---|
| [docs/01-research.md](01-research.md) | Consolidated research with sources and confidence levels |
| [docs/02-positioning-and-brand.md](02-positioning-and-brand.md) | Market, ideal customer profile, positioning, names, messaging |
| [docs/03-service-offering.md](03-service-offering.md) | Plans, deliverables, review kit, pricing, unit economics |
| [docs/04-outbound-engine.md](04-outbound-engine.md) | Lead sourcing, scoring, sequences, visuals, voice, infrastructure |
| [docs/05-fulfillment.md](05-fulfillment.md) | Onboarding, monthly operations, review engine, reporting |
| [docs/06-ai-operating-model.md](06-ai-operating-model.md) | Every function mapped to an agent and a human checkpoint; Muse compatibility |
| [docs/07-website.md](07-website.md) | Sitemap, page copy, stack, audit-page specification |
| [docs/08-roadmap-budget-kpis.md](08-roadmap-budget-kpis.md) | Phases, budget, KPIs, kill criteria |
| [docs/09-compliance-checklist.md](09-compliance-checklist.md) | Pre-launch checklist and questions for your lawyer |
| [tools/audit-visual/](../tools/audit-visual/) | Working renderer: prospect JSON to before/after PNG and audit page |
| [outreach/email/](../outreach/email/) | Cold sequences (EN, FR) and reply playbook |
| [outreach/voice/](../outreach/voice/) | Bland persona, call flows, API payload, post-call schema |
| [.claude/skills/](../.claude/skills/) | Agent playbooks as `SKILL.md` (usable by Claude Code now, portable to Muse) |
| [config/](../config/) | Compliance rules and the lead data schema |
