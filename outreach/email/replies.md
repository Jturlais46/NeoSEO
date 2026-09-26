# Reply playbook

The `reply-triage` skill classifies each reply and drafts a response from these templates. You approve drafts until 50 have gone through with no edits. After that, only the cases marked **(always you)** come to you.

**Rules for every reply:**
- Answer in the same thread.
- Keep it short.
- Quote the prospect's own numbers.
- Never argue.

## Interested ("sure", "send it", "yes")

Attach `card.png` inline, one image only.

```
Here you go, {{first_name}}. This is {{business_name}} today next to how it would look a week after we start:

[card.png]

The full page, with the new description, categories and your first month of updates: {{audit_url}}

If it looks right, this sets it up ({{price}}/month, cancel anytime, 14-day money back): {{checkout_url}}
Prefer to talk it through first? Grab 10 minutes: {{booking_url}}

Once you're in, all we need from you is a Google invite. I'll send a 1-minute guide.

{{sender_first_name}}
```

## Price question

```
{{price}}/month, month to month. That covers the setup work (normally {{setup_price}}, waived right now), 4 updates and fresh photos every month, replies to every review within 48 hours, a review kit for your counter, and a one-page report on calls and directions each month.

No contract, and you stay the owner of your profile. Want the link to start?
```

## "Is this Google?" / "Is this a scam?" (always gets an answer)

```
Fair question. You should be skeptical, since there are a lot of scam calls about Google listings. We're not Google, and we're not affiliated with them. Google doesn't charge for profiles, and nobody can "verify" you on its behalf.

We're {{company}}, a small independent company. I'm {{sender_name}}, the founder. Our prices are public ({{pricing_url}}), there's no contract, and you'd stay the owner of your profile the whole time. You don't need to reply to anything if you're not interested.
```

## "I already have someone" / "I do it myself"

```
Good to hear someone's on it. If it's useful, the audit is yours to share with them: {{audit_url}}. The category and review-reply points are the quickest wins. No follow-up from me.
```

Mark the lead `not_now`. Make no further contact for 6 months, then send one check-in only if they didn't say "stop".

## "Not now" / "Later"

```
No problem. I'll check back in 3 months. Your audit stays up until {{expiry_date}} if you want to look again.
```

## "Call me" / "Can we talk?"

```
Happy to. Pick a time here: {{booking_url}}. Or, if you'd rather we just call you, leave your number here and we'll call within business hours: {{callback_form_url}}
(Our assistant may be an AI. It'll tell you so, and you can ask for me anytime.)
```

The callback form captures written consent. **Never** start a Bland call from a phone number found in an email reply without the form.

## "How did you get my email?" (EU/UK: always answered within 24 h)

```
From your business's public Google listing and website. We only keep your business name, contact details and the public profile data used for your audit. You can ask us to delete it anytime. Just reply "delete" and it's gone. Our privacy notice: {{privacy_url}}
```

## "Wrong person"

```
Thanks for letting me know. Who looks after the Google listing for {{business_name}}? If you'd rather not say, no problem, and I won't email again.
```

Ask only once. If they don't answer, suppress.

## "Stop" / "Unsubscribe" / "Remove me" / anything hostile

- Suppress immediately, across every channel.
- **No reply**, except in the EU/UK when they asked for erasure. In that case, send a one-line confirmation.

## (Always you) Complaints, legal threats, press, anything unclear

Escalate to you with the thread and a suggested reply. Nothing is sent automatically.
