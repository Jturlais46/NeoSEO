// Optional: landline / mobile lookup for phone numbers (Twilio Lookup v2, Line Type Intelligence,
// about $0.008 per number). Used where config/markets.yaml sets call_line_types (US).
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN. Without them every number stays "unknown".

const MAP = { landline: 'landline', mobile: 'mobile', fixedVoip: 'landline', nonFixedVoip: 'mobile', tollFree: 'landline' };

export async function lookupLineType(e164, { sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN } = {}) {
  if (!sid || !token || !e164) return 'unknown';
  const res = await fetch(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(e164)}?Fields=line_type_intelligence`, {
    headers: { authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}` },
  });
  if (!res.ok) return 'unknown';
  const body = await res.json();
  return MAP[body.line_type_intelligence?.type] || 'unknown';
}
