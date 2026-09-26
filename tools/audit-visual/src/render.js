#!/usr/bin/env node
// Usage: node src/render.js <prospect.json>... [--out out] [--brand brand.json] [--locale en|fr|ms|zh]
//                                              [--months 3] [--variants card,side-by-side,...|all]
// For each prospect writes <out>/<slug>/:
//   before.png, after.png   Google-style profile panels (today / in N days), 2x
//   comparison.png          variant "side-by-side"      card.png   variant "card" (1200x630)
//   v-<name>.png            any other variant (see src/variants.js)
//   index.html              personal audit page
//   audit.json              facts and projections quoted by messages and calls
// "Today" uses prospect.screenshot (a real capture from capture.js) when present.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { STRINGS } from './i18n.js';
import { scoreProfile } from './score.js';
import { projectProfile, estimateDistribution } from './projection.js';
import { panelPage, auditPageHTML, pairedRows, kpis } from './templates.js';
import { VARIANTS } from './variants.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_VARIANTS = ['side-by-side', 'card'];
const FILE_FOR = { 'side-by-side': 'comparison.png', card: 'card.png' };

function parseArgs(argv) {
  const opts = { inputs: [], out: 'out', brand: path.join(root, 'brand.json'), locale: null, months: null, variants: DEFAULT_VARIANTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--brand') opts.brand = argv[++i];
    else if (a === '--locale') opts.locale = argv[++i];
    else if (a === '--months') opts.months = Number(argv[++i]);
    else if (a === '--variants') { const v = argv[++i]; opts.variants = v === 'all' ? Object.keys(VARIANTS) : v.split(','); }
    else opts.inputs.push(a);
  }
  if (!opts.inputs.length) throw new Error('Pass at least one prospect JSON file.');
  const unknown = opts.variants.filter((v) => !VARIANTS[v]);
  if (unknown.length) throw new Error(`Unknown variants: ${unknown.join(', ')}. Known: ${Object.keys(VARIANTS).join(', ')}`);
  return opts;
}

const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'prospect';

export async function copyFonts(outDir) {
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
const withSrc = (baseDir, list = []) => (list || []).map((x) => ({ ...x, src: x.src && resolveSrc(baseDir, x.src), photo: x.photo && resolveSrc(baseDir, x.photo) }));

export function buildStates(data, months = 3, locale = 'en') {
  const p = data.prospect;
  const competitors = data.competitors || [];
  const today = { ...p, rating_distribution: p.rating_distribution || estimateDistribution(p.rating ?? 0, p.review_count ?? 0) };
  const after = projectProfile(p, data.proposal || {}, competitors, { months });
  const before = scoreProfile(today, { competitors, locale });
  const afterScore = scoreProfile(after, { competitors, locale });
  return { today, after, before, afterScore };
}

async function shoot(browser, htmlPath, outPng, { width, height, selector, scale = 1 }) {
  const page = await browser.newPage({ viewport: { width, height: height || 800 }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(50);
  if (selector) await page.locator(selector).screenshot({ path: outPng });
  else await page.screenshot({ path: outPng, fullPage: !height });
  await page.close();
}

// Render one prospect. Returns the audit summary (also written to audit.json).
export async function renderProspect({ browser, data, baseDir, outDir, brand, locale, months, variants = DEFAULT_VARIANTS }) {
  locale = locale || data.locale || brand.locale || 'en';
  months = months || data.projection_months || 3;
  const t = STRINGS[locale];
  if (!t) throw new Error(`Unknown locale ${locale}`);
  const p = data.prospect; const pr = data.proposal || {};
  const { today, after, before, afterScore } = buildStates(data, months, locale);
  const slug = data.token || slugify(p.business_name);
  const dir = path.join(outDir, slug);
  await mkdir(dir, { recursive: true });
  const fontBase = '../fonts';

  const extraToday = { photos: withSrc(baseDir, p.photos), reviews: p.recent_reviews, posts: withSrc(baseDir, p.posts), description: p.description };
  const extraAfter = { photos: withSrc(baseDir, pr.photos?.length ? pr.photos : p.photos), reviews: pr.illustrative_reviews, posts: withSrc(baseDir, pr.posts), description: pr.description };

  if (p.screenshot) {
    await copyFile(path.resolve(baseDir, p.screenshot), path.join(dir, 'before.png'));
  } else {
    const beforeHtml = path.join(dir, 'before.html');
    await writeFile(beforeHtml, panelPage({ state: today, vertical: p.vertical, locale, fontBase, extra: extraToday }));
    await shoot(browser, beforeHtml, path.join(dir, 'before.png'), { width: 408, height: 800, selector: '.gp', scale: 2 });
  }
  const afterHtml = path.join(dir, 'after.html');
  await writeFile(afterHtml, panelPage({ state: after, vertical: p.vertical, locale, fontBase, extra: extraAfter }));
  await shoot(browser, afterHtml, path.join(dir, 'after.png'), { width: 408, height: 800, selector: '.gp', scale: 2 });

  const kpiRows = kpis({ today, after, before, afterScore, locale });
  const ctx = { data, p, pr, today, after, before, afterScore, kpiRows, brand, locale, t, fontBase, beforeSrc: 'before.png', afterSrc: 'after.png', months, extraToday, extraAfter };
  const rendered = [];
  for (const name of variants) {
    const v = VARIANTS[name].fn(ctx);
    const file = FILE_FOR[name] || `v-${name}.png`;
    const htmlPath = path.join(dir, file.replace(/\.png$/, '.html'));
    await writeFile(htmlPath, v.html);
    await shoot(browser, htmlPath, path.join(dir, file), { width: v.width, height: v.height });
    rendered.push(file);
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
    images: rendered,
  };
  await writeFile(path.join(dir, 'audit.json'), JSON.stringify(summary, null, 2));
  return { ...summary, dir };
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
      const s = await renderProspect({
        browser, data, baseDir: path.dirname(path.resolve(input)), outDir, brand,
        locale: opts.locale, months: opts.months, variants: opts.variants,
      });
      console.log(`${s.slug}: score ${s.score_today} -> ${s.score_projected}, reviews ${s.reviews_today} -> ${s.reviews_projected}, rating ${s.rating_today} -> ${s.rating_projected}  [${s.images.length} images] (${path.relative(process.cwd(), s.dir)})`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
