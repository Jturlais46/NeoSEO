// Comparison image (today vs. in 90 days, as Google profile panels) and the per-prospect audit page.

import { STRINGS } from './i18n.js';
import { PANEL_CSS, panelHTML } from './panel.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fontFaces(fontBase) {
  const face = (family, file, w) => `@font-face{font-family:${family};font-weight:${w};font-display:block;src:url(${fontBase}/${file}) format('woff2')}`;
  return [
    ...[400, 500, 600, 700, 800].map((w) => face('Inter', `inter-latin-${w}-normal.woff2`, w)),
    ...[600, 700].map((w) => face('Fraunces', `fraunces-latin-${w}-normal.woff2`, w)),
    ...[400, 500, 700].map((w) => face('Roboto', `roboto-latin-${w}-normal.woff2`, w)),
  ].join('\n');
}

// Checks that share one fix; show only the biggest loss in each group.
const ROW_GROUP = { reviewVolume: 'reviews', reviewRecency: 'reviews', rating: 'reviews' };

// The biggest point losses today, paired with their fix (used by emails and calls via audit.json).
export function pairedRows(before, proposal, locale, max = 5) {
  const t = STRINGS[locale];
  const seen = new Set();
  return before.breakdown
    .filter((b) => b.finding && t.fixes[b.key])
    .sort((a, b) => (b.weight - b.points) - (a.weight - a.points))
    .filter((b) => {
      const g = ROW_GROUP[b.key] || b.key;
      if (seen.has(g)) return false;
      seen.add(g);
      return true;
    })
    .slice(0, max)
    .map((b) => ({ key: b.key, today: b.finding, after: t.fixes[b.key](proposal) }));
}

export function kpis({ today, after, before, afterScore, locale }) {
  const t = STRINGS[locale];
  return [
    [t.kpi.reviews, t.int(today.review_count ?? 0), t.int(after.review_count)],
    [t.kpi.rating, today.rating ? t.number(today.rating) : '–', t.number(after.rating)],
    [t.kpi.photos, t.int(today.photo_count ?? 0), `${t.int(after.photo_count)}+`],
    [t.kpi.replies, `${Math.round((today.owner_reply_rate ?? 0) * 100)}%`, '100%'],
    [t.kpi.score, `${before.score}`, `${afterScore.score}`],
  ];
}

// Standalone page for one panel, screenshotted to before.png / after.png.
export function panelPage({ state, extra, vertical, locale, fontBase }) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<style>${fontFaces(fontBase)}html,body{margin:0;background:#fff}${PANEL_CSS}</style></head>
<body>${panelHTML({ state, extra, vertical, locale })}</body></html>`;
}

const COMP_CSS = `
:root{--ink:#14261F;--muted:#5E6E67;--paper:#F6F2EA;--line:#E3DCCF;--brand:#1D6B51;--brand-2:#0F4735}
*{box-sizing:border-box}
html,body{margin:0;width:1200px;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans SC","WenQuanYi Zen Hei",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.frame{padding:30px 44px 36px}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;height:74px}
.title{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:var(--ts,32px);line-height:1.1;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{font-size:14px;color:var(--muted);margin-top:6px}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:17px;color:var(--brand-2);white-space:nowrap}
.brand .pin{width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--brand);position:relative}
.brand .pin:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--paper)}
.cols{display:grid;grid-template-columns:540px 540px;gap:32px;margin-top:14px;align-items:start}
.lbl{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:#E6E0D4;color:#4A5751;margin-bottom:10px}
.lbl.after{background:var(--brand);color:#fff}
.shot{width:540px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08),0 12px 32px rgba(20,38,31,.12)}
.shot.after{outline:3px solid var(--brand)}
.shot img{display:block;width:540px;height:auto}
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:26px}
.k{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.k .l{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.k .v{margin-top:6px;font-size:22px;font-weight:600;font-variant-numeric:tabular-nums}
.k .v b{color:var(--brand);font-weight:800}
.k .v span{color:var(--muted);font-weight:500;margin:0 6px}
/* dark theme */
body.dark{--ink:#EEF3F0;--muted:#9AABA3;--paper:#0E1512;--line:#26332E;--brand:#4CC095;--brand-2:#8FDDBF;background:var(--paper)}
body.dark .lbl{background:#26332E;color:#C9D4CF}body.dark .lbl.after{color:#0E1512}
body.dark .k{background:#17221E}body.dark .shot{box-shadow:0 12px 36px rgba(0,0,0,.5)}
/* card variant: fixed 1200x630, panels cropped to photo bottom + name + rating */
body.card{height:630px;overflow:hidden}
.card .frame{padding:26px 44px 0}
.card .cols{margin-top:10px}
.card .shot{height:370px}
.card .shot img{margin-top:-120px}
.card .kpis{margin-top:18px}
.card .k{padding:10px 14px}
.card .k .v{font-size:20px;margin-top:2px}
`;

const titleSize = (text) => (text.length <= 56 ? 32 : text.length <= 66 ? 28 : 24);

export function comparisonHTML({ data, brand, locale, fontBase, beforeSrc, afterSrc, kpiRows, months, variant = 'full', theme = 'light' }) {
  const t = STRINGS[locale];
  const p = data.prospect;
  const headline = t.headline(p.business_name);
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<style>${fontFaces(fontBase)}${COMP_CSS}</style></head><body class="${variant} ${theme}"><div class="frame">
  <div class="top"><div style="min-width:0"><div class="title" style="--ts:${titleSize(headline)}px">${esc(headline)}</div>
    <div class="sub">${esc(t.subline(brand.name, p.city))}</div></div>
    <div class="brand"><span class="pin"></span>${esc(brand.name)}</div></div>
  <div class="cols">
    <div><div class="lbl">${esc(t.today)}</div><div class="shot"><img src="${esc(beforeSrc)}" alt=""></div></div>
    <div><div class="lbl after">${esc(t.inDays(brand.name, months))}</div><div class="shot after"><img src="${esc(afterSrc)}" alt=""></div></div>
  </div>
  <div class="kpis">${kpiRows.map(([l, a, b]) => `<div class="k"><div class="l">${esc(l)}</div><div class="v">${esc(a)}<span>→</span><b>${esc(b)}</b></div></div>`).join('')}</div>
</div></body></html>`;
}

// ---------- Audit page ----------

const PAGE_CSS = `
:root{--ink:#14261F;--ink-2:#3C4D46;--muted:#5E6E67;--paper:#F6F2EA;--card:#FFFFFF;--line:#E3DCCF;
  --brand:#1D6B51;--brand-2:#0F4735;--brand-soft:#E2F0E9;--bad:#A8472A;--bar-other:#B9B0A0;--focus:#D9912B}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#EEF3F0;--ink-2:#C9D4CF;--muted:#9AABA3;--paper:#0F1714;--card:#17221E;--line:#2A3833;
  --brand:#4CC095;--brand-2:#8FDDBF;--brand-soft:#173A2E;--bad:#E48B6C;--bar-other:#5C6862}}
:root[data-theme="dark"]{--ink:#EEF3F0;--ink-2:#C9D4CF;--muted:#9AABA3;--paper:#0F1714;--card:#17221E;--line:#2A3833;
  --brand:#4CC095;--brand-2:#8FDDBF;--brand-soft:#173A2E;--bad:#E48B6C;--bar-other:#5C6862}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:1000px;margin:0 auto;padding:40px 16px 64px}
.eyebrow{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}
h1{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:clamp(30px,5vw,46px);line-height:1.08;letter-spacing:-.015em;margin:10px 0 12px}
h2{font-family:Fraunces,Georgia,serif;font-size:26px;line-height:1.2;margin:0 0 6px}
h3{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:18px 0 6px}
.lede{font-size:18px;color:var(--ink-2);max-width:720px;margin:0}
.ctas{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 8px}
.btn{display:inline-block;padding:14px 22px;border-radius:12px;font-weight:700;text-decoration:none;border:2px solid var(--brand)}
.btn.primary{background:var(--brand);color:#fff}.btn.ghost{color:var(--brand)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .btn.primary{color:#0F1714}}
:root[data-theme="dark"] .btn.primary{color:#0F1714}
.btn:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.note{font-size:14px;color:var(--muted)}
.panels{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:28px 0 8px;align-items:start}
@media (max-width:720px){.panels{grid-template-columns:1fr}}
.pl{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:var(--line);color:var(--ink-2);margin-bottom:10px}
.pl.after{background:var(--brand);color:#fff}
.panels img{display:block;width:100%;height:auto;border-radius:14px;box-shadow:0 1px 2px rgba(0,0,0,.08),0 12px 32px rgba(20,38,31,.12);background:#fff}
.panels .after img{outline:3px solid var(--brand)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:20px}
.k{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.k .l{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.k .v{margin-top:6px;font-size:22px;font-weight:600;font-variant-numeric:tabular-nums}
.k .v b{color:var(--brand);font-weight:800}.k .v span{color:var(--muted);margin:0 6px}
section{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:24px;margin-top:20px}
section > p{margin:0 0 12px;color:var(--ink-2)}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:9px 6px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tfoot td{font-weight:800;border-bottom:none}
.gap{color:var(--bad)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:5px 11px;border-radius:999px;background:var(--brand-soft);color:var(--brand-2);font-weight:600;font-size:14px}
.chip.primary{background:var(--brand);color:#fff}
blockquote{margin:0;padding:12px 16px;border-left:3px solid var(--line);color:var(--ink-2)}
.reply{margin-top:10px;padding:14px 16px;border-radius:12px;background:var(--brand-soft)}
.reply .lbl{font-size:12px;font-weight:700;color:var(--brand-2);margin-bottom:4px}
.bars{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.bar-row{display:grid;grid-template-columns:minmax(90px,220px) 1fr 56px;gap:10px;align-items:center;font-size:14px}
.bar-row .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-fill{height:14px;border-radius:0 4px 4px 0;background:var(--bar-other);min-width:2px}
.bar-row.you .bar-fill{background:var(--bad)}.bar-row.you .nm{font-weight:700}
.bar-row.after .bar-fill{background:var(--brand)}.bar-row.after .nm{font-weight:800}
.bar-row .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2)}
ol.steps{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
ol.steps li b{display:block;margin-bottom:2px}
ol.steps .n{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--brand);color:#fff;font-weight:800;margin-bottom:6px}
ul.plain{margin:0;padding-left:20px}
footer{margin-top:36px;font-size:13px;color:var(--muted)}
footer a{color:var(--muted)}
`;

export function auditPageHTML({ data, before, afterScore, today, after, brand, locale = 'en', fontBase, beforeSrc, afterSrc, kpiRows, months }) {
  const t = STRINGS[locale]; const tp = t.page;
  const p = data.prospect; const pr = data.proposal || {};
  const links = data.links || {};
  const afterByKey = Object.fromEntries(afterScore.breakdown.map((b) => [b.key, b.points]));

  const scoreRows = before.breakdown.map((b) => `<tr><td>${esc(t.checkLabels[b.key] || b.key)}${b.finding ? `<div class="note gap">${esc(b.finding)}</div>` : ''}</td>
    <td class="num">${b.points} / ${b.weight}</td><td class="num">${afterByKey[b.key]} / ${b.weight}</td></tr>`).join('');

  const comps = [
    { name: `${tp.you}`, review_count: today.review_count ?? 0, cls: 'you' },
    { name: `${tp.youAfter}`, review_count: after.review_count, cls: 'after' },
    ...(data.competitors || []).map((c) => ({ ...c, cls: '' })),
  ].sort((a, b) => b.review_count - a.review_count);
  const maxReviews = Math.max(1, ...comps.map((c) => c.review_count));
  const bars = comps.map((c) => `<div class="bar-row ${c.cls}" title="${esc(c.name)}: ${c.review_count}">
      <span class="nm">${esc(c.name)}</span>
      <div><div class="bar-fill" style="width:${((c.review_count / maxReviews) * 100).toFixed(1)}%"></div></div>
      <span class="v">${t.int(c.review_count)}</span></div>`).join('');

  const r = pr.sample_review_reply;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(tp.metaTitle(p.business_name))}</title>
<style>${fontFaces(fontBase)}${PAGE_CSS}</style></head><body><main>
  <div class="eyebrow">${esc(tp.eyebrow)}</div>
  <h1>${esc(tp.h1(p.business_name))}</h1>
  <p class="lede">${esc(tp.lede(data.audit_date))}</p>
  <div class="ctas">
    <a class="btn primary" href="${esc(links.checkout || '#')}">${esc(tp.ctaYes(brand.price))}</a>
    <a class="btn ghost" href="${esc(links.booking || '#')}">${esc(tp.ctaCall)}</a>
  </div>
  <div class="note">${esc(tp.ctaNote)}</div>

  <div class="panels">
    <div><div class="pl">${esc(t.today)}</div><img src="${esc(beforeSrc)}" alt="${esc(p.business_name)}: ${esc(t.today)}"></div>
    <div class="after"><div class="pl after">${esc(t.inDays(brand.name, months))}</div><img src="${esc(afterSrc)}" alt="${esc(p.business_name)}: ${esc(t.inDays(brand.name, months))}"></div>
  </div>
  <div class="kpis">${kpiRows.map(([l, a, b]) => `<div class="k"><div class="l">${esc(l)}</div><div class="v">${esc(a)}<span>→</span><b>${esc(b)}</b></div></div>`).join('')}</div>

  <section><h2>${esc(tp.scoreH)}: ${before.score} → ${afterScore.score}</h2><p>${esc(tp.scoreLede)}</p>
    <table><thead><tr><th>${esc(tp.colCheck)}</th><th class="num">${esc(tp.colToday)}</th><th class="num">${esc(tp.colAfter)}</th></tr></thead>
    <tbody>${scoreRows}</tbody>
    <tfoot><tr><td></td><td class="num">${before.score} / 100</td><td class="num">${afterScore.score} / 100</td></tr></tfoot></table>
  </section>

  <section><h2>${esc(tp.proposalH)}</h2>
    <h3>${esc(tp.categoriesH)}</h3>
    <div class="chips">${[pr.primary_category].filter(Boolean).map((c) => `<span class="chip primary">${esc(c)}</span>`).join('')}${(pr.secondary_categories || []).map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    ${pr.description ? `<h3>${esc(tp.descriptionH)}</h3><p>${esc(pr.description)}</p>` : ''}
    ${pr.services?.length ? `<h3>${esc(tp.servicesH)}</h3><ul class="plain">${pr.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  </section>

  ${data.competitors?.length ? `<section><h2>${esc(tp.compareH)}</h2><p>${esc(tp.compareLede)}</p><div class="bars" role="list">${bars}</div></section>` : ''}

  ${pr.update_ideas?.length ? `<section><h2>${esc(tp.postsH)}</h2><ul class="plain">${pr.update_ideas.map((u) => `<li>${esc(u)}</li>`).join('')}</ul></section>` : ''}

  ${pr.photo_shot_list?.length ? `<section><h2>${esc(tp.shotsH)}</h2><p>${esc(tp.shotsLede)}</p><ul class="plain">${pr.photo_shot_list.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>` : ''}

  ${r ? `<section><h2>${esc(tp.replyH)}</h2><blockquote>${esc(r.review_excerpt)}</blockquote>
    <div class="reply"><div class="lbl">${esc(tp.replyLabel)}</div>${esc(r.reply)}</div></section>` : ''}

  <section><h2>${esc(tp.aiH)}</h2><p>${esc(tp.aiBody)}</p></section>

  <section><h2>${esc(tp.howH)}</h2><ol class="steps">${tp.how.map(([h, d], i) => `<li><span class="n">${i + 1}</span><b>${esc(h)}</b>${esc(d)}</li>`).join('')}</ol>
    <div class="ctas"><a class="btn primary" href="${esc(links.checkout || '#')}">${esc(tp.ctaYes(brand.price))}</a></div>
  </section>

  <footer><p>${esc(tp.footer(brand.legal))}</p><p><a href="${esc(links.optout || '#')}">${esc(tp.stopLink)}</a></p></footer>
</main></body></html>`;
}
