// High-fidelity recreation of the Google Maps place panel (desktop, 408px wide), rendered
// from listing data. Used for the "in 90 days" side, and for "today" when no real
// screenshot is available (see capture.js).

import { STRINGS } from './i18n.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Material icon paths (Apache 2.0).
const ICON = {
  directions: 'M21.71 11.29l-9-9a.996.996 0 0 0-1.41 0l-9 9a.996.996 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z',
  save: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z',
  nearby: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  phoneSend: 'M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 0 0 3 12a2.99 2.99 0 0 0 5.04 2.19l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  store: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z',
  photo: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
};
const svg = (name, size = 24, color = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path fill="${color}" d="${ICON[name]}"/></svg>`;

function stars(rating, size = 13) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (color) => Array.from({ length: 5 }, () => svg('star', size, color)).join('');
  return `<span class="stars" style="--w:${size * 5}px"><span class="off">${row('#dadce0')}</span><span class="on" style="width:${pct}%">${row('#fbbc04')}</span></span>`;
}

const AVATAR_COLORS = ['#1e8e3e', '#d93025', '#1a73e8', '#e37400', '#9334e6', '#007b83', '#c5221f', '#185abc'];
const avatar = (name) => {
  const c = AVATAR_COLORS[[...String(name)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return `<span class="av" style="background:${c}">${esc(String(name).trim()[0] || '?')}</span>`;
};

export const PANEL_CSS = `
.gp{width:408px;background:#fff;color:#1f1f1f;font:14px/20px Roboto,Arial,sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}
.gp .hero{position:relative;height:236px;background:#e8eaed center/cover no-repeat}
.gp .hero.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#5f6368;font-size:14px}
.gp .hero .chip{position:absolute;left:12px;bottom:12px;display:flex;align-items:center;gap:6px;background:#fff;border-radius:16px;padding:5px 12px 5px 8px;font-weight:500;font-size:13px;color:#1f1f1f;box-shadow:0 1px 3px rgba(60,64,67,.3)}
.gp .head{padding:18px 24px 10px}
.gp h1{font:400 22px/28px "Google Sans",Roboto,Arial,sans-serif;margin:0 0 4px}
.gp .rate{display:flex;align-items:center;gap:4px;color:#1f1f1f}
.gp .rate .cnt{color:#70757a}
.gp .muted{color:#70757a}
.gp .cat{color:#1a73e8;margin-top:2px}
.gp .stars{position:relative;display:inline-block;width:var(--w);height:14px;vertical-align:-2px}
.gp .stars>span{position:absolute;left:0;top:0;white-space:nowrap;overflow:hidden;display:flex}
.gp .stars svg{flex:none}
.gp .tabs{display:flex;border-bottom:1px solid #e8eaed;padding:0 12px}
.gp .tab{flex:1;text-align:center;padding:14px 0 12px;font-weight:500;color:#444746;border-bottom:3px solid transparent}
.gp .tab.on{color:#0b57d0;border-color:#0b57d0}
.gp .acts{display:flex;justify-content:space-around;padding:16px 8px 14px;border-bottom:1px solid #e8eaed}
.gp .act{width:72px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;line-height:16px;text-align:center;color:#1f1f1f}
.gp .act i{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;border:1px solid #c4c7c5;color:#0b57d0}
.gp .act.primary i{background:#0b57d0;border-color:#0b57d0;color:#fff}
.gp .rows{padding:6px 0;border-bottom:1px solid #e8eaed}
.gp .row{display:flex;gap:22px;align-items:flex-start;padding:10px 24px;color:#1f1f1f}
.gp .row svg{flex:none;color:#0b57d0}
.gp .open{color:#188038}
.gp .closed{color:#d93025}
.gp .desc{padding:14px 24px;border-bottom:1px solid #e8eaed;color:#1f1f1f}
.gp .sec{padding:16px 24px;border-bottom:1px solid #e8eaed}
.gp .sec h2{font:500 16px/24px "Google Sans",Roboto,Arial,sans-serif;margin:0 0 12px}
.gp .strip{display:flex;gap:8px;overflow:hidden}
.gp .ph{flex:none;width:112px;height:112px;border-radius:8px;background:#e8eaed center/cover no-repeat;position:relative}
.gp .ph span{position:absolute;left:8px;bottom:6px;color:#fff;font-weight:500;font-size:13px;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.gp .post{flex:none;width:250px;border:1px solid #dadce0;border-radius:8px;overflow:hidden}
.gp .post .img{height:120px;background:#e8eaed center/cover no-repeat}
.gp .post .txt{padding:10px 12px 12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gp .post .when{padding:0 12px 10px;color:#70757a;font-size:12px}
.gp .sum{display:flex;gap:18px;align-items:center}
.gp .bars{flex:1;display:flex;flex-direction:column;gap:5px}
.gp .bar{display:flex;align-items:center;gap:8px;font-size:12px;color:#70757a}
.gp .bar b{flex:1;height:8px;border-radius:4px;background:#e8eaed;position:relative;overflow:hidden}
.gp .bar b i{position:absolute;inset:0 auto 0 0;background:#fbbc04;border-radius:4px}
.gp .big{text-align:center;min-width:110px}
.gp .big .n{font:400 56px/60px "Google Sans",Roboto,Arial,sans-serif}
.gp .big .c{color:#1a73e8;margin-top:4px}
.gp .rev{padding:14px 24px 16px;border-bottom:1px solid #e8eaed}
.gp .who{display:flex;gap:12px;align-items:center}
.gp .av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:500;font-size:16px}
.gp .who .nm{font-weight:500}
.gp .who .mt{font-size:12px;line-height:16px;color:#70757a}
.gp .when{color:#70757a;font-size:12px;margin-left:8px}
.gp .rtxt{margin-top:8px}
.gp .resp{margin-top:10px;padding:10px 12px;background:#f1f3f4;border-radius:8px}
.gp .resp b{font-weight:500}
.gp .more{padding:14px 24px;color:#0b57d0;font-weight:500}
`;

// state: the profile to show (today, or projected). extra: photos, posts and reviews for that side.
export function panelHTML({ state, extra = {}, vertical, locale = 'en' }) {
  const t = STRINGS[locale]; const p = t.panel;
  const photos = extra.photos || [];
  const hero = photos[0];
  const rating = state.rating ?? 0;
  const count = state.review_count ?? 0;
  const cats = [state.primary_category].filter(Boolean);

  const heroHTML = hero
    ? `<div class="hero" style="background-image:url('${esc(hero.src)}')"><span class="chip">${svg('photo', 18, '#1f1f1f')}${esc(p.seePhotos)}</span></div>`
    : `<div class="hero empty">${svg('photo', 40, '#9aa0a6')}<span>${esc(p.noPhotos)}</span></div>`;

  const rateHTML = count
    ? `<div class="rate">${t.number(rating)} ${stars(rating)} <span class="cnt">(${t.int(count)})</span>${state.price_level ? ` <span class="muted">· ${esc(state.price_level)}</span>` : ''}</div>`
    : '';

  const tabs = p.tabs(vertical).map((x, i) => `<div class="tab${i === 0 ? ' on' : ''}">${esc(x)}</div>`).join('');
  const acts = p.actions.map((a, i) => {
    const icons = ['directions', 'save', 'nearby', 'phoneSend', 'share'];
    return `<div class="act${i === 0 ? ' primary' : ''}"><i>${svg(icons[i], 20)}</i>${esc(a)}</div>`;
  }).join('');

  const rows = [];
  if (state.address) rows.push(['place', esc(state.address)]);
  if (state.has_hours && state.hours_today) {
    const cls = state.open_now === false ? 'closed' : 'open';
    const word = state.open_now === false ? p.closed : p.open;
    rows.push(['clock', `<span class="${cls}">${esc(word)}</span> · ${esc(state.hours_today)}`]);
  }
  if (state.has_website && state.website) rows.push(['globe', esc(String(state.website).replace(/^https?:\/\//, '').replace(/\/$/, ''))]);
  if (state.phone_display) rows.push(['phone', esc(state.phone_display)]);
  if (!state.is_claimed) rows.push(['store', esc(p.claim)]);

  const desc = extra.description ? `<div class="desc">${esc(extra.description)}</div>` : '';

  const gallery = photos.length > 1
    ? `<div class="sec"><div class="strip">${photos.slice(1, 4).map((ph) => `<div class="ph" style="background-image:url('${esc(ph.src)}')"><span>${esc(ph.label || '')}</span></div>`).join('')}</div></div>`
    : '';

  const posts = (extra.posts || []).length
    ? `<div class="sec"><h2>${esc(p.fromOwner)}</h2><div class="strip">${extra.posts.slice(0, 2).map((po) => `<div class="post"><div class="img" style="background-image:url('${esc(po.photo || hero?.src || '')}')"></div><div class="txt">${esc(po.text)}</div><div class="when">${esc(po.when || '')}</div></div>`).join('')}</div></div>`
    : '';

  const dist = state.rating_distribution || {};
  const maxBar = Math.max(1, ...[5, 4, 3, 2, 1].map((s) => dist[s] || 0));
  const summary = count
    ? `<div class="sec"><h2>${esc(p.reviewSummary)}</h2><div class="sum"><div class="bars">${[5, 4, 3, 2, 1].map((s) => `<div class="bar">${s}<b><i style="width:${(((dist[s] || 0) / maxBar) * 100).toFixed(1)}%"></i></b></div>`).join('')}</div>
      <div class="big"><div class="n">${t.number(rating)}</div>${stars(rating, 14)}<div class="c">${esc(p.reviewsCount(count))}</div></div></div></div>`
    : '';

  const reviews = (extra.reviews || []).slice(0, 2).map((r) => `<div class="rev">
      <div class="who">${avatar(r.author)}<div><div class="nm">${esc(r.author)}</div><div class="mt">${esc(r.meta || '')}</div></div></div>
      <div style="margin-top:8px">${stars(r.rating, 12)}<span class="when">${esc(r.when || '')}</span></div>
      <div class="rtxt">${esc(r.text)}</div>
      ${r.owner_reply ? `<div class="resp"><b>${esc(p.ownerResponse)}</b> <span class="when">${esc(r.owner_reply_when || '')}</span><div>${esc(r.owner_reply)}</div></div>` : ''}
    </div>`).join('');
  const more = count > 2 ? `<div class="more">${esc(p.moreReviews(count))}</div>` : '';

  return `<div class="gp">${heroHTML}
    <div class="head"><h1>${esc(state.business_name)}</h1>${rateHTML}<div class="cat">${esc(cats.join(' · '))}</div></div>
    <div class="tabs">${tabs}</div>
    <div class="acts">${acts}</div>
    <div class="rows">${rows.map(([ic, html]) => `<div class="row">${svg(ic, 24)}<div>${html}</div></div>`).join('')}</div>
    ${desc}${gallery}${posts}${summary}${reviews}${more}
  </div>`;
}
