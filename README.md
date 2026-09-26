# NeoSEO (working title; customer brand proposed: Mapkeeper)

This repo holds the implementation plan and starter assets for an AI-run service that manages Google Business Profiles for independent local businesses.

**The offer:** we show each owner their Google profile today next to how it will look in 90 days with us: more reviews, a higher rating, real photos and fresh posts. Then, for about $99/month, we make it happen. AI agents do the work; the founder approves and handles exceptions.

**Start here:** [docs/00-summary.md](docs/00-summary.md)

![Sample card](docs/assets/sample-card-en.png)

## What's inside

| Area | Files |
|---|---|
| Plan | [docs/](docs/): summary, research, positioning, offering, outbound engine, fulfillment, AI operating model, website, roadmap and budget |
| Profile visuals and audit page | [tools/audit-visual/](tools/audit-visual/): Google-style "today vs. in 90 days" panels, real-screenshot capture, comparison image, email card, audit page (English and French, tested) |
| Email | [outreach/email/](outreach/email/): 4-step sequence (English and French) and reply playbook |
| Voice (Bland) | [outreach/voice/](outreach/voice/): persona, call flows (outbound first call, follow-up, inbound, onboarding, check-in), API payload, post-call schema |
| Agent playbooks | [.claude/skills/](.claude/skills/): `gbp-audit`, `outreach-email`, `reply-triage`, `review-reply`, `monthly-report` |
| Config | [config/markets.yaml](config/markets.yaml) (calling hours, caps, prices, languages per market), [config/lead.schema.json](config/lead.schema.json) |

## Quick start (renderer)

```bash
cd tools/audit-visual && npm install && npm test && npm run sample
```

## How it sells

1. **Show the potential.** Each prospect sees their real profile next to the profile they could have in 90 days.
2. **Two channels working together.**
   - **Email** carries the visual and the audit page.
   - **Bland** calls prospects directly and follows up on engagement.
3. **Portable by design.** Playbooks are `SKILL.md` files, calls go through one API module, and the lead store mirrors to a Google Sheet. That makes a later move to Meta's Muse, or any other agent, a configuration change.
