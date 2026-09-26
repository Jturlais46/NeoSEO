# Reply playbook

The `reply-triage` skill classifies each reply and drafts from these templates. You approve drafts until 50 have gone through with no edits. After that, only the cases marked **(always you)** come to you.

**Rules for every reply:**
- Answer in the same thread.
- Keep it short.
- Quote the prospect's own numbers.
- Never argue.
- If we have a phone number, trigger a Bland `walkthrough_close` call as well.

## Interested ("sure", "send it", "yes")

Attach `comparison.png` inline.

```
Here you go, {{first_name}}. {{business_name}} today, and after 90 days with us:

[comparison.png]

Around {{reviews_projected}} reviews, a {{rating_projected}} rating, {{photos_projected}}+ photos, weekly posts and every review answered.

The full page with your new description and categories: {{audit_url}}

If it looks right, this sets it up ({{price}}/month, cancel anytime, 14-day money back): {{checkout_url}}
Prefer to talk first? Grab 10 minutes: {{booking_url}}

{{sender_first_name}}
```

## Price question

```
{{price}}/month, month to month. That covers setup (normally {{setup_price}}, waived right now), 4 posts and fresh photos every month, replies to every review within 48 hours, a review stand and cards for your counter, follow-up texts to your customers, and a one-page report on calls and directions each month.

No contract, and you stay the owner of your profile. Want the link to start?
```

## "Is this Google?"

```
No, we're {{company}}, an independent team that manages Google profiles for local businesses. I'm {{sender_name}}, the founder. Our prices are on {{pricing_url}}, there's no contract, and you stay the owner of your profile the whole time.
```

## "I already have someone" / "I do it myself"

```
Good to hear someone's on it. The 90-day page is yours to keep and share with them: {{audit_url}}. The review stand and the category change are the quickest wins.
```

Mark the lead `not_now`. Don't contact them again for 6 months, then send one check-in.

## "Not now" / "Later"

```
No problem. I'll check back in 3 months. Your page stays up until {{expiry_date}} if you want another look.
```

## "Call me" / "Can we talk?"

```
Sure. We'll call you at {{requested_time_or_next_slot}}. Or pick a time that suits you here: {{booking_url}}
```

Then schedule a Bland `walkthrough_close` call at that time.

## "How did you get my email?"

```
From your business's public Google listing and website. Happy to remove you: just reply "delete" and it's gone.
```

## "Wrong person"

```
Thanks for letting me know. Who looks after the Google listing for {{business_name}}?
```

Ask once. If there's no answer, suppress.

## "Stop" / "Unsubscribe" / "Remove me" / hostile

Suppress on every channel immediately. Don't reply.

## (Always you) Complaints, threats, press, anything unclear

Escalate to you with the thread and a suggested reply.
