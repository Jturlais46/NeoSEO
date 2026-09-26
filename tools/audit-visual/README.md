# audit-visual

This tool renders the per-prospect **before/after card** (PNG) and the **audit page** (HTML) from one JSON file. It also writes `audit.json`: the facts that the emails and calls quote, so every channel says the same thing.

![sample](../../docs/assets/sample-card-en.png)

## Run it

```bash
cd tools/audit-visual
npm install          # uses the preinstalled Chromium via Playwright
npm test             # scoring and honesty rules
npm run sample       # renders the two fictional samples into out/
node src/render.js path/to/prospect.json --out out [--brand brand.json] [--locale en|fr]
```

For each prospect, it writes these files to `out/<slug>/`:

| File | Use |
|---|---|
| `card.png` (1200×630) | Inline image in a thread after a reply; postcard front |
| `card@2x.png` | Hero image on the audit page |
| `index.html` | Personal audit page (noindex). Deploy to `/r/<token>` |
| `audit.json` | Scores, top findings and card rows, for email and call personalization |

## How scoring works (`src/score.js`)

There are 13 weighted checks, adding up to 100.

| Check | Weight | Why |
|---|---|---|
| Claimed | 15 | Unclaimed = you can't reply or control edits |
| Primary category | 10 | Strongest lever on the profile itself (Whitespark 2026) |
| Photos | 10 | Affects conversion |
| Review count vs. competitors | 10 | Ranking factor. Benchmarked against the median of the businesses shown next to you |
| Review recency | 10 | Steady, recent reviews count more than a large stale total (Sterling Sky) |
| Reply rate | 10 | Affects conversion and trust. Not a ranking factor |
| Secondary categories, description, hours, website, services, rating, recent updates | 5 each | Completeness and conversion. Posting frequency has no measured effect on ranking |

**Honesty rules** (covered by tests):

- **What the "after" score changes.** It counts only what setup controls:
  - claiming the profile;
  - categories;
  - completeness;
  - photos;
  - replies;
  - one update.
- **What it never touches.** Rating, review count and review recency stay as they are.
- **What the visuals avoid.** No Google logos, and no copy of Google's interface.
- **What's always on the visuals.** "Illustrative mockup, not affiliated with Google, rankings not guaranteed".

## Input format

See [samples/trattoria-olivo.json](samples/trattoria-olivo.json). Three parts:

| Part | Where it comes from |
|---|---|
| `prospect` | Listing data |
| `competitors` | Up to 3 nearby businesses |
| `proposal` | Written by the `gbp-audit` skill |

To add a language, copy the `en` block in [src/i18n.js](src/i18n.js).

## Production notes

- **Where to run it.** At volume, run the same code on Cloudflare Browser Rendering (about $5/month at around 4,000 renders), or on the n8n host.
- **Brand settings.** Change the name, price and legal line in `brand.json` once the name is final.
- **Fonts.** Inter and Fraunces, both under the SIL Open Font License, bundled through @fontsource.
