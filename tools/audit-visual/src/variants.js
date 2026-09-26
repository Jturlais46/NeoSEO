// Visual layouts built from the same tailored data: pick the ones that sell best per channel.
// Each variant returns { html, width, height } (height null = full page).
// ctx = { data, p, pr, today, after, before, afterScore, kpiRows, brand, locale, t, fontBase,
//         beforeSrc, afterSrc, months, extraToday, extraAfter }

import { PANEL_CSS, MOBILE_CSS, panelHTML, phoneHTML } from './panel.js';
import { fontFaces, comparisonHTML } from './templates.js';
import { competitorMedian } from './score.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const BASE_CSS = `
:root{--ink:#14261F;--muted:#5E6E67;--paper:#F6F2EA;--line:#E3DCCF;--brand:#1D6B51;--brand-2:#0F4735;--card:#fff;--bad:#A8472A}
.dark{--ink:#EEF3F0;--muted:#9AABA3;--paper:#0E1512;--line:#26332E;--brand:#4CC095;--brand-2:#8FDDBF;--card:#17221E;--bad:#E48B6C}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,"Noto Sans SC","WenQuanYi Zen Hei",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:Fraunces,Georgia,"Noto Serif SC","WenQuanYi Zen Hei",serif;font-weight:700;letter-spacing:-.01em}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:17px;color:var(--brand-2);white-space:nowrap}
.brand .pin{width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--brand);position:relative}
.brand .pin:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--paper)}
.lbl{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:7px 14px;border-radius:999px;background:#E6E0D4;color:#4A5751}
.dark .lbl{background:#26332E;color:#C9D4CF}
.lbl.after{background:var(--brand);color:#fff}
.dark .lbl.after{color:#0E1512}
.kpis{display:grid;gap:12px}
.k{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px}
.k .l{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.k .v{margin-top:4px;font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.k .v b{color:var(--brand);font-weight:800}.k .v span{color:var(--muted);margin:0 6px}
`;

const brandMark = (ctx) => `<div class="brand"><span class="pin"></span>${esc(ctx.brand.name)}</div>`;
const kpiTiles = (rows) => rows.map(([l, a, b]) => `<div class="k"><div class="l">${esc(l)}</div><div class="v">${esc(a)}<span>→</span><b>${esc(b)}</b></div></div>`).join('');

function page(ctx, { css = '', body, dark = false, script = '' }) {
  return `<!doctype html><html lang="${ctx.locale}"><head><meta charset="utf-8">
<style>${fontFaces(ctx.fontBase)}${BASE_CSS}${PANEL_CSS}${MOBILE_CSS}${css}</style></head>
<body class="${dark ? 'dark' : ''}">${body}${script ? `<script>${script}</script>` : ''}</body></html>`;
}

const phone = (ctx, side) => phoneHTML({
  state: side === 'after' ? ctx.after : ctx.today,
  extra: side === 'after' ? ctx.extraAfter : ctx.extraToday,
  vertical: ctx.p.vertical, locale: ctx.locale,
});

// ---- 1-3: the desktop panel comparisons (full, email card, dark card)
const sideBySide = (ctx) => ({ html: comparisonHTML({ ...ctx, beforeSrc: ctx.beforeSrc, afterSrc: ctx.afterSrc, variant: 'full' }), width: 1200, height: null });
const card = (ctx) => ({ html: comparisonHTML({ ...ctx, variant: 'card' }), width: 1200, height: 630 });
const darkCard = (ctx) => ({ html: comparisonHTML({ ...ctx, variant: 'card', theme: 'dark' }), width: 1200, height: 630 });

// ---- 4: two phones, landscape (email, website, slide)
function phones(ctx) {
  const t = ctx.t;
  const css = `
  .wrap{width:1200px;height:1000px;display:grid;grid-template-columns:420px 1fr;padding:56px 48px}
  .x-left{display:flex;flex-direction:column;gap:18px;padding-top:30px}
  .x-left h1{font-size:44px;line-height:1.08;margin:18px 0 0}
  .x-left .sub{color:var(--muted);font-size:15px}
  .x-left .kpis{grid-template-columns:1fr;margin-top:10px}
  .x-stage{position:relative}
  .x-ph{position:absolute;transform-origin:top left}
  .x-ph.t{left:10px;top:70px;transform:scale(.8) rotate(-4deg);filter:saturate(.8)}
  .x-ph.a{left:330px;top:20px;transform:scale(.92)}
  .x-tag{position:absolute;z-index:3}
  .x-tag.t{left:30px;top:30px}.x-tag.a{left:360px;top:-14px}`;
  const body = `<div class="wrap"><div class="x-left">${brandMark(ctx)}
    <h1 class="serif">${esc(t.headline(ctx.p.business_name))}</h1><div class="sub">${esc(t.subline(ctx.brand.name, ctx.p.city))}</div>
    <div class="kpis">${kpiTiles(ctx.kpiRows.slice(0, 4))}</div></div>
    <div class="x-stage"><span class="x-tag t lbl">${esc(t.today)}</span><div class="x-ph t">${phone(ctx, 'today')}</div>
    <span class="x-tag a lbl after">${esc(t.inDays(ctx.brand.name, ctx.months))}</span><div class="x-ph a">${phone(ctx, 'after')}</div></div></div>`;
  return { html: page(ctx, { css, body }), width: 1200, height: 1000 };
}

// ---- 5: two phones, portrait 4:5 (WhatsApp, Instagram feed)
function phonesPortrait(ctx) {
  const t = ctx.t;
  const css = `
  .wrap{width:1080px;height:1350px;padding:52px 56px;display:flex;flex-direction:column}
  .x-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
  h1{font-size:50px;line-height:1.06;margin:0;max-width:760px}
  .x-cols{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:26px}
  .x-col{display:flex;flex-direction:column;align-items:center;gap:14px}
  .x-ph{width:427px;height:890px}
  .x-ph .phone{transform:scale(1.02);transform-origin:top left}
  .kpis{grid-template-columns:repeat(4,1fr);margin-top:auto}`;
  const body = `<div class="wrap"><div class="x-top"><h1 class="serif">${esc(t.headline(ctx.p.business_name))}</h1>${brandMark(ctx)}</div>
    <div class="x-cols"><div class="x-col"><span class="lbl">${esc(t.today)}</span><div class="x-ph">${phone(ctx, 'today')}</div></div>
    <div class="x-col"><span class="lbl after">${esc(t.inDays(ctx.brand.name, ctx.months))}</span><div class="x-ph">${phone(ctx, 'after')}</div></div></div>
    <div class="kpis">${kpiTiles(ctx.kpiRows.slice(0, 4))}</div></div>`;
  return { html: page(ctx, { css, body }), width: 1080, height: 1350 };
}

// ---- 6: vertical story 9:16 (WhatsApp status, Instagram/Facebook stories)
function story(ctx) {
  const t = ctx.t;
  const [reviews, rating] = ctx.kpiRows;
  const css = `
  .wrap{position:relative;width:1080px;height:1920px;padding:70px 64px;overflow:hidden;background:linear-gradient(180deg,var(--paper) 0%,#EDE5D6 100%)}
  h1{font-size:68px;line-height:1.04;margin:26px 0 0}
  .x-big{position:absolute;left:50%;top:360px;transform:translateX(-50%) scale(1.42);transform-origin:top center}
  .x-small{position:absolute;left:40px;top:1130px;transform:scale(.55) rotate(-7deg);transform-origin:top left;filter:saturate(.75)}
  .x-small-tag{position:absolute;left:70px;top:1100px;z-index:3}
  .x-bottom{position:absolute;left:64px;right:64px;bottom:70px;display:flex;flex-direction:column;gap:18px}
  .x-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .k .v{font-size:40px}
  .x-cta{background:var(--brand);color:#fff;border-radius:999px;padding:26px 30px;text-align:center;font-size:32px;font-weight:800}`;
  const body = `<div class="wrap">${brandMark(ctx)}<h1 class="serif">${esc(t.v.storyTop(ctx.p.business_name))}</h1>
    <div class="x-big">${phone(ctx, 'after')}</div>
    <span class="x-small-tag lbl">${esc(t.today)}</span><div class="x-small">${phone(ctx, 'today')}</div>
    <div class="x-bottom"><div class="x-row kpis">${kpiTiles([reviews, rating])}</div><div class="x-cta">${esc(t.v.storyCta)}</div></div></div>`;
  return { html: page(ctx, { css, body }), width: 1080, height: 1920 };
}

// ---- 7: big numbers (email card, WhatsApp)
function statsHero(ctx) {
  const t = ctx.t;
  const [reviews, ...rest] = ctx.kpiRows;
  const css = `
  .wrap{position:relative;width:1200px;height:630px;padding:44px 48px;overflow:hidden}
  .x-eyebrow{margin-top:26px;font-size:15px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}
  .x-name{font-size:36px;margin-top:6px}
  .x-hero{display:flex;align-items:baseline;gap:22px;margin-top:18px}
  .x-hero .a{font-size:120px;line-height:1;color:var(--muted)}
  .x-hero .arrow{font-size:64px;color:var(--muted)}
  .x-hero .b{font-size:150px;line-height:1;color:var(--brand)}
  .x-cap{font-size:22px;color:var(--muted);margin-top:8px}
  .kpis{grid-template-columns:repeat(3,200px);margin-top:26px}
  .x-ph{position:absolute;right:40px;top:40px;transform:scale(.8) rotate(3deg);transform-origin:top right}`;
  const body = `<div class="wrap">${brandMark(ctx)}
    <div class="x-eyebrow">${esc(t.inDays(ctx.brand.name, ctx.months))}</div>
    <div class="x-name serif">${esc(ctx.p.business_name)}</div>
    <div class="x-hero serif"><span class="a">${esc(reviews[1])}</span><span class="arrow">→</span><span class="b">${esc(reviews[2])}</span></div>
    <div class="x-cap">${esc(t.v.bigReviews)}</div>
    <div class="kpis">${kpiTiles(rest.slice(0, 3))}</div>
    <div class="x-ph">${phone(ctx, 'after')}</div></div>`;
  return { html: page(ctx, { css, body }), width: 1200, height: 630 };
}

// ---- 8: the 90-day profile with callouts on each improvement (audit page, reply to "what do I get?")
function annotated(ctx) {
  const t = ctx.t; const a = t.v.annot;
  const added = ctx.after.review_count - (ctx.today.review_count ?? 0);
  const notes = [
    ['rating', a.reviews(added) + ' · ' + a.rating(t.number(ctx.after.rating))],
    ctx.pr.primary_category && ctx.pr.primary_category !== ctx.p.primary_category ? ['category', a.category(ctx.pr.primary_category)] : null,
    !ctx.today.has_hours ? ['hours', a.hours] : null,
    !ctx.today.has_website && ctx.after.has_website ? ['website', a.website] : null,
    !ctx.today.has_description && ctx.pr.description ? ['description', a.description] : null,
    ['photos', a.photos(ctx.after.photo_count)],
    ['posts', a.posts],
    ['reviews', a.reviews(added)],
    ['replies', a.replies],
  ].filter(Boolean);
  const css = `
  .wrap{position:relative;width:1200px;padding:44px 48px 60px}
  .top{display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:40px;margin:0}
  .stage{position:relative;margin-top:30px;min-height:600px}
  .panel{position:relative;margin:0 auto;width:510px;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(20,38,31,.14);outline:3px solid var(--brand)}
  .panel .gp{zoom:1.25}
  .note{position:absolute;width:270px;background:var(--card);border:1px solid var(--line);border-left:5px solid var(--brand);border-radius:12px;padding:12px 14px;font-weight:700;font-size:17px;line-height:1.3;box-shadow:0 4px 14px rgba(20,38,31,.08)}
  .note.l{left:0}.note.r{right:0}
  svg.lines{position:absolute;inset:0;pointer-events:none;overflow:visible}`;
  const body = `<div class="wrap"><div class="top"><h1 class="serif">${esc(t.v.storyTop(ctx.p.business_name))}</h1>${brandMark(ctx)}</div>
    <div class="stage" id="stage"><div class="panel" id="panel">${panelHTML({ state: ctx.after, extra: ctx.extraAfter, vertical: ctx.p.vertical, locale: ctx.locale })}</div>
    ${notes.map(([anchor, text], i) => `<div class="note ${i % 2 ? 'r' : 'l'}" data-for="${anchor}">${esc(text)}</div>`).join('')}
    <svg class="lines" id="lines"></svg></div></div>`;
  // Place each note beside its anchor, avoid overlaps per side, draw a connector.
  const script = `
  const stage=document.getElementById('stage'),panel=document.getElementById('panel'),lines=document.getElementById('lines');
  const S=stage.getBoundingClientRect(),P=panel.getBoundingClientRect();const lastBottom={l:-1e9,r:-1e9};
  document.querySelectorAll('.note').forEach(n=>{const el=panel.querySelector('[data-anchor="'+n.dataset.for+'"]');if(!el){n.remove();return;}
    const r=el.getBoundingClientRect();const side=n.classList.contains('l')?'l':'r';let y=r.top+r.height/2-S.top-n.offsetHeight/2;
    y=Math.max(y,lastBottom[side]+12);n.style.top=y+'px';lastBottom[side]=y+n.offsetHeight;
    const ny=y+n.offsetHeight/2;const x1=side==='l'?n.offsetLeft+n.offsetWidth:n.offsetLeft;const x2=side==='l'?P.left-S.left+14:P.right-S.left-14;const y2=r.top+r.height/2-S.top;
    lines.insertAdjacentHTML('beforeend','<path d="M'+x1+' '+ny+' C'+(x1+x2)/2+' '+ny+' '+(x1+x2)/2+' '+y2+' '+x2+' '+y2+'" stroke="#1D6B51" stroke-width="2.5" fill="none"/><circle cx="'+x2+'" cy="'+y2+'" r="6" fill="#1D6B51"/>');});
  stage.style.height=Math.max(panel.offsetHeight,lastBottom.l,lastBottom.r)+'px';`;
  return { html: page(ctx, { css, body, script }), width: 1200, height: null };
}

// ---- 9: before/after swipe on one panel (email card, link preview)
function swipe(ctx) {
  const t = ctx.t;
  const [reviews, rating] = ctx.kpiRows;
  const css = `
  .wrap{position:relative;width:1200px;height:630px;display:grid;grid-template-columns:290px 620px 290px;overflow:hidden}
  .x-side{padding:44px 30px;display:flex;flex-direction:column;gap:14px;justify-content:center}
  .x-side.r{text-align:right;align-items:flex-end}
  .x-n{font-size:64px;line-height:1;font-variant-numeric:tabular-nums}
  .x-side.r .x-n{color:var(--brand)}
  .x-c{color:var(--muted);font-size:15px;font-weight:600}
  .x-stage{position:relative;overflow:hidden;background:#fff}
  .x-stage img{position:absolute;left:0;top:0;width:620px}
  .x-stage img.after{clip-path:inset(0 0 0 50%)}
  .x-divider{position:absolute;left:309px;top:0;bottom:0;width:4px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.35)}
  .x-knob{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:54px;height:54px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.3);display:grid;place-items:center;font-size:22px;font-weight:800;color:var(--brand-2)}
  .brandpos{position:absolute;left:30px;top:30px}`;
  const body = `<div class="wrap"><div class="x-side"><span class="lbl">${esc(t.v.swipe[0])}</span>
      <div class="x-n serif">${esc(reviews[1])}</div><div class="x-c">${esc(reviews[0])}</div><div class="x-n serif">${esc(rating[1])}</div><div class="x-c">${esc(rating[0])}</div></div>
    <div class="x-stage"><img src="${esc(ctx.beforeSrc)}" alt=""><img class="after" src="${esc(ctx.afterSrc)}" alt=""><div class="x-divider"><div class="x-knob">‹ ›</div></div></div>
    <div class="x-side r"><span class="lbl after">${esc(t.v.swipe[1])}</span>
      <div class="x-n serif">${esc(reviews[2])}</div><div class="x-c">${esc(reviews[0])}</div><div class="x-n serif">${esc(rating[2])}</div><div class="x-c">${esc(rating[0])}</div>${brandMark(ctx)}</div></div>`;
  return { html: page(ctx, { css, body }), width: 1200, height: 630 };
}

// ---- 10: who shows up in the search, today vs. 90 days (uses real competitors)
const strength = (x) => (x.rating || 0) * Math.log10((x.review_count || 0) + 10);
function localPack(ctx) {
  const t = ctx.t;
  const comps = (ctx.data.competitors || []).slice(0, 3);
  const me = (state) => ({ name: ctx.p.business_name, rating: state.rating, review_count: state.review_count, category: state.primary_category, me: true, photo: state === ctx.after ? ctx.extraAfter.photos?.[0]?.src : ctx.extraToday.photos?.[0]?.src });
  const rankToday = ctx.p.rank_today || comps.length + 4;
  // 90-day side shows the target position: the estimate if it is already top 3, otherwise #3
  // (override with proposal.target_rank). Competitors keep their order around it.
  const others = [...comps].sort((a, b) => strength(b) - strength(a));
  const estimate = [...others, me(ctx.after)].sort((a, b) => strength(b) - strength(a)).findIndex((x) => x.me) + 1;
  const rankAfter = Math.max(1, Math.min(ctx.pr.target_rank || Math.min(estimate, 3), others.length + 1));
  const afterList = [...others.slice(0, rankAfter - 1), me(ctx.after), ...others.slice(rankAfter - 1)];
  const stars = (r) => `<span class="st">${'★'.repeat(Math.round(r))}<i>${'★'.repeat(5 - Math.round(r))}</i></span>`;
  const item = (x, rank, cls = '') => `<div class="it ${cls}"><div class="rk">${esc(t.v.rankLabel(rank))}</div><div class="tx">
      <div class="nm">${esc(x.name)}</div>
      <div class="rt">${x.rating ? `${t.number(x.rating)} ${stars(x.rating)} <span>(${t.int(x.review_count || 0)})</span>` : ''}</div>
      <div class="ct">${esc(x.category || '')}</div></div>
      <div class="th" style="${x.photo ? `background-image:url('${esc(x.photo)}')` : ''}">${x.photo ? '' : esc(x.name[0])}</div></div>`;
  const todayList = comps.map((c, i) => item(c, i + 1)).join('')
    + `<div class="gap">⋯</div>` + item(me(ctx.today), rankToday, 'mine bad') + `<div class="tag bad">${esc(t.v.notInTop)}</div>`;
  const afterHTML = afterList.slice(0, 4).map((x, i) => item(x, i + 1, x.me ? 'mine good' : '')).join('')
    + (rankAfter <= 3 ? `<div class="tag good">${esc(t.v.inTop)}</div>` : '');
  const css = `
  .wrap{width:1200px;padding:40px 48px 48px}
  .top{display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:36px;margin:0}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:22px}
  .list{background:#fff;border-radius:14px;box-shadow:0 12px 32px rgba(20,38,31,.12);overflow:hidden;font-family:Roboto,Arial,"Noto Sans SC",sans-serif;color:#1f1f1f}
  .q{display:flex;align-items:center;gap:10px;margin:14px;padding:12px 18px;border-radius:24px;box-shadow:0 1px 4px rgba(0,0,0,.25);font-size:16px}
  .it{display:grid;grid-template-columns:44px 1fr 88px;gap:12px;align-items:center;padding:14px 18px;border-top:1px solid #e8eaed}
  .rk{font-weight:700;color:#5f6368;font-size:15px}
  .nm{font-size:16px;font-weight:500}
  .rt{font-size:14px;color:#1f1f1f}.rt span{color:#70757a}
  .st{color:#fbbc04;letter-spacing:1px}.st i{color:#dadce0;font-style:normal}
  .ct{font-size:14px;color:#70757a}
  .th{width:88px;height:70px;border-radius:8px;background:#dfe3e1 center/cover;display:grid;place-items:center;color:#5f6368;font-weight:700;font-size:22px}
  .mine.bad{background:#fbeee9}.mine.good{background:#e7f4ed}
  .gap{text-align:center;color:#9aa0a6;padding:2px 0;border-top:1px solid #e8eaed}
  .tag{margin:0 18px 16px;display:inline-block;padding:6px 12px;border-radius:999px;font-weight:700;font-size:13px}
  .tag.bad{background:#f6d9cf;color:#8b2f14}.tag.good{background:#cfeadb;color:#0f4735}`;
  const q = ctx.data.search_query || `${ctx.pr.primary_category || ctx.p.primary_category} near ${ctx.p.city}`;
  const search = `<div class="q"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#5f6368" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>${esc(t.v.searchFor(q))}</div>`;
  const body = `<div class="wrap"><div class="top"><h1 class="serif">${esc(t.headline(ctx.p.business_name))}</h1>${brandMark(ctx)}</div>
    <div class="cols"><div><span class="lbl">${esc(t.today)}</span><div class="list" style="margin-top:12px">${search}${todayList}</div></div>
    <div><span class="lbl after">${esc(t.inDays(ctx.brand.name, ctx.months))}</span><div class="list" style="margin-top:12px">${search}${afterHTML}</div></div></div></div>`;
  return { html: page(ctx, { css, body }), width: 1200, height: null };
}

// ---- 11: review growth chart + new reviews (WhatsApp follow-up, audit page)
function reviewGrowth(ctx) {
  const t = ctx.t;
  const start = ctx.today.review_count ?? 0; const end = ctx.after.review_count;
  const bench = Math.round(competitorMedian(ctx.data.competitors || []) || 0);
  const W = 640; const H = 400; const pad = { l: 46, r: 120, t: 16, b: 36 };
  const weeks = 13;
  // Scale to the prospect's own growth; show the nearby average as a line only if it fits.
  const yMax = Math.max(end * 1.3, bench && bench <= end * 1.6 ? bench * 1.1 : 0);
  const benchOnChart = bench && bench <= yMax;
  const x = (w) => pad.l + (w / weeks) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / yMax) * (H - pad.t - pad.b);
  // First two weeks slower (kit arriving), then a steady pace.
  const pts = Array.from({ length: weeks + 1 }, (_, w) => {
    const f = w <= 2 ? (w / weeks) * 0.5 : ((w - 1) / (weeks - 1));
    return [x(w), y(start + (end - start) * Math.min(1, f))];
  });
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const area = `${line} L${x(weeks)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const rawStep = yMax / 3; const mag = 10 ** Math.floor(Math.log10(rawStep || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((v) => v >= rawStep) || 10 * mag;
  const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.v.growthTitle)}">
    ${ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#E3DCCF"/><text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="#5E6E67">${v}</text>`).join('')}
    ${benchOnChart ? `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(bench)}" y2="${y(bench)}" stroke="#8F8A80" stroke-width="2" stroke-dasharray="6 5"/>
      <text x="${W - pad.r + 8}" y="${y(bench) + 4}" font-size="13" fill="#5E6E67">${esc(t.v.nearby)}: ${bench}</text>` : ''}
    <path d="${area}" fill="#1D6B51" opacity=".08"/>
    <path d="${line}" fill="none" stroke="#1D6B51" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(0)}" cy="${y(start)}" r="5" fill="#A8472A"/><text x="${x(0) + 10}" y="${y(start) - 10}" font-size="13" font-weight="700" fill="#A8472A">${esc(t.v.week(0))}: ${start}</text><circle cx="${x(weeks)}" cy="${y(end)}" r="6" fill="#1D6B51"/>
    <text x="${x(weeks) + 10}" y="${y(end) + 5}" font-size="15" font-weight="800" fill="#0F4735">${esc(t.v.you)}: ${end}</text>
    ${[0, 4, 8, 12].map((w) => `<text x="${x(w)}" y="${H - 12}" text-anchor="middle" font-size="12" fill="#5E6E67">${esc(t.v.week(w))}</text>`).join('')}
  </svg>`;
  const r = ctx.extraAfter.reviews || [];
  const revCard = (rv) => `<div class="rc"><div class="who"><span class="av">${esc(rv.author[0])}</span><div><b>${esc(rv.author)}</b><div class="mt">${esc(rv.meta || '')}</div></div></div>
    <div class="st">${'★'.repeat(rv.rating)}<span class="mt"> ${esc(rv.when || '')}</span></div><div class="tx">${esc(rv.text)}</div></div>`;
  const css = `
  .wrap{width:1200px;height:630px;padding:40px 48px;display:grid;grid-template-columns:660px 1fr;gap:28px}
  h1{font-size:30px;margin:14px 0 4px}
  .legend{display:flex;gap:18px;font-size:13px;color:var(--muted);margin:6px 0 10px}
  .legend i{display:inline-block;width:18px;height:3px;vertical-align:middle;margin-right:6px;background:#1D6B51}
  .legend i.d{background:none;border-top:2px dashed #8F8A80}
  .rcs{display:flex;flex-direction:column;gap:14px;padding-top:40px}
  .rcs h2{font-size:15px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);margin:0}
  .rc{background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 6px 18px rgba(20,38,31,.1);font-family:Roboto,Arial,"Noto Sans SC",sans-serif;color:#1f1f1f;font-size:14px;line-height:20px}
  .who{display:flex;gap:10px;align-items:center}
  .av{width:32px;height:32px;border-radius:50%;background:#1e8e3e;color:#fff;display:grid;place-items:center;font-weight:500}
  .mt{font-size:12px;color:#70757a}
  .st{color:#fbbc04;margin-top:6px;letter-spacing:1px}
  .tx{margin-top:4px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}`;
  const body = `<div class="wrap"><div>${brandMark(ctx)}<h1 class="serif">${esc(t.v.growthTitle)}</h1>
      <div class="legend"><span><i></i>${esc(ctx.p.business_name)}</span>${benchOnChart ? `<span><i class="d"></i>${esc(t.v.nearby)}</span>` : bench ? `<span>${esc(t.v.nearby)}: ${bench}</span>` : ''}</div>${svg}</div>
    <div class="rcs"><h2>${esc(t.v.newReviews)}</h2>${r.slice(0, 2).map(revCard).join('')}</div></div>`;
  return { html: page(ctx, { css, body }), width: 1200, height: 630 };
}

export const VARIANTS = {
  'side-by-side': { fn: sideBySide, use: 'Full comparison: reply to an interested prospect, audit page, postcard' },
  card: { fn: card, use: 'Email card and link preview (1200×630)' },
  'dark-card': { fn: darkCard, use: 'Email card, premium dark look (1200×630)' },
  phones: { fn: phones, use: 'Two phones side by side: website, email, slide (1200×1000)' },
  'phones-portrait': { fn: phonesPortrait, use: 'WhatsApp image or Instagram/Facebook post (1080×1350)' },
  story: { fn: story, use: 'WhatsApp status, Instagram/Facebook story (1080×1920)' },
  'stats-hero': { fn: statsHero, use: 'Big-number card: first WhatsApp image, email (1200×630)' },
  annotated: { fn: annotated, use: 'What changes, called out on the 90-day profile: audit page, "what do I get?" replies' },
  swipe: { fn: swipe, use: 'One profile split today / 90 days: email card, link preview (1200×630)' },
  'local-pack': { fn: localPack, use: 'Who shows up in the search, today vs. 90 days, with real competitors' },
  'review-growth': { fn: reviewGrowth, use: 'Review growth over 90 days + new reviews: follow-up message (1200×630)' },
};
