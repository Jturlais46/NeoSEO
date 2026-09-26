# Project context for agents

AI-run Google Business Profile management service (working brand: Mapkeeper). The plan lives in `docs/` (start at `docs/00-summary.md`). Agent playbooks live in `.claude/skills/`.

## Non-negotiable rules

- **No AI cold calls.** Voice calls need `consent_status` in [written, inbound, client]. See `config/compliance.yaml`.
- **Every outbound send passes the compliance gate:** suppression list, country and legal-form rules, calling windows.
- **Never invent facts in audits, emails, calls or reports.** Use only numbers from the data. When unsure, mark `confidence: low`.
- **The "after" side of any visual never changes the rating, review count or review recency.**
- **No Google logos, no copies of Google's interface, no claims of Google affiliation, no ranking guarantees, no urgency or fear copy.**
- **Reviews:**
  - no gating, incentives or staff-name requests;
  - never write reviews;
  - the owner approves replies to negative reviews.
- **Writing style:** never use em dashes. Use commas, colons, semicolons or separate sentences.

## Commands

- Renderer: `cd tools/audit-visual && npm install && npm test && npm run sample`
- Render one prospect: `node tools/audit-visual/src/render.js <prospect.json> --out out`

## Conventions

- Prices and vendor facts carry confidence tags in `docs/01-research.md`. Update the tag when you re-verify.
- Bland Pathway exports go in `outreach/voice/pathways/<flow>-v<N>.json`.
