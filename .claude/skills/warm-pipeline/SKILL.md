---
name: warm-pipeline
description: Run the warm pipeline bot. Find businesses on Google Maps for the targets in config/targets.yaml (US and Malaysia), qualify them, write each tailored 90-day proposal yourself, render visuals 5 and 9, and produce the day's call sheet and digest. Use when asked to "run the pipeline", "prepare leads", "top up the warm pipeline", or on the daily schedule.
---

# Warm pipeline

**Split of work:**
- **Scripts** (`tools/pipeline/src/cli.js`) do the mechanical steps.
- **You** write the proposals, following the `gbp-audit` skill, in the lead's language.
- **Everything runs on the subscription:** no API keys for proposals, no paid data vendor.

**Setup check (once per session):**
- **Dependencies:** `tools/audit-visual/node_modules` and `tools/pipeline/node_modules` exist. If not, run `npm install` in each.
- **Google Maps reachable:** `node -e "fetch('https://www.google.com/maps').then(r=>console.log(r.status))"`.
  - If it fails in a cloud session, the environment's network access must allow `www.google.com`, `consent.google.com`, `maps.gstatic.com`, `*.googleusercontent.com` and `*.ggpht.com`.
  - Stop and tell the founder.

## Run

1. **Status:** `node tools/pipeline/src/cli.js status`
2. **Source, only for targets whose warm pool is below `ready_buffer`:** `node tools/pipeline/src/cli.js source --target <id>`
   - This uses the Google Maps browser scan. It's about 1-2 minutes per 20 listings.
   - If a captcha or "unusual traffic" page appears, stop sourcing for today and report it.
   - If the scan returns 0 listings for a query that clearly has results, the page layout probably changed.
     - Open the page with Playwright.
     - Compare it with the selectors in `tools/pipeline/src/maps-scan.js`.
     - Fix them, run the scan on 1 target, and commit the fix.
3. **Prepare:** `node tools/pipeline/src/cli.js prepare --limit 40`. This extracts facts and qualifies leads.
4. **Write proposals:** `node tools/pipeline/src/cli.js queue` lists leads waiting for a proposal, highest priority first. For each one, up to 40 per run:
   - Read its facts, reviews and competitors. If the listing has a website and it's reachable, skim the About, Menu and Services pages.
   - Write the proposal JSON to `data/proposals/<lead_id>.json`, following `.claude/skills/gbp-audit/SKILL.md` and the rules below.
   - Store it with `node tools/pipeline/src/cli.js set-proposal <lead_id> data/proposals/<lead_id>.json`. If validation fails, fix the JSON and retry.
5. **Render:** `node tools/pipeline/src/cli.js render`. This builds visuals 5 (`v-phones-portrait.png`) and 9 (`v-swipe.png`) plus the audit page.
6. **Call sheet:** `node tools/pipeline/src/cli.js callsheet`
7. **Calls:** only when the founder asked for them in this run, with `node tools/pipeline/src/cli.js call --send --max <n>`. Otherwise stop at the call sheet.
8. **Digest to the founder:** keep it to 10 lines or fewer.
   - New warm leads per market.
   - The top 10 by priority: business, city, reviews now → 90 days, and why they're a good lead.
   - Leads marked `needs_review`, with the reason.
   - Blockers, with counts per reason from the call sheet.
   - Anything that broke.

## Proposal JSON (validated by `set-proposal`)

```json
{
  "primary_category": "Coffee shop",
  "secondary_categories": ["Malaysian restaurant", "Breakfast restaurant"],
  "description": "≤750 chars, owner's voice, real facts from the listing/reviews/website",
  "services": ["4-8 real items from menu/website/reviews"],
  "hours_today": "Closes 3 PM",
  "website_url": "",
  "photo_labels": ["Latest", "Menu", "Vibe"],
  "posts": [{ "text": "real item or news", "when": "2 days ago" }, { "text": "...", "when": "1 week ago" }],
  "illustrative_reviews": [
    { "author": "Aisyah R.", "meta": "Local Guide · 64 reviews", "rating": 5, "when": "2 weeks ago",
      "text": "25-45 words naming real items", "owner_reply": "short reply signed with owner's first name", "owner_reply_when": "2 weeks ago" },
    { "...": "second review" }
  ],
  "sample_review_reply": { "review_excerpt": "their latest unanswered review", "reply": "..." },
  "photo_shot_list": ["6 short labels"],
  "update_ideas": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],
  "projected_reviews_per_month": 0,
  "confidence": "high",
  "low_confidence_reasons": []
}
```

## Rules for tailoring

**Language.** Write every customer-facing field in the lead's `locale`:
- `en`: English.
- `ms`: Bahasa Malaysia.
- `zh`: Simplified Chinese.

Use the local phrasing for time and hours:
- `when`: "2 minggu lalu", "2 周前".
- `hours_today`: "Tutup pada 3 PTG", "下午3点打烊".

**Names.**
- Reviewer names must fit the area and clientele. Malaysia: Malay, Chinese and Indian names; US: local names.
- Each owner reply is signed with the owner's first name if you know it, otherwise with the business name.

**Content.**
- Name real menu items, services, streets and neighborhoods taken from the facts, reviews or website.
- Never keep a generic "Service 1".
- Pick categories from real Google category names, choosing ones competitors rank with.

**Review pace (`projected_reviews_per_month`).**
- `0` uses the default: close the gap to competitors within 8-30 a month.
- Set it only when the business clearly has far more or far fewer customers than average.

**Confidence.** Set `"low"` and give reasons when:
- the listing looks like a chain;
- it looks closed or mis-categorized;
- there's too little data to write something specific.

The founder reviews those before calls.

**Never:**
- change the business name, or add keywords to it;
- write text that attacks competitors.
