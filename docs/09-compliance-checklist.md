# Compliance checklist

This is research-based guidance, not legal advice. Anything marked **[Lawyer]** needs sign-off from qualified counsel in your launch market before you go live.

## Before any outreach

- [ ] Legal entity, postal address and a named person are shown in every email and on every page.
- [ ] The privacy notice explains the source of prospect data, the purpose, the legal basis (EU/UK: legitimate interest), retention, rights, and an opt-out route. **[Lawyer]**
- [ ] A legitimate interest assessment is on file (EU/UK only). **[Lawyer]**
- [ ] One suppression list covers email, phone, SMS, mail and place ID, and every channel checks it. `/stop` writes to it instantly.
- [ ] `config/compliance.yaml` rules are implemented, and tests cover them (country rules, legal form, state rules, calling windows).
- [ ] Data retention: prospects with no reply are deleted 12 months after the last contact.

## Email

- [ ] SPF, DKIM and DMARC are set on every sending domain. One-click List-Unsubscribe is on.
- [ ] Every message has an honest subject line, the sender's identity, a postal address and a one-line opt-out.
- [ ] Opt-outs are processed immediately. The legal limit is 10 business days under CAN-SPAM; we do it the same day.
- [ ] UK: sole traders and partnerships are excluded unless they have given consent. Limited companies and LLPs are allowed.
- [ ] Germany: excluded.
- [ ] Canada: excluded until CASL implied consent is assessed. **[Lawyer]**
- [ ] France: the offer relates to the recipient's profession. Each email includes a short data-source and privacy link. **[Lawyer]** to confirm the wording.

## Voice (Bland)

- [ ] No AI calls to anyone without `consent_status` in [written, inbound, client].
- [ ] The consent form wording names the company, covers AI or artificial-voice calls, and says consent is not a condition of purchase. It is E-SIGN compliant, and consent evidence (timestamp, IP, form version) is stored. **[Lawyer]**
- [ ] The first sentence of every call discloses that it's an AI and names the company. A recording notice is included.
- [ ] An opt-out tool is available on every call, and it writes to the suppression list.
- [ ] Calling windows:
  - US: 9:00-20:00 local time. This is stricter than the 8-21 legal limit.
  - France: Mon-Fri 10:00-13:00 and 14:00-20:00.
- [ ] Before any call, the number's line type is checked and the Reassigned Numbers Database is consulted.
- [ ] California and Washington numbers get no automated calls. **[Lawyer]**: do California inbound or consented calls still need a natural-voice opener?
- [ ] EU AI Act Art. 50: say that it's an AI at the first interaction. We do this everywhere, by design.
- [ ] Voice clones only of a consenting person (you). No cloned third-party voices.

## Mockups and audit pages

- [ ] No Google logos, Google UI replicas or map screenshots without permission. The card design is deliberately generic.
- [ ] "Illustrative mockup, not affiliated with Google, rankings not guaranteed" appears on every visual and page.
- [ ] The "after" side never shows invented ratings or review counts. This is enforced by `score.test.js`.
- [ ] No reviewer names or photos. Review excerpts are short and used only to demonstrate a reply.
- [ ] Audit pages are noindex, use unguessable tokens and expire after 90 days.

## Reviews and the review kit

- [ ] Every customer gets the same request. No filtering by satisfaction (no review gating).
- [ ] No incentives, discounts or raffles for reviews. No staff quotas, and no asking customers to name staff.
- [ ] No tablets or kiosks on premises. The kit is passive (customers use their own phones), and take-home cards are the primary format.
- [ ] We never write, buy or suggest reviews. The AI drafts **replies** only, and the owner approves negative ones.
- [ ] Health businesses: replies never confirm that someone is a customer or patient.
- [ ] The public `/legal/review-policy` page states all of the above.
- [ ] SMS review requests (Grow): US A2P 10DLC registration; the client warrants it has consent or a lawful basis. Default to email where unclear. **[Lawyer]**

## Contracts and billing

- [ ] Terms: month to month; deliverables described; no ranking guarantee; the client stays Primary Owner; handover on exit; 14-day money back.
- [ ] Data processing agreement (DPA) and subprocessor list: Stripe, Twilio, email provider, Anthropic, Bland, Cloudflare, fulfillment tool.
- [ ] France: the 14-day withdrawal right (L221-3) for off-premises contracts with firms of 5 or fewer employees is covered by our 14-day money back. **[Lawyer]** to confirm this applies to online sales after cold email.
- [ ] Stripe Checkout requires ticking the terms-of-service box. Records are kept.

## Questions for your lawyer (bring this list)

1. **US:** Is our consent form wording sufficient as prior express written consent for AI-voice calls to a mobile number under 47 CFR 64.1200? Does E-SIGN capture via a web checkbox suffice?
2. **US:** For consented or inbound AI calls, do California (PUC §2874 as amended by AB 2905) or Washington (RCW 80.36.400) still restrict us?
3. **US:** Any state rules on AI disclosure or call recording we must add, for example two-party consent states?
4. **US:** CAN-SPAM compliance of the sequence, and any state laws on commercial email we should know about.
5. **France:** Is cold email to professional addresses of sole traders (artisans, micro-entrepreneurs) OK under CNIL guidance, with our notice? Is an AI-voice call to a professional who requested a callback compliant with CPCE L34-5?
6. **France:** Does L221-3 apply to contracts signed online after a cold email? Is our 14-day money back sufficient?
7. **All:** Is using third-party-scraped public business data (Outscraper / DataForSEO) acceptable for our prospecting, and what must our privacy notice say?
8. **All:** Terms of service review: limitation of liability, processor role for client customer lists, SMS responsibilities.
