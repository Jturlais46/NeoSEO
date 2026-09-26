# Pipeline bot (work in progress)

**Status:** code drafted but not yet run or tested. Paused pending a decision on how call approvals are recorded (see below).

## What it does

For each target search in `config/targets.yaml`:

1. **Source.** Finds businesses on Google Maps (Outscraper).
2. **Qualify.** Keeps weak profiles and scores them.
3. **Propose.** Has Claude write a 90-day proposal tailored to each business (`src/propose.js`).
4. **Render.** Builds the visuals with `tools/audit-visual`.
5. **Call sheet.** Produces a daily call sheet for Bland.

## Calls

Calls only go to leads whose `consent_status` is `prior_approval`, `inbound` or `client`. New leads are stored as `none` (`src/store.js`), so no lead is callable until approval is recorded for it.

## Still to do

- **Approval source.** Decide how approvals are recorded. The recommendation is an imported list of approved businesses or numbers.
- **Config.** Add `config/targets.yaml` and the Malaysian calling hours in `config/markets.yaml`.
- **Known fixes:**
  - resolve the data directory at run time;
  - convert `now` to seconds before passing it to `toProspect`;
  - pass the photo library into `generateProposal`.
- **Tests.** Add fixtures and tests, then run `npm run demo`.
