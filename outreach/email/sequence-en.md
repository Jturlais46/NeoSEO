# Email sequence (US, English)

The emails run alongside the Bland calls. For timing, see [docs/04-outbound-engine.md](../../docs/04-outbound-engine.md), section 6.

**Where the content comes from:**
- **Variables:** the lead record and `audit.json` from `tools/audit-visual`.
- **Tailored sentence:** the `outreach-email` skill writes **one** sentence per email (`{{tailored}}`). Everything else stays word for word, so quality holds at scale.

**Rules (deliverability):**
- under 80 words;
- plain text;
- email 1 has no link and no image;
- no open tracking;
- secondary domains only;
- sign with the founder's real name.

**Footer (every email):**
```
{{sender_name}}, {{company}}
{{postal_address}}
Not interested? Reply "stop" and I won't email again.
```

---

## Email 1: Day 0 (no link)

**Subject options (A/B):**
- `{{business_name}} on Google Maps`
- `your Google profile in 90 days`
- `{{competitor_1}} vs {{business_name}}`

```
Hi {{first_name}},

I looked at {{business_name}} on Google Maps this week. Three things stood out:

- {{finding_1}}
- {{finding_2}}
- {{finding_3}}

{{tailored}}

I mocked up your profile as it would look after 90 days with us: around {{reviews_projected}} reviews, real photos, weekly posts. Want me to send it over?

{{sender_first_name}}
```

**Rules for `{{tailored}}`:**
- one sentence, about a competitor fact or something from the business's own website;
- no flattery.

Example: `Northside Roasters and The Daily Grind, the two places Google shows next to you, both reply to almost every review.`

**Rules for findings:** plain words, taken from `top_findings`. Examples:
- "no hours on Google, so you show as closed"
- "0 replies to your 31 reviews"
- "3 photos, none from this year"

---

## Email 2: Day 3 (card image + one link)

**Subject:** same thread (`Re:`)

```
Hi {{first_name}}, here it is: {{business_name}} today, and in 90 days.

[card.png]

The full version, with your new description, categories and first month of posts: {{audit_url}}

{{price}}/month, no contract, and you always stay the owner. There's a "yes" button on the page if you want us to start.

{{sender_first_name}}
```

---

## Email 3: Day 7 (no link). Pick the variant by segment.

### Variant A: Behind on reviews

**Subject:** `{{reviews_today}} vs {{competitor_1_reviews}}`

```
Hi {{first_name}},

{{business_name}} has {{reviews_today}} Google reviews. {{competitor_1}} has {{competitor_1_reviews}}.

The gap is usually about asking, not quality. We put a review stand on your counter, hand out cards and text every customer after their visit. That's how we get you to around {{reviews_projected}} in 90 days.

Want to see the plan? It's in the page I sent on {{email2_day}}.

{{sender_first_name}}
```

### Variant B: Unclaimed

**Subject:** `your Google listing isn't claimed`

```
Hi {{first_name}},

Quick one: {{business_name}}'s Google listing isn't claimed yet. Anyone can suggest changes to your hours, phone or address, and you can't reply to reviews.

We'll claim it with you in 10 minutes and turn it into a profile that brings customers in. Want me to call you to do it?

{{sender_first_name}}
```

### Variant C: Neglected (Ask Maps angle, US)

**Subject:** `Google's AI and {{business_name}}`

```
Hi {{first_name}},

Google Maps now answers questions like "best {{service}} open now near me" with AI, built from your profile, your reviews and your website.

Right now {{business_name}}'s profile is missing {{missing_1}} and {{missing_2}}, so there's little for it to say about you.

The fix is in the page I sent on {{email2_day}}. Want me to resend it?

{{sender_first_name}}
```

---

## Email 4: Day 14 (close the loop)

**Subject:** `should I close your file?`

```
Hi {{first_name}},

I'll take the silence as "not now". Your 90-day profile page stays up until {{expiry_date}}.

If the timing's better later, reply "later" and I'll check back in 3 months. Either way, good luck with {{business_name}}.

{{sender_first_name}}
```

---

## Words to avoid (spam filters)

"guarantee", "#1", "100% free", "act now", "limited time", "urgent", "final notice", "winner", "risk-free", "click here", and ALL-CAPS subject lines.
