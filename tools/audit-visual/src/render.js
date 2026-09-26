#!/usr/bin/env node
// Usage: node src/render.js <prospect.json>... [--out out] [--brand brand.json] [--locale en|fr] [--months 3]
// For each prospect writes <out>/<slug>/:
//   before.png, after.png   Google-style profile panels (today / in N days), 2x
//   comparison.png          both panels side by side with the key numbers (email reply, postcard)
//   card.png                1200x630 crop of the comparison (email thumbnail, link preview)
//   index.html              personal audit page
//   audit.json              facts and projections quoted by emails and calls
// "Today" uses prospect.screenshot (a real capture from capture.js) when present.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { scoreProfile } from './score.js';
import { projectProfile, estimateDistribution } from './projection.js';
import { panelPage, comparisonHTML, auditPageHTML, pairedRows, kpis } from './templates.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const opts = { inputs: [], out: 'out', brand: path.join(root, 'brand.json'), locale: null, months: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--brand') opts.brand = argv[++i];
    else if (a === '--locale') opts.locale = argv[++i];
    else if (a === '--months') opts.months = Number(argv[++i]);
    else opts.inputs.push(a);
  }
  if (!opts.inputs.length) throw new Error('Pass at least one prospect JSON file.');
  return opts;
}

const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function copyFonts(outDir) {
  const fontsDir = path.join(outDir, 'fonts');
  await mkdir(fontsDir, { recursive: true });
  const files = [
    ...[400, 500, 600, 700, 800].map((w) => ['inter', `inter-latin-${w}-normal.woff2`]),
    ...[600, 700].map((w) => ['fraunces', `fraunces-latin-${w}-normal.woff2`]),
    ...[400, 500, 700].map((w) => ['roboto', `roboto-latin-${w}-normal.woff2`]),
  ];
  await Promise.all(files.map(([pkg, f]) => copyFile(
    path.join(root, 'node_modules/@fontsource', pkg, 'files', f), path.join(fontsDir, f))));
}

// Relative photo paths in the JSON resolve against the JSON file; URLs pass through.
const resolveSrc = (baseDir, src) => (/^(https?|file|data):/.test(src) ? src : pathToFileURL(path.resolve(baseDir, src)).href);
const withSrc = (baseDir, list = []) => list.map((x) => ({ ...x, src: x.src && resolveSrc(baseDir, x.src), photo: x.photo && resolveSrc(baseDir, x.photo) }));

export function buildStates(data, months = 3, locale = 'en') {
  const p = data.prospect;
  const competitors = data.competitors || [];
  const today = { ...p, rating_distribution: p.rating_distribution || estimateDistribution(p.rating ?? 0, p.review_count ?? 0) };
  const after = projectProfile(p, data.proposal || {}, competitors, { months });
  const before = scoreProfile(today, { competitors, locale });
  const afterScore = scoreProfile(after, { competitors, locale });
  return { today, after, before, afterScore };
}

async function shootPanel(browser, htmlPath, outPng) {
  const page = await browser.newPage({ viewport: { width: 408, height: 800 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.gp').screenshot({ path: outPng });
  await page.close();
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const brand = JSON.parse(await readFile(opts.brand, 'utf8'));
  const outDir = path.resolve(opts.out);
  await copyFonts(outDir);

  const browser = await chromium.launch();
  try {
    for (const input of opts.inputs) {
      const data = JSON.parse(await readFile(input, 'utf8'));
      const baseDir = path.dirname(path.resolve(input));
      const locale = opts.locale || data.locale || brand.locale || 'en';
      const months = opts.months || data.projection_months || 3;
      const p = data.prospect; const pr = data.proposal || {};
      const { today, after, before, afterScore } = buildStates(data, months, locale);
      const slug = data.token || slugify(p.business_name);
      const dir = path.join(outDir, slug);
      await mkdir(dir, { recursive: true });
      const fontBase = '../fonts';

      // Today: real screenshot if we have one, otherwise the recreated panel from listing data.
      if (p.screenshot) {
        await copyFile(path.resolve(baseDir, p.screenshot), path.join(dir, 'before.png'));
      } else {
        const beforeHtml = path.join(dir, 'before.html');
        await writeFile(beforeHtml, panelPage({
          state: today, vertical: p.vertical, locale, fontBase,
          extra: { photos: withSrc(baseDir, p.photos), reviews: p.recent_reviews, posts: withSrc(baseDir, p.posts), description: p.description },
        }));
        await shootPanel(browser, beforeHtml, path.join(dir, 'before.png'));
      }

      const afterHtml = path.join(dir, 'after.html');
      await writeFile(afterHtml, panelPage({
        state: after, vertical: p.vertical, locale, fontBase,
        extra: { photos: withSrc(baseDir, pr.photos || p.photos), reviews: pr.illustrative_reviews, posts: withSrc(baseDir, pr.posts), description: pr.description },
      }));
      await shootPanel(browser, afterHtml, path.join(dir, 'after.png'));

      const kpiRows = kpis({ today, after, before, afterScore, locale });
      for (const variant of ['full', 'card']) {
        const htmlPath = path.join(dir, `${variant === 'full' ? 'comparison' : 'card'}.html`);
        await writeFile(htmlPath, comparisonHTML({ data, brand, locale, fontBase, beforeSrc: 'before.png', afterSrc: 'after.png', kpiRows, months, variant }));
        const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(dir, `${variant === 'full' ? 'comparison' : 'card'}.png`), fullPage: variant === 'full' });
        await page.close();
      }

      await writeFile(path.join(dir, 'index.html'), auditPageHTML({
        data, before, afterScore, today, after, brand, locale, fontBase, beforeSrc: 'before.png', afterSrc: 'after.png', kpiRows, months,
      }));

      const summary = {
        business_name: p.business_name,
        slug,
        locale,
        months,
        score_today: before.score,
        score_projected: afterScore.score,
        reviews_today: today.review_count ?? 0,
        reviews_projected: after.review_count,
        reviews_per_month: after.reviews_per_month,
        rating_today: today.rating ?? null,
        rating_projected: after.rating,
        photos_today: today.photo_count ?? 0,
        photos_projected: after.photo_count,
        top_findings: before.findings.slice(0, 3),
        card_rows: pairedRows(before, pr, locale),
      };
      await writeFile(path.join(dir, 'audit.json'), JSON.stringify(summary, null, 2));
      console.log(`${slug}: score ${before.score} -> ${afterScore.score}, reviews ${summary.reviews_today} -> ${summary.reviews_projected}, rating ${summary.rating_today} -> ${summary.rating_projected}  (${path.relative(process.cwd(), dir)})`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
