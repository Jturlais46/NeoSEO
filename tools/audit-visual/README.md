# audit-visual

This tool renders each prospect's Google Business Profile as it looks **today**, next to how it will look **in 90 days** with us. Both are shown as Google Maps profile panels.

From one JSON file per prospect it produces:
- the two panel images;
- a comparison image;
- a 1200×630 email card;
- the personal audit page.

It also writes `audit.json`, which holds the numbers that the emails and Bland calls quote.

![card](../../docs/assets/sample-card-en.png)

Full comparison: [docs/assets/sample-comparison-en.png](../../docs/assets/sample-comparison-en.png)

## Run it

```bash
cd tools/audit-visual
npm install
npm test
npm run sample       # renders the two demo cafés into out/
node src/render.js path/to/prospect.json --out out [--months 3] [--locale en|fr] [--brand brand.json]
```

## Output (per prospect, in `out/<slug>/`)

| File | Use |
|---|---|
| `before.png` | "Today" panel. Either a real capture, or a recreation built from the listing data. |
| `after.png` | The profile in N days: fixed categories, description, hours and website; new photos and posts; projected review count and rating; illustrative reviews with owner replies |
| `comparison.png` | Both panels side by side with the key numbers. Use it for the reply to an interested prospect, or on a postcard. |
| `card.png` (1200×630) | Email thumbnail and link preview |
| `index.html` | Personal audit page. Deploy it to `/r/<token>`. |
| `audit.json` | Scores, review count and rating (today and projected), top findings |

## Real screenshots for "today"

`src/capture.js` opens the business on Google Maps and captures the actual place panel at 816px wide, the same size as our panels:

```bash
node src/capture.js --place-id ChIJ... --out shots/ember-today.png
node src/capture.js --query "Ember & Oak Coffee Riverton" --out shots/ember-today.png
```

Set `"screenshot": "shots/ember-today.png"` on the prospect. `render.js` then uses the capture instead of the recreation.

Two limits:
- **Not tested against live Google here.** This sandbox blocks google.com. The flow is tested against a local page. The selector it relies on (`div[role="main"][aria-label]`) is the Maps place panel, and it may need a tweak on the first live run.
- **Volume needs a hosted browser.** Google throttles repeated headless traffic from one IP. Beyond a few dozen captures a day, run them through a hosted browser or screenshot service.

## Projection model (`src/projection.js`)

**Reviews per month:**
- Default: close the gap to the median of the 3 nearby competitors over the window, bounded at 8-30 a month.
- Override per prospect with `proposal.projected_reviews_per_month`.

**Rating:** new reviews are mostly 5 stars (85% 5★, 10% 4★, 5% lower). The projected rating is the real average of the combined distribution, so the rating, the stars and the review-summary bars always agree. It never goes below today's rating.

**Photos:** 20 at setup, plus 8 a month.

**Profile score:** recalculated on the projected profile with the same 13 checks (`src/score.js`).

## Input format

See [samples/ember-oak-coffee.json](samples/ember-oak-coffee.json):

- **`prospect`:** listing data, plus the fields the panel shows: `address`, `phone_display`, `price_level`, `hours_today`, `photos`, `recent_reviews`. Optionally `rating_distribution` and `screenshot`.
- **`competitors`:** up to 3 nearby businesses.
- **`proposal`:** written by the `gbp-audit` skill. It holds categories, description, services, `photos`, `posts`, `illustrative_reviews`, `hours_today`, `website_url`, and optionally `projected_reviews_per_month`.

**Photos:** use the business's own photos (from its listing, website or Instagram) for both sides. The demo uses CC0 sample images from scikit-image, because this sandbox can't download images.

**Languages:** English and French. To add a language, copy the `en` block in [src/i18n.js](src/i18n.js).

**Fonts:** Roboto (the panels), Inter and Fraunces (the frame), all under the Open Font License and bundled through @fontsource.
