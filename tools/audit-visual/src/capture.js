#!/usr/bin/env node
// Captures the real Google Maps place panel for a business, to use as the "today" side:
// set prospect.screenshot to the output path and render.js uses it instead of the recreation.
//
//   node src/capture.js --place-id <PLACE_ID> --out shots/ember-today.png [--locale en] [--height 2200]
//   node src/capture.js --query "Ember & Oak Coffee Riverton" --out ...
//   node src/capture.js --url "<any Google Maps place URL>" --out ...
//
// The output is 816px wide (the 408px panel at 2x), the same size as our rendered panels.
// For volume, run captures through a hosted browser or screenshot service instead of one
// machine; Google throttles repeated headless traffic from a single IP.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';

const CONSENT_BUTTONS = ['Accept all', 'Reject all', 'Tout accepter', 'Tout refuser', 'Alle akzeptieren', 'Aceptar todo', 'Terima semua'];

export const mapsUrl = ({ placeId, query, locale = 'en' }) => (placeId
  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}&hl=${locale}`
  : `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=${locale}`);

export async function capturePanel({ url, out, locale = 'en', height = 2200, browser }) {
  const own = !browser;
  const b = browser || await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height }, deviceScaleFactor: 2, locale });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // EU visitors land on a consent interstitial first.
    if (/consent\./.test(page.url())) {
      for (const name of CONSENT_BUTTONS) {
        const btn = page.getByRole('button', { name });
        if (await btn.count()) { await btn.first().click(); break; }
      }
      await page.waitForURL((u) => !/consent\./.test(String(u)), { timeout: 30000 });
    }
    // The place panel is the main region labelled with the business name.
    const panel = page.locator('div[role="main"][aria-label]').first();
    await panel.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200); // let photos and the review summary paint
    await panel.screenshot({ path: out });
    return out;
  } finally {
    await page.close();
    if (own) await b.close();
  }
}

function parseArgs(argv) {
  const o = { locale: 'en', height: 2200 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i].replace(/^--/, '');
    o[k === 'place-id' ? 'placeId' : k] = argv[++i];
  }
  if (!o.out || !(o.url || o.placeId || o.query)) {
    throw new Error('Usage: capture.js (--place-id ID | --query TEXT | --url URL) --out FILE [--locale en] [--height 2200]');
  }
  o.height = Number(o.height);
  return o;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const o = parseArgs(process.argv.slice(2));
  const url = o.url || mapsUrl(o);
  capturePanel({ url, out: o.out, locale: o.locale, height: o.height })
    .then((f) => console.log(`saved ${f}`))
    .catch((err) => { console.error(err.message); process.exit(1); });
}
