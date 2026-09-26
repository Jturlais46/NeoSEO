# Warm pipeline bot

Prepares warm leads for the US and Malaysia before any outreach starts. It runs on Claude Code and your Claude subscription:

- **Scripts** (`src/cli.js`) do the mechanical steps.
- **Claude Code** writes each tailored proposal, following `.claude/skills/warm-pipeline/SKILL.md`.
- **No Anthropic API key and no paid data vendor.** Listings come from a browser scan of Google Maps.

## The flow

For each target search in `config/targets.yaml`:

| Step | Command | Result (lead stage) |
|---|---|---|
| 1. Source | `source [--target id] [--headed]` | Google Maps scan: listing facts, up to 10 newest reviews, up to 6 photos, a screenshot of the profile (`sourced`) |
| 2. Prepare | `prepare [--limit 40]` | Facts, profile score, competitors ranked above, qualification; US leads get a line-type lookup (`needs_proposal` or `gated_out`) |
| 3. Queue | `queue` | JSON list for Claude Code: facts, reviews, competitors, language |
| 4. Proposal | Claude Code writes `data/proposals/<id>.json`, then `set-proposal <id> <file>` | Validated and stored (`needs_render`) |
| 5. Render | `render` | Visual 5 (`v-phones-portrait.png`), Visual 9 (`v-swipe.png`) and the audit page (`ready`) |
| 6. Call sheet | `callsheet` | `data/callsheets/<date>.csv` and `.json`, ranked, with the Bland payload or the reason a lead can't be called now |
| 7. Calls | `call [--send] [--max N]` | Dry run unless `--send` |

`status` prints counts per market and stage. `daily` runs steps 1-2 and 5-6 (sourcing only for targets whose warm pool is below `ready_buffer`).

## Try it offline

```bash
cd tools/audit-visual && npm install
cd ../pipeline && npm install
npm test          # 14 tests, including the scanner against a mock Maps page
npm run demo      # fixtures -> 9 warm leads (MY 5, US 4) in data/demo/, dry-run calls
```

## Run it for real

1. **Where:** run the scan from a computer on a normal home or office connection. Google Maps shows "unusual traffic" pages to most cloud IP addresses quickly. In a Claude Code cloud session, the environment's network access must also allow `www.google.com`, `consent.google.com`, `maps.gstatic.com`, `*.googleusercontent.com` and `*.ggpht.com`.
2. **How:** open Claude Code in this repo and say "run the warm pipeline". Claude follows the skill: sources, prepares, writes the proposals, renders, builds the call sheet and gives you a digest of 10 lines or fewer.
3. **Pace:** about 1-2 minutes per 20 listings, with a pause every 15. If Google shows a block page, the scan keeps what it has and stops for the day.
4. **When the scan returns nothing:** Google changed its page. Claude compares the page with `SEL` in `src/maps-scan.js`, fixes the selectors, updates `fixtures/maps-place.html` and re-runs one target.

## Data

Everything goes to `data/` (ignored by git): `leads/`, `proposals/`, `audits/`, `screens/`, `photos/`, `callsheets/`. Set `PIPELINE_DATA_DIR` to use another folder.

## Calls

A lead is callable only when all of these hold (`src/bland.js`, `callBlocker`):

- `consent_status` is `prior_approval`, `inbound` or `client`. It is recorded by the founder, per lead or per target in `config/targets.yaml`. New leads default to `none`.
- It has a phone number and isn't suppressed.
- **US:** the number is a landline (`call_line_types` in `config/markets.yaml`), checked with Twilio Lookup (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`).
- Fewer than 3 attempts, and at least 48 hours since the last one.
- It's inside the market's calling window, in the business's own time zone (Malaysia: 10:00-11:30 and 15:00-17:30, no calls Friday 12:00-15:00, Sunday-Thursday weeks in Kedah, Kelantan and Terengganu).

**Environment for calls:** `BLAND_API_KEY`, `BLAND_PATHWAY_FIRST_CALL`, `BLAND_FROM_NUMBER`, `BLAND_VOICE`, `BLAND_WEBHOOK_URL`, `FOUNDER_FIRST_NAME`.

## Files

| File | What it does |
|---|---|
| `src/maps-scan.js` | Google Maps browser scan (Playwright); selectors in `SEL` |
| `src/normalize.js` | Raw listing to prospect facts; phone formats; review dates; competitors |
| `src/qualify.js` | Profile score, segment (unclaimed, behind on reviews, neglected), gating rules |
| `src/propose.js` | Proposal contract, validation and photo selection |
| `src/window.js` | Calling windows per market and state |
| `src/bland.js` | Call blockers, Bland payload (localized voicemail), `POST /v1/calls` |
| `src/linetype.js` | Twilio Lookup line type |
| `src/store.js` | Lead files and events |
| `fixtures/` | Offline search results and a mock Maps place page |
