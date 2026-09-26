// Google Maps browser scan (Playwright). No paid data vendor. Produces raw place records in the
// shape normalize.js reads, plus a real screenshot of each profile for the "today" side.
//
// Selectors prefer attributes/ARIA that change rarely (data-item-id, role, aria-label). When Google
// changes the page and a scan comes back empty, the warm-pipeline skill has Claude Code open the page,
// compare it with SEL below, fix the selectors and re-run one target.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '../../audit-visual/node_modules/playwright/index.mjs';
import { dataDir } from './config.js';

export const SEL = {
  feed: 'div[role="feed"]',
  resultLink: 'div[role="feed"] a[href*="/maps/place/"]',
  panel: 'div[role="main"]',
  name: 'div[role="main"] h1',
  category: 'div[role="main"] button[jsaction*="category"], div[role="main"] button.DkEaL',
  address: 'button[data-item-id="address"]',
  phone: 'button[data-item-id^="phone:tel:"]',
  website: 'a[data-item-id="authority"]',
  claim: 'a[data-item-id="merchant"]',
  stars: 'div[role="main"] [role="img"][aria-label*="star"]',
  hoursRows: 'div[role="main"] table tr',
  heroImg: 'div[role="main"] img[src*="googleusercontent"]',
  reviewsTab: 'button[role="tab"][aria-label*="Reviews"]',
  reviewCard: 'div[data-review-id]',
  reviewText: 'span.wiI7pd',
  sortButton: 'button[aria-label="Sort reviews"], button[data-value="Sort"]',
  seeMore: 'div[data-review-id] button[aria-label="See more"]',
};

const TZ = { MY: 'Asia/Kuala_Lumpur', US: 'America/Chicago', FR: 'Europe/Paris' };
const MY_STATES = ['Selangor', 'Kuala Lumpur', 'Wilayah Persekutuan Kuala Lumpur', 'Putrajaya', 'Penang', 'Pulau Pinang', 'Johor', 'Perak', 'Kedah', 'Kelantan', 'Terengganu', 'Pahang', 'Negeri Sembilan', 'Melaka', 'Perlis', 'Sabah', 'Sarawak', 'Labuan'];
const US_STATES = { AL: 'Alabama', AZ: 'Arizona', CA: 'California', CO: 'Colorado', FL: 'Florida', GA: 'Georgia', IL: 'Illinois', NC: 'North Carolina', NY: 'New York', OH: 'Ohio', TX: 'Texas', WA: 'Washington' };

export class BlockedError extends Error {}
const safe = (id) => String(id).replace(/[^\w-]/g, '_').slice(0, 80);

async function downloadPhotos(context, urls = [], dir) {
  const files = [];
  for (const [i, url] of urls.entries()) {
    try {
      const res = await context.request.get(url, { timeout: 20000 });
      if (!res.ok()) continue;
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${i + 1}.jpg`);
      await writeFile(file, await res.body());
      files.push(file);
    } catch { /* a missing photo only lowers the photo count on the visual */ }
  }
  return files;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => sleep(a + Math.random() * (b - a));

// "5 months ago" -> unix seconds (approximate), for review-recency counts.
export function parseRelative(text, now = Date.now() / 1000) {
  const m = String(text || '').match(/(a|an|\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
  if (!m) return null;
  const n = /^an?$/i.test(m[1]) ? 1 : Number(m[1]);
  const secs = { minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 }[m[2].toLowerCase()];
  return Math.round(now - n * secs);
}

export function parseAddress(address, market) {
  const parts = String(address || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (market === 'MY') {
    const state = MY_STATES.find((s) => parts.some((p) => p.includes(s))) || null;
    const withPostcode = parts.find((p) => /^\d{5}\s+/.test(p));
    return { city: withPostcode ? withPostcode.replace(/^\d{5}\s+/, '') : parts.at(-2) || null, state };
  }
  if (market === 'US') {
    const stateZip = parts.find((p) => /^[A-Z]{2}\s+\d{5}/.test(p));
    const idx = parts.indexOf(stateZip);
    return { city: idx > 0 ? parts[idx - 1] : null, state: stateZip ? US_STATES[stateZip.slice(0, 2)] || stateZip.slice(0, 2) : null };
  }
  return { city: parts.at(-2) || null, state: null };
}

async function handleConsent(page) {
  if (!/consent\./.test(page.url())) return;
  const btn = page.getByRole('button', { name: /reject all|accept all/i }).first();
  if (await btn.count()) await btn.click();
  await page.waitForURL((u) => !/consent\./.test(String(u)), { timeout: 30000 });
}

async function checkBlocked(page) {
  const url = page.url();
  const text = await page.locator('body').innerText().catch(() => '');
  if (/\/sorry\//.test(url) || /unusual traffic/i.test(text)) throw new BlockedError('Google is rate-limiting this IP (sorry page / unusual traffic). Stop for today.');
}

// Everything visible in the place panel, read in the page.
export async function extractPlace(page, sel = SEL) {
  return page.evaluate((S) => {
    const q = (s) => document.querySelector(s);
    const panel = q(S.panel);
    const text = panel ? panel.innerText : '';
    const labels = [...(panel?.querySelectorAll('[aria-label]') || [])].map((e) => e.getAttribute('aria-label'));
    const starLabel = q(S.stars)?.getAttribute('aria-label') || '';
    const reviewsLabel = labels.find((l) => /[\d,.]+\s+reviews?/i.test(l)) || '';
    const photosLabel = labels.find((l) => /[\d,.]+\s+photos?/i.test(l)) || '';
    const num = (s) => (s ? Number(String(s).replace(/[^\d.]/g, '')) : null);
    const hours = {};
    document.querySelectorAll(S.hoursRows).forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      // Day cells can carry a holiday note ("Monday (Hari Malaysia)"); ranges read "7 AM to 3 PM".
      if (tds.length >= 2) hours[tds[0].innerText.trim().split(/[\s(]/)[0]] = (tds[1].getAttribute('aria-label') || tds[1].innerText).replace(/\s+to\s+/g, '–').replace(/\s+/g, ' ').trim();
    });
    const phoneEl = q(S.phone);
    const addrEl = q(S.address);
    const priceLabel = labels.find((l) => /^Price/i.test(l));
    return {
      name: q(S.name)?.innerText.trim() || null,
      category: q(S.category)?.innerText.trim() || null,
      rating: num((starLabel.match(/([\d.]+)\s*star/i) || [])[1]),
      reviews: num((reviewsLabel.match(/([\d,.]+)\s+reviews?/i) || [])[1]) ?? 0,
      photos_count: num((photosLabel.match(/([\d,.]+)\s+photos?/i) || [])[1]),
      full_address: addrEl ? (addrEl.getAttribute('aria-label') || '').replace(/^Address:\s*/i, '').trim() : null,
      phone: phoneEl ? ((phoneEl.getAttribute('aria-label') || '').replace(/^Phone:\s*/i, '').trim() || (phoneEl.getAttribute('data-item-id') || '').replace('phone:tel:', '')) : null,
      site: q(S.website)?.href || null,
      verified: !q(S.claim),
      working_hours: Object.keys(hours).length ? hours : null,
      range: priceLabel ? priceLabel.replace(/^Price:?\s*/i, '') : null,
      photo_urls: [...new Set([...document.querySelectorAll(S.heroImg)].map((i) => i.src.replace(/=w\d+-h\d+[^/]*$/, '=w900-h600-k-no')))].slice(0, 6),
      business_status: /permanently closed/i.test(text) ? 'CLOSED_PERMANENTLY' : /temporarily closed/i.test(text) ? 'CLOSED_TEMPORARILY' : 'OPERATIONAL',
      limited_view: /limited view of Google Maps/i.test(document.body.innerText),
      place_id_in_page: (document.documentElement.innerHTML.match(/ChIJ[\w-]{20,}/) || [])[0] || null,
    };
  }, sel);
}

// Newest first, so reviews_last_90d is a real count whenever there are fewer than `max` in 90 days.
export async function extractReviews(page, sel = SEL, max = 10) {
  const tab = page.locator(sel.reviewsTab).first();
  if (!(await tab.count())) return null;
  await tab.click();
  await page.waitForSelector(sel.reviewCard, { timeout: 10000 }).catch(() => {});
  const sort = page.locator(sel.sortButton).first();
  if (await sort.count()) {
    await sort.click().catch(() => {});
    const newest = page.getByRole('menuitemradio', { name: /newest/i }).first();
    if (await newest.count()) { await newest.click().catch(() => {}); await jitter(1200, 2000); }
  }
  for (const more of await page.locator(sel.seeMore).all()) await more.click().catch(() => {});
  await jitter(400, 800);
  return page.evaluate(({ S, max }) => [...document.querySelectorAll(S.reviewCard)]
    .filter((c, i, all) => all.findIndex((x) => x.getAttribute('data-review-id') === c.getAttribute('data-review-id')) === i)
    .slice(0, max).map((c) => {
      const star = c.querySelector('[role="img"][aria-label*="star"]')?.getAttribute('aria-label') || '';
      const texts = [...c.querySelectorAll(S.reviewText)].map((e) => e.innerText.trim());
      const whenEl = [...c.querySelectorAll('span')].find((e) => /\bago$/.test(e.innerText.trim()));
      const author = c.querySelector('button[aria-label]')?.getAttribute('aria-label')?.replace(/^Photo of\s*/i, '') || c.getAttribute('aria-label') || '';
      const metaEl = [...c.querySelectorAll('div, span')].find((e) => /\d+\s+reviews?/i.test(e.innerText) && e.innerText.length < 60);
      return {
        author_title: author,
        author_reviews_count: Number(((metaEl?.innerText || '').match(/(\d+)\s+reviews?/i) || [])[1] || 1),
        review_rating: Number((star.match(/(\d)/) || [])[1] || 0),
        review_when: whenEl?.innerText.trim() || '',
        review_text: texts[0] || '',
        owner_answer: /response from the owner/i.test(c.innerText) ? (texts[1] || 'yes') : null,
      };
    }), { S: sel, max });
}

// Search one query; return places in Google's order (index = rank for that search).
export async function searchPlaces(query, { limit = 40, market = 'MY', screenshots = true, headless = true } = {}) {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ locale: 'en-US', timezoneId: TZ[market] || 'UTC', viewport: { width: 1280, height: 2000 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const shotsDir = path.join(dataDir(), 'screens');
  const photosDir = path.join(dataDir(), 'photos');
  await mkdir(shotsDir, { recursive: true });
  const out = [];
  try {
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await handleConsent(page);
    await checkBlocked(page);

    let links = [];
    if (/\/maps\/place\//.test(page.url())) {
      links = [{ href: page.url() }];
    } else {
      await page.waitForSelector(SEL.feed, { timeout: 30000 });
      for (let i = 0, stale = 0; links.length < limit && stale < 4; i++) {
        const found = await page.$$eval(SEL.resultLink, (as) => as.map((a) => ({ href: a.href, name: a.getAttribute('aria-label') })));
        const before = links.length;
        links = [...new Map(found.map((l) => [l.href.split('?')[0], l])).values()];
        stale = links.length === before ? stale + 1 : 0;
        if (await page.getByText(/reached the end of the list/i).count()) break;
        await page.locator(SEL.feed).evaluate((el) => el.scrollBy(0, 2500));
        await jitter(1200, 2200);
      }
      links = links.slice(0, limit);
    }

    for (const [rank, link] of links.entries()) {
      await page.goto(link.href.includes('hl=') ? link.href : `${link.href}${link.href.includes('?') ? '&' : '?'}hl=en`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await handleConsent(page);
      await checkBlocked(page);
      await page.waitForSelector(SEL.name, { timeout: 20000 }).catch(() => {});
      await jitter(1500, 3000);
      const p = await extractPlace(page, SEL);
      if (!p.name) continue;
      const ftid = (link.href.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/) || [])[1];
      const id = p.place_id_in_page || ftid || `${p.name}|${p.full_address}`;
      let screenshot = null;
      if (screenshots) {
        screenshot = path.join(shotsDir, `${safe(id)}.png`);
        await page.locator(SEL.panel).first().screenshot({ path: screenshot }).catch(() => { screenshot = null; });
      }
      const photos = await downloadPhotos(context, p.photo_urls, path.join(photosDir, safe(id)));
      const reviews = p.limited_view ? null : await extractReviews(page, SEL);
      const now = Date.now() / 1000;
      const { city, state } = parseAddress(p.full_address, market);
      out.push({
        ...p, place_id: id, google_id: ftid || null, maps_url: link.href, city, state, time_zone: TZ[market] || null, screenshot,
        subtypes: '', reviews_per_score: null, description: null,
        reviews_data: (reviews || []).map((r) => ({ ...r, review_timestamp: parseRelative(r.review_when, now) })),
        photo: photos[0] || null, photos_data: photos.map((f) => ({ photo_url_big: f })),
        confidence_note: p.limited_view ? 'limited view: reviews not visible' : null,
      });
      await jitter(2000, 5000);
      if ((rank + 1) % 15 === 0) await jitter(20000, 40000); // breather every 15 listings
    }
  } catch (err) {
    if (!(err instanceof BlockedError)) throw err;
    out.blocked = err.message; // keep what was collected; the caller stops sourcing for today
  } finally {
    await browser.close();
  }
  return out;
}
