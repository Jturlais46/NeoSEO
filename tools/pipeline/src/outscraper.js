// Minimal Outscraper client. Endpoints and fields follow Outscraper's OpenAPI spec and SDK
// source (checked 2026-09-26): /maps/search-v3, /maps/reviews-v3, /maps/photos-v3,
// header X-API-KEY, results nested per query (data[query][place]).

const BASE = process.env.OUTSCRAPER_BASE_URL || 'https://api.app.outscraper.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(endpoint, params, { apiKey = process.env.OUTSCRAPER_API_KEY, pollMs = 4000, maxWaitMs = 180000 } = {}) {
  if (!apiKey) throw new Error('OUTSCRAPER_API_KEY is not set');
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    for (const item of [].concat(v)) qs.append(k, String(item));
  }
  const res = await fetch(`${BASE}${endpoint}?${qs}`, { headers: { 'X-API-KEY': apiKey } });
  if (!res.ok && res.status !== 202) throw new Error(`Outscraper ${endpoint} HTTP ${res.status}: ${await res.text()}`);
  let body = await res.json();
  if (body.error) throw new Error(`Outscraper ${endpoint}: ${body.errorMessage}`);
  // Async requests return a results_location to poll until status leaves "Pending".
  const started = Date.now();
  while (body.status === 'Pending' && body.results_location) {
    if (Date.now() - started > maxWaitMs) throw new Error(`Outscraper ${endpoint}: timed out waiting for ${body.id}`);
    await sleep(pollMs);
    const r = await fetch(body.results_location, { headers: { 'X-API-KEY': apiKey } });
    body = await r.json();
  }
  if (body.status && body.status !== 'Success') throw new Error(`Outscraper ${endpoint}: status ${body.status}`);
  return body.data;
}

// One query -> list of places in Google's order (index = rank for that search).
export async function searchPlaces(query, { limit = 40, language = 'en', region } = {}) {
  const data = await call('/maps/search-v3', { query, limit, language, region, async: false });
  return (Array.isArray(data?.[0]) ? data[0] : data) || [];
}

// Newest reviews for each place id -> { [place_id]: reviews_data[] }
export async function fetchReviews(placeIds, { limit = 20, language = 'en' } = {}) {
  const data = await call('/maps/reviews-v3', { query: placeIds, reviewsLimit: limit, sort: 'newest', language, async: false });
  const places = (data || []).flat();
  return Object.fromEntries(places.map((p) => [p.place_id, p.reviews_data || []]));
}

// Photos for each place id -> { [place_id]: photos_data[] }. tag: all | latest | menu | by_owner
export async function fetchPhotos(placeIds, { limit = 12, tag = 'all', language = 'en' } = {}) {
  const data = await call('/maps/photos-v3', { query: placeIds, photosLimit: limit, tag, language, async: false });
  const places = (data || []).flat();
  return Object.fromEntries(places.map((p) => [p.place_id, p.photos_data || []]));
}
