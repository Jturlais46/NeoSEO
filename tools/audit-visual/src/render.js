#!/usr/bin/env node
// Usage: node src/render.js <prospect.json>... [--out out] [--brand brand.json] [--locale en|fr]
// For each prospect writes <out>/<slug>/{card.png, card@2x.png, index.html, audit.json}.
// audit.json carries the scores and top findings that the email and call scripts reference,
// so every channel quotes the same facts.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { scoreProfile } from './score.js';
import { applyProposal } from './proposal.js';
import { cardHTML, auditPageHTML, pairedRows } from './templates.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const opts = { inputs: [], out: 'out', brand: path.join(root, 'brand.json'), locale: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--brand') opts.brand = argv[++i];
    else if (a === '--locale') opts.locale = argv[++i];
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
  ];
  await Promise.all(files.map(([pkg, f]) => copyFile(
    path.join(root, 'node_modules/@fontsource', pkg, 'files', f), path.join(fontsDir, f))));
}

export function buildAudit(data, locale = 'en') {
  const competitors = data.competitors || [];
  const before = scoreProfile(data.prospect, { competitors, locale });
  const after = scoreProfile(applyProposal(data.prospect, data.proposal), { competitors, locale });
  return { before, after };
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
      const locale = opts.locale || data.locale || brand.locale || 'en';
      const { before, after } = buildAudit(data, locale);
      const slug = data.token || slugify(data.prospect.business_name);
      const dir = path.join(outDir, slug);
      await mkdir(dir, { recursive: true });

      const cardPath = path.join(dir, 'card.html');
      await writeFile(cardPath, cardHTML({ data, before, after, brand, locale, fontBase: '../fonts' }));
      for (const [scale, name] of [[1, 'card.png'], [2, 'card@2x.png']]) {
        const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: scale });
        await page.goto(pathToFileURL(cardPath).href);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(dir, name) });
        await page.close();
      }

      await writeFile(path.join(dir, 'index.html'),
        auditPageHTML({ data, before, after, brand, locale, fontBase: '../fonts', cardSrc: 'card@2x.png' }));

      const summary = {
        business_name: data.prospect.business_name,
        slug,
        locale,
        score_today: before.score,
        score_after_setup: after.score,
        top_findings: before.findings.slice(0, 3),
        card_rows: pairedRows(before, data.proposal || {}, locale),
      };
      await writeFile(path.join(dir, 'audit.json'), JSON.stringify(summary, null, 2));
      console.log(`${slug}: ${before.score} -> ${after.score}  (${path.relative(process.cwd(), dir)})`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
