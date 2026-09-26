// Builds the Bland call for a prepared lead and places it (or prints it in dry-run).
// Payload shape follows outreach/voice/call-request.example.json and Bland's POST /v1/calls docs.

import { withinCallingWindow } from './window.js';

const ALLOWED = new Set(['prior_approval', 'inbound', 'client']);
const HOURS = 3600 * 1000;

export function requestData(lead, audit, market) {
  const f = audit.top_findings || [];
  const c = lead.competitors?.[0];
  return {
    first_name: lead.first_name || '',
    business_name: lead.business_name,
    service: lead.proposal?.primary_category || lead.prospect?.primary_category || '',
    reviews_today: audit.reviews_today,
    reviews_projected: audit.reviews_projected,
    rating_today: audit.rating_today != null ? String(audit.rating_today) : '',
    rating_projected: String(audit.rating_projected),
    photos_projected: audit.photos_projected,
    competitor_1: c?.name || '',
    competitor_1_reviews: c?.review_count ?? '',
    finding_1: f[0] || '', finding_2: f[1] || '', finding_3: f[2] || '',
    price_keep: market.price_label?.keep || '',
    price_grow: market.price_label?.grow || '',
    price_setup: market.price_label?.setup || '',
    founder_first_name: process.env.FOUNDER_FIRST_NAME || '',
    disclose_ai_in_opener: Boolean(market.disclose_ai_in_opener),
  };
}

// Why a call cannot go out right now (null = OK to call).
export function callBlocker(lead, market, { now = new Date() } = {}) {
  if (lead.suppressed) return 'do_not_contact';
  if (!ALLOWED.has(lead.consent_status)) return 'no_call_approval';
  if (!lead.prospect?.phone) return 'no_phone';
  if (market.call_line_types && !market.call_line_types.includes(lead.line_type || 'unknown')) return `line_type_${lead.line_type || 'unknown'}`;
  if ((lead.call_attempts || 0) >= (market.max_call_attempts_per_lead ?? 3)) return 'max_attempts';
  if (lead.last_call_at && now - new Date(lead.last_call_at) < (market.min_hours_between_calls ?? 48) * HOURS) return 'too_soon';
  if (!withinCallingWindow({ ...market, timezone: lead.prospect.time_zone || market.timezone }, { date: now, state: lead.state })) return 'outside_calling_hours';
  return null;
}

export function callPayload(lead, audit, market, flow = 'first_call') {
  const env = process.env;
  const pathway = env[`BLAND_PATHWAY_${flow.toUpperCase()}`];
  return {
    phone_number: lead.prospect.phone,
    ...(env.BLAND_FROM_NUMBER ? { from: env.BLAND_FROM_NUMBER } : {}),
    ...(pathway ? { pathway_id: pathway } : { task: `Run the ${flow} flow from outreach/voice/call-flows.md.` }),
    ...(env.BLAND_VOICE ? { voice: env.BLAND_VOICE } : {}),
    wait_for_greeting: true,
    record: true,
    max_duration: 12,
    language: ({ en: 'en', ms: 'ms', zh: 'zh', fr: 'fr' })[lead.locale] || market.bland_language || 'en',
    timezone: lead.prospect.time_zone || market.timezone,
    voicemail: { action: 'leave_message', message: voicemail(lead, audit) },
    request_data: requestData(lead, audit, market),
    metadata: { lead_id: lead.lead_id, flow, attempt: (lead.call_attempts || 0) + 1, consent_status: lead.consent_status },
    ...(env.BLAND_WEBHOOK_URL ? { webhook: env.BLAND_WEBHOOK_URL } : {}),
  };
}

const VOICEMAIL = {
  en: (n, r) => `Hi, it's Kit from Mapkeeper. I put together what ${n}'s Google profile could look like in 90 days: around ${r} reviews and a full profile. I'll send it over. Call me back on this number anytime.`,
  ms: (n, r) => `Hai, ini Kit dari Mapkeeper. Saya dah sediakan rupa profil Google ${n} dalam 90 hari: kira-kira ${r} ulasan dan profil yang lengkap. Saya akan hantar kepada anda. Telefon semula nombor ini bila-bila masa.`,
  zh: (n, r) => `您好，我是 Mapkeeper 的 Kit。我为${n}准备了 90 天后的 Google 商家资料：大约 ${r} 条评价和完整的资料。我会发给您，欢迎随时回电这个号码。`,
};
function voicemail(lead, audit) {
  return (VOICEMAIL[lead.locale] || VOICEMAIL.en)(lead.business_name, audit.reviews_projected);
}

export async function placeCall(payload, { apiKey = process.env.BLAND_API_KEY } = {}) {
  if (!apiKey) throw new Error('BLAND_API_KEY is not set');
  const res = await fetch('https://api.bland.ai/v1/calls', {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Bland HTTP ${res.status}: ${JSON.stringify(body)}`);
  return body; // { status, call_id, ... }
}
