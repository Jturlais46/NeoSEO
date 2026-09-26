#!/usr/bin/env node
// Builds a picker for the visual options of one rendered prospect:
//   node src/gallery.js out/<slug> [--title "..."] [--extra out/<slug-ms>,out/<slug-zh>]
// Writes <dir>/gallery.html (numbered options with where each works best) and
// <dir>/contact-sheet.png (all options on one image, for choosing on a phone).

import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { VARIANTS } from './variants.js';

const NAME_OF = { 'comparison.png': 'side-by-side', 'card.png': 'card' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function listOptions(dir) {
  const files = (await readdir(dir)).filter((f) => f === 'comparison.png' || f === 'card.png' || /^v-.+\.png$/.test(f));
  const order = Object.keys(VARIANTS);
  return files
    .map((f) => ({ file: f, name: NAME_OF[f] || f.replace(/^v-|\.png$/g, '') }))
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
    .map((o, i) => ({ ...o, n: i + 1, use: VARIANTS[o.name]?.use || '' }));
}

async function main() {
  const args = process.argv.slice(2);
  const dir = path.resolve(args[0]);
  const title = args.includes('--title') ? args[args.indexOf('--title') + 1] : 'Visual options';
  const extras = args.includes('--extra') ? args[args.indexOf('--extra') + 1].split(',').map((d) => path.resolve(d)) : [];
  const options = await listOptions(dir);
  const extraTiles = [];
  for (const d of extras) {
    for (const o of await listOptions(d)) extraTiles.push({ ...o, file: path.relative(dir, path.join(d, o.file)), label: `${o.name} (${path.basename(d)})` });
  }

  const tile = (o, big) => `<figure class="${big ? 'big' : ''}"><div class="num">${o.n ?? ''}</div><img src="${esc(o.file)}" alt="${esc(o.name)}">
    <figcaption><b>${esc(o.label || o.name)}</b>${o.use ? `<span>${esc(o.use)}</span>` : ''}</figcaption></figure>`;
  const css = `*{box-sizing:border-box}body{margin:0;background:#F6F2EA;color:#14261F;font:15px/1.45 system-ui,sans-serif}
  main{max-width:1280px;margin:0 auto;padding:32px 16px}h1{font:700 30px Georgia,serif;margin:0 0 6px}h2{margin:32px 0 10px;font-size:18px}
  p{color:#5E6E67;margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px}
  figure{position:relative;margin:0;background:#fff;border:1px solid #E3DCCF;border-radius:14px;overflow:hidden}
  figure img{display:block;width:100%;height:260px;object-fit:contain;object-position:top;background:#EDE7DC}
  figcaption{padding:10px 14px;display:flex;flex-direction:column;gap:2px}figcaption span{color:#5E6E67;font-size:13px}
  .num{position:absolute;left:10px;bottom:62px;width:34px;height:34px;border-radius:50%;background:#1D6B51;color:#fff;display:grid;place-items:center;font-weight:800;box-shadow:0 0 0 3px #fff}
  .num:empty{display:none}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${css}</style></head>
  <body><main><h1>${esc(title)}</h1><p>Every option is generated from the same prospect data. Pick by number; you can use different ones per channel.</p>
  <div class="grid">${options.map((o) => tile(o)).join('')}</div>
  ${extraTiles.length ? `<h2>Other languages</h2><div class="grid">${extraTiles.map((o) => tile({ ...o, n: '' })).join('')}</div>` : ''}
  </main></body></html>`;
  const galleryPath = path.join(dir, 'gallery.html');
  await writeFile(galleryPath, html);

  // Contact sheet: fixed 3-column grid, rendered to one PNG.
  const sheetCss = `${css} main{max-width:none;width:1500px}.grid{grid-template-columns:repeat(3,1fr)}figure img{height:300px}`;
  const sheet = html.replace(`<style>${css}</style>`, `<style>${sheetCss}</style>`);
  const sheetPath = path.join(dir, 'contact-sheet.html');
  await writeFile(sheetPath, sheet);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await page.goto(pathToFileURL(sheetPath).href, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'contact-sheet.png'), fullPage: true });
  await browser.close();
  console.log(`gallery: ${path.relative(process.cwd(), galleryPath)} (${options.length} options${extraTiles.length ? ` + ${extraTiles.length} other-language` : ''})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
