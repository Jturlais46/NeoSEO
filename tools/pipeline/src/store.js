// File-based lead store: one JSON per business in data/leads/, plus an event timeline.
// Simple to inspect, diff and mirror to a Google Sheet; swap for Postgres/Attio later.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './config.js';

const dir = () => path.join(DATA_DIR, 'leads');
const file = (id) => path.join(dir(), `${id.replace(/[^\w-]/g, '_')}.json`);

export async function getLead(id) {
  try { return JSON.parse(await readFile(file(id), 'utf8')); } catch { return null; }
}

export async function saveLead(lead) {
  await mkdir(dir(), { recursive: true });
  lead.updated_at = new Date().toISOString();
  await writeFile(file(lead.lead_id), JSON.stringify(lead, null, 2));
  return lead;
}

export async function listLeads(filter = () => true) {
  await mkdir(dir(), { recursive: true });
  const files = (await readdir(dir())).filter((f) => f.endsWith('.json'));
  const leads = await Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(dir(), f), 'utf8'))));
  return leads.filter(filter);
}

export function addEvent(lead, type, data = {}) {
  lead.events = [...(lead.events || []), { at: new Date().toISOString(), type, ...data }];
  return lead;
}

// Insert a newly sourced place, or refresh listing data on an existing lead without resetting its stage.
export async function upsertSourced({ place, rank, target, searchPlaces }) {
  const id = place.place_id;
  const existing = await getLead(id);
  if (existing) {
    existing.raw = place; existing.rank_today = rank; existing.search_places = searchPlaces;
    return saveLead(addEvent(existing, 'resourced', { target: target.id }));
  }
  return saveLead(addEvent({
    lead_id: id, place_id: id, business_name: place.name, country: target.market, market: target.market,
    vertical: target.vertical, locale: target.locale, target_id: target.id, search_query: target.query,
    consent_status: target.consent_status || 'none', suppressed: false, stage: 'sourced',
    rank_today: rank, raw: place, search_places: searchPlaces, call_attempts: 0,
    created_at: new Date().toISOString(),
  }, 'sourced', { target: target.id }));
}
