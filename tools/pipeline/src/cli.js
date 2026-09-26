#!/usr/bin/env node
// Warm pipeline bot: the scripted half. Claude Code (the `warm-pipeline` skill) runs these commands
// and writes the tailored proposals itself, on your subscription. No paid data vendor, no API key.
//
//   node src/cli.js source [--target id] [--headed]   find businesses on Google Maps (browser scan)
//   node src/cli.js prepare [--limit N]        facts -> qualify -> queue for a proposal (stage needs_proposal)
//   node src/cli.js queue                      list leads waiting for a proposal (for Claude Code)
//   node src/cli.js set-proposal <lead_id> <file.json>   validate + store a proposal (stage needs_render)
//   node src/cli.js render [--limit N]         visuals 5 and 9 + audit page (stage ready)
//   node src/cli.js callsheet                  rank callable leads into data/callsheets/<date>.csv/.json
//   node src/cli.js call [--send] [--max N]    place Bland calls (dry-run unless --send)
//   node src/cli.js daily                      source (if the ready pool is low) + prepare + render + callsheet
//   node src/cli.js status                     counts per stage
//   node src/cli.js demo                       offline run on fixtures with stub proposals
// Env: TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN (US line type),
//      BLAND_API_KEY, BLAND_PATHWAY_FIRST_CALL, BLAND_FROM_NUMBER, BLAND_VOICE, BLAND_WEBHOOK_URL,
//      FOUNDER_FIRST_NAME, PIPELINE_DATA_DIR

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '../../audit-visual/node_modules/playwright/index.mjs';
import { renderProspect, copyFonts } from '../../audit-visual/src/render.js';
import { ROOT, dataDir, loadConfig, marketOf } from './config.js';
import { toProspect, pickCompetitors } from './normalize.js';
import { qualify } from './qualify.js';
import { checkProposal, finalize, stubProposal } from './propose.js';
import { getLead, listLeads, saveLead, addEvent, upsertSourced } from './store.js';
import { callBlocker, callPayload, placeCall } from './bland.js';
import { lookupLineType } from './linetype.js';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : dflt);
const compact = (p) => ({ place_id: p.place_id, name: p.name, reviews: p.reviews, rating: p.rating, category: p.category, photo: p.photo, business_status: p.business_status });

async function searcher() {
  const { searchPlaces } = await import('./maps-scan.js');
  return (query, o) => searchPlaces(query, { ...o, headless: !flag('headed') });
}

// 1. Source: one search per target; each listing becomes a lead at stage "sourced".
export async function source(config, { targetId, search } = {}) {
  search ??= await searcher();
  let n = 0;
  for (const target of config.targets.filter((t) => !targetId || t.id === targetId)) {
    const places = await search(target.query, { limit: target.limit || 40, language: target.locale, market: target.market });
    const list = places.map(compact);
    for (const [i, place] of places.entries()) {
      if (!place.place_id) continue;
      await upsertSourced({ place, rank: i + 1, target, searchPlaces: list });
      n++;
    }
    console.log(`source ${target.id}: ${places.length} listings for "${target.query}"`);
    if (places.blocked) { config.sourceBlocked = places.blocked; console.log(`source stopped: ${places.blocked}`); break; }
  }
  return n;
}

// 2. Prepare: listing -> facts -> qualify. Qualified leads wait for Claude Code to write the proposal.
export async function prepare(config, { limit = 40, now } = {}) {
  const leads = (await listLeads((l) => l.stage === 'sourced' && !l.suppressed)).slice(0, limit);
  let queued = 0;
  for (const lead of leads) {
    const target = config.targets.find((t) => t.id === lead.target_id) || config.targetDefaults;
    const market = marketOf(config, lead.market);
    const raw = lead.raw;
    const prospect = toProspect(raw, {
      reviews: raw.reviews_data || [], photos: raw.photos_data || [], rank: lead.rank_today,
      locale: lead.locale, countryCode: market.phone_country_code, now: now ? now.getTime() / 1000 : undefined,
    });
    prospect.vertical = lead.vertical;
    const competitors = pickCompetitors(lead.search_places || [], lead.place_id);
    const q = qualify(prospect, competitors, target.rules);
    Object.assign(lead, { prospect, competitors, score: q.score, segment: q.segment, priority: q.priority });
    if (!q.ok) {
      Object.assign(lead, { stage: 'gated_out', gated_reason: q.reason });
      await saveLead(addEvent(lead, 'gated_out', { reason: q.reason, score: q.score }));
      continue;
    }
    if (market.call_line_types && !lead.line_type) lead.line_type = await lookupLineType(prospect.phone);
    lead.stage = 'needs_proposal';
    await saveLead(addEvent(lead, 'qualified', { score: q.score, segment: q.segment }));
    queued++;
  }
  console.log(`prepare: ${leads.length} checked, ${queued} queued for a proposal`);
  return queued;
}

// 3. Queue: what Claude Code needs to write each proposal (facts, competitors, language).
export async function queue() {
  const leads = await listLeads((l) => l.stage === 'needs_proposal');
  const items = leads.sort((a, b) => (b.priority || 0) - (a.priority || 0)).map((l) => ({
    lead_id: l.lead_id, locale: l.locale, vertical: l.vertical, market: l.market, segment: l.segment,
    facts: { ...l.prospect, photos: (l.prospect.photos || []).length },
    competitors: l.competitors,
  }));
  console.log(JSON.stringify(items, null, 2));
  return items;
}

async function photoLibrary(vertical) {
  const dir = path.join(ROOT, 'assets/photo-library', vertical || 'default');
  try {
    return (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => ({ src: path.join(dir, f) }));
  } catch { return []; }
}

// 4. Store a proposal written by Claude Code (validated against PROPOSAL_SCHEMA).
export async function setProposal(leadId, proposal) {
  const lead = await getLead(leadId);
  if (!lead) throw new Error(`No lead ${leadId}`);
  const errs = checkProposal(proposal);
  if (errs.length) throw new Error(`Proposal for ${lead.business_name} is invalid:\n- ${errs.join('\n- ')}`);
  lead.proposal = finalize(proposal, lead.prospect, await photoLibrary(lead.vertical));
  Object.assign(lead, { stage: 'needs_render', needs_review: proposal.confidence === 'low' });
  await saveLead(addEvent(lead, 'proposal_written', { confidence: proposal.confidence }));
  return lead;
}

// 5. Render visuals 5 and 9 (target variants) + audit page for leads with a proposal.
export async function render(config, { limit = 40 } = {}) {
  const leads = (await listLeads((l) => l.stage === 'needs_render')).slice(0, limit);
  if (!leads.length) { console.log('render: nothing to render'); return 0; }
  const brandBase = JSON.parse(await readFile(path.join(ROOT, 'tools/audit-visual/brand.json'), 'utf8'));
  const outDir = path.join(dataDir(), 'audits');
  await copyFonts(outDir);
  const browser = await chromium.launch();
  try {
    for (const lead of leads) {
      const target = config.targets.find((t) => t.id === lead.target_id) || config.targetDefaults;
      const market = marketOf(config, lead.market);
      const data = {
        token: lead.lead_id.replace(/[^\w-]/g, '').slice(0, 40), locale: lead.locale, market: lead.market,
        audit_date: new Date().toLocaleDateString(lead.locale === 'zh' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        projection_months: 3, search_query: lead.search_query, prospect: lead.prospect, competitors: lead.competitors,
        proposal: lead.proposal, links: target.links || {},
      };
      const brand = { ...brandBase, price: market.price_label?.keep || brandBase.price, locale: lead.locale };
      lead.audit = await renderProspect({ browser, data, baseDir: ROOT, outDir, brand, locale: lead.locale, variants: target.variants || ['phones-portrait', 'swipe'] });
      lead.stage = 'ready';
      await saveLead(addEvent(lead, 'ready', { reviews_projected: lead.audit.reviews_projected }));
      console.log(`ready: ${lead.business_name} [${lead.segment}] reviews ${lead.audit.reviews_today}->${lead.audit.reviews_projected}, score ${lead.audit.score_today}->${lead.audit.score_projected}`);
    }
  } finally {
    await browser.close();
  }
  return leads.length;
}

// 6. Call sheet: every ready lead, ranked, with the reason it can't be called right now (if any).
export async function callsheet(config, { now = new Date() } = {}) {
  const leads = await listLeads((l) => ['ready', 'called', 'callback'].includes(l.stage) && !l.suppressed);
  const rows = leads.map((lead) => ({ lead, market: marketOf(config, lead.market) }))
    .map((r) => ({ ...r, blocker: callBlocker(r.lead, r.market, { now }) }))
    .sort((a, b) => (a.blocker ? 1 : 0) - (b.blocker ? 1 : 0) || (b.lead.priority || 0) - (a.lead.priority || 0));
  const day = now.toISOString().slice(0, 10);
  const dir = path.join(dataDir(), 'callsheets');
  await mkdir(dir, { recursive: true });
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const csv = ['market,priority,business,phone,line_type,language,segment,reviews_today,reviews_projected,rating_today,rating_projected,attempts,status,visual_5,visual_9']
    .concat(rows.map(({ lead, blocker }) => [lead.market, lead.priority, esc(lead.business_name), lead.prospect?.phone, lead.line_type || '', lead.locale,
      lead.segment, lead.audit?.reviews_today, lead.audit?.reviews_projected, lead.audit?.rating_today, lead.audit?.rating_projected,
      lead.call_attempts || 0, blocker || 'callable',
      lead.audit ? esc(path.relative(ROOT, path.join(lead.audit.dir, 'v-phones-portrait.png'))) : '',
      lead.audit ? esc(path.relative(ROOT, path.join(lead.audit.dir, 'v-swipe.png'))) : ''].join(',')));
  await writeFile(path.join(dir, `${day}.csv`), csv.join('\n'));
  await writeFile(path.join(dir, `${day}.json`), JSON.stringify(rows.map(({ lead, blocker, market }) => ({
    lead_id: lead.lead_id, business_name: lead.business_name, market: lead.market, blocker,
    payload: blocker ? null : callPayload(lead, lead.audit, market),
  })), null, 2));
  console.log(`callsheet ${day}: ${rows.filter((r) => !r.blocker).length} callable of ${rows.length} (${path.relative(ROOT, path.join(dir, `${day}.csv`))})`);
  return rows;
}

// 7. Calls (dry-run unless --send).
export async function call(config, { send = false, max = 50, now = new Date() } = {}) {
  const rows = (await callsheet(config, { now })).filter((r) => !r.blocker).slice(0, max);
  for (const { lead, market } of rows) {
    const payload = callPayload(lead, lead.audit, market);
    if (!send) { console.log(`[dry-run] ${lead.market} ${lead.business_name} ${payload.phone_number} (${payload.language})`); continue; }
    try {
      const res = await placeCall(payload);
      Object.assign(lead, { stage: 'called', call_attempts: (lead.call_attempts || 0) + 1, last_call_at: new Date().toISOString(), last_call_id: res.call_id });
      await saveLead(addEvent(lead, 'call_placed', { call_id: res.call_id, flow: 'first_call' }));
      console.log(`called ${lead.business_name}: ${res.call_id}`);
    } catch (err) {
      await saveLead(addEvent(lead, 'call_failed', { error: err.message }));
      console.error(`call ${lead.business_name}: ${err.message}`);
    }
  }
  return rows.length;
}

export async function status() {
  const leads = await listLeads();
  const by = {};
  for (const l of leads) {
    by[l.market] ??= {};
    by[l.market][l.stage] = (by[l.market][l.stage] || 0) + 1;
  }
  console.log(JSON.stringify(by, null, 2));
  return by;
}

// Scripted part of a daily run. Proposals in between are written by Claude Code (see the skill).
export async function daily(config, deps = {}) {
  for (const target of config.targets) {
    if (config.sourceBlocked) break;
    const warm = (await listLeads((l) => l.target_id === target.id && ['needs_proposal', 'needs_render', 'ready'].includes(l.stage))).length;
    if (warm < (target.ready_buffer ?? 150)) await source(config, { targetId: target.id, search: deps.search });
  }
  await prepare(config, { limit: config.targetDefaults.per_run_limit || 40, now: deps.now });
  if (deps.propose) {
    for (const item of await listLeads((l) => l.stage === 'needs_proposal')) await setProposal(item.lead_id, deps.propose(item.prospect, item.competitors));
  }
  await render(config);
  return callsheet(config, { now: deps.now });
}

// Offline end-to-end run on fixtures: no network, stub proposals, dry-run calls.
async function demo() {
  process.env.PIPELINE_DATA_DIR ||= path.join(ROOT, 'data/demo');
  const fx = JSON.parse(await readFile(path.join(ROOT, 'tools/pipeline/fixtures/maps-search.json'), 'utf8'));
  const config = await loadConfig();
  config.targets = fx.searches.map((s) => ({ ...config.targetDefaults, ...s }));
  const now = new Date(fx.now);
  await daily(config, { search: async (q) => fx.searches.find((s) => s.query === q).places, propose: stubProposal, now });
  await call(config, { now });
  await status();
}

async function main() {
  const [cmd, a1, a2] = args;
  if (cmd === 'demo') return demo();
  const config = await loadConfig();
  if (cmd === 'source') return source(config, { targetId: opt('target') });
  if (cmd === 'prepare') return prepare(config, { limit: Number(opt('limit', 40)) });
  if (cmd === 'queue') return queue();
  if (cmd === 'set-proposal') return setProposal(a1, JSON.parse(await readFile(a2, 'utf8'))).then((l) => console.log(`stored proposal: ${l.business_name}`));
  if (cmd === 'render') return render(config, { limit: Number(opt('limit', 40)) });
  if (cmd === 'callsheet') return callsheet(config);
  if (cmd === 'call') return call(config, { send: flag('send'), max: Number(opt('max', 50)) });
  if (cmd === 'daily') return daily(config);
  if (cmd === 'status') return status();
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('\n').slice(1, 17).join('\n'));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
