# Research findings (2026-09-26)

## How this was researched, and its limits

- **Method.** Six parallel research agents ran live web searches. Direct page fetches were blocked by this environment's network policy for most vendor, regulator and Google sites. The session's search quota (200) ran out before every gap was closed.
- **Confidence tags:**
  - **[V]** Verified today: from live search results or primary artifacts. Examples: Google API discovery documents, live API endpoint probes, GitHub source, npm/PyPI packages.
  - **[S]** From search-result summaries of the cited page; the page itself wasn't opened.
  - **[U]** Unverified, from model knowledge (to mid-2026). Check before relying on it.
- **Before spending money:** re-check pricing on vendor pages, and have a lawyer confirm the legal points.

---

## 1. Bland AI

- **Policy on cold calling [V]:** Bland's post ["Why Bland Can't Be Used for AI Outbound Cold Calling Campaigns"](https://www.bland.ai/blog/cold-calling) says AI voices need prior express written consent under the TCPA, "a condition inherently unmet in cold calling". Its [Terms](https://www.bland.ai/legal/terms) put compliance and indemnity on the customer.
- **Pricing, plan-based since 2025-12-05 [S]** ([pricing](https://www.bland.ai/pricing), [billing docs](https://docs.bland.ai/platform/billing)):

| Plan | Monthly fee | Per connected minute | Calls per day / per hour | Concurrent calls |
|---|---|---|---|---|
| Start | $0 | $0.14 | 100 / 100 | 10 |
| Build | $299 | $0.12 | 2,000 / 1,000 | 50 |
| Scale | $499 | $0.11 | 5,000 / 1,000 | 100 |

  Also: about $0.015 per call attempt (scope disputed), phone numbers $15/month, SMS $0.02.
- **Features [S/V]:**
  - Conversational Pathways: a graph of conversation steps, with knowledge-base and webhook steps. Adds about 800-900 ms of latency.
  - Personas (late 2025): versioned agent bundles.
  - Voice cloning, knowledge bases, mid-call tools, transfers.
  - Voicemail `action` = `hangup` / `leave_message` / `leave_message_and_sms`.
  - Batches (`POST /v2/batches`), Memory across calls, SMS, web chat, iMessage.
  - Integrations: HubSpot, Salesforce, Cal.com, Calendly, Zapier, Make.
  - **No native email.**
- **Languages [S]:** the "Fluent" speech-to-text model covers English, Spanish, German, French, Portuguese and Italian. Reviewers say English is clearly strongest, so pilot French before relying on it.
- **Latency [S]:** about 820 ms median and 2.1 s at the 95th percentile. Retell is about 610 ms and Vapi about 540 ms (a vendor-published benchmark, so potentially biased).
- **API and tooling [V]:**
  - Endpoints: `POST /v1/calls`, pathways with versions and staging/production publishing, JSON export of pathways. Post-call webhook with transcript and `recording_url`.
  - A hosted **MCP server** at `api.bland.ai/v1/mcp`, and a plugin for Claude Code with a pathway builder ([MCP docs](https://docs.bland.ai/integrations/mcp/overview), [plugins](https://github.com/CINTELLILABS/bland-plugins)).
- **Alternatives [U]:**
  - Retell: about $0.10-0.15/min all-in, lowest latency.
  - Vapi: $0.05/min platform fee plus the underlying model and telephony providers at cost; most flexible.
  - Synthflow: about $0.08-0.15/min, no-code.
  - ElevenLabs Agents: about $0.08-0.10/min plus the language model; best voices.
  - Air AI: reportedly sued by the FTC in 2025; avoid.

## 2. Muse (Meta) and the Bland connection

- **What Muse is [S]:** Meta's personal AI agent, launched 2026-09-08 in the US ([Axios](https://www.axios.com/2026/09/08/meta-debuts-muse-personal-ai-agent), [CNBC](https://www.cnbc.com/2026/09/08/meta-personal-ai-agents-public-reckoning-privacy-safety.html), [Meta](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)).
  - **What it does:** errands, scheduling, email, bookings, shopping.
  - **How it runs:** each user gets a private cloud VM (virtual machine) with a browser, scheduled jobs, sub-agents and custom skills.
  - **Connectors:** Gmail, Calendar, Workspace, Shopify, PayPal, Notion, GitHub, and others. "Custom connectors" can reach any public API, with keys hidden from the model.
  - **Pricing:** reported tiers of free, $20 and $100 per month [S].
- **Bland integration [V]:**
  - Bland's docs added a "Meta Muse" page on 2026-09-10 ([commit](https://github.com/CINTELLILABS/docs/commit/c5d721b800399c1c2e0716174a99b93143e73e50)).
  - Muse drives Bland through its REST API via a custom connector. Bland's page says Muse doesn't list MCP servers.
  - Two setup paths: paste an API key, or let Muse sign itself up through a device-code flow.
- **Agent Phone Plan [V]:** $29.99/month. One US number, one call at a time, 60 calls/hour, 500/day, US and Canada only.
- **Muse's own calling [S]:** it can call US businesses. 404 Media reports Meta tested routing some of those calls to human contractors.
- **Not found:**
  - any Meta announcement naming Bland;
  - any Muse import format for pathways, CRM data or brand kits;
  - any business or agency product.
  - Muse support for skills folders and MCP is unconfirmed.

## 3. Law and platform policy

**This is not legal advice.** See [09-compliance-checklist.md](09-compliance-checklist.md) for the questions to take to a lawyer.

### AI-voice calls to businesses

| Jurisdiction | Verdict | Key rule |
|---|---|---|
| US | **Red** by default, **amber** for verified business landlines only | FCC 24-17: AI voice = "artificial" under the TCPA [V]. Mobiles need prior express (written, for telemarketing) consent, with no B2B exemption [V]. §64.1200(b): identify the caller, give a number, provide an opt-out [V]. California AB 2905: a natural-voice announcement must come first [V]. Washington RCW 80.36.400 bans automatic dialing and announcing devices for solicitation [V]. Businesses are exempt from the Do Not Call registry, but mobile numbers are presumed residential [V]. |
| UK | **Red** | PECR reg. 19: automated calls need prior specific consent, including from companies [V]. Fines up to £17.5m or 4% of turnover since Feb 2026 [V]. |
| EU | **Red/amber** | ePrivacy Art. 13 [V]. AI Act Art. 50 (you must disclose that it's an AI) applies from 2026-08-02 and was not delayed by the Digital Omnibus [V/S]. |
| France | **Amber, leaning red** | Consumer calls became opt-in on 2026-08-11 (law 2025-594) [V]. Calls to businesses remain opt-out if relevant to their profession [V]. Automated calls (CPCE L34-5) to professionals are unsettled; sole traders are natural persons [V]. |
| Germany | **Red** | UWG §7(2): even B2B calls need presumed consent; automated calls need express consent [V]. |
| Canada | **Red** | The CRTC's automatic-dialing (ADAD) rules require express consent. Notice 2026-132 proposes explicit AI rules [V]. |

### Cold email to businesses

| Jurisdiction | Verdict | Key rule |
|---|---|---|
| US | **Green** | CAN-SPAM: truthful headers, postal address, opt-out honored within 10 business days [U]. |
| UK | **Amber** | Limited companies and LLPs: fine with an opt-out. Sole traders and partnerships need consent [U]. |
| France | **Green/amber** | CNIL: allowed if related to the recipient's profession, with information and an easy opt-out [V]. |
| Germany | **Red** | Express consent is required even B2B [V]. |
| Canada | **Amber** | CASL implied consent only via conspicuous publication and relevance to their role [U]. |

**Mailbox providers [S]:**
- **Gmail and Yahoo (since 2024):** SPF, DKIM and DMARC authentication; one-click unsubscribe; spam rate under 0.3% (target under 0.1%). Enforcement by rejection since Nov 2025.
- **Microsoft:** the same, enforced since 2025-05-05.

### Mockups and Google brand

- **Rules for the mockup [U]:**
  - no Google logos;
  - label it "illustrative mockup";
  - **no invented ratings or review counts** on the "after" side;
  - blur reviewer identities (they're personal data);
  - no guaranteed rankings.
- **Data sources [U]:** Maps Platform terms ban scraping the Google UI and building databases from Places data. Third-party data providers carry the scraping exposure. CNIL fined KASPR €240k for scraping contact data in Dec 2024.

### Google review and agency policies [S/U]

- **Reviews:**
  - no gating, no incentives, no staff reviews, no discouraging negative reviews;
  - since 2026-04-17, no staff quotas and no asking customers to name staff;
  - "don't set up review stations or kiosks" on premises;
  - since 2026-02-11, reviews may be restricted on profiles with suspicious patterns.
- **Agencies:** the owner keeps ownership and adds the agency as a manager. No claims of Google affiliation or guaranteed rankings.
- **FTC Consumer Review Rule** (16 CFR 465, since 2024-10-21) [V]: bans fake reviews (including AI-generated ones), review suppression and conditional incentives. About $53k per violation.
- **UK DMCC Act (Apr 2025):** fines up to 10% of global turnover [U].
- **EU Omnibus Directive** (since 2022) [U].
- **Health businesses:** never confirm that someone is a patient in a review reply. HHS has fined dental practices under HIPAA over this [U].

## 4. Google Business Profile in 2026

**Product changes:**

| Change | Status |
|---|---|
| Profile websites (business.site) | Shut down in 2024 [S] |
| Chat and call history | Removed in July 2024 [S] |
| Q&A | API discontinued 2025-11-03; public section phased out from Dec 2025. The endpoint returns 404 today [V]. |
| Ask Maps (Gemini in Maps) | Launched 2026-03-12, US and India first. Answers from profile fields, reviews, photos, menus and websites [S] |
| AI review replies | Test in the GBP dashboard [S] |
| WhatsApp and SMS contact links | Added [S] |
| Google messaging with an AI agent | Being reintroduced as a US pilot [S] |

**Ranking factors [S]:**
- **Whitespark Local Search Ranking Factors 2026:** the top local-pack factors are primary category, proximity and keywords in the business name (which get profiles suspended when faked). Being open at search time is #5. Reviews and behavioral signals are rising. A wrong primary category is the #2 negative factor.
- **Sterling Sky tests:**
  - posts showed no ranking effect over 9 weeks and 441 keywords;
  - review count gives a lift around 10 reviews, then plateaus, so recency and steady flow matter;
  - keywords in reviews have no effect;
  - owner replies don't affect rankings (Joy Hawkins), but they do affect conversion.
- **Myths:** geotagged photos (Whitespark's #1 myth), frequent posting for rankings, keyword-stuffed descriptions.

**APIs [V]** (live discovery documents, revision 20260923):

| API | What it covers |
|---|---|
| Business Information v1 | Categories, description, hours, special hours, services, attributes, `getGoogleUpdated`, `newReviewUri` |
| Account Management v1 | Admins and invitations; roles PRIMARY_OWNER / OWNER / MANAGER; location groups; transfer |
| Verifications v1 | ADDRESS, EMAIL, PHONE_CALL, SMS, AUTO, TRUSTED_PARTNER. **No video method**; video happens in the UI |
| Performance v1 | Impressions, calls, directions, website clicks, bookings, monthly search keywords |
| Notifications | NEW_REVIEW, GOOGLE_UPDATE, DUPLICATE_LOCATION, VOICE_OF_MERCHANT_UPDATED, and others |
| Legacy v4, still live | `localPosts`, reviews and reply, media upload, food menus |

- **Access:** apply through a form. Approval raises the quota from 0 to 300 requests per minute [S].
- **Eligibility [U]:** reportedly a verified profile active 60+ days, a website, and a matching domain email.

**Lead data:**

| Source | Claimed/verified flag | Price | Notes |
|---|---|---|---|
| Google Places API (New) | **No** [V] | About $20-35 per 1k [U] | No total photo count or owner replies. Terms forbid building lead databases. |
| DataForSEO | `is_claimed` [V] | About $1.5-5 per 1k [U] | Also `total_photos`, reviews with `owner_answer`, and posts (Updates) [V] |
| Outscraper | `verified` [V] | About $3 per 1k (+$3 per 1k for emails and contacts) [S] | `photos_count`, posts |
| Apify | `claimThisBusiness` [U] | About $4 per 1k [U] | |

**What owners get free:**
- all of GBP;
- a review link and QR code;
- AI description suggestions and AI replies (testing);
- the Performance dashboard;
- Google's Marketing Kit ([marketingkit.withgoogle.com](https://marketingkit.withgoogle.com/)): posters and stickers; physical ordering is intermittent.

Owners can do about 80% of the mechanics themselves. What they lack is time, judgment and consistency.

## 5. Market and competitors

**Software you use yourself (DIY) [S]:**

| Tool | Price |
|---|---|
| GMB Everywhere | $15-30 |
| Pleper | from $9 |
| OneUp | from $12 |
| Moz Local | $16-40 |
| Semrush Local | $30 Base, which **includes an AI GBP agent, AI posts and review auto-replies**; $60 Pro |
| BrightLocal | $39-59 |
| Localo | $39-49 single; Pro from $149-169 for up to 60 profiles |
| Merchynt Paige | $99 per profile |
| Local Falcon (rank grids) | $24.99-199.99 |

**Reputation suites [S]:**

| Tool | Price |
|---|---|
| Birdeye | $299-449+ per location |
| Podium | $399-599, 12-month contract |
| Yext | about $199-999 per location per year |
| Synup (agency) | $99-999 |
| Partoo (France) | from 149 €/month, 12-month contract |

**Done-for-you agencies [S]:**
- US freelancers: $125-285/month.
- US agencies: $300-700/month; full "map pack" work $800-1,200; setup $300-500.
- UK: from about £300.
- France: 100-500 €.

**White-label wholesale [S]:**
- Localo Pro: about $2.50-2.80 per profile at 60 profiles.
- Vendasta Local SEO Pro: $11.50 per location.
- GMB Gorilla done-for-you: $200.
- DashClicks: $149-249.
- Merchynt partner price: conflicting sources.

**Churn and retention [S]:**
- Small-business monthly plans lose 3-7% of customers per month; 43% of those losses happen in the first 90 days.
- Vendasta's study of 200k+ small businesses: clients with one product had 30% retention at 2 years; with four products, 80%. Clients not upsold within 3 months churned more. Agencies focused on one vertical had +34% retention at 3 years.

**Scam context [S]:**
- The FTC's Pointbreak Media case: "Google listing" robocalls; 4,467 businesses refunded, $1.8M+.
- Google's help page on fraudulent calls ([support](https://support.google.com/business/answer/6212928)).
- A Google lawsuit (2025) against about 10k fake Maps listings.
- France: the DGCCRF (consumer-fraud authority) warns about business-directory scams.

**Review stands [U]** (research incomplete):
- Retail: about $15-45 per stand.
- Alibaba: about $1-5 per unit with NFC (NTAG213) and custom print, minimum orders of 50-500.
- Import duties on small parcels rose in 2025-2026 [U].
- No independent data shows that stands increase reviews.

## 6. Outbound and operations tooling [S unless noted]

- **Sending platforms:**
  - Instantly: Growth $47 (1k contacts), Hypergrowth $97 (25k contacts, API).
  - Smartlead: Pro $94 (API starts at Pro).
  - lemlist: $79 plus $9 per extra sender.
- **Mailboxes:** Zapmail, Premium Inboxes and Mailforge at about $3-4.50 per inbox. Google Workspace is $7-8.40. Microsoft 365 Basic went to $7 on 2026-07-01.
- **Sending volume:** 30-50 emails per inbox per day including warmup; warm up for 14-21 days. For 1,000 prospects a week you need about 30 inboxes on about 10 domains.
- **Benchmarks:** Instantly's 2026 report gives a 3.43% average reply rate and 5.5%+ for the top quartile. Best practice is 4-7 steps under 80 words each. **No reply-rate data specific to local businesses was found.**
- **Visuals:** plain text beats images in the first email. Use 0-1 links in the first email, and put the visual on a branded audit page or send it in the thread after a reply.
- **Rendering:** Playwright on Cloudflare Browser Rendering costs about $5/month at this volume. Bannerbear is $49-149, Hyperise $49-149.
- **Enrichment:**
  - Outscraper emails and contacts: $3 per 1k.
  - Prospeo: $39 per 1k credits.
  - Findymail: $49 per 1k, charged only for verified results.
  - MillionVerifier: about $37 per 10k.
  - Twilio Lookup (landline or mobile check): about $0.008 per lookup.
  - Clay: from $185.
- **Orchestration:** n8n self-hosted is free for internal business use [V license]. Attio or Twenty as CRM. Stripe Checkout with a terms-of-service checkbox. Stripe runs a hosted MCP server [V].
- **Claude API [V]** (per 1M tokens, input / output):

| Model | Price |
|---|---|
| Haiku 4.5 | $1 / $5 |
| Sonnet 5 | $2 / $10 |
| Opus 5 | $5 / $25 |

  The Batch API is 50% off. Estimated LLM cost at 1,000 prospects a week: $60-120/month.
- **Audit pages:**
  - use unguessable tokens of 128+ bits;
  - send `X-Robots-Tag: noindex`;
  - don't block the pages in robots.txt (crawlers must see the noindex);
  - expire them after 60-90 days.

## Open research items

To close with a normal search budget:

1. Review-stand supplier quotes and minimum order quantities. Order samples.
2. Exact current Bland terms and acceptable-use wording.
3. Retell and Vapi compliance features, if you want a US landline-only calling test.
4. Direct-mail postcard API pricing (Lob, or similar) for the optional postcard channel.
5. GBP API access eligibility wording on the live prereqs page.
6. Trademark availability for the chosen name.
7. Whether you need a US entity to sell to US clients from your location.
