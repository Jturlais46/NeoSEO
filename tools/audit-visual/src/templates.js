// HTML templates for (1) the 1200x630 before/after card and (2) the per-prospect audit page.
// Deliberately NOT a replica of Google's interface: no Google logos, colors or layout.
// The card is a neutral "profile summary" so it cannot be mistaken for a Google screenshot.

import { STRINGS } from './i18n.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fontFaces(fontBase) {
  const inter = [400, 500, 600, 700, 800].map((w) => `@font-face{font-family:Inter;font-weight:${w};font-display:block;src:url(${fontBase}/inter-latin-${w}-normal.woff2) format('woff2')}`);
  const fraunces = [600, 700].map((w) => `@font-face{font-family:Fraunces;font-weight:${w};font-display:block;src:url(${fontBase}/fraunces-latin-${w}-normal.woff2) format('woff2')}`);
  return [...inter, ...fraunces].join('\n');
}

function stars(rating) {
  if (!rating) return '';
  const full = Math.round(rating);
  return `<span class="stars" aria-label="${rating} out of 5">${'★'.repeat(full)}<span class="off">${'★'.repeat(5 - full)}</span></span>`;
}

function ring(score, tone) {
  const r = 24; const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  return `<svg class="ring ${tone}" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
    <circle cx="30" cy="30" r="${r}" class="track"/>
    <circle cx="30" cy="30" r="${r}" class="bar" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 30 30)"/>
    <text x="30" y="35" text-anchor="middle">${score}</text></svg>`;
}

// Checks that share one fix; the card shows only the biggest loss in each group.
const ROW_GROUP = { reviewVolume: 'reviews', reviewRecency: 'reviews', rating: 'reviews' };

// The rows shown on the card: the biggest point losses today, paired with their fix.
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
    .map((b) => ({
      key: b.key,
      today: b.finding,
      after: typeof t.fixes[b.key] === 'function' ? t.fixes[b.key](proposal) : t.fixes[b.key],
    }));
}

// Keep the title on one line: shrink long names instead of wrapping into the cards.
const titleSize = (text) => (text.length <= 48 ? 33 : text.length <= 58 ? 29 : 25);

const CARD_CSS = `
:root{--ink:#14261F;--muted:#5E6E67;--paper:#F6F2EA;--card:#FFFFFF;--line:#E3DCCF;
  --brand:#1D6B51;--brand-2:#0F4735;--brand-soft:#E2F0E9;--bad:#A8472A;--bad-soft:#F6E3DB;--star:#D9912B}
*{box-sizing:border-box}
html,body{margin:0;width:1200px;height:630px;background:var(--paper);color:var(--ink);
  font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.frame{width:1200px;height:630px;padding:34px 44px 24px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.title{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:var(--title-size,33px);line-height:1.1;letter-spacing:-.01em;max-width:900px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brandmark{display:flex;align-items:center;gap:8px;font-weight:800;font-size:17px;color:var(--brand-2);white-space:nowrap}
.brandmark .pin{width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--brand);position:relative}
.brandmark .pin:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--paper)}
.meta{font-size:14px;color:var(--muted);margin-top:6px}
.cols{flex:1;display:grid;grid-template-columns:1fr 56px 1fr;margin-top:18px;min-height:0}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px 22px 16px;display:flex;flex-direction:column;min-height:0}
.card.after{border:2px solid var(--brand);box-shadow:0 12px 28px rgba(15,71,53,.12)}
.label{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.after .label{color:var(--brand)}
.name{font-size:21px;font-weight:700;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{font-size:14px;color:var(--muted);margin-top:3px;display:flex;gap:8px;align-items:center;white-space:nowrap;overflow:hidden}
.stars{color:var(--star);letter-spacing:1px}.stars .off{color:#DDD5C7}
.photos{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin:12px 0 10px}
.tile{height:40px;border-radius:7px;display:flex;align-items:flex-end;padding:3px 5px;font-size:9.5px;font-weight:700;color:#fff;overflow:hidden;line-height:1.05}
.before .tile{background:#DCD5C8;justify-content:center;align-items:center}
.before .tile svg{opacity:.55}
.before .tile.empty{background:repeating-linear-gradient(45deg,#F3EEE5 0 6px,#EAE3D6 6px 12px)}
.after .tile{background:linear-gradient(140deg,#2E8C69,#0F4735)}
.after .tile:nth-child(2n){background:linear-gradient(140deg,#D9912B,#A45F12)}
.after .tile:nth-child(3n){background:linear-gradient(140deg,#4E7A8C,#23485A)}
ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
li{display:flex;gap:9px;align-items:center;font-size:14.5px;line-height:1.25;height:36px}
li span.t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ic{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:800}
.before .ic{background:var(--bad-soft);color:var(--bad)}
.after .ic{background:var(--brand-soft);color:var(--brand)}
.score{margin-top:auto;display:flex;align-items:center;gap:12px;padding-top:10px;border-top:1px dashed var(--line)}
.score .k{font-size:13px;font-weight:700}.score .n{font-size:12px;color:var(--muted)}
.ring .track{fill:none;stroke:#EFE9DE;stroke-width:6}.ring .bar{fill:none;stroke-width:6;stroke-linecap:round}
.ring.bad .bar{stroke:var(--bad)}.ring.good .bar{stroke:var(--brand)}
.ring text{font:800 17px Inter,sans-serif;fill:var(--ink)}
.arrow{display:grid;place-items:center}
.foot{font-size:11.5px;color:var(--muted);margin-top:12px}
`;

export function cardHTML({ data, before, after, brand, locale = 'en', fontBase }) {
  const t = STRINGS[locale];
  const p = data.prospect; const pr = data.proposal || {};
  const rows = pairedRows(before, pr, locale);
  const n = p.photo_count ?? 0;
  const photoIcon = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z M4 15l5-5 4 4 3-3 4 4" fill="none" stroke="#6F6555" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const beforeTiles = Array.from({ length: 6 }, (_, i) => (i < Math.min(n, 6)
    ? `<div class="tile">${photoIcon}</div>` : '<div class="tile empty"></div>')).join('');
  const shots = (pr.photo_shot_list || []).slice(0, 6);
  const afterTiles = Array.from({ length: 6 }, (_, i) => `<div class="tile">${esc(shots[i] || '')}</div>`).join('');
  const ratingLine = p.rating ? `${stars(p.rating)} ${p.rating.toFixed(1)} · ${t.reviews(p.review_count ?? 0)}` : t.noRating;
  const afterCats = [pr.primary_category, ...(pr.secondary_categories || []).slice(0, 2)].filter(Boolean).join(' · ');

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<style>${fontFaces(fontBase)}${CARD_CSS}</style></head><body>
<div class="frame">
  <div class="top">
    <div style="min-width:0"><div class="title" style="--title-size:${titleSize(t.cardTitle(p.business_name))}px">${esc(t.cardTitle(p.business_name))}</div>
      <div class="meta">${esc(t.preparedFor(p.city, data.audit_date))}</div></div>
    <div class="brandmark"><span class="pin"></span>${esc(brand.name)}</div>
  </div>
  <div class="cols">
    <section class="card before">
      <div class="label">${esc(t.today)}</div>
      <div class="name">${esc(p.business_name)}</div>
      <div class="sub">${ratingLine} · ${esc(p.primary_category || '')}</div>
      <div class="photos">${beforeTiles}</div>
      <ul>${rows.map((r) => `<li><span class="ic">✕</span><span class="t">${esc(r.today)}</span></li>`).join('')}</ul>
      <div class="score">${ring(before.score, 'bad')}<div><div class="k">${esc(t.healthScore)}</div><div class="n">${esc(t.today)}</div></div></div>
    </section>
    <div class="arrow"><svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="#1D6B51" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <section class="card after">
      <div class="label">${esc(t.afterSetup(brand.name))}</div>
      <div class="name">${esc(p.business_name)}</div>
      <div class="sub">${ratingLine} · ${esc(afterCats)}</div>
      <div class="photos">${afterTiles}</div>
      <ul>${rows.map((r) => `<li><span class="ic">✓</span><span class="t">${esc(r.after)}</span></li>`).join('')}</ul>
      <div class="score">${ring(after.score, 'good')}<div><div class="k">${esc(t.healthScore)}</div><div class="n">${esc(t.afterNote)}</div></div></div>
    </section>
  </div>
  <div class="foot">${esc(t.disclaimer)}</div>
</div></body></html>`;
}

// ---------- Audit page ----------

const PAGE_CSS = `
:root{--ink:#14261F;--ink-2:#3C4D46;--muted:#5E6E67;--paper:#F6F2EA;--card:#FFFFFF;--line:#E3DCCF;
  --brand:#1D6B51;--brand-2:#0F4735;--brand-soft:#E2F0E9;--bad:#A8472A;--bad-soft:#F6E3DB;--bar-other:#B9B0A0;--focus:#D9912B}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#EEF3F0;--ink-2:#C9D4CF;--muted:#9AABA3;--paper:#0F1714;--card:#17221E;--line:#2A3833;
  --brand:#4CC095;--brand-2:#8FDDBF;--brand-soft:#173A2E;--bad:#E48B6C;--bad-soft:#3A221A;--bar-other:#5C6862}}
:root[data-theme="dark"]{--ink:#EEF3F0;--ink-2:#C9D4CF;--muted:#9AABA3;--paper:#0F1714;--card:#17221E;--line:#2A3833;
  --brand:#4CC095;--brand-2:#8FDDBF;--brand-soft:#173A2E;--bad:#E48B6C;--bad-soft:#3A221A;--bar-other:#5C6862}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:880px;margin:0 auto;padding:40px 16px 64px}
.eyebrow{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}
h1{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:clamp(30px,5vw,46px);line-height:1.08;letter-spacing:-.015em;margin:10px 0 12px}
h2{font-family:Fraunces,Georgia,serif;font-size:26px;line-height:1.2;margin:0 0 6px}
h3{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:18px 0 6px}
.lede{font-size:18px;color:var(--ink-2);max-width:680px;margin:0}
.ctas{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 8px}
.btn{display:inline-block;padding:14px 22px;border-radius:12px;font-weight:700;text-decoration:none;border:2px solid var(--brand)}
.btn.primary{background:var(--brand);color:#fff}.btn.ghost{color:var(--brand)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .btn.primary{color:#0F1714}}
:root[data-theme="dark"] .btn.primary{color:#0F1714}
.btn:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.note{font-size:14px;color:var(--muted)}
.hero-img{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line);margin:28px 0 8px}
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
.bar-row{display:grid;grid-template-columns:minmax(90px,200px) 1fr 52px;gap:10px;align-items:center;font-size:14px}
.bar-row .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{height:14px}
.bar-fill{height:14px;border-radius:0 4px 4px 0;background:var(--bar-other);min-width:2px}
.bar-row.you .bar-fill{background:var(--brand)}.bar-row.you .nm{font-weight:800}
.bar-row .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2)}
ol.steps{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
ol.steps li b{display:block;margin-bottom:2px}
ol.steps .n{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--brand);color:#fff;font-weight:800;margin-bottom:6px}
ul.plain{margin:0;padding-left:20px}
footer{margin-top:36px;font-size:13px;color:var(--muted)}
footer a{color:var(--muted)}
`;

export function auditPageHTML({ data, before, after, brand, locale = 'en', fontBase, cardSrc }) {
  const t = STRINGS[locale]; const tp = t.page;
  const p = data.prospect; const pr = data.proposal || {};
  const links = data.links || {};
  const label = (key) => t.checkLabels[key] || key;
  const afterByKey = Object.fromEntries(after.breakdown.map((b) => [b.key, b.points]));

  const scoreRows = before.breakdown.map((b) => `<tr><td>${esc(label(b.key))}${b.finding ? `<div class="note gap">${esc(b.finding)}</div>` : ''}</td>
    <td class="num">${b.points} / ${b.weight}</td><td class="num">${afterByKey[b.key]} / ${b.weight}</td></tr>`).join('');

  const comps = [{ name: p.business_name, review_count: p.review_count ?? 0, you: true }, ...(data.competitors || [])]
    .sort((a, b) => b.review_count - a.review_count);
  const maxReviews = Math.max(1, ...comps.map((c) => c.review_count));
  const bars = comps.map((c) => `<div class="bar-row${c.you ? ' you' : ''}" title="${esc(c.name)}: ${c.review_count}">
      <span class="nm">${esc(c.you ? `${tp.you} (${c.name})` : c.name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${((c.review_count / maxReviews) * 100).toFixed(1)}%"></div></div>
      <span class="v">${c.review_count}</span></div>`).join('');

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
  <img class="hero-img" src="${esc(cardSrc)}" width="1200" height="630" alt="${esc(t.cardTitle(p.business_name))}">

  <section><h2>${esc(tp.scoreH)}: ${before.score} → ${after.score}</h2><p>${esc(tp.scoreLede)}</p>
    <table><thead><tr><th>${esc(tp.colCheck)}</th><th class="num">${esc(tp.colToday)}</th><th class="num">${esc(tp.colAfter)}</th></tr></thead>
    <tbody>${scoreRows}</tbody>
    <tfoot><tr><td></td><td class="num">${before.score} / 100</td><td class="num">${after.score} / 100</td></tr></tfoot></table>
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

  <footer><p>${esc(t.disclaimer)}</p><p><a href="${esc(links.optout || '#')}">${esc(tp.stopLink)}</a></p><p>${esc(tp.footer(brand.legal))}</p></footer>
</main></body></html>`;
}
