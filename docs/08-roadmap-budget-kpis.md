# Roadmap, budget and KPIs

## 1. Phases

### Phase 0: Foundations (week 0-1)

| Task | Owner | Notes |
|---|---|---|
| Decide market, verticals, name | **You** | See [02](02-positioning-and-brand.md) |
| Trademark search, buy domains (main + 5 secondary) | You (Claude prepares list) | USPTO / EUIPO / INPI |
| Bland account, local numbers, 3 test voices | Claude sets up, you pay | Start plan is free |
| Entity, bank, Stripe | **You** | Tell me your country; I will research the US-entity question |
| Create and verify the agency's own GBP; site placeholder; domain email | You + Claude | Starts the 60-day clock for GBP API eligibility [U] |
| Order 3 review-stand samples | Claude researches, you order | |
| Mailboxes bought, DNS set, warmup started | Claude (scripted), you pay | Warmup needs 2-3 weeks, start day 1 |

### Phase 1: Build (weeks 1-3)

| Task | Owner |
|---|---|
| Astro site: home, pricing, audit form, about, legal, /stop | Claude |
| Audit page Worker + redirect Worker on Cloudflare | Claude |
| n8n: sourcing → enrichment → gate → scoring → audit → render → Instantly | Claude, you approve |
| Skills tuned on 30 real audits in each pilot vertical (you review all 30) | Claude + you |
| Reply triage + approval queue in Telegram/Slack | Claude |
| Bland: first_call, follow_up, walkthrough_close and inbound flows; test 20 calls on yourself and friends | Claude + you |
| Stripe products, Checkout links, portal, terms | Claude drafts, you approve |
| Fulfillment tool account (Localo Pro or similar), setup checklist | Claude |
| Apply for GBP API access | You submit, Claude drafts the application text |

### Phase 2: Pilot (weeks 4-9)

- **Volume:** 250 prospects/week (weeks 4-5), then 500/week. 2 verticals × 3 cities.
- **First 10 clients:** white-glove. You join the onboarding calls and personally check every setup.
- **Tests, one variable at a time:**
  - subject line and opener angle, by segment;
  - link in email 2 vs. only after a reply;
  - Keep at $99 vs. $129 (split by city);
  - optional: 200 direct-mail postcards.
- **Autonomy:** move agents up the autonomy ladder as they meet the promotion criteria in [06](06-ai-operating-model.md).

### Phase 3: Scale (weeks 10-16)

- Go to 1,000 prospects/week, but only if the pilot KPIs hold (below).
- Launch Grow; add the review-request integrations.
- Swap to our own GBP API integration once approved.
- Decide on a second market (France), or add a third vertical.

## 2. Budget: first 3 months (moderate: $1-5k)

| Item | One-time | Monthly | 3-month total | Confidence |
|---|---|---|---|---|
| Entity + registered agent (if US LLC needed) | $0-500 | | $0-500 | [U], depends on your country |
| Domains (main + 5-10 secondary) | $100-200 | | $100-200 | [U] |
| Review kit inventory (50 stands, cards, label printer) | $300-500 | | $300-500 | [U] |
| Mailboxes (15 → 30) | | $55-115 | ~$250 | [S] |
| Instantly Hypergrowth | | $97 | ~$290 | [S] |
| Lead data + enrichment + verification | | $60-150 | ~$300 | [S] |
| Fulfillment tool (Localo Pro or similar) | | $50-170 | ~$250 | [S] |
| Local Falcon (rank grids) | | $25 | $75 | [S] |
| Claude API | | $40-120 | ~$200 | [V] |
| Bland: Start plan at 250 leads/week, Build ($299/mo) above 100 calls/day; 3-5 local numbers | | $300-800 | ~$1,200 | [S] |
| Cloudflare (Workers Paid) + n8n VPS | | $15-25 | ~$60 | [S/U] |
| CRM (Attio free / Twenty self-hosted) | | $0-36 | ~$50 | [U] |
| Optional: 200 direct-mail postcards | $150-300 | | $150-300 | [U] |
| **Total** | | | **~$3k-5k** | Top of the moderate budget. To stay near $3k, keep calls at 250 leads/week until the pilot proves conversion. |

Revenue from the first clients starts covering the monthly stack from about month 3. Target: 5-10 clients by the end of week 9. The funnel model in [04](04-outbound-engine.md) gives about 7 from ~2,400 pilot prospects, plus any inbound audit requests.

## 3. KPIs (weekly dashboard, produced by the Digest agent)

| Stage | KPI | Target (pilot) | Alarm |
|---|---|---|---|
| Deliverability | Bounce rate | <2% | >3% auto-pause |
| | Spam complaint rate | <0.1% | >0.2% auto-pause |
| Calls | Owner reached (any of 3 attempts) | ≥30% | <15% |
| | Conversation → positive (link sent or call booked) | ≥15% | <5% after 200 conversations |
| | Answer rate per number | ≥10% | <5%: rotate numbers |
| Interest | Reply rate | ≥3% | <1.5% after 1,500 sends |
| | Positive reply + audit engagement | ≥1.2% | <0.5% after 3,000 sends |
| | Audit page view rate (recipients of email 2) | ≥15% | <5% |
| Close | Checkout rate from positive replies | ≥25% | <10% |
| | Win cost per client (variable stack ÷ clients won) | <$300 | >$500 |
| Onboarding | Access granted within 14 days | ≥80% | <60% |
| Delivery | Setup done within 7 days of access | ≥90% | <75% |
| Retention | Monthly churn (months 2-3) | <6% | >10% |
| | Refunds within 14 days | <10% | >20% |
| Quality | Audit material-error rate (spot checks) | ≤2% | >5% |
| Outcome (client) | Calls + directions vs. baseline at day 90 | Up (median client) | Flat or down for most clients |

## 4. Kill, pivot or double-down rules

- **After 3,000 prospects with fewer than 0.5% positive replies:**
  - change the segment first (vertical, city size);
  - then change the offer (free kit-first trial, lower price);
  - then change the channel (postcards, human calls in France).
- **Onboarding below 60%:** stop outbound, and fix verification coaching and access guides before spending more.
- **Churn above 10% monthly by month 3:** interview every cancelled client. Likely causes are unclear value or a weak report. Fix the report before scaling.
- **Everything green at 500/week:** scale to 1,000/week, then decide on France.

## 5. What would make this fail (pre-mortem)

1. **Deliverability collapse from over-sending.** Guarded by volume caps, auto-pause and domain rotation.
2. **Audits with wrong facts erode trust.** Guarded by strict data-only prompts, confidence flags and spot checks.
3. **Owners never finish verification.** Guarded by coaching calls, the video checklist and the refund policy.
4. **Commoditization by Google's own AI tools.** Mitigation: accountability, the physical kit, protection and honest reporting. Revisit the offer quarterly.
5. **Calling numbers get flagged as "Spam Likely".** Guarded by local numbers, low daily volume per number, rotation when the answer rate drops, and stopping anyone who says stop.
6. **Your time balloons.** Guarded by autonomy promotion criteria, and by fixing the root cause of recurring exceptions.
