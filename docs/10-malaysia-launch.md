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
- The visuals and proposals are built in English, Malay and Chinese (see [docs/visual-options/](visual-options/)). Each target in `config/targets.yaml` sets the language; the pipeline writes the proposal, the visuals and the Bland voicemail in it.

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

### With a Bland Enterprise account: yes, through your own Malaysian carrier line

**Verdict: a conditional yes.** Bland Enterprise can call Malaysian businesses from a genuine **03** number, but only by connecting a licensed Malaysian carrier to Bland over SIP (Bland's bring-your-own-carrier option). The carrier issues the numbers to your company and places the calls from inside Malaysia, so they pass the anti-spoofing filters.

The other routes risk being blocked or having the number rewritten:
- **Bland's own numbers:** US and Canada only.
- **Bring-your-own Twilio +60 numbers:** they enter Malaysia through international gateways.
- **A mobile 01x caller ID:** not realistic over a SIP line; plan on 03 numbers.

**What Bland needs [R]** (from `enterprise-features/SIP-integration.mdx` and `api-v1/post/sip-attach.mdx`, docs dated 2026-09-23):

| Item | Requirement |
|---|---|
| Endpoint | Asia-Pacific `asia2.sip.bland.ai:5061` (hosted in Sydney) |
| Connection | TLS 1.2+ for the signaling, SRTP for the audio (AES_CM_128_HMAC_SHA1_80) |
| Codecs | PCMU, PCMA, Opus, G.722 |
| Authentication | Trusted IP addresses, or registration with a username and password |
| Numbers | Attach each 03 number with `POST /v1/sip/attach`, then pass it as `from` on each call |
| Callbacks | The attached numbers also receive calls, so owners who call back reach Kit's inbound flow |
| Price | Plan rate per minute plus your carrier's charges; no discount for bringing your own line |

**Docs conflict.** A changelog entry dated 2026-03-23 says the SIP feature was removed for all organizations. **Get SIP written into the Enterprise contract.**

**Setup path**
1. **Malaysian company.** A Sdn Bhd registered with SSM. Carriers typically ask for:
   - the SSM certificate;
   - the director's MyKad or passport;
   - proof of a Malaysian office address;
   - a letter describing how the numbers will be used (AI-assisted B2B calls, about 4,500 a month).
2. **Carrier quotes.** 5-10 simultaneous call lines (channels) and 2-5 numbers from:
   - **AlienVoIP:** internet-delivered, TLS/SRTP, numbers in 1-2 days. The best fit for a direct connection.
   - **ITGTEL:** RM0.08-0.09/min.
   - **Maxis Business SIP:** 4-7 sen/min, but runs over Maxis's own line.
   - **TIME dotCom.**

   Get written confirmation that AI-assisted outbound calls are allowed.
3. **Connection.**
   - **Direct:** if the carrier offers TLS/SRTP over the internet and accepts Bland's Sydney IP addresses.
   - **Through a small relay server:** otherwise, host one in Malaysia (Asterisk, FreeSWITCH or Kamailio). It speaks Bland's secure format on one side and the carrier's on the other, and pins the caller ID to your own numbers. It costs about $30-100/month.
4. **Bland configuration.**
   - Create the trunk: `POST /v1/sip/trunks`.
   - Attach the +603 numbers in both directions.
   - Test with `/v1/sip/test-call`.
5. **Pilot.** Place 50-100 calls to test phones on Maxis, CelcomDigi, U Mobile, Unifi Mobile and TM fixed lines. Check how the number displays, the answer rate and the delay.

**Monthly cost at about 11,000 minutes**

| Item | Monthly |
|---|---|
| Bland ($0.11-0.14/min, Enterprise is custom) | ~$1,210-1,540 |
| Carrier minutes (RM0.07-0.09) | ~$180-240 |
| Channels, numbers, relay server | ~$100-200 |
| **Total** | **~$1,450-1,950**, plus any Bland international surcharge |

**Ask Bland:**
- Is SIP in the contract?
- Can the line to the carrier use plain UDP or TCP?
- In which headers and format does the caller ID go?
- What is the rate for +60 calls that go out through our own line?
- What are the limits on simultaneous calls and calls per second?
- Where are recordings stored?

**Ask the carrier:**
- Do you accept foreign directors?
- Can the line be delivered over the internet with TLS/SRTP?
- Will our number display unchanged on every network?
- Do your terms allow AI-assisted calls?
- What are the rates, billing increment and minimum term?

**If this can't be set up,** sell in the US with Bland first. Malaysia can start with the warm pipeline and visuals only: send the visual over WhatsApp after a human call, until the local line is live.

**Cantonese-speaking owners:** use Retell (`yue-CN`) or Vapi on the same carrier line, or a human caller [R].

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
| Bland Enterprise over your carrier line (section 3) | ~$1,450-1,950 |
| WhatsApp marketing templates (~1,300 × RM0.35) | ~$110 |
| Listings, reviews, photos | $0: Google Maps scan by the pipeline bot |
| Proposals (~4,000 per month) | $0 extra: Claude Code on your subscription. At this volume, plan on a Max plan and several runs a day [U] |
| **Total** | **~$1,560-2,060**, plus the Bland Enterprise minimum and any international surcharge |

**Pilot volume:** at 250 leads a week, expect roughly a quarter of these costs.

## 6. Competitors to position against

- **Agencies:** Maximus, ZenWeb, Hypercharge, MediaPlus, Locus-T, KCOM, BigDomain and Rekaweb.
- **Review tools:** SenangReview sends unhappy customers to a private form instead of Google. Google's policy forbids that, which gives us a clean differentiator: every customer goes straight to Google.
- **Fake-review sellers:** ReviewNow and INextz sell reviews at about RM20-30 each. We never sell reviews.
