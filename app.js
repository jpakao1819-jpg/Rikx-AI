'use strict';

const DEFAULT_BASE_CURRENCY = 'PGK';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_USD_TO_PGK = 3.75;

const ICONS = {
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 20V9"/></svg>',
  markets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 17l5-6 4 3 4-6 5 4"/><path d="M3 21h18"/></svg>',
  trades: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  messages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12z"/></svg>',
  accounts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M7 15h10"/></svg>',
  firewall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path d="M9.5 12.2l1.8 1.8 3.4-3.6"/></svg>',
  alerts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 19a2 2 0 0 0 3 0"/></svg>',
  security: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v16H5.5A2.5 2.5 0 0 0 3 22V6.5z"/><path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v16h5.5A2.5 2.5 0 0 1 21 22V6.5z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 11a8 8 0 1 0-2.3 6.4"/><path d="M20 5v6h-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12.5l5 5L20 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'
};

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const todayKey = () => new Date().toISOString().slice(0, 10);
const rand = (spread = 1) => (Math.random() - 0.5) * 2 * spread;

const exchange = {
  usdToPngK: FALLBACK_USD_TO_PGK,
  updatedAt: null,
  source: 'open.er-api.com',
  lastError: null
};

const usdToPngRate = () => Number(exchange.usdToPngK) || FALLBACK_USD_TO_PGK;

async function refreshExchangeRate() {
  try {
    const res = await fetch(EXCHANGE_API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const rate = Number(payload?.rates?.PGK || payload?.rates?.pgk);
    if (Number.isFinite(rate) && rate > 0) {
      exchange.usdToPngK = rate;
      exchange.updatedAt = new Date().toISOString();
      exchange.lastError = null;
    }
  } catch (error) {
    exchange.lastError = error?.message || 'Rate fetch failed';
  }
}

const formatMoney = (value, currency = DEFAULT_BASE_CURRENCY) => {
  const n = Number(value) || 0;
  let amount = n;
  if (currency === 'PGK') amount = n * usdToPngRate();
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const symbol = currency === 'PGK' ? 'K ' : '$';
  return `${sign}${symbol}${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const money = (value) => formatMoney(value, DEFAULT_BASE_CURRENCY);
const signed = (value) => (Number(value) > 0 ? '+' : '') + money(value);

const timeAgo = (ts) => {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const STORE_KEY = 'rikx-desk-v1';
const LEARNING_KEY = 'rikx-learning-program-v1';

const defaultState = () => ({
  limits: { startBalance: 10000, riskPct: 1, dailyLossPct: 3, maxPositions: 4, convictionFloor: 55 },
  paper: { realized: 0, dayStart: 10000, day: todayKey(), open: [], closed: [] },
  alerts: [],
  accounts: [],
  messages: [],
  memory: [],
  security: { pinHash: null, salt: null, credentialId: null },
  ui: { baseCurrency: 'PGK' }
});

function loadState() {
  const base = defaultState();
  let raw;
  try { raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { raw = null; }
  if (!raw || typeof raw !== 'object') return base;
  const merged = {
    ...base,
    ...raw,
    limits: { ...base.limits, ...(raw.limits || {}) },
    paper: { ...base.paper, ...(raw.paper || {}) },
    security: { ...base.security, ...(raw.security || {}) },
    ui: { ...base.ui, ...(raw.ui || {}) }
  };
  if (!Array.isArray(merged.paper.open)) merged.paper.open = [];
  if (!Array.isArray(merged.paper.closed)) merged.paper.closed = [];
  if (!Array.isArray(merged.alerts)) merged.alerts = [];
  if (!Array.isArray(merged.accounts)) merged.accounts = [];
  if (!Array.isArray(merged.messages)) merged.messages = [];
  if (!Array.isArray(merged.memory)) merged.memory = [];
  return merged;
}

let state = loadState();
let saveTimer = null;
function save(immediate = false) {
  clearTimeout(saveTimer);
  const write = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch { toast('Could not save to this browser.'); }
  };
  if (immediate) write(); else saveTimer = setTimeout(write, 250);
}

const PAIR_DEFS = [
  { sym: 'EUR/USD', base: 1.1168, digits: 5, vol: 0.00006 },
  { sym: 'GBP/USD', base: 1.3347, digits: 5, vol: 0.00007 },
  { sym: 'USD/JPY', base: 158.745, digits: 3, vol: 0.00006 },
  { sym: 'AUD/USD', base: 0.6872, digits: 5, vol: 0.00007 },
  { sym: 'USD/CAD', base: 1.419, digits: 5, vol: 0.00006 },
  { sym: 'USD/CHF', base: 0.8255, digits: 5, vol: 0.00006 },
  { sym: 'NZD/USD', base: 0.5606, digits: 5, vol: 0.00007 },
  { sym: 'EUR/JPY', base: 177.245, digits: 3, vol: 0.00007 },
  { sym: 'EUR/GBP', base: 0.8367, digits: 5, vol: 0.00005 }
];

const market = PAIR_DEFS.map((def) => {
  const sessionChange = rand(1.8) / 100;
  const open = def.base / (1 + sessionChange);
  const history = [];
  const steps = 26;
  const step = (def.base - open) / steps;
  for (let i = 0; i <= steps; i += 1) {
    history.push(open + step * i + rand(def.base * def.vol * 4));
  }
  return { ...def, open, price: def.base, momentum: rand(0.4), history };
});

function tickMarket() {
  market.forEach((m) => {
    m.momentum = m.momentum * 0.94 + rand(0.3);
    const shock = Math.random() < 0.02 ? rand(4) : 0;
    const drift = m.vol * (m.momentum + rand(1) + shock);
    m.price = Math.max(m.base * 0.85, Math.min(m.base * 1.15, m.price * (1 + drift)));
    m.history.push(m.price);
    if (m.history.length > 90) m.history.shift();
  });
  markPositions();
}

function pctChange(m) { return ((m.price - m.open) / m.open) * 100; }
const pairBySym = (sym) => market.find((m) => m.sym === sym);
const fmtPrice = (m, value = m.price) => value.toFixed(m.digits);

function sparkline(history, up) {
  const points = history.slice(-40);
  if (points.length < 2) return '<svg class="spark" viewBox="0 0 62 22" aria-hidden="true"></svg>';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 0.0001;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 62;
    const y = 20 - ((v - min) / span) * 18;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const stroke = up ? '#22e39a' : '#ff4b5c';
  return `<svg class="spark" viewBox="0 0 62 22" aria-hidden="true"><path d="${path}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function computeSignal(m) {
  const recent = m.history.slice(-24);
  const first = recent[0];
  const move = (m.price - first) / first;
  const change = pctChange(m);
  let sameDirection = 0;
  for (let i = 1; i < recent.length; i += 1) {
    if (Math.sign(recent[i] - recent[i - 1]) === Math.sign(move)) sameDirection += 1;
  }
  const consistency = recent.length > 1 ? sameDirection / (recent.length - 1) : 0.5;
  const dir = move >= 0 ? 'LONG' : 'SHORT';
  const trending = Math.abs(change) >= 0.3;
  const conviction = clamp(Math.round(42 + Math.abs(change) * 11 + consistency * 26), 18, 94);
  let atr = 0;
  for (let i = 1; i < recent.length; i += 1) atr += Math.abs(recent[i] - recent[i - 1]);
  atr = atr / Math.max(1, recent.length - 1);
  const stopDistance = Math.max(atr * 5.5, m.price * 0.00045);
  const stop = dir === 'LONG' ? m.price - stopDistance : m.price + stopDistance;
  const target = dir === 'LONG' ? m.price + stopDistance * 2 : m.price - stopDistance * 2;

  return { pair: m.sym, digits: m.digits, dir, entry: m.price, stop, target, stopDistance, conviction, structure: trending ? 'trending' : 'ranging', change };
}

const signals = () => market.map(computeSignal);

function openPnl() {
  return state.paper.open.reduce((sum, pos) => {
    const m = pairBySym(pos.pair);
    if (!m) return sum;
    const dir = pos.dir === 'LONG' ? 1 : -1;
    return sum + (m.price - pos.entry) * dir * pos.size;
  }, 0);
}

function equity() {
  return Number(state.limits.startBalance) + Number(state.paper.realized) + openPnl();
}

function winRate() {
  const closed = state.paper.closed;
  if (!closed.length) return 0;
  const wins = closed.filter((t) => t.pnl > 0).length;
  return Math.round((wins / closed.length) * 100);
}

function rollDay() {
  if (state.paper.day !== todayKey()) {
    state.paper.day = todayKey();
    state.paper.dayStart = equity();
    save();
  }
}

function usdBias(pos) {
  const [baseCur, quoteCur] = pos.pair.split('/');
  const dir = pos.dir === 'LONG' ? 1 : -1;
  if (baseCur === 'USD') return dir;
  if (quoteCur === 'USD') return -dir;
  return 0;
}

function firewallCheck(signal) {
  const L = state.limits;
  const paper = state.paper;
  if (signal.conviction < L.convictionFloor) {
    return { ok: false, reason: `Conviction ${signal.conviction} is under the floor of ${L.convictionFloor}.` };
  }
  if (paper.open.length >= L.maxPositions) {
    return { ok: false, reason: `Concurrent exposure is capped at ${L.maxPositions} open positions.` };
  }
  if (paper.open.some((pos) => pos.pair === signal.pair)) {
    return { ok: false, reason: `Already holding ${signal.pair}. One position per pair.` };
  }
  const dayPnl = equity() - paper.dayStart;
  const dayLimit = paper.dayStart * (L.dailyLossPct / 100);
  if (dayPnl <= -dayLimit) {
    return { ok: false, reason: `Daily loss circuit tripped (${money(dayPnl)} vs ${money(-dayLimit)} limit). Desk stands down until tomorrow.` };
  }
  const bias = usdBias({ pair: signal.pair, dir: signal.dir });
  if (bias !== 0) {
    const same = paper.open.filter((pos) => usdBias(pos) === bias).length;
    if (same >= 2) {
      return { ok: false, reason: `${same} positions already bet the same way on USD. Correlated exposure blocked.` };
    }
  }
  const size = (equity() * (L.riskPct / 100)) / signal.stopDistance;
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, reason: 'Position size resolved to zero — check the stop distance.' };
  }
  return { ok: true, reason: 'Cleared every gate.' };
}

function executeSignal(signal) {
  const verdict = firewallCheck(signal);
  if (!verdict.ok) {
    addAlert('block', `Firewall blocked ${signal.pair}`, verdict.reason);
    toast(`Blocked: ${verdict.reason}`);
    render();
    return;
  }
  const L = state.limits;
  const riskUsd = equity() * (L.riskPct / 100);
  const size = riskUsd / signal.stopDistance;
  state.paper.open.push({ id: `p${Date.now()}`, pair: signal.pair, dir: signal.dir, entry: signal.entry, stop: signal.stop, target: signal.target, size, riskUsd, conviction: signal.conviction, openedAt: Date.now() });
  addAlert('open', `Paper fill · ${signal.pair} ${signal.dir.toLowerCase()}`, `${money(riskUsd)} at risk, stop ${signal.stop.toFixed(signal.digits)}, target ${signal.target.toFixed(signal.digits)}.`);
  toast(`${signal.pair} ${signal.dir} opened on the paper account (${money(riskUsd)} at risk)`);
  save(true);
  render();
}

function markPositions() {
  for (let i = state.paper.open.length - 1; i >= 0; i -= 1) {
    const pos = state.paper.open[i];
    const m = pairBySym(pos.pair);
    if (!m) continue;
    const dir = pos.dir === 'LONG' ? 1 : -1;
    const hitTarget = dir === 1 ? m.price >= pos.target : m.price <= pos.target;
    const hitStop = dir === 1 ? m.price <= pos.stop : m.price >= pos.stop;
    if (!hitTarget && !hitStop) continue;
    const exit = hitTarget ? pos.target : pos.stop;
    const pnl = (exit - pos.entry) * dir * pos.size;
    state.paper.realized += pnl;
    state.paper.open.splice(i, 1);
    state.paper.closed.unshift({ ...pos, exit, closedAt: Date.now(), pnl, outcome: pnl >= 0 ? 'target' : 'stop' });
    addAlert(hitTarget ? 'payout' : 'stop', hitTarget ? `${pos.pair} paid out` : `${pos.pair} stopped out`, `${pnl >= 0 ? '+' : ''}${money(pnl)} on ${pos.dir.toLowerCase()} at ${exit.toFixed(m.digits)}.`);
    toast(`${pos.pair} closed ${pnl >= 0 ? 'in profit' : 'at the stop'} · ${signed(pnl)}`);
    save(true);
  }
}

function addAlert(kind, title, body) {
  state.alerts.unshift({ id: `a${Date.now()}${Math.random().toString(16).slice(2, 6)}`, kind, title, body, ts: Date.now(), read: false });
  state.alerts = state.alerts.slice(0, 80);
  save();
}
const unreadCount = () => state.alerts.filter((a) => !a.read).length;

function deskSnapshot() {
  return { eq: equity(), open: state.paper.open, dayPnl: equity() - state.paper.dayStart, realized: state.paper.realized };
}

function answerRikx(input) {
  const text = String(input || '').trim();
  const lower = text.toLowerCase();
  const snap = deskSnapshot();
  const L = state.limits;

  if (lower.includes('pgk') || lower.includes('kina') || lower.includes('currency')) {
    return `Rikx is set to PNG Kina (PGK) as the desk base currency. Latest indicative rate: 1 USD = ${usdToPngRate().toFixed(2)} PGK. All balances, realised P&L and open P&L are displayed in PGK with USD approximations available from the conversion chip.`;
  }

  if (/position|p&l|pnl|doing|open trade/.test(lower)) {
    if (!snap.open.length) return `No open positions. Equity is ${money(snap.eq)}, today ${signed(snap.dayPnl)} against a ${money(-(state.paper.dayStart * L.dailyLossPct / 100))} circuit.`;
    const lines = snap.open.map((pos) => {
      const m = pairBySym(pos.pair);
      const pnl = (m.price - pos.entry) * (pos.dir === 'LONG' ? 1 : -1) * pos.size;
      return `${pos.pair} ${pos.dir.toLowerCase()} from ${pos.entry.toFixed(m.digits)} — now ${m.price.toFixed(m.digits)}, ${signed(pnl)} open, stop ${pos.stop.toFixed(m.digits)}.`;
    });
    return `${snap.open.length} open at ${money(snap.eq)} equity. ${lines.join(' ')}`;
  }

  const pairMatch = text.toUpperCase().match(/\b([A-Z]{3})\s*\/?\s*([A-Z]{3})\b/);
  if (pairMatch) {
    const sym = `${pairMatch[1]}/${pairMatch[2]}`;
    const m = pairBySym(sym);
    if (m) {
      const s = computeSignal(m);
      return `${sym} at ${fmtPrice(m)} (${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}% this session), ${s.structure}. Structure reads ${s.dir} with conviction ${s.conviction}; stop ${s.stop.toFixed(s.digits)}, target ${s.target.toFixed(s.digits)}. ${s.conviction >= L.convictionFloor ? 'Clears the conviction floor.' : `Under the conviction floor of ${L.convictionFloor}.`}`;
    }
  }

  if (/setup|worth taking|scan|trade right now|signal/.test(lower)) {
    const ranked = signals().filter((s) => s.conviction >= L.convictionFloor).sort((a, b) => b.conviction - a.conviction);
    if (!ranked.length) return `Nothing clears the ${L.convictionFloor} conviction floor right now.`;
    const best = ranked[0];
    const verdict = firewallCheck(best);
    return `Best read: ${best.pair} ${best.dir.toLowerCase()} at conviction ${best.conviction}. ${verdict.ok ? `The firewall clears it — the desk would risk ${money(equity() * (L.riskPct / 100))}.` : `Firewall blocks it: ${verdict.reason}`}`;
  }

  if (/firewall|size a trade|position size|risk/.test(lower)) {
    const risk = equity() * (L.riskPct / 100);
    return `Sizing: risk ${L.riskPct}% of ${money(equity())} = ${money(risk)} per trade. Gates: conviction ≥ ${L.convictionFloor}, no more than ${L.maxPositions} open positions.`;
  }

  if (/what is (a )?pip|\bpips\b/.test(lower)) return 'A pip is a small forex move — typically 0.0001 for most pairs and 0.01 for JPY pairs.';
  if (/study|learn|week|curriculum/.test(lower)) {
    const next = weeks.findIndex((_, i) => !completedWeeks().has(i));
    if (next === -1) return 'All 12 weeks are marked complete.';
    const week = weeks[next];
    return `Next up is Week ${next + 1}: ${week.title}. Goal: ${week.goal}`;
  }

  if (/^(hi|hey|hello|yo)\b/.test(lower)) return `Hey. Your desk is ${money(snap.eq)} in PGK, with ${snap.open.length} open position${snap.open.length === 1 ? '' : 's'}.`;

  const best = signals().sort((a, b) => b.conviction - a.conviction)[0];
  return `I can read your desk, the firewall, any major pair, or the next study week. Right now the strongest read is ${best.pair} ${best.dir.toLowerCase()} at conviction ${best.conviction}.`;
}

const weeks = [
  { title: 'Forex market basics', phase: 'FOUNDATIONS', goal: 'Understand what is traded and how currency prices are quoted.', lessons: ['Base/quote currencies', 'major/minor pairs', 'pips and spreads'], practice: 'Read a EUR/USD quote and map the bid/ask.', sources: ['CFTC', 'NFA', 'BIS'] },
  { title: 'How the market works', phase: 'FOUNDATIONS', goal: 'Learn the roles of banks, dealers, funds and liquidity.', lessons: ['Session structure', 'liquidity drivers', 'execution'], practice: 'Map the major FX sessions to liquidity.', sources: ['BIS', 'Federal Reserve', 'CME'] },
  { title: 'Leverage and risk', phase: 'FOUNDATIONS', goal: 'Recognize how leverage magnifies both gains and losses.', lessons: ['Margin', 'risk limits', 'stop distance'], practice: 'Convert a stop distance into a position size.', sources: ['CFTC', 'NFA'] },
  { title: 'Economic fundamentals', phase: 'FOUNDATIONS', goal: 'Connect currency moves to policy and data.', lessons: ['Inflation', 'rates', 'employment'], practice: 'Track one news release and its likely impact.', sources: ['Federal Reserve', 'BIS'] },
  { title: 'Reading charts thoughtfully', phase: 'ANALYSIS & RISK', goal: 'Read charts without treating patterns as certainty.', lessons: ['Trend', 'range', 'support and resistance'], practice: 'Mark levels on one chart and write a thesis.', sources: ['CME', 'BIS'] },
  { title: 'Build a testable hypothesis', phase: 'ANALYSIS & RISK', goal: 'Turn opinions into rules you can invalidate.', lessons: ['Entry', 'invalidations', 'risk plan'], practice: 'Write a 3-rule hypothesis for one pair.', sources: ['CFTC', 'NFA'] },
  { title: 'Position sizing and guardrails', phase: 'ANALYSIS & RISK', goal: 'Make risk independent of confidence in the prediction.', lessons: ['Risk per trade', 'drawdown', 'correlation'], practice: 'Build a simple risk table.', sources: ['NFA', 'CME'] },
  { title: 'Trading psychology and process', phase: 'ANALYSIS & RISK', goal: 'Develop repeatable habits and reduce bias.', lessons: ['Overconfidence', 'loss aversion', 'process'], practice: 'Review one trade journal entry.', sources: ['CFTC', 'NFA'] },
  { title: 'Backtesting without fooling yourself', phase: 'PRACTICE & REVIEW', goal: 'Learn what test evidence can and cannot show.', lessons: ['Out-of-sample', 'walk forward', 'data snooping'], practice: 'Compare a rule on one window against another.', sources: ['BIS', 'CME'] },
  { title: 'Evaluate evidence', phase: 'PRACTICE & REVIEW', goal: 'Assess performance with more than a win rate.', lessons: ['Expectancy', 'drawdown', 'sample size'], practice: 'Inspect a single trade journal.', sources: ['NFA', 'BIS'] },
  { title: 'Paper-trading simulation', phase: 'PRACTICE & REVIEW', goal: 'Practice rules without live money.', lessons: ['Execution discipline', 'journaling', 'review'], practice: 'Run a four-day paper sheet.', sources: ['CFTC', 'CME'] },
  { title: 'Review and next steps', phase: 'PRACTICE & REVIEW', goal: 'Summarize learning, risks and your next research plan.', lessons: ['Gaps', 'next steps', 'responsible plan'], practice: 'Write the top 3 lessons you still need to improve.', sources: ['CFTC', 'NFA', 'BIS'] }
];

function completedWeeks() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEARNING_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n) && n >= 0 && n < weeks.length) : []);
  } catch { return new Set(); }
}

function saveCompletedWeeks(set) {
  try { localStorage.setItem(LEARNING_KEY, JSON.stringify([...set])); }
  catch { toast('Progress could not be saved in this browser.'); }
}

const ROUTES = [
  { key: 'desk', label: 'Desk', icon: 'desk' },
  { key: 'markets', label: 'Markets', icon: 'markets' },
  { key: 'trades', label: 'Positions', icon: 'trades' },
  { key: 'messages', label: 'Messages', icon: 'messages' },
  { key: 'accounts', label: 'Accounts', icon: 'accounts' },
  { key: 'firewall', label: 'Firewall', icon: 'firewall' },
  { key: 'alerts', label: 'Alerts', icon: 'alerts' },
  { key: 'security', label: 'Security', icon: 'security' },
  { key: 'learn', label: 'Learn', icon: 'learn' }
];

const appEl = document.getElementById('app');
const navEl = document.getElementById('nav');
let route = 'desk';
let tradeTab = 'open';
let accountDraft = { broker: 'OANDA' };

const routeFromHash = () => {
  const key = (location.hash || '#/desk').replace(/^#\/?/, '').split('?')[0] || 'desk';
  return ROUTES.some((r) => r.key === key) ? key : 'desk';
};

function renderNav() {
  const unread = unreadCount();
  navEl.innerHTML = ROUTES.map((r) => {
    const badge = r.key === 'alerts' && unread ? `<span class="badge">${unread > 9 ? '9+' : unread}</span>` : '';
    return `<a href="#/${r.key}" ${route === r.key ? 'aria-current="page"' : ''}>${ICONS[r.icon]}<span>${r.label}</span>${badge}</a>`;
  }).join('');
}

function navigate(key) {
  if (location.hash !== `#/${key}`) location.hash = `#/${key}`;
  else render();
}

function tickerHtml(count = 9) {
  return `<div class="ticker" aria-label="Simulated FX quotes">${market.slice(0, count).map((m) => {
    const change = pctChange(m);
    return `<div class="tick"><div class="tick-top"><span class="tick-sym">${m.sym}</span><span class="tick-chg ${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></div><span class="tick-price">${fmtPrice(m)}</span></div>`;
  }).join('')}</div>`;
}

function positionsTable(positions) {
  if (!positions.length) {
    return '<div class="empty">No open positions. Rikx is scanning for setups that clear the firewall.</div>';
  }
  return `<div class="table-wrap"><table><thead><tr><th>PAIR</th><th>SIDE</th><th>ENTRY</th><th>NOW</th><th>STOP</th><th>TARGET</th><th>OPEN P&amp;L</th><th></th></tr></thead><tbody>${positions.map((pos) => {
    const m = pairBySym(pos.pair);
    const dir = pos.dir === 'LONG' ? 1 : -1;
    const pnl = (m.price - pos.entry) * dir * pos.size;
    return `<tr><td><span class="pair-sym">${pos.pair}</span></td><td><span class="side ${pos.dir === 'LONG' ? 'long' : 'short'}">${pos.dir}</span></td><td class="num">${pos.entry.toFixed(m.digits)}</td><td class="num">${m.price.toFixed(m.digits)}</td><td class="num">${pos.stop.toFixed(m.digits)}</td><td class="num">${pos.target.toFixed(m.digits)}</td><td class="num ${pnl >= 0 ? 'up' : 'down'}">${signed(pnl)}</td><td><button class="btn small" data-action="close-position" data-id="${pos.id}">Close</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function firewallRows() {
  const L = state.limits;
  const dayPnl = equity() - state.paper.dayStart;
  const rows = [
    ['Paper execution', 'Simulated fills only — connected accounts are read-only'],
    ['Per-trade risk', `${L.riskPct}% of equity ceiling`],
    ['Concurrent exposure', `${state.paper.open.length} of ${L.maxPositions} open`],
    ['Daily loss circuit', `Today ${money(dayPnl)} · limit ${L.dailyLossPct}%`],
    ['Correlated USD bets', `${state.paper.open.filter((p) => usdBias(p) === 1).length} long / ${state.paper.open.filter((p) => usdBias(p) === -1).length} short USD`],
    ['Signal quality floor', `Rejects conviction under ${L.convictionFloor}`]
  ];
  return rows.map(([name, value]) => `<li class="row"><span class="row-name">${ICONS.check}${name}</span><span class="row-value">${value}</span></li>`).join('');
}

function alertHtml(alert) {
  return `<div class="alert-item ${alert.read ? '' : 'unread'}"><span class="alert-dot" aria-hidden="true"></span><div><strong>${esc(alert.title)}</strong><p>${esc(alert.body)}</p></div><span class="alert-time">${timeAgo(alert.ts)}</span></div>`;
}

const PAGES = {
  desk() {
    const eq = equity();
    const pnl = openPnl();
    const day = eq - state.paper.dayStart;
    const closed = state.paper.closed;
    return `
      ${tickerHtml(9)}
      <div class="stat-grid">
        <div class="stat"><span class="stat-label">Equity</span><span class="stat-value">${money(eq)}</span><span class="stat-foot">Started ${money(state.limits.startBalance)}</span></div>
        <div class="stat"><span class="stat-label">Today</span><span class="stat-value ${day >= 0 ? 'up' : 'down'}">${signed(day)}</span><span class="stat-foot">Limit ${state.limits.dailyLossPct}%</span></div>
        <div class="stat"><span class="stat-label">Open P&amp;L</span><span class="stat-value ${pnl >= 0 ? 'up' : 'down'}">${signed(pnl)}</span><span class="stat-foot">${state.paper.open.length} open</span></div>
        <div class="stat"><span class="stat-label">Win rate</span><span class="stat-value">${winRate()}%</span><span class="stat-foot">${closed.length} closed</span></div>
        <div class="stat"><span class="stat-label">Realized</span><span class="stat-value ${state.paper.realized >= 0 ? 'up' : 'down'}">${signed(state.paper.realized)}</span><span class="stat-foot">PGK</span></div>
      </div>
      <div class="desk-grid" style="margin-top:.9rem">
        <div>
          <div class="intel">
            <div><h2>Rikx intelligence</h2><p>Live conversion is active and the desk base is PGK.</p></div>
            <button class="btn" data-action="ask-rikx">${ICONS.spark}<span>Ask Rikx</span></button>
          </div>
          <div class="section"><div class="section-head"><h2>Open positions</h2><span class="tagline">LIVE MARK-TO-MARKET</span></div>${positionsTable(state.paper.open)}</div>
        </div>
        <div>
          <div class="section"><div class="section-head"><h2>Firewall</h2><span class="pill armed">ARMED</span></div><div class="card"><ul class="rows">${firewallRows()}</ul></div></div>
          <div class="section"><div class="section-head"><h2>Latest alerts</h2><span class="tagline">${unreadCount()} UNREAD</span></div><div class="card">${state.alerts.length ? state.alerts.slice(0, 4).map(alertHtml).join('') : '<p class="card-sub">Nothing yet. Rikx will notify you the moment a position pays out.</p>'}</div></div>
        </div>
      </div>`;
  },

  markets() {
    const rows = signals().sort((a, b) => b.conviction - a.conviction);
    return `
      ${tickerHtml(9)}
      <div class="page-head page-title-row">
        <div><h1>Market scan</h1><p>Indicative major pairs with a PGK desk conversion bar.</p></div>
        <button class="btn" data-action="rescan">${ICONS.refresh}<span>Rescan</span></button>
      </div>
      <div class="table-wrap"><table><thead><tr><th>PAIR</th><th>PRICE</th><th>CHANGE</th><th>STRUCTURE</th><th>CONVICTION</th><th>STOP / TARGET</th><th>ACTION</th></tr></thead><tbody>${rows.map((s) => {
        const m = pairBySym(s.pair);
        return `<tr><td><div class="pair-cell"><span class="pair-sym">${s.pair}</span><span class="pair-meta">${s.structure}</span></div></td><td class="num">${s.entry.toFixed(s.digits)}</td><td class="num ${s.change >= 0 ? 'up' : 'down'}">${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%</td><td><div class="structure">${sparkline(m.history, s.dir === 'LONG')}<span class="side ${s.dir === 'LONG' ? 'long' : 'short'}">${s.dir}</span></div></td><td class="num">${s.conviction}</td><td class="num stop-target">${s.stop.toFixed(s.digits)} / ${s.target.toFixed(s.digits)}</td><td><button class="btn small" data-action="execute" data-pair="${s.pair}">Execute</button></td></tr>`;
      }).join('')}</tbody></table></div>`;
  },

  trades() {
    const eq = equity();
    const closed = state.paper.closed;
    const list = tradeTab === 'open' ? positionsTable(state.paper.open) : (closed.length ? `<div class="table-wrap"><table><thead><tr><th>PAIR</th><th>SIDE</th><th>ENTRY</th><th>EXIT</th><th>RESULT</th><th>CLOSED</th></tr></thead><tbody>${closed.map((t) => `<tr><td><span class="pair-sym">${t.pair}</span></td><td><span class="side ${t.dir === 'LONG' ? 'long' : 'short'}">${t.dir}</span></td><td class="num">${t.entry.toFixed(pairBySym(t.pair)?.digits ?? 5)}</td><td class="num">${t.exit.toFixed(pairBySym(t.pair)?.digits ?? 5)}</td><td class="num ${t.pnl >= 0 ? 'up' : 'down'}">${signed(t.pnl)}</td><td class="num stop-target">${timeAgo(t.closedAt)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No closed trades yet.</div>');
    return `
      <div class="page-head"><h1>Positions</h1><p>Every fill Rikx has taken on the paper account, with full history.</p></div>
      <div class="stat-grid">
        <div class="stat"><span class="stat-label">Realized</span><span class="stat-value ${state.paper.realized >= 0 ? 'up' : 'down'}">${signed(state.paper.realized)}</span></div>
        <div class="stat"><span class="stat-label">Today</span><span class="stat-value ${eq - state.paper.dayStart >= 0 ? 'up' : 'down'}">${signed(eq - state.paper.dayStart)}</span></div>
        <div class="stat"><span class="stat-label">Win rate</span><span class="stat-value">${winRate()}%</span><span class="stat-foot">${closed.length} closed</span></div>
        <div class="stat"><span class="stat-label">Open</span><span class="stat-value">${state.paper.open.length}</span></div>
      </div>
      <div class="section">
        <div class="section-head"><h2>Live positions</h2><div class="tabs" role="tablist"><button role="tab" aria-selected="${tradeTab === 'open'}" data-action="tab" data-tab="open">Open (${state.paper.open.length})</button><button role="tab" aria-selected="${tradeTab === 'closed'}" data-action="tab" data-tab="closed">Closed (${closed.length})</button></div></div>
        ${list}
        <p class="hint" style="margin-top:.7rem">Account equity ${money(eq)} · simulated fills only.</p>
      </div>`;
  },

  messages() {
    const messages = state.messages.length ? state.messages : [{ role: 'assistant', text: 'This is your private line to Rikx. He answers with your live positions, the firewall rules and the current market read.', ts: Date.now() }];
    return `
      <div class="page-head"><h1>Messages</h1><p>One private line to Rikx — he reads your live positions, the tape and the firewall.</p></div>
      <div class="card chat-card">
        <div class="chat-head"><span class="chat-avatar">R</span><div><strong>Rikx</strong><small>Desk assistant — reads your account and the tape</small></div><span class="live-dot">LOCAL</span></div>
        <div class="chat-log" id="chat-log">${messages.map((msg) => `<div class="msg ${msg.role === 'user' ? 'mine' : ''}"><span class="msg-name">${msg.role === 'user' ? 'YOU' : 'RIKX'}</span><p>${esc(msg.text)}</p></div>`).join('')}</div>
        <div class="suggestions">${['How are my positions doing?', 'What is the read on EUR/USD?', 'Any setup worth taking right now?', 'How does the firewall size a trade?'].map((p) => `<button class="suggestion" type="button" data-action="suggest" data-prompt="${esc(p)}">${esc(p)}</button>`).join('')}</div>
        <form class="chat-form" id="chat-form"><label class="visually-hidden" for="chat-input">Message Rikx</label><input class="input" id="chat-input" name="message" placeholder="Ask Rikx…" autocomplete="off" maxlength="400" required><button class="btn primary" type="submit" aria-label="Send">${ICONS.send}</button></form>
      </div>
      <div class="section card"><h2 class="card-title">How Rikx reaches you</h2><ul class="rows"><li class="row"><span class="row-name">${ICONS.check}In-app messages</span><span class="row-value">Replies in this thread</span></li><li class="row"><span class="row-name">${ICONS.check}Browser notifications</span><span class="row-value">Optional, on this device only</span></li></ul><button class="btn block" data-action="notify" type="button">Allow browser notifications</button></div>`;
  },

  accounts() {
    return `
      <div class="page-head"><h1>Accounts</h1><p>The trading accounts Rikx may look at. Nothing is transmitted or verified.</p></div>
      <div class="card">${state.accounts.length ? `<ul class="rows">${state.accounts.map((a) => `<li class="row"><span class="row-name">${ICONS.check}<span><strong style="color:var(--heading)">${esc(a.label)}</strong><br><span class="pair-meta">${esc(a.broker)} · ${esc(a.accountId)} · ${esc(a.environment)}</span></span></span><span class="row-value"><button class="btn small danger" data-action="remove-account" data-id="${a.id}">Remove</button></span></li>`).join('')}</ul>` : '<div class="empty">No accounts connected yet.</div>'}</div>
      <div class="section card"><h2 class="card-title">Connect an account</h2><div class="chip-group" role="group" aria-label="Broker">${['OANDA', 'MetaTrader 4/5', 'cTrader'].map((b) => `<button class="chip" type="button" data-action="broker" data-broker="${b}" aria-pressed="${accountDraft.broker === b}">${b}</button>`).join('')}</div><form id="account-form"><div class="field"><label class="field-label" for="acc-label">Label</label><input class="input" id="acc-label" name="label" value="${esc(accountDraft.broker)}" required></div><div class="field"><label class="field-label" for="acc-id">Account ID</label><input class="input" id="acc-id" name="accountId" placeholder="101-004-1234567-001" required></div><div class="field"><label class="field-label" for="acc-token">API token</label><input class="input" id="acc-token" name="token" type="password" placeholder="Stored locally" required></div><div class="field"><label class="field-label" for="acc-env">Environment</label><select class="select" id="acc-env" name="environment"><option value="practice">Practice / demo</option><option value="live">Live</option></select></div><p class="hint">No backend exists in this build, so the token cannot be verified and no orders can be sent.</p><button class="btn primary" type="submit">${ICONS.plus}<span>Connect account</span></button></form></div>`;
  },

  firewall() {
    const L = state.limits;
    return `
      <div class="page-head"><h1>Firewall</h1><p>Every order passes these gates before a fill. This build enforces them in-browser.</p></div>
      <div class="card"><div class="section-head"><h2 class="card-title">Firewall</h2><span class="pill armed">ARMED</span></div><ul class="rows">${firewallRows()}</ul></div>
      <div class="section card"><h2 class="card-title">Risk limits</h2><p class="card-sub" style="margin-bottom:.6rem">Set how much Rikx is allowed to risk on your behalf.</p><form id="limits-form"><div class="limits-row"><label for="lim-start">Starting balance (USD)</label><div class="limits-input"><input class="input" id="lim-start" name="startBalance" type="number" min="100" step="100" value="${Number(state.limits.startBalance).toFixed(0)}"></div></div><div class="limits-row"><label for="lim-risk">Risk per trade</label><div class="limits-input"><input class="input" id="lim-risk" name="riskPct" type="number" min="0.1" max="10" step="0.1" value="${state.limits.riskPct}"></div></div><div class="limits-row"><label for="lim-daily">Daily loss limit</label><div class="limits-input"><input class="input" id="lim-daily" name="dailyLossPct" type="number" min="0.5" max="50" step="0.5" value="${state.limits.dailyLossPct}"></div></div><div class="limits-row"><label for="lim-max">Max open positions</label><div class="limits-input"><input class="input" id="lim-max" name="maxPositions" type="number" min="1" max="20" step="1" value="${state.limits.maxPositions}"></div></div><div class="limits-row"><label for="lim-conv">Conviction floor</label><div class="limits-input"><input class="input" id="lim-conv" name="convictionFloor" type="number" min="0" max="95" step="1" value="${state.limits.convictionFloor}"></div></div><button class="btn primary block" type="submit">Save limits</button></form><p class="hint">Live broker execution is not connected. Rikx sizes and simulates every position on the paper account, so no real money moves.</p></div>`;
  },

  alerts() {
    return `
      <div class="page-head page-title-row"><div><h1>Alerts</h1><p>Payouts, stops, firewall blocks and requests from Rikx — all in one feed.</p></div><button class="btn" data-action="mark-read" ${state.alerts.some((a) => !a.read) ? '' : 'disabled'}>Mark all read</button></div>
      <div class="card">${state.alerts.length ? state.alerts.map(alertHtml).join('') : '<div class="empty">No alerts yet.</div>'}</div>`;
  },

  security() {
    const s = state.security;
    const on = Boolean(s.pinHash || s.credentialId);
    return `
      <div class="page-head"><h1>Security</h1><p>How the desk opens on this device. Set a PIN, add your fingerprint, and lock Rikx.</p></div>
      <div class="card"><div class="section-head"><h2 class="card-title">Device lock</h2><span class="pill ${on ? 'armed' : 'off'}">${on ? 'ON' : 'OFF'}</span></div><p class="card-sub">${on ? 'The desk asks for your PIN when it loads.' : 'Off — the desk opens straight away.'}</p><form id="pin-form" style="margin-top:1rem"><div class="field"><label class="field-label" for="pin-new">${s.pinHash ? 'Replace PIN' : 'Set a 6-digit PIN'}</label><input class="input pin-input" id="pin-new" name="pin" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" placeholder="••••••" required></div><button class="btn primary" type="submit">Save PIN</button></form></div>
      <div class="section card"><h2 class="card-title">Fingerprint</h2><p class="card-sub">Uses this device's own sensor through WebAuthn.</p><div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem"><button class="btn" data-action="biometric-add">${s.credentialId ? 'Replace fingerprint' : 'Add fingerprint'}</button><button class="btn" data-action="lock-now">Lock now</button><button class="btn danger" data-action="security-off" ${on ? '' : 'disabled'}>Turn off</button></div><p class="hint">The lock lives on this device only.</p></div>`;
  },

  learn() {
    const done = completedWeeks();
    const count = done.size;
    const next = weeks.findIndex((_, i) => !done.has(i));
    return `
      <div class="page-head"><h1>Learn</h1><p>The 12-week forex program that started this project — about 3–5 hours a week.</p></div>
      <div class="card"><div class="section-head"><h2 class="card-title">Progress</h2><span class="row-value"><strong>${count}</strong> / ${weeks.length} weeks</span></div><div class="progress-track"><span style="width:${(count / weeks.length) * 100}%"></span></div><p class="hint">${count === weeks.length ? 'Program complete.' : next === -1 ? '' : `Next up: Week ${next + 1} — ${weeks[next].title}.`}</p></div>
      <div class="section">${weeks.map((w, i) => `<article class="week ${done.has(i) ? 'is-complete' : ''}"><details ${i === next ? 'open' : ''}><summary><span class="week-num">${String(i + 1).padStart(2, '0')}</span><span class="week-title"><small>${w.phase}</small><strong>${w.title}</strong></span><span class="week-plus" aria-hidden="true">+</span></summary><div class="week-body"><p>${w.goal}</p><h3>Study</h3><ul>${w.lessons.map((l) => `<li>${l}</li>`).join('')}</ul><h3>Practice</h3><p>${w.practice}</p><h3>Suggested sources</h3><p style="color:var(--muted)">${w.sources.join(' · ')}</p><label class="check-row"><input type="checkbox" data-action="week" data-index="${i}" ${done.has(i) ? 'checked' : ''}> Mark this week complete</label></div></details></article>`).join('')}</div>`;
  }
};

function render() {
  route = routeFromHash();
  rollDay();
  renderNav();
  appEl.innerHTML = PAGES[route] ? PAGES[route]() : PAGES.desk();
  document.title = `Rikx — ${ROUTES.find((r) => r.key === route)?.label || 'Desk'}`;
  const rateEl = document.getElementById('feed-chip');
  if (rateEl) {
    rateEl.title = `Indicative USD→PGK rate from ${exchange.source}.`;
    rateEl.textContent = `PGK ${usdToPngRate().toFixed(2)}`;
  }
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'execute') {
    const signal = computeSignal(pairBySym(button.dataset.pair));
    executeSignal(signal);
    return;
  }
  if (action === 'rescan') {
    market.forEach((m) => { m.momentum = rand(1.2); });
    tickMarket();
    render();
    toast('Rescanned the majors.');
    return;
  }
  if (action === 'tab') {
    tradeTab = button.dataset.tab;
    render();
    return;
  }
  if (action === 'ask-rikx' || action === 'suggest') {
    if (action === 'suggest') {
      const prompt = button.dataset.prompt;
      state.messages.push({ role: 'user', text: prompt, ts: Date.now() });
      state.messages.push({ role: 'assistant', text: answerRikx(prompt), ts: Date.now() });
      state.messages = state.messages.slice(-60);
      save();
    }
    navigate('messages');
    return;
  }
  if (action === 'mark-read') {
    state.alerts.forEach((a) => { a.read = true; });
    save();
    render();
    return;
  }
  if (action === 'close-position') {
    const index = state.paper.open.findIndex((p) => p.id === button.dataset.id);
    if (index >= 0) {
      const pos = state.paper.open[index];
      const m = pairBySym(pos.pair);
      const dir = pos.dir === 'LONG' ? 1 : -1;
      const pnl = (m.price - pos.entry) * dir * pos.size;
      state.paper.realized += pnl;
      state.paper.open.splice(index, 1);
      state.paper.closed.unshift({ ...pos, exit: m.price, closedAt: Date.now(), pnl, outcome: 'manual' });
      addAlert('stop', `${pos.pair} closed manually`, `${pnl >= 0 ? '+' : ''}${money(pnl)} at ${m.price.toFixed(m.digits)}.`);
      save(true);
      render();
    }
    return;
  }
  if (action === 'remove-account') {
    state.accounts = state.accounts.filter((a) => a.id !== button.dataset.id);
    save(true);
    render();
    toast('Account removed from this browser.');
    return;
  }
  if (action === 'broker') {
    accountDraft.broker = button.dataset.broker;
    render();
    return;
  }
  if (action === 'notify') {
    if (!('Notification' in window)) return toast('This browser has no notification support.');
    Notification.requestPermission().then((result) => {
      toast(result === 'granted' ? 'Notifications allowed on this device.' : 'Notifications were not allowed.');
    });
    return;
  }
  if (action === 'lock-now') {
    if (!state.security.pinHash && !state.security.credentialId) return toast('Set a PIN or a fingerprint first.');
    lockDesk();
    return;
  }
  if (action === 'security-off') {
    const pin = prompt('Enter your current PIN to turn the device lock off (leave blank if you only added a fingerprint).');
    if (pin === null) return;
    if (state.security.pinHash) {
      verifyPin(pin).then((ok) => {
        if (!ok) return toast('That PIN did not match.');
        state.security = { pinHash: null, salt: null, credentialId: null };
        save(true);
        render();
        toast('Device lock turned off.');
      });
      return;
    }
    state.security = { pinHash: null, salt: null, credentialId: null };
    save(true);
    render();
    toast('Device lock turned off.');
    return;
  }
  if (action === 'biometric-add') {
    addFingerprint();
  }
});

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.dataset.action === 'week') {
    const done = completedWeeks();
    const index = Number(el.dataset.index);
    if (el.checked) done.add(index); else done.delete(index);
    saveCompletedWeeks(done);
    render();
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;

  if (form.id === 'chat-form') {
    event.preventDefault();
    const input = form.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text) return;
    state.messages.push({ role: 'user', text, ts: Date.now() });
    state.messages.push({ role: 'assistant', text: answerRikx(text), ts: Date.now() });
    state.messages = state.messages.slice(-60);
    save(true);
    render();
    document.getElementById('chat-input')?.focus();
    const log = document.getElementById('chat-log');
    if (log) log.scrollTop = log.scrollHeight;
    return;
  }

  if (form.id === 'limits-form') {
    event.preventDefault();
    const data = new FormData(form);
    const next = {
      startBalance: clamp(Number(data.get('startBalance')) || 10000, 100, 10000000),
      riskPct: clamp(Number(data.get('riskPct')) || 1, 0.1, 10),
      dailyLossPct: clamp(Number(data.get('dailyLossPct')) || 3, 0.5, 50),
      maxPositions: clamp(Math.round(Number(data.get('maxPositions')) || 4), 1, 20),
      convictionFloor: clamp(Math.round(Number(data.get('convictionFloor')) || 55), 0, 95)
    };
    state.limits = next;
    if (!state.paper.open.length && !state.paper.closed.length) state.paper.dayStart = equity();
    save(true);
    render();
    toast('Limits saved.');
    addAlert('request', 'Risk limits updated', `${next.riskPct}% per trade, ${next.dailyLossPct}% daily circuit, ${next.maxPositions} max open, conviction floor ${next.convictionFloor}.`);
    return;
  }

  if (form.id === 'account-form') {
    event.preventDefault();
    const data = new FormData(form);
    const account = {
      id: `acc${Date.now()}`,
      broker: accountDraft.broker,
      label: String(data.get('label') || accountDraft.broker).slice(0, 60),
      accountId: String(data.get('accountId') || '').slice(0, 60),
      token: String(data.get('token') || '').slice(0, 200),
      environment: data.get('environment') === 'live' ? 'live' : 'practice'
    };
    state.accounts.push(account);
    save(true);
    render();
    toast('Account saved in this browser only — no connection was made.');
    addAlert('request', 'Account added', `${account.label} (${account.broker}) was stored locally. No credential was transmitted.`);
    return;
  }

  if (form.id === 'pin-form') {
    event.preventDefault();
    const pin = String(new FormData(form).get('pin') || '');
    if (!/^\d{6}$/.test(pin)) return toast('Choose exactly 6 digits.');
    setPin(pin);
    return;
  }

  if (form.id === 'unlock-form') {
    event.preventDefault();
    const pin = form.querySelector('#unlock-pin').value;
    verifyPin(pin).then((ok) => {
      if (ok) unlockDesk();
      else {
        document.getElementById('lock-error').textContent = 'Wrong PIN. Try again.';
        form.querySelector('#unlock-pin').value = '';
      }
    });
  }
});

const enc = new TextEncoder();
const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function derivePin(pin, saltB64) {
  if (!window.crypto?.subtle) throw new Error('Web Crypto is unavailable here — open the site over https or localhost.');
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(saltB64), iterations: 150000, hash: 'SHA-256' }, key, 256);
  return b64(bits);
}

async function setPin(pin) {
  try {
    const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    state.security.pinHash = await derivePin(pin, salt);
    state.security.salt = salt;
    save(true);
    render();
    toast('PIN saved on this device.');
  } catch (error) {
    toast(error.message);
  }
}

async function verifyPin(pin) {
  if (!state.security.pinHash || !state.security.salt) return false;
  try { return (await derivePin(pin, state.security.salt)) === state.security.pinHash; }
  catch { return false; }
}

async function addFingerprint() {
  if (!window.PublicKeyCredential) return toast('This browser has no WebAuthn support.');
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Rikx Desk' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'desk@local', displayName: 'Rikx desk' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { userVerification: 'preferred' },
        timeout: 60000
      }
    });
    if (!credential) return;
    state.security.credentialId = b64(credential.rawId);
    save(true);
    render();
    toast('Fingerprint added on this device.');
  } catch (error) {
    toast(`Fingerprint setup failed: ${error.message || 'cancelled'}`);
  }
}

async function unlockWithFingerprint() {
  if (!state.security.credentialId) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: unb64(state.security.credentialId), type: 'public-key' }],
        userVerification: 'preferred',
        timeout: 60000
      }
    });
    return Boolean(assertion);
  } catch { return false; }
}

const lockScreen = document.getElementById('lock-screen');

function lockDesk() {
  lockScreen.hidden = false;
  document.getElementById('lock-error').textContent = '';
  document.getElementById('lock-copy').textContent = 'Enter your PIN to open the desk.';
  document.getElementById('unlock-biometric').hidden = !state.security.credentialId;
  document.getElementById('unlock-pin').focus();
}

function unlockDesk() {
  lockScreen.hidden = true;
  document.getElementById('unlock-pin').value = '';
  document.getElementById('lock-error').textContent = '';
}

document.getElementById('unlock-biometric').addEventListener('click', async () => {
  const ok = await unlockWithFingerprint();
  if (ok) unlockDesk();
  else document.getElementById('lock-error').textContent = 'Fingerprint was not accepted.';
});

document.getElementById('lock-btn').innerHTML = ICONS.lock;
document.getElementById('lock-btn').addEventListener('click', () => {
  if (!state.security.pinHash && !state.security.credentialId) {
    toast('Set a PIN in Security first — then this button locks the desk.');
    navigate('security');
    return;
  }
  lockDesk();
});

window.addEventListener('hashchange', render);

refreshExchangeRate();
tickMarket();
setInterval(() => {
  refreshExchangeRate();
  tickMarket();
  if (['desk', 'markets', 'trades'].includes(route)) render();
}, 1600);

render();
if (state.security.pinHash || state.security.credentialId) lockDesk();
else document.getElementById('lock-copy').textContent = 'Enter your PIN to open the desk.';
if (!state.alerts.length) addAlert('request', 'Desk ready', 'Paper account funded with a PGK base, with live-rate conversion from USD to PGK.');
save(true);
