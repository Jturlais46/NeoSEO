# Project context for agents

AI-run Google Business Profile management service (working brand: Mapkeeper). Markets: US and Malaysia. Default visuals: 5 (`phones-portrait`) and 9 (`swipe`). The plan lives in `docs/` (start at `docs/00-summary.md`). Agent playbooks live in `.claude/skills/`.

## Working rules

- **Facts about a prospect's profile today come from the data.** Projections (review count, rating, photos in 90 days) come from `tools/audit-visual/src/projection.js`, so every channel quotes the same numbers.
- **Outbound calls go through Bland** to leads marked `prior_approval`, `inbound` or `client` in `consent_status` (the founder confirms approval is in place). Calling hours and daily caps are set per market in `config/markets.yaml`.
- **Anyone who says stop** (email, call or text) goes on the do-not-contact list and is never contacted again.
- **We post replies to reviews, never reviews themselves.** The owner approves replies to negative reviews.
- **Writing style:** never use em dashes. Use commas, colons, semicolons or separate sentences.

## Commands

- Renderer: `cd tools/audit-visual && npm install && npm test && npm run sample`
- Render one prospect: `node tools/audit-visual/src/render.js <prospect.json> --out out`
- Pipeline: `cd tools/pipeline && npm install && npm test && npm run demo`; real runs follow `.claude/skills/warm-pipeline/SKILL.md`
- Capture a real "today" panel: `node tools/audit-visual/src/capture.js --place-id <ID> --out <file.png>`

## Conventions

- Prices and vendor facts carry confidence tags in `docs/01-research.md`. Update the tag when you re-verify.
- Bland Pathway exports go in `outreach/voice/pathways/<flow>-v<N>.json`.
