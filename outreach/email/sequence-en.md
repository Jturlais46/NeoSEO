# Cold sequence (US, English)

**Variables** come from the lead record and `audit.json`, produced by `tools/audit-visual`. The `outreach-email` skill fills them in and writes **one** tailored sentence per email (marked `{{tailored}}`). Everything else stays word-for-word, so quality holds at scale.

**Rules:**
- under 80 words;
- plain text;
- no images;
- email 1 has no link;
- no open tracking;
- send from secondary domains;
- sign with the founder's real name.

**Footer** (every email):
```
{{sender_name}}, {{company}}
{{postal_address}}
Not interested? Reply "stop" and I won't email again.
```

---

## Email 1: Day 0 (no link)

**Subject options** (A/B test):
- `{{business_name}} on Google Maps`
- `quick look at your Google profile`
- `{{competitor_1}} vs {{business_name}}`

```
Hi {{first_name}},

I looked at {{business_name}} on Google Maps this week. Three things stood out:

- {{finding_1}}
- {{finding_2}}
- {{finding_3}}

{{tailored}}

I mocked up what your profile would look like fixed: categories, description, photo plan, even a reply to your latest review. Want me to send it over?

{{sender_first_name}}
```

**Rules for `{{tailored}}`:**
- one sentence, based on a competitor fact or something from the business's own website;
- **no flattery**;
- **nothing the data doesn't support**.

Example: `Luca's and Via Roma, the two places Google shows next to you, both reply to almost every review.`

**Rules for findings:** plain words, drawn from `top_findings`, and rewritten for an owner. For example:
- "0 replies to your 38 reviews"
- "7 photos, none from this year"
- "your category is just 'Restaurant', so you're not showing for 'Italian restaurant'"

---

## Email 2: Day 3 (one link)

**Subject:** same thread (`Re:`)

```
Hi {{first_name}}, here it is anyway, no strings:

{{audit_url}}

It shows your profile today next to how it would look a week after we start, plus what we'd post in your first month.

If you like it, there's a "yes" button on the page. {{price}}/month, no contract, and you always stay the owner.

{{sender_first_name}}
```

---

## Email 3: Day 7 (no link). Pick the variant by segment.

### Variant A: Behind on reviews

**Subject:** `{{review_count}} vs {{competitor_1_reviews}}`

```
Hi {{first_name}},

{{business_name}} has {{review_count}} Google reviews. {{competitor_1}} has {{competitor_1_reviews}}.

That gap is usually about asking, not quality: most happy customers never think to leave one. We send every customer the same short request after their visit and give you a counter card for the till. No rewards, no filtering, just asking.

Worth a look? The audit I sent on {{email2_day}} has the details.

{{sender_first_name}}
```

### Variant B: Unclaimed

**Subject:** `your Google listing isn't claimed`

```
Hi {{first_name}},

Quick one: {{business_name}}'s Google listing isn't claimed yet. That means anyone can suggest changes to your hours, phone or address, and you can't reply to reviews.

Claiming it is free. I'm happy to walk you through it in 10 minutes, even if you never become a client. Want me to?

{{sender_first_name}}
```

### Variant C: Neglected (Ask Maps angle, US only)

Confirm Ask Maps is live for the prospect's area before enabling this variant. The launch date comes from news summaries (confidence [S] in docs/01-research.md).

**Subject:** `Google's AI and {{business_name}}`

```
Hi {{first_name}},

Since March, Google Maps answers questions like "best {{service}} open now near me" with AI, built from what's on your profile, your reviews and your website.

Right now {{business_name}}'s profile is missing {{missing_1}} and {{missing_2}}, so there's less for it to say about you.

The fix is in the audit I sent on {{email2_day}}. Want me to resend the link?

{{sender_first_name}}
```

---

## Email 4: Day 14 (close the loop)

**Subject:** `should I delete your audit?`

```
Hi {{first_name}},

I'll take the silence as "not now". Your audit page stays up until {{expiry_date}}, then I'll delete it.

If the timing's better later, reply "later" and I'll check back in 3 months. Either way, good luck with {{business_name}}.

{{sender_first_name}}
```

---

## Banned phrases (the Guard rejects any draft that contains them)

"guarantee", "#1", "rank first", "Google partner", "on behalf of Google", "your listing will be removed", "urgent", "final notice", "limited time", "act now", "verified by Google", "Google-certified". Also: any rating or review count we are not quoting from the data.
