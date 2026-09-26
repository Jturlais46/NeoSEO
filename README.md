# NeoSEO (working title; customer brand proposed: Mapkeeper)

This repo is the implementation plan and starter assets for an AI-run service that manages Google Business Profiles for independent local businesses.

**The offer:** we show each owner their profile fixed *before* they pay anything. Then, for about $99/month, we keep it complete, fresh and collecting reviews. AI agents do the work, and the founder approves and handles exceptions.

**Start here:** [docs/00-summary.md](docs/00-summary.md), which covers the thesis, what changed from the original idea, the recommendations and your next decisions.

![Sample before/after card](docs/assets/sample-card-en.png)

## What's inside

| Area | Files |
|---|---|
| Plan | [docs/](docs/): summary, research with sources, positioning, offering, outbound engine, fulfillment, AI operating model, website, roadmap and budget, compliance |
| Before/after visual and audit page | [tools/audit-visual/](tools/audit-visual/): working Node renderer with tests; English and French |
| Email | [outreach/email/](outreach/email/): 4-step cold sequence (English and French) and a reply playbook |
| Voice (Bland) | [outreach/voice/](outreach/voice/): persona, 4 consent-based call flows, API payload, post-call schema |
| Agent playbooks | [.claude/skills/](.claude/skills/): `gbp-audit`, `outreach-email`, `reply-triage`, `review-reply`, `monthly-report` |
| Rules and data | [config/compliance.yaml](config/compliance.yaml), [config/lead.schema.json](config/lead.schema.json) |

## Quick start (renderer)

```bash
cd tools/audit-visual && npm install && npm test && npm run sample
```

## Three decisions that shape everything

1. **No AI cold calls.** Bland's policy and most countries' laws forbid them. Voice is used for consented callbacks, the inbound line, onboarding and client check-ins.
2. **Proof beats persistence.** A personalized audit, sent by email (and optionally a postcard), is the sales engine.
3. **Portable by design.** Playbooks are `SKILL.md` files, calls go through one API module, and the lead store mirrors to a Google Sheet. That makes a later move to Meta's Muse (or any agent) a configuration change, not a rebuild.
