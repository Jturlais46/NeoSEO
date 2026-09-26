// Raw place record from the Google Maps scan (+ reviews, photos) -> the `prospect` facts audit-visual renders.
// Only facts from the listing; nothing here is estimated.

const DAY = 86400;
// Parent categories too broad to rank for anything specific.
const GENERIC = new Set(['restaurant', 'store', 'shop', 'cafe', 'food', 'contractor', 'service', 'business', 'company',
  'point of interest', 'establishment', 'restoran', 'kedai', '餐馆', '商店']);

const CLOSES = {
  en: (t) => `Closes ${t}`,
  ms: (t) => `Tutup pada ${t.replace('AM', 'PG').replace('PM', 'PTG')}`,
  zh: (t) => `${t}打烊`,
  fr: (t) => `Ferme à ${t}`,
};
const REVIEWS_META = {
  en: (n) => `${n} review${n === 1 ? '' : 's'}`,
  ms: (n) => `${n} ulasan`,
  zh: (n) => `${n} 条评价`,
  fr: (n) => `${n} avis`,
};
const AGO = {
  en: (n, u) => `${n} ${u}${n === 1 ? '' : 's'} ago`,
  ms: (n, u) => `${n} ${{ day: 'hari', week: 'minggu', month: 'bulan', year: 'tahun' }[u]} lalu`,
  zh: (n, u) => `${n} ${{ day: '天', week: '周', month: '个月', year: '年' }[u]}前`,
  fr: (n, u) => `il y a ${n} ${{ day: 'jour', week: 'semaine', month: 'mois', year: 'an' }[u]}${n > 1 && u !== 'month' ? 's' : ''}`,
};

export function relativeTime(tsSeconds, nowSeconds, locale = 'en') {
  const d = Math.max(0, (nowSeconds - tsSeconds) / DAY);
  const f = AGO[locale] || AGO.en;
  if (d < 7) return f(Math.max(1, Math.round(d)), 'day');
  if (d < 30) return f(Math.round(d / 7), 'week');
  if (d < 365) return f(Math.round(d / 30), 'month');
  return f(Math.round(d / 365), 'year');
}

// "Margaret Tan Siew Lin" -> "Margaret T."
export const shortName = (name = '') => {
  const parts = String(name).trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0] || 'Google user';
};

// "+60 3-7800 0012" -> { e164: "+60378000012", display: "03-7800 0012" }
export function phoneFormats(raw, countryCode = '60') {
  if (!raw) return { e164: null, display: null };
  const digits = String(raw).replace(/[^\d+]/g, '');
  const e164 = digits.startsWith('+') ? digits : `+${countryCode}${digits.replace(/^0/, '')}`;
  const display = String(raw).startsWith(`+${countryCode} `) ? `0${String(raw).slice(countryCode.length + 2)}` : String(raw);
  return { e164, display };
}

// reviews_per_score is an object {"1":n,...} in current responses, a "1: 6, 2: 0" string in older ones.
export function parseDistribution(v) {
  if (!v) return null;
  if (typeof v === 'string') {
    return Object.fromEntries(v.split(',').map((x) => x.split(':').map((y) => y.trim())).map(([k, n]) => [Number(k), Number(n)]));
  }
  return Object.fromEntries(Object.entries(v).map(([k, n]) => [Number(k), Number(n)]));
}

// working_hours: {"Monday": "7 AM-3 PM"} (times may contain U+202F). -> "Closes 3 PM" for the given weekday.
export function closingText(workingHours, weekday, locale = 'en') {
  if (!workingHours || typeof workingHours !== 'object') return null;
  const today = workingHours[weekday] || Object.values(workingHours)[0];
  if (!today || /closed/i.test(today)) return null;
  const last = String(today).replace(/ /g, ' ').split(',').pop().split(/[-–]/).pop().trim();
  if (/24 hours/i.test(today)) return null;
  return (CLOSES[locale] || CLOSES.en)(last);
}

const isGeneric = (cat) => !cat || GENERIC.has(String(cat).trim().toLowerCase());

export function toProspect(place, { reviews = [], photos = [], rank, locale = 'en', countryCode = '60', now = Date.now() / 1000, weekday } = {}) {
  const primary = place.category || place.type || null;
  const subtypes = String(place.subtypes || '').split(',').map((s) => s.trim()).filter((s) => s && s !== primary);
  const nowS = Math.floor(now);
  const recent = reviews.filter((r) => r.review_timestamp && nowS - r.review_timestamp <= 90 * DAY);
  const withText = reviews.filter((r) => r.review_text);
  const answered = reviews.filter((r) => r.owner_answer).length;
  const phone = phoneFormats(place.phone, countryCode);
  const day = weekday || new Date(now * 1000).toLocaleDateString('en-US', { weekday: 'long', timeZone: place.time_zone || 'Asia/Kuala_Lumpur' });
  const hoursToday = closingText(place.working_hours, day, locale);
  const photoList = photos.length
    ? photos.map((p) => ({ src: p.photo_url_big || p.photo_url || p.original_photo_url })).filter((p) => p.src)
    : place.photo ? [{ src: place.photo }] : [];

  return {
    place_id: place.place_id,
    business_name: place.name,
    city: place.city || null,
    address: place.full_address ? String(place.full_address).replace(/,\s*(Malaysia|France|USA|United States)$/i, '') : null,
    phone: phone.e164,
    phone_display: phone.display,
    website: place.site || null,
    price_level: place.range || null,
    primary_category: primary,
    primary_category_specific: !isGeneric(primary),
    secondary_categories: subtypes,
    rating: place.rating ?? null,
    review_count: place.reviews ?? 0,
    rating_distribution: parseDistribution(place.reviews_per_score),
    reviews_last_90d: recent.length,
    owner_reply_rate: reviews.length ? answered / reviews.length : 0,
    photo_count: place.photos_count ?? photoList.length,
    has_description: Boolean(place.description),
    description: place.description || null,
    has_hours: Boolean(place.working_hours && Object.keys(place.working_hours).length),
    hours_today: hoursToday,
    open_now: true,
    has_website: Boolean(place.site),
    has_services_or_menu: Boolean(place.menu_link || place.order_links),
    last_update_days_ago: null, // posts aren't read by the scan; treat as no recent updates.
    is_claimed: place.verified !== false,
    permanently_closed: place.business_status && place.business_status !== 'OPERATIONAL',
    rank_today: rank ?? null,
    state: place.state || null,
    time_zone: place.time_zone || null,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    photos: photoList.slice(0, 6),
    recent_reviews: withText.slice(0, 2).map((r) => ({
      author: shortName(r.author_title),
      meta: REVIEWS_META[locale] ? REVIEWS_META[locale](r.author_reviews_count ?? 1) : '',
      rating: r.review_rating,
      when: r.review_timestamp ? relativeTime(r.review_timestamp, nowS, locale) : '',
      text: r.review_text,
      owner_reply: r.owner_answer || null,
    })),
    review_texts: withText.slice(0, 12).map((r) => ({ rating: r.review_rating, text: r.review_text, answered: Boolean(r.owner_answer) })),
  };
}

// The 3 businesses Google shows above this one for the same search (or the top 3 if it is already there).
export function pickCompetitors(places, placeId) {
  const idx = places.findIndex((p) => p.place_id === placeId);
  const others = places.filter((p) => p.place_id !== placeId && (!p.business_status || p.business_status === 'OPERATIONAL'));
  const above = idx > 0 ? places.slice(0, idx).filter((p) => p.place_id !== placeId) : [];
  const chosen = (above.length >= 3 ? above.slice(0, 3) : others.slice(0, 3));
  return chosen.map((p) => ({ name: p.name, review_count: p.reviews ?? 0, rating: p.rating ?? null, category: p.category || p.type || null, photo: p.photo || null }));
}
