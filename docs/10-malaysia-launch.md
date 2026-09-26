# Malaysia launch notes

**Research date:** 2026-09-26.

**Confidence tags:**
- **[R]** read in the vendor's docs source.
- **[S]** from search-result summaries.
- **[U]** unverified.

## 1. Market and pricing

**Market size and where to start**
- Malaysia has 1,086,386 micro, small and medium businesses (MSMEs), per DOSM's 2024 figures [S] ([DOSM](https://www.dosm.gov.my/portal-main/release-content/micro-small--medium-enterprises-msmes-performance-2024)). That is 96.1% of all establishments, and 84% of them are in services.
- Selangor has 23.2% of SMEs and Kuala Lumpur 14.3% [S]. **Start in the Klang Valley** (Petaling Jaya, Subang Jaya, Shah Alam, KL), then Penang and Johor Bahru.

**What competitors charge**

| Offer | Price |
|---|---|
| Review software ([SenangReview](https://senangreview.com/)) | RM50/month |
| Agency GBP setup ([Maximus](https://www.maximus.com.my/google-my-business-local-seo.php)) | from RM960 one-time |
| Agency local SEO ([ZenWeb](https://zenweb.my/blog/local-seo-price-malaysia/)) | RM800-3,500/month |
| NFC review stands ([UMAKE](https://umake.my/product/nfc-tap-and-review-google-business-review-acrylic-standee-qr-codenfc-office-shop)) | RM17.90-34.90 |

**The gap:** nothing is published between RM50 software and RM800 agencies [S].

**Recommended price ladder (to validate in the pilot)**

| Plan | Price | What's included |
|---|---|---|
| Keep | RM199/month | Hours and state-holiday updates, posts, replies to every review, monthly report |
| Grow | RM399/month | Weekly posts, about 8 photos a month, review stand included, rank tracking |
| Premium | RM699/month | Posts in Malay, English and Chinese; review follow-up over WhatsApp; competitor tracking |
| Setup | RM390, waived on a 12-month term | Claiming, verification coaching (most new Malaysian profiles need **video verification** [S]), full profile |

**Ask Maps**
- Ask Maps (Gemini in Maps) began rolling out in Malaysia in August 2026 [S] ([The Star](https://www.thestar.com.my/tech/tech-news/2026/08/10/google039s-ask-maps-feature-rolls-out-in-malaysia-provides-gemini-powered-recommendations-and-trip-planning)).
- The "Google's AI answers from your profile" argument therefore works in Malaysia too, in English at least.

## 2. Language and timing

**Language**
- Owners speak Malay, English, Chinese (Mandarin; Cantonese is common in Klang Valley commerce, Hokkien in Penang) or Tamil.
- The visuals and proposals are built in English, Malay and Chinese (see [docs/visual-options/](visual-options/)).

**When to call F&B owners** (inference, to confirm in the pilot)
- Call between rushes: 10:00-11:30 and 15:00-17:30.
- Avoid 12:00-15:00 on Fridays (Friday prayers).

**State weekends [S]**
- Kedah, Kelantan and Terengganu have a Friday-Saturday weekend.
- Johor returned to Saturday-Sunday in 2025, with a 2-hour Friday prayer break.

## 3. Calling Malaysian numbers with Bland (the main launch risk)

**What Bland can and can't do**

| Question | Finding |
|---|---|
| International calls | Allowed on standard plans after at least $5 of credit purchases, with an undisclosed international rate limit [R] ([calls.mdx](https://github.com/CINTELLILABS/docs/blob/main/api-v1/post/calls.mdx)) |
| International rates | Not published. Get a written quote. |
| Malaysian numbers from Bland | **Not sold.** Bland's number purchase supports US/CA only; other countries go through support [R] |
| Bring your own Twilio | Import a Twilio +60 number and pass it as `from`. Twilio's own permissions apply [R] ([custom-twilio.mdx](https://github.com/CINTELLILABS/docs/blob/main/tutorials/custom-twilio.mdx)). Twilio sells Malaysian numbers against a regulatory bundle of name, address and ID [S]. |
| Bring your own SIP carrier | Supported, with an Asia endpoint `asia2.sip.bland.ai`, but **Enterprise only** [R] ([SIP-integration.mdx](https://github.com/CINTELLILABS/docs/blob/main/enterprise-features/SIP-integration.mdx)). Local licensed SIP carriers charge about RM0.08-0.09/min [S]. |
| Cantonese | **Not supported by Bland** [R] |
| Malay and Mandarin | Listed as `ms` and `zh` [R] |
| WhatsApp from Bland | Enterprise only [R] |

**Caller ID risk:** Malaysia is blocking spoofed local numbers that arrive through international gateways [S] ([The Star, Jan 2026](https://www.thestar.com.my/news/nation/2026/01/25/scammers-using-caller-id-spoofing-to-impersonate-telcos-govt-agencies-says-bukit-aman)). A +60 caller ID on calls placed from abroad may be blocked or rewritten. A foreign caller ID gets fewer answers.

**What to do**
1. **Pilot caller ID.** Run 50-100 calls each through a Twilio +60 number (bring your own) and through Bland's default pool. Measure answer rates and how the number shows on Maxis, CelcomDigi and U Mobile.
2. **Move to a local carrier if needed.** If answer rates are poor, ask Bland for SIP access and use a local licensed carrier's trunk.
3. **Cantonese-speaking owners.** Use Retell (`yue-CN`) or Vapi (Azure/Speechmatics Cantonese) on the same numbers, or hand those calls to a human [R].

## 4. Sending the visual on WhatsApp

**Channel**
- **Reach:** WhatsApp reaches about 90% of Malaysian internet users, and about half of SMEs use WhatsApp Business [S].
- **Tooling:** send from your own backend through Meta's Cloud API (no platform fee) or 360dialog (from €49 per number per month). Bland's WhatsApp needs Enterprise.

**Permission to message**
- The owner has to agree to receive messages from you. A yes on the call counts as the closest match to Meta's accepted phone opt-in [S] ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in)).
- **Keep a record of each yes:** the recording line, the timestamp, the number, and the business name spoken.

**Cost and limits**
- **Template type:** the visual is a **Marketing** template with an image header.
- **Price:** about RM0.35 per delivered message [S].
- **Sending limits:** new accounts start at 250 recipients per 24 hours [S]. Blocks and reports lower that limit.

**Law to watch**
- The 2025 amendment to Malaysia's Communications and Multimedia Act adds section 233A on unsolicited commercial electronic messages [S] ([Conventus](https://conventuslaw.com/report/malaysia-overview-on-the-communications-and-multimedia-amendment-act-2025/)). It is not in force until the implementing regulations are issued; check its status before scaling WhatsApp.

## 5. Monthly cost at about 1,000 calls a week

| Item | Monthly |
|---|---|
| Bland Build ($299 + ~10,800 min × $0.12) | ~$1,600 |
| Local carrier or Twilio minutes | ~$275 |
| Bland international surcharge | unknown |
| WhatsApp marketing templates (~1,300 × RM0.35) | ~$110 |
| Outscraper (listings, reviews, photos) | ~$30-60 |
| Claude (proposals, ~4,000 per month) | ~$150-400 [U] |
| **Total** | **~$2,200-2,500**, plus any international surcharge |

**Pilot volume:** at 250 leads a week, expect roughly a quarter of these costs.

## 6. Competitors to position against

- **Agencies:** Maximus, ZenWeb, Hypercharge, MediaPlus, Locus-T, KCOM, BigDomain and Rekaweb.
- **Review tools:** SenangReview sends unhappy customers to a private form instead of Google. Google's policy forbids that, which gives us a clean differentiator: every customer goes straight to Google.
- **Fake-review sellers:** ReviewNow and INextz sell reviews at about RM20-30 each. We never sell reviews.
