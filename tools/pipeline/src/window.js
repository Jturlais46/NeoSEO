// Is now a good time to call this business? Uses the market's calling hours, days and blocks
// (config/markets.yaml) in the market's time zone, plus state weekends where they differ.

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export function localParts(date, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date).map((p) => [p.type, p.value]));
  return { day: parts.weekday.toLowerCase().slice(0, 3), minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
}

export function withinCallingWindow(market, { date = new Date(), state } = {}) {
  const tz = market.timezone || 'UTC';
  const { day, minutes } = localParts(date, tz);
  const days = (state && market.state_call_days?.[state]) || market.call_days || DAYS;
  if (!days.includes(day)) return false;
  const windows = Array.isArray(market.calling_window_local?.[0]) ? market.calling_window_local : [market.calling_window_local];
  const open = windows.some(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
  const blocked = (market.blocked?.[day] || []).some(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
  return open && !blocked;
}
