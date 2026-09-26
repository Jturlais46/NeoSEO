# Service offering

**Design rules:**
- Every deliverable must either move rankings (evidence-based), move conversion, or protect the profile.
- Everything else is cut, even if competitors sell it.

## 1. Plans

US prices first; France prices (HT, excluding VAT) in brackets.

| | **Setup** (one-time) | **Keep** | **Grow** |
|---|---|---|---|
| Price | $149 (99 €), waived for the first 25 clients and on annual prepay | **$99/mo** (69 €) | **$179/mo** (129 €) |
| Contract | n/a | Month to month | Month to month |
| Best for | Everyone, once | Most independents | Businesses that want reviews faster and proof of results |

### Setup (done within 7 days of access)

1. **Access and verification.**
   - If the profile is claimed: the owner adds our business group as Manager (guided).
   - If it's unclaimed: we coach the owner through Google verification on a guided call, with a video-verification checklist.
2. **Profile health check.** Business name, address and service-area setup, duplicates, pending edits and suspension risk.
3. **Category research.** Compare against the 3 businesses ranking above them in the map pack, then set the primary and secondary categories.
4. **Complete the profile:**
   - description (750 characters, factual, no keyword stuffing);
   - services, products and menu;
   - attributes;
   - regular and holiday hours;
   - website, booking and messaging links.
5. **Photos.** 15-25 real photos from the owner (upload link, or text them to us) or from their Instagram with permission. Curated and uploaded. **Never stock photos.**
6. **Review backlog.** Answer every existing review that has no reply. Replies to negative reviews are approved by the owner first.
7. **Review kit shipped** (see section 3). Personal review link and QR code set up.
8. **Other listings.** Apple Business Connect and Bing Places claimed and synced with the same information.
9. **Baseline report.** Performance data, rank grid (7×7) for 3 key searches, review count and rating, recorded as the starting point.

### Keep, every month

| Deliverable | Frequency | Why (evidence) |
|---|---|---|
| Updates: offers, events, news, with a photo and a call-to-action button | 4 per month | Conversion and freshness. **Not** sold as ranking. |
| New real photos | 8-10 per month | Conversion. Owners get a monthly text asking for photos, with a shot list. |
| Review replies | Within 48 h. Positive: auto-posted from approved templates. Negative: owner approves. | Trust and conversion. Owners who reply win back unhappy customers. |
| Hours, holiday hours, seasonal changes | Continuous; we ask 2 weeks before each holiday | "Open at search time" is a top-5 factor |
| Watching suggested edits and hijacks | Daily check | Protects the profile from bad edits by third parties |
| Duplicate and suspension watch, plus recovery if needed | Daily check; recovery included | Protection |
| Category re-check against competitors | Quarterly | The #1 lever; competitors change |
| Reporting spam competitors (fake names, fake addresses) | Quarterly | Removes competitors who rank by breaking rules |
| Monthly report in plain English | Monthly | Calls, directions, website clicks, search terms, reviews, one rank grid |

### Grow = Keep, plus:

| Deliverable | Detail |
|---|---|
| Automated review requests | Email or SMS after each visit, sent from the business's customer list (CSV upload, or connecting their booking or point-of-sale system through Zapier or n8n). Every customer gets the same message; there's no filtering. |
| Rank grid | Weekly, 3 keywords |
| AI answer check | Monthly: does Google's AI (Ask Maps, AI Overviews) or ChatGPT mention you for "best [service] in [city]"? What's missing? |
| Competitor watch | Alert when a competitor jumps in reviews or changes category |
| Quarterly strategy note | 1 page: what worked, what's next |

## 2. What we deliberately don't sell (and say so)

| Common agency offer | Why not |
|---|---|
| Keywords in the business name | The #1 cause of suspension; against Google's guidelines |
| Daily or 3-7 posts a week "for rankings" | No measured effect on rankings |
| Geotagged photos | A myth; Google strips the location data |
| Q&A seeding | The feature is gone |
| Blasts to hundreds of directory listings | Only the core listings matter (about 6-7% weight). We do Apple, Bing and the core directories only. |
| Fake, bought or "review exchange" reviews | Google detects and removes them, and can restrict the profile |
| "Guaranteed #1" | Impossible to guarantee, and misleading |

Saying this publicly is part of the trust positioning.

## 3. The review kit (physical product)

### What's in the kit (included in Setup; the client keeps it)

- **1 counter display:** acrylic, with QR code and NFC chip, and the business name.
- **100 take-home cards:** QR code on one side, "How was your visit?" on the other.
- **Personal review link:** `mpk.to/<slug>`. Both the QR code and NFC chip point to it, and it redirects straight to the Google review form using the profile's `newReviewUri` from the Business Information API.

### Design notes

- **Customers tap or scan with their own phones** and land straight on the Google review form.
- **Keep review flow steady.** Google restricts profiles with sudden review spikes (since 2026-02), so the kit and follow-up texts spread requests over time.
- **The chip is locked** so strangers can't rewrite it.
- **The link keeps working forever, even if the client cancels.** This is a trust promise, and costs us almost nothing.

**Why our own redirect link:**
- we can track taps and scans (a report metric);
- we can repoint the link if the profile changes;
- the kit becomes a tangible part of the service.

### Sourcing plan

| Option | Unit cost (unverified) | Pros | Cons |
|---|---|---|---|
| Alibaba blanks (acrylic stand with NTAG213 chip) + a local label printer | ~$1-5 per stand + ~$0.10 per sticker | Cheapest; we print and encode in-house per client | Minimum orders of 50-500, import duties, you handle packing (or hire a virtual assistant) |
| Print-on-demand cards (Moo, Vistaprint, or a local printer) + stock stands | Cards ~$0.10-0.30 each | Customized per client, shipped direct | Stand still comes from stock |
| White-label review-stand vendor | ~$10-20 | No inventory | Margin; dependent on their link platform |

**Recommendation:**
- Order 3 supplier samples in week 1.
- Start with 50 blank stands and a label printer: you encode and ship.
- Move to a fulfillment partner once you're past about 20 kits a month.
- **Budget:** $300-500 for the first inventory.

**Extra stands:** sold at $29 each (for multi-till shops).

## 4. Add-ons (offer within 90 days, because clients who buy more stay longer)

Vendasta's data: clients with one product had 30% retention at 2 years; with four products, 80%.

| Add-on | Price | Cost to us |
|---|---|---|
| Extra review stand | $29 | ~$5-8 plus shipping |
| Photo session (local photographer, 1 hour, 30 edited photos) | $249 | Pass-through (~$150-200) plus margin. Photographer marketplaces to be researched. |
| One-page website (for businesses without a site; Google's free sites closed in 2024) | $29/mo | Astro template + hosting, ~$1 |
| Extra location | -20% per location | |
| AI answer check (for Keep clients) | $19/mo | ~$1 |

## 5. Unit economics (US Keep plan; assumptions to validate)

| Line | $/client/month | Notes |
|---|---|---|
| Revenue | 99.00 | |
| Stripe fees | -3.40 | ~2.9% + 30¢ + Billing ~0.7% [U] |
| Fulfillment tool (Localo Pro seat share, until our API integration) | -3.00 | [S] ~$2.50-2.80 at 60 profiles; higher at first |
| Rank grid (Local Falcon, 1 grid per month) | -0.50 | [S] |
| LLM (drafting, replies, report) | -2.00 | [V] prices; volume estimated |
| Kit (spread over 12 months) | -1.50 | ~$10-15 kit + shipping, one-time |
| Your review time (~15 min/month early, ~5 min later, at $40/h) | -10.00 → -3.00 | Falls as approvals become automatic |
| **Gross margin** | **~$78-88 (79-89%)** | |

**Lifetime value and cost per client:**
- **Lifetime value at 5% monthly churn:** about 20 months × about $80 ≈ **$1,600 gross profit**. At 8% churn, about $1,000.
- **Target cost to win a client:** under $300 (payback in 4 months or less).
- **Fixed costs:** the stack is about $300-600/month, so **break-even is about 5-8 clients**.

**Revenue targets** (targets, not forecasts; see [08](08-roadmap-budget-kpis.md)):
- Month 6: 30 clients ≈ $3k MRR (monthly recurring revenue).
- Month 12: 100 clients ≈ $10k MRR.

## 6. Service promises and terms

**Response times:**
- negative reviews flagged to the owner within 24 h;
- positive replies within 48 h;
- support replies within 1 business day.

**Terms:**
- **Month to month.** Cancel in the portal and it takes effect at the end of the billing period.
- **14-day money-back guarantee on the first month.** This also covers France's 14-day right of withdrawal for firms with 5 or fewer employees (Code de la consommation L221-3), so we apply it everywhere.
- **The client always stays Primary Owner.** On cancellation we remove ourselves as Manager within 48 h and send a handover sheet (logins we set up, photo library).
- **No results guaranteed.** We commit to the deliverables, not to rankings.
- **Data processing.** We act as the client's processor for their customer lists (review requests). We need a data processing agreement (DPA) and a subprocessor list (Stripe, Twilio, email provider, LLM provider).

**Health businesses:** we never mention treatment or confirm that someone is a patient in replies. All replies need owner approval.
