# US: text and email messages

Each message maps to a scenario in [docs/11-sales-playbook.md](../../docs/11-sales-playbook.md). Variables are the same as the Malaysia file.

**Which channel:**
- Text when the owner asked for a text on the call.
- Email otherwise, with Visual 9 inline and Visual 5 attached.

## M1: visual after "send it"

**Text** (image: Visual 5)
> Hi {{name}}, it's Kit from Mapkeeper, as promised. Left: {{biz}} on Google today. Right: your profile after 90 days with us, about {{r1}} reviews, real photos, every review answered. Full plan: {{link}}. {{price}}/mo, no contract. Reply YES to start this week.

**Email.** Subject: `{{biz}} on Google, today and in 90 days`
> Hi {{name}},
>
> Here's what we talked about:
>
> [Visual 9]
>
> Today {{biz}} has {{r0}} reviews and {{finding_1}}. In 90 days: about {{r1}} reviews, a {{rating1}} rating, weekly posts and every review answered.
>
> The full plan (new categories, description, first month of posts): {{link}}
>
> {{price}}/month, no contract, 14-day money back, and you always stay the owner. If it looks right: {{pay}}
>
> {{me}}, Mapkeeper

## M2: +24h

**Text**
> Hi {{name}}, did it come through? The first thing we'd fix is {{finding_1}}. Takes us a week.

## M3: price question

> {{price}}/month. Setup ($149) is waived right now. Includes the full profile fix, weekly posts, fresh photos monthly, replies to every review within 48h, a review stand for your counter, and a monthly report on calls and directions. Cancel anytime, 14-day money back.

## M4: "looks good"

> Great. Want us to start this week? Here's the link: {{pay}}

## M5: checkout link during the call

> Here's the link we talked about, {{name}}: {{pay}}. Once done, I'll send a 1-minute guide to add us on Google.

## M6: "later"

> No problem. I'll check in on {{date}}. The plan stays here: {{link}}

## M7: day 5 email

Subject: `{{r0}} vs {{c_reviews}}`
> Hi {{name}}, {{competitor}} has {{c_reviews}} Google reviews; {{biz}} has {{r0}}. The gap is usually just asking. Our counter stand and follow-up texts get you to about {{r1}} in 90 days. Want us to start this week? {{link}}

## M8: close the file

> I'll close your file for now, {{name}}. If you want it later, just reply. All the best to {{biz}}!

## M9: welcome after payment

> Welcome to Mapkeeper, {{name}}! Three quick things:
> 1) 5-minute form: {{form}}
> 2) Add us on Google (1-minute guide): {{guide}}
> 3) Reply with 10 photos of your place.
> Your new profile goes live within 7 days.

## M10: "you're live" (image: real before/after)

> Done! This is {{biz}} on Google now, next to where we started. Your review stand ships this week.

## M11: payment reminder

> Hi {{name}}, the link is still open if you'd like to start: {{pay}}. Anything I can answer?

## Operations

- **O1, negative review approval:** "New 2★ review: '{{excerpt}}'. Draft reply: '{{draft}}'. Reply OK to post or send changes."
- **O2, monthly photos:** "Photo time! Send 8 photos from this month and we'll pick the best."
- **O3, monthly report:** "{{month}} for {{biz}}: {{calls}} calls, {{directions}} direction requests, {{new_reviews}} new reviews. Full report: {{report}}"
