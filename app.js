'use strict';

/*
 * Rikx — paper forex desk.
 * Rebuilt from the Base44 desk app as a dependency-free static build.
 * All prices are simulated in the browser; no broker, no server, no real money.
 */

/* ------------------------------------------------------------------ icons */
const ICONS = {
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 20V9"/></svg>',
  markets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 17l5-6 4 3 4-6 5 4"/><path d="M3 21h18"/></svg>',
  trades: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  messages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12z"/></svg>',
  accounts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M7 15h4"/></svg>',
  firewall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path d="M9.5 12.2l1.8 1.8 3.4-3.6"/></svg>',
  alerts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 19a2 2 0 0 0 3 0"/></svg>',
  security: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v16H5.5A2.5 2.5 0 0 0 3 22V6.5z"/><path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v16h5.5A2.5 2.5 0 0 1 21 22V6.5z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 11a8 8 0 1 0-2.3 6.4"/><path d="M20 5v6h-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12.5l5 5L20 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  sources: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 13a5 5 0 0 0 7.1 0l2.1-2.1a5 5 0 0 0-7.1-7.1L11 5"/><path d="M14 11a5 5 0 0 0-7.1 0l-2.1 2.1a5 5 0 0 0 7.1 7.1L13 19"/></svg>'
};

/* ---------------------------------------------------------------- helpers */
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const money = (value) => {
  const n = Number(value) || 0;
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const signed = (value) => (Number(value) > 0 ? '+' : '') + money(value);
const todayKey = () => new Date().toISOString().slice(0, 10);
const rand = (spread = 1) => (Math.random() - 0.5) * 2 * spread;

const timeAgo = (ts) => {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

/* ---------------------------------------------------------------- storage */
const STORE_KEY = 'rikx-desk-v1';
const LEARNING_KEY = 'rikx-learning-program-v1';

const READER_DEFAULT = 'https://r.jina.ai/';

const defaultState = () => ({
  limits: { startBalance: 10000, riskPct: 1, dailyLossPct: 3, maxPositions: 4, convictionFloor: 55 },
  paper: { realized: 0, dayStart: 10000, day: todayKey(), open: [], closed: [] },
  alerts: [],
  accounts: [],
  messages: [],
  memory: [],
  sources: [],
  settings: { reader: READER_DEFAULT },
  security: { pinHash: null, salt: null, credentialId: null }
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
    settings: { ...base.settings, ...(raw.settings || {}) },
    security: { ...base.security, ...(raw.security || {}) }
  };
  if (!Array.isArray(merged.paper.open)) merged.paper.open = [];
  if (!Array.isArray(merged.paper.closed)) merged.paper.closed = [];
  if (!Array.isArray(merged.alerts)) merged.alerts = [];
  if (!Array.isArray(merged.accounts)) merged.accounts = [];
  if (!Array.isArray(merged.messages)) merged.messages = [];
  if (!Array.isArray(merged.memory)) merged.memory = [];
  if (!Array.isArray(merged.sources)) merged.sources = [];
  return merged;
}

let state = loadState();
let saveTimer = null;
function save(immediate = false) {
  clearTimeout(saveTimer);
  const write = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch { toast('Could not save to this browser — storage may be full or blocked.'); }
  };
  if (immediate) write(); else saveTimer = setTimeout(write, 250);
}

/* ------------------------------------------------------------ market engine */
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
  // Seed a plausible session: the open sits away from the current level so the
  // day's change, structure and conviction all have something to read.
  const sessionChange = rand(1.8) / 100;
  const open = def.base / (1 + sessionChange);
  const history = [];
  const steps = 26;
  const step = (def.base - open) / steps;
  for (let i = 0; i <= steps; i += 1) {
    history.push(open + step * i + rand(def.base * def.vol * 4));
  }
  return {
    ...def,
    open,
    price: def.base,
    momentum: rand(0.4),
    history
  };
});

const pipSize = (m) => (m.digits === 3 ? 0.01 : 0.0001);

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

/* ---------------------------------------------------------------- playbook */
/*
 * Rikx cannot reason about a whole article in a static page, so the "learning"
 * here is deliberate and narrow: a link is read, its text is scanned for the
 * concepts below, and each concept becomes a filed lesson. Filed lessons nudge
 * conviction on setups with a matching structure. It is keyword digestion, and
 * the UI says so — it is not comprehension and it is not a strategy.
 */
const CONCEPTS = [
  { tag: 'risk', label: 'Risk first', words: ['risk', 'position size', 'position sizing', 'lot size', 'drawdown', 'exposure'], takeaway: 'Size from the loss you can take, not from how good the idea feels.' },
  { tag: 'stops', label: 'Invalidation', words: ['stop loss', 'stop-loss', 'stops', 'invalidation', 'invalidate'], takeaway: 'An idea is not a trade until there is a level that proves it wrong.' },
  { tag: 'liquidity', label: 'Liquidity', words: ['liquidity', 'stop hunt', 'stop run', 'order block', 'supply', 'demand', 'imbalance', 'fair value gap', 'sweep'], takeaway: 'Resting orders sit at obvious levels; entries taken there need room behind the stop.' },
  { tag: 'trend', label: 'Trend', words: ['trend', 'momentum', 'breakout', 'higher high', 'higher low', 'trending'], takeaway: 'In a trend the pullback is the entry and the trend carries the target.' },
  { tag: 'range', label: 'Range / mean reversion', words: ['range', 'reversion', 'reversal', 'fade', 'overbought', 'oversold'], takeaway: 'In a range the edges pay and the middle is noise.' },
  { tag: 'session', label: 'Session timing', words: ['london', 'new york', 'asian', 'session', 'overlap', 'killzone'], takeaway: 'Timing clusters the movement — most FX action lands in the London/New York overlap.' },
  { tag: 'news', label: 'News risk', words: ['news', 'nfp', 'non-farm', 'cpi', 'fomc', 'interest rate', 'central bank', 'announcement'], takeaway: 'Scheduled data can gap through a stop; stand aside unless the plan prices it.' },
  { tag: 'psychology', label: 'Process & psychology', words: ['discipline', 'patience', 'journal', 'revenge', 'emotion', 'fomo', 'psychology', 'mistake'], takeaway: 'A plain plan followed beats a clever idea abandoned halfway.' },
  { tag: 'testing', label: 'Evidence', words: ['backtest', 'win rate', 'expectancy', 'sample size', 'forward test', 'statistics'], takeaway: 'Judge a method on expectancy and drawdown over many trades, not a hot week.' },
  { tag: 'indicators', label: 'Indicators', words: ['rsi', 'macd', 'ema', 'moving average', 'stochastic', 'bollinger', 'indicator'], takeaway: 'Indicators are transformed past price — they lag and can contradict structure.' },
  { tag: 'price-action', label: 'Price action', words: ['candlestick', 'pin bar', 'engulfing', 'price action', 'chart pattern', 'support', 'resistance', 'wick'], takeaway: 'Read the reaction at a level before trusting the name of the pattern.' }
];

const STRUCTURE_TAGS = {
  trending: ['trend', 'price-action', 'indicators'],
  ranging: ['range', 'liquidity', 'price-action']
};

function playbookBonus(structure) {
  const tags = STRUCTURE_TAGS[structure] || [];
  const hits = state.sources.reduce((n, s) => n + (s.lessons || []).filter((l) => tags.includes(l.tag)).length, 0);
  return Math.min(5, hits);
}

function playbookThemes() {
  const counts = new Map();
  state.sources.forEach((s) => (s.lessons || []).forEach((l) => counts.set(l.label, (counts.get(l.label) || 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function digest(text) {
  const lower = ` ${String(text || '').toLowerCase().replace(/\s+/g, ' ')} `;
  return CONCEPTS.map((c) => {
    const hits = c.words.reduce((n, w) => n + (lower.split(w).length - 1), 0);
    return { tag: c.tag, label: c.label, text: c.takeaway, hits };
  }).filter((c) => c.hits > 0).sort((a, b) => b.hits - a.hits).slice(0, 6);
}

/* ----------------------------------------------------------------- signals */
function computeSignal(m) {
  const recent = m.history.slice(-24);
  const change = pctChange(m);
  const trending = Math.abs(change) >= 0.3;
  // Trending: follow the session. Ranging: fade it. Keeps direction and the
  // structure label telling the same story.
  const dir = (change >= 0) === trending ? 'LONG' : 'SHORT';
  const dirNum = dir === 'LONG' ? 1 : -1;
  let sameDirection = 0;
  for (let i = 1; i < recent.length; i += 1) {
    if (Math.sign(recent[i] - recent[i - 1]) === dirNum) sameDirection += 1;
  }
  const consistency = recent.length > 1 ? sameDirection / (recent.length - 1) : 0.5;
  const convictionBase = clamp(Math.round(42 + Math.abs(change) * 11 + consistency * 26), 18, 94);
  const boost = playbookBonus(trending ? 'trending' : 'ranging');
  const conviction = clamp(convictionBase + boost, 18, 94);

  let atr = 0;
  for (let i = 1; i < recent.length; i += 1) atr += Math.abs(recent[i] - recent[i - 1]);
  atr = atr / Math.max(1, recent.length - 1);
  const stopDistance = Math.max(atr * 5.5, m.price * 0.00045);
  const stop = dir === 'LONG' ? m.price - stopDistance : m.price + stopDistance;
  const target = dir === 'LONG' ? m.price + stopDistance * 2 : m.price - stopDistance * 2;

  return {
    pair: m.sym,
    digits: m.digits,
    dir,
    entry: m.price,
    stop,
    target,
    stopDistance,
    conviction,
    convictionBase,
    boost,
    structure: trending ? 'trending' : 'ranging',
    change
  };
}

const signals = () => market.map(computeSignal);

/* ------------------------------------------------------------- paper account */
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

/* ---------------------------------------------------------------- chat send */
async function sendChat(text) {
  const clean = String(text || '').trim();
  if (!clean) return;
  state.messages.push({ role: 'user', text: clean, ts: Date.now() });
  const found = clean.match(URL_RE);
  const reply = found ? await ingestLink(found[0], clean) : answerRikx(clean);
  state.messages.push({ role: 'assistant', text: reply, ts: Date.now() });
  state.messages = state.messages.slice(-60);
  save(true);
  render();
  const log = document.getElementById('chat-log');
  if (log) log.scrollTop = log.scrollHeight;
  document.getElementById('chat-input')?.focus();
}

/** Every order passes these gates. Returns { ok, reason }. */
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
  const m = pairBySym(signal.pair);
  state.paper.open.push({
    id: `p${Date.now()}`,
    pair: signal.pair,
    dir: signal.dir,
    entry: signal.entry,
    stop: signal.stop,
    target: signal.target,
    size,
    riskUsd,
    conviction: signal.conviction,
    openedAt: Date.now()
  });
  addAlert('open', `Paper fill · ${signal.pair} ${signal.dir.toLowerCase()}`,
    `${money(riskUsd)} at risk, stop ${signal.stop.toFixed(signal.digits)}, target ${signal.target.toFixed(signal.digits)}.`);
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
    state.paper.closed.unshift({
      ...pos,
      exit,
      closedAt: Date.now(),
      pnl,
      outcome: pnl >= 0 ? 'target' : 'stop'
    });
    addAlert(
      hitTarget ? 'payout' : 'stop',
      hitTarget ? `${pos.pair} paid out` : `${pos.pair} stopped out`,
      `${pnl >= 0 ? '+' : ''}${money(pnl)} on ${pos.dir.toLowerCase()} at ${exit.toFixed(m.digits)}.`
    );
    toast(`${pos.pair} closed ${pnl >= 0 ? 'in profit' : 'at the stop'} · ${signed(pnl)}`);
    save(true);
  }
}

/* ------------------------------------------------------------------ alerts */
function addAlert(kind, title, body) {
  state.alerts.unshift({ id: `a${Date.now()}${Math.random().toString(16).slice(2, 6)}`, kind, title, body, ts: Date.now(), read: false });
  state.alerts = state.alerts.slice(0, 80);
  save();
}
const unreadCount = () => state.alerts.filter((a) => !a.read).length;

/* -------------------------------------------------------------- link reader */
const MAX_TEXT = 20000;
const URL_RE = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;

function normalizeUrl(input) {
  const raw = String(input || '').trim().replace(/[)\].,]+$/, '');
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
  try {
    const u = new URL(withScheme);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null;
    return u;
  } catch { return null; }
}

function platformOf(u) {
  const h = u.hostname.replace(/^www\./, '');
  if (/youtube\.com$|youtu\.be$|youtube-nocookie\.com$/.test(h)) return 'YouTube';
  if (/^(x|twitter)\.com$/.test(h)) return 'X';
  if (/instagram\.com$/.test(h)) return 'Instagram';
  if (/tiktok\.com$/.test(h)) return 'TikTok';
  if (/reddit\.com$/.test(h)) return 'Reddit';
  if (/forexfactory\.com$/.test(h)) return 'Forex Factory';
  if (/babypips\.com$/.test(h)) return 'BabyPips';
  if (/tradingview\.com$/.test(h)) return 'TradingView';
  if (/wikipedia\.org$/.test(h)) return 'Wikipedia';
  if (/\.(pdf)$/i.test(u.pathname)) return 'PDF';
  return 'Article';
}

function htmlToText(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,noscript,nav,footer,header,aside,form,svg,iframe,button').forEach((n) => n.remove());
    const title = (doc.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
    const blocks = [...doc.querySelectorAll('article p, article li, main p, main li, p, li, h1, h2, h3, blockquote')]
      .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
      .filter((t) => t.length >= 60);
    return { title, text: [...new Set(blocks)].join('\n').slice(0, MAX_TEXT) };
  } catch { return { title: '', text: '' }; }
}

async function fetchText(target, ms = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(target, {
      signal: ctrl.signal,
      credentials: 'omit',
      redirect: 'follow',
      headers: { Accept: 'text/html,text/plain,text/markdown,*/*' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { body: await res.text(), type: res.headers.get('content-type') || '' };
  } finally { clearTimeout(timer); }
}

/* Bot checks, consent walls and error pages read like content but are not. */
const BLOCK_MARKERS = [
  'just a moment', 'enable javascript', 'checking your browser', 'attention required',
  'access denied', 'verify you are human', 'captcha', 'are you a robot', 'request blocked',
  '403 forbidden', 'cloudflare', 'subscribe to continue', 'sign in to continue'
];

function looksBlocked(text) {
  const low = String(text || '').toLowerCase().slice(0, 6000);
  if (low.trim().length < 400) return true;
  return BLOCK_MARKERS.some((marker) => low.includes(marker));
}

/** Try the site directly, then the optional reader service. Returns { text, title, via }. */
async function readLink(u) {
  const host = u.hostname.replace(/^www\./, '');
  const attempts = [];
  if (/wikipedia\.org$/.test(host)) {
    const title = decodeURIComponent(u.pathname.split('/').pop() || '').replace(/\.html?$/, '').replace(/_/g, ' ');
    if (title) attempts.push({ via: 'Wikipedia API', url: `https://${host}/w/api.php?action=query&format=json&prop=extracts&explaintext=1&redirects=1&origin=*&titles=${encodeURIComponent(title)}` });
  }
  attempts.push({ via: 'direct', url: u.href });
  const reader = String(state.settings.reader || '').trim();
  if (reader) attempts.push({ via: 'reader', url: reader.replace(/\/?$/, '/') + u.href });

  for (const attempt of attempts) {
    try {
      const { body, type } = await fetchText(attempt.url);
      if (attempt.via === 'Wikipedia API') {
        const json = JSON.parse(body);
        const page = Object.values(json?.query?.pages || {})[0] || {};
        const text = String(page.extract || '').slice(0, MAX_TEXT);
        if (text.length > 200) return { text, title: page.title || '', via: attempt.via };
        continue;
      }
      if (/^\s*\{/.test(body) && /json/i.test(type)) {
        // Some reader services answer with an error envelope instead of text.
        continue;
      }
      const isHtml = /html/i.test(type) || /^\s*<(!doctype|html)/i.test(body);
      const parsed = isHtml
        ? htmlToText(body)
        : { title: (body.split('\n').find((l) => l.startsWith('Title:')) || '').replace(/^Title:\s*/, '').trim(), text: body.replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_TEXT) };
      if (!looksBlocked(parsed.text)) return { text: parsed.text, title: parsed.title, via: attempt.via };
    } catch { /* try the next route */ }
  }
  return { text: '', title: '', via: null };
}

function sourceTitle(u, read) {
  const clean = (read.title || '').replace(/\s+/g, ' ').trim();
  if (clean) return clean.slice(0, 92);
  const line = (read.text || '').split('\n').map((s) => s.trim()).find((s) => s.length > 20);
  return line ? line.slice(0, 92) : u.hostname.replace(/^www\./, '');
}

/** Read a link (or pasted text), file its concepts, and explain what was filed. */
async function ingestLink(rawUrl, pasted = '') {
  const u = normalizeUrl(rawUrl);
  if (!u) return 'That does not look like a link. Send something like https://example.com/article.';
  const paste = String(pasted || '').trim();
  const read = paste.length >= 200
    ? { text: paste.slice(0, MAX_TEXT), title: `${platformOf(u)} · pasted notes`, via: 'pasted text' }
    : await readLink(u);

  if (!read.text) {
    return `I could not open ${u.hostname.replace(/^www\./, '')} from this browser — the site blocks cross-origin reads, or the reader service refused it. Nothing was learned from it yet. Paste the transcript or the main points on the Sources page and I will digest those instead.`;
  }

  const lessons = digest(read.text);
  if (!lessons.length) {
    return `I got ${read.text.length.toLocaleString('en-US')} characters from ${u.hostname.replace(/^www\./, '')}, but none of it reads like trading content — likely navigation, a paywall or a bot check. Nothing was filed. Paste the transcript or the key points on the Sources page and I will digest those.`;
  }
  const source = {
    id: `src${Date.now()}`,
    url: u.href,
    host: u.hostname.replace(/^www\./, ''),
    platform: platformOf(u),
    title: sourceTitle(u, read),
    chars: read.text.length,
    text: read.text.slice(0, MAX_TEXT),
    via: read.via || 'unknown',
    at: Date.now(),
    lessons
  };
  state.sources = [source, ...state.sources].slice(0, 40);
  save(true);
  addAlert('request', `Studied a ${source.platform} link`, `${source.title} — ${lessons.length} concept${lessons.length === 1 ? '' : 's'} filed to the playbook.`);

  const filed = lessons.length
    ? lessons.slice(0, 3).map((l) => `${l.label} (${l.hits} mention${l.hits === 1 ? '' : 's'})`).join(', ')
    : 'no concept keywords I recognise';
  return `Read “${source.title}” from ${source.host} — ${source.chars.toLocaleString('en-US')} characters via ${source.via}. ` +
    `Filed: ${filed}. That is keyword-level digestion, not comprehension: the takeaways are mine, not the author's words. ` +
    `The playbook now adds +${playbookBonus('trending')} to trending setups and +${playbookBonus('ranging')} to ranging ones.`;
}

/* -------------------------------------------------------------------- chat */
function deskSnapshot() {
  const eq = equity();
  const open = state.paper.open;
  const dayPnl = eq - state.paper.dayStart;
  return { eq, open, dayPnl, realized: state.paper.realized };
}

function answerRikx(input) {
  const text = String(input || '').trim();
  const lower = text.toLowerCase();
  const snap = deskSnapshot();
  const L = state.limits;

  const remember = text.match(/^(?:rikx[, ]+)?remember(?: that)?[: ]+(.+)$/i);
  if (remember) {
    const note = remember[1].trim().slice(0, 180);
    if (note.length < 3) return 'Tell me what to remember, e.g. “Remember that I prefer simple explanations.”';
    state.memory.push(note);
    state.memory = state.memory.slice(-12);
    save();
    return `Saved on this device: “${note}”. It stays in this browser and is used to shape these replies only.`;
  }
  if (/forget (that|it|everything|my notes)|clear memory/.test(lower)) {
    state.memory = [];
    save();
    return 'Cleared the desk notes stored in this browser.';
  }

  if (/position|p&l|pnl|doing|open trade/.test(lower)) {
    if (!snap.open.length) {
      return `No open positions. Equity is ${money(snap.eq)}, today ${signed(snap.dayPnl)} against a ${money(-(state.paper.dayStart * L.dailyLossPct / 100))} circuit. Nothing on the book means nothing at risk.`;
    }
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
      return `${sym} at ${fmtPrice(m)} (${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}% this session), ${s.structure}. Structure reads ${s.dir} with conviction ${s.conviction}; stop ${s.stop.toFixed(m.digits)} and target ${s.target.toFixed(m.digits)}. ` +
        (s.conviction >= L.convictionFloor ? 'That clears your conviction floor — the firewall would size it.' : `That is under your conviction floor of ${L.convictionFloor}, so the desk stands aside.`) +
        ' This is simulated price action, not a forecast.';
    }
  }

  if (/setup|worth taking|scan|trade right now|signal/.test(lower)) {
    const ranked = signals().filter((s) => s.conviction >= L.convictionFloor).sort((a, b) => b.conviction - a.conviction);
    if (!ranked.length) return `Nothing clears the ${L.convictionFloor} conviction floor right now, so the honest answer is no trade. Standing aside is a position too.`;
    const best = ranked[0];
    const verdict = firewallCheck(best);
    return `Best read: ${best.pair} ${best.dir.toLowerCase()} at ${best.entry.toFixed(best.digits)}, conviction ${best.conviction}, stop ${best.stop.toFixed(best.digits)}, target ${best.target.toFixed(best.digits)}. ` +
      (verdict.ok ? `The firewall clears it — it would risk ${money(equity() * (L.riskPct / 100))} of ${money(equity())}.` : `The firewall blocks it: ${verdict.reason}`);
  }

  if (/firewall|size a trade|position size|risk/.test(lower)) {
    const riskUsd = equity() * (L.riskPct / 100);
    return `Sizing: risk ${L.riskPct}% of ${money(equity())} = ${money(riskUsd)} per trade. Units = ${money(riskUsd)} / stop distance. Gates: conviction ≥ ${L.convictionFloor}, max ${L.maxPositions} open, ${L.dailyLossPct}% daily loss circuit, and at most 2 positions betting the same way on USD.`;
  }

  if (/what is (a )?pip|\bpips\b/.test(lower)) return 'A pip is a conventional unit for a forex price move — typically 0.0001 for most pairs and 0.01 for many JPY pairs. Its money value depends on pair, size and account currency.';
  if (/leverage|margin/.test(lower)) return 'Leverage is exposure relative to the funds behind it. It magnifies losses as well as gains, and a stop order does not guarantee an exit price. The paper desk sizes from risk, not from confidence.';
  if (/spread|slippage|execution/.test(lower)) return 'Bid/ask spread and slippage are real costs. This simulator fills at the mid without spread, so paper results are optimistic — treat them as practice, not evidence.';
  if (/backtest|test a strateg|win rate/.test(lower)) return 'Test chronologically on data you did not use to build the rules, include spreads and slippage, and look at drawdown and after-cost expectancy — not just win rate. The desk forward-tests on a paper account only.';

  if (/what have you (learned|read)|sources|my links|playbook|studied/.test(lower)) {
    if (!state.sources.length) {
      return 'Nothing filed yet. Send me a link — a trader thread, a video, an article — or paste the transcript, and I will digest it into the playbook. Until then my conviction is just the price structure.';
    }
    const themes = playbookThemes().slice(0, 4).map(([label, n]) => `${label} (${n})`).join(', ');
    return `${state.sources.length} source${state.sources.length === 1 ? '' : 's'} filed. Strongest themes: ${themes}. ` +
      `Latest: “${state.sources[0].title}” from ${state.sources[0].host}. ` +
      `That shifts conviction by +${playbookBonus('trending')} on trending setups and +${playbookBonus('ranging')} on ranging ones. ` +
      'The digestion is keyword-based, so treat it as organised reading, not a proven edge.';
  }

  if (/study|learn|week|curriculum/.test(lower)) {
    const next = weeks.findIndex((_, i) => !completedWeeks().has(i));
    if (next === -1) return 'All 12 weeks are marked complete. Review your journal and limitations — finishing the program does not show a strategy works.';
    const week = weeks[next];
    return `Next up is Week ${next + 1}: ${week.title}. Goal: ${week.goal} Practice: ${week.practice}`;
  }

  if (/^(hi|hey|hello|yo)\b/.test(lower)) return `Hey. Your equity is ${money(snap.eq)}, ${snap.open.length} position${snap.open.length === 1 ? '' : 's'} open, and ${state.alerts.filter((a) => !a.read).length} unread alert${state.alerts.filter((a) => !a.read).length === 1 ? '' : 's'}. Ask me about a pair, the firewall, or a setup.`;

  const best = signals().sort((a, b) => b.conviction - a.conviction)[0];
  return `I can read the desk: positions, the firewall math, any major pair, or the next study week. Right now the strongest read is ${best.pair} ${best.dir.toLowerCase()} at conviction ${best.conviction}. I do not forecast prices, and this feed is simulated.`;
}

/* -------------------------------------------------------------------- weeks */
const weeks = [
  { title: 'Forex market basics', phase: 'FOUNDATIONS', goal: 'Understand what is traded and how currency prices are quoted.', lessons: ['Learn base and quote currencies, major/minor pairs, pips, lots, and leverage.', 'Compare spot forex with exchange-traded currency products; market structure varies by provider and jurisdiction.'], practice: 'Explain a sample EUR/USD quote and calculate a hypothetical pip value and notional size.', sources: ['CFTC Learn & Protect', 'NFA Investor Resources'] },
  { title: 'How the market works', phase: 'FOUNDATIONS', goal: 'Learn about participants, sessions, liquidity, and execution.', lessons: ['Study the roles of banks, businesses, funds, dealers, and retail providers.', 'Learn bid, ask, spread, market and limit orders, and slippage.'], practice: 'Compare timestamped demo bid/ask quotes at different times. Record observations; do not place a trade.', sources: ['BIS Triennial Survey', 'CME Group Education'] },
  { title: 'Leverage and risk', phase: 'FOUNDATIONS', goal: 'Recognize how leverage magnifies both gains and losses.', lessons: ['Work through hypothetical margin, position-size, and pip-value calculations.', 'Study gap, liquidity, counterparty, and provider risks; a stop order may not guarantee an exit price.'], practice: 'Write a risk checklist and calculate hypothetical loss scenarios for different position sizes.', sources: ['CFTC Learn & Protect', 'NFA Investor Resources'] },
  { title: 'Economic fundamentals', phase: 'FOUNDATIONS', goal: 'Connect currencies to economic data and policy without assuming simple cause and effect.', lessons: ['Review inflation, employment, growth, interest rates, and central-bank communications.', "Use primary sources; distinguish a release's actual value, expectations, and revisions."], practice: 'Summarize an official policy statement and two relevant economic indicators for one currency.', sources: ['Federal Reserve Monetary Policy', 'BIS Triennial Survey'] },
  { title: 'Reading charts thoughtfully', phase: 'ANALYSIS & RISK', goal: 'Read charts without treating patterns as certainty.', lessons: ['Learn candlesticks, timeframes, trend, range, support, and resistance as descriptive tools.', 'Understand that indicators transform price data and may lag or give false signals.'], practice: 'Annotate three historical charts using only information available at each timestamp.', sources: ['CME Group Education'] },
  { title: 'Build a testable hypothesis', phase: 'ANALYSIS & RISK', goal: 'Turn vague opinions into specific, falsifiable rules.', lessons: ['Define market, timeframe, entry condition, invalidation, exit, and when not to trade.', 'Separate observation from interpretation and record assumptions before reviewing outcomes.'], practice: 'Write one simple hypothetical strategy with unambiguous rules. No live orders or profit claims.', sources: ['CME Group Education'] },
  { title: 'Position sizing and guardrails', phase: 'ANALYSIS & RISK', goal: 'Make risk limits independent of confidence in a prediction.', lessons: ['Study potential loss, drawdown, correlated exposure, and daily stop rules.', 'Understand that sizing and stop-losses cannot eliminate market or execution risk.'], practice: 'Create a paper-only risk plan with a hypothetical maximum loss and stop-for-the-day rule.', sources: ['NFA Investor Resources', 'CFTC Learn & Protect'] },
  { title: 'Trading psychology and process', phase: 'ANALYSIS & RISK', goal: 'Develop repeatable decision habits and recognize cognitive biases.', lessons: ['Study overconfidence, loss aversion, confirmation bias, and revenge trading.', 'Create a pre-analysis checklist and define conditions for standing aside.'], practice: 'Review five historical scenarios and journal uncertainties and possible biases.', sources: ['CME Group Education'] },
  { title: 'Backtesting without fooling yourself', phase: 'PRACTICE & REVIEW', goal: 'Learn what historical tests can and cannot tell you.', lessons: ['Use chronological training and test periods; avoid look-ahead bias.', 'Include realistic spreads, fees, slippage, missing data, and varied market conditions.'], practice: 'Write a test protocol and reserve unseen data before tuning any rules.', sources: ['BIS Triennial Survey', 'CME Group Education'] },
  { title: 'Evaluate evidence', phase: 'PRACTICE & REVIEW', goal: 'Assess performance with more than a win rate.', lessons: ['Review after-cost expectancy, drawdown, sample size, and performance across regimes.', 'Check probability calibration and compare model ideas against simple baselines.'], practice: 'Design a timestamped signal log that records confidence before outcomes are known.', sources: ['CME Group Education'] },
  { title: 'Paper-trading simulation', phase: 'PRACTICE & REVIEW', goal: 'Practice following written rules without risking money.', lessons: ['Use simulated funds or a spreadsheet with timestamped prices and hypothetical costs.', 'Record rule changes and avoid changing rules mid-test without starting a new evaluation.'], practice: "Log hypothetical setups—or explicitly record 'no trade' when rules are not met. Practice is not proof of an edge.", sources: ['CFTC Learn & Protect', 'NFA Investor Resources'] },
  { title: 'Review and next steps', phase: 'PRACTICE & REVIEW', goal: 'Summarize learning, gaps, and a responsible next research plan.', lessons: ['Review your journal for data quality, rule-following, errors, and emotional patterns.', 'Write what evidence would change your mind and identify topics for further study.'], practice: 'Prepare a report with sources, methodology, costs, results, uncertainties, and lessons. Do not treat a short simulation as evidence of future profits.', sources: ['All program sources'] }
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

/* ------------------------------------------------------------------ routing */
const ROUTES = [
  { key: 'desk', label: 'Desk', icon: 'desk' },
  { key: 'markets', label: 'Markets', icon: 'markets' },
  { key: 'trades', label: 'Positions', icon: 'trades' },
  { key: 'messages', label: 'Messages', icon: 'messages' },
  { key: 'accounts', label: 'Accounts', icon: 'accounts' },
  { key: 'firewall', label: 'Firewall', icon: 'firewall' },
  { key: 'alerts', label: 'Alerts', icon: 'alerts' },
  { key: 'security', label: 'Security', icon: 'security' },
  { key: 'learn', label: 'Learn', icon: 'learn' },
  { key: 'sources', label: 'Sources', icon: 'sources' }
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

/* ------------------------------------------------------------------- render */
function render() {
  route = routeFromHash();
  rollDay();
  renderNav();
  const html = PAGES[route] ? PAGES[route]() : PAGES.desk();
  appEl.innerHTML = html;
  document.title = `Rikx — ${ROUTES.find((r) => r.key === route)?.label || 'Desk'}`;
}

/* --------------------------------------------------------------- page: desk */
function tickerHtml(count = 9) {
  return `<div class="ticker" aria-label="Simulated FX quotes">${market.slice(0, count).map((m) => {
    const change = pctChange(m);
    return `<div class="tick">
      <div class="tick-top"><span class="tick-sym">${m.sym}</span><span class="tick-chg ${change >= 0 ? 'up' : 'down'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></div>
      <span class="tick-price">${fmtPrice(m)}</span>
    </div>`;
  }).join('')}</div>`;
}

function positionsTable(positions) {
  if (!positions.length) {
    return `<div class="empty">No open positions. Rikx is scanning for setups that clear the firewall.</div>`;
  }
  return `<div class="table-wrap"><table>
    <thead><tr><th>PAIR</th><th>SIDE</th><th>ENTRY</th><th>NOW</th><th>STOP</th><th>TARGET</th><th>OPEN P&amp;L</th><th></th></tr></thead>
    <tbody>${positions.map((pos) => {
      const m = pairBySym(pos.pair);
      const dir = pos.dir === 'LONG' ? 1 : -1;
      const pnl = (m.price - pos.entry) * dir * pos.size;
      return `<tr>
        <td><span class="pair-sym">${pos.pair}</span></td>
        <td><span class="side ${pos.dir === 'LONG' ? 'long' : 'short'}">${pos.dir}</span></td>
        <td class="num">${pos.entry.toFixed(m.digits)}</td>
        <td class="num">${m.price.toFixed(m.digits)}</td>
        <td class="num">${pos.stop.toFixed(m.digits)}</td>
        <td class="num">${pos.target.toFixed(m.digits)}</td>
        <td class="num ${pnl >= 0 ? 'up' : 'down'}">${signed(pnl)}</td>
        <td><button class="btn small" data-action="close-position" data-id="${pos.id}">Close</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

const PAGES = {
  desk() {
    const eq = equity();
    const pnl = openPnl();
    const day = eq - state.paper.dayStart;
    const closed = state.paper.closed;
    const wins = closed.filter((t) => t.pnl > 0).length;
    return `
      ${tickerHtml(9)}
      <div class="stat-grid">
        <div class="stat"><span class="stat-label">Equity</span><span class="stat-value">${money(eq)}</span><span class="stat-foot">Started ${money(state.limits.startBalance)}</span></div>
        <div class="stat"><span class="stat-label">Today</span><span class="stat-value ${day >= 0 ? 'up' : 'down'}">${signed(day)}</span><span class="stat-foot">Limit ${state.limits.dailyLossPct}%</span></div>
        <div class="stat"><span class="stat-label">Open P&amp;L</span><span class="stat-value ${pnl >= 0 ? 'up' : 'down'}">${signed(pnl)}</span><span class="stat-foot">${state.paper.open.length} position${state.paper.open.length === 1 ? '' : 's'}</span></div>
        <div class="stat"><span class="stat-label">Win rate</span><span class="stat-value">${winRate()}%</span><span class="stat-foot">${closed.length} closed trade${closed.length === 1 ? '' : 's'}</span></div>
        <div class="stat"><span class="stat-label">Realized</span><span class="stat-value ${state.paper.realized >= 0 ? 'up' : 'down'}">${signed(state.paper.realized)}</span><span class="stat-foot">${wins}W / ${closed.length - wins}L</span></div>
      </div>

      <div class="desk-grid" style="margin-top:.9rem">
        <div>
          <div class="intel">
            <div>
              <h2>Rikx intelligence</h2>
              <p>Live market read, plan and what Rikx needs from you</p>
            </div>
            <button class="btn" data-action="ask-rikx">${ICONS.spark}<span>Ask Rikx</span></button>
          </div>

          <div class="section">
            <div class="section-head"><h2>Open positions</h2><span class="tagline">LIVE MARK-TO-MARKET</span></div>
            ${positionsTable(state.paper.open)}
          </div>
        </div>

        <div>
          <div class="section">
            <div class="section-head"><h2>Firewall</h2><span class="pill armed">ARMED</span></div>
            <div class="card">
              <ul class="rows">
                ${firewallRows()}
              </ul>
            </div>
          </div>

          <div class="section">
            <div class="section-head"><h2>Latest alerts</h2><span class="tagline">${unreadCount()} UNREAD</span></div>
            <div class="card">
              ${state.alerts.length ? state.alerts.slice(0, 4).map(alertHtml).join('') : '<p class="card-sub">Nothing yet. Rikx will notify you the moment a position pays out.</p>'}
            </div>
          </div>
        </div>
      </div>`;
  },

  markets() {
    const rows = signals().sort((a, b) => b.conviction - a.conviction);
    return `
      ${tickerHtml(9)}
      <div class="page-head page-title-row">
        <div>
          <h1>Market scan</h1>
          <p>15-minute structure across the majors. Every order is re-checked by the firewall before it is filled. Prices here are simulated.</p>
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          ${state.sources.length ? `<a class="pill armed" href="#/sources">PLAYBOOK ${state.sources.length}</a>` : ''}
          <button class="btn" data-action="rescan">${ICONS.refresh}<span>Rescan</span></button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>PAIR</th><th>PRICE</th><th>CHANGE</th><th>STRUCTURE</th><th>CONVICTION</th><th>STOP / TARGET</th><th>ACTION</th></tr></thead>
        <tbody>${rows.map((s) => {
          const m = pairBySym(s.pair);
          return `<tr>
            <td><div class="pair-cell"><span class="pair-sym">${s.pair}</span><span class="pair-meta">${s.structure}</span></div></td>
            <td class="num">${s.entry.toFixed(s.digits)}</td>
            <td class="num ${s.change >= 0 ? 'up' : 'down'}">${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%</td>
            <td><div class="structure">${sparkline(m.history, s.dir === 'LONG')}<span class="side ${s.dir === 'LONG' ? 'long' : 'short'}">${s.dir}</span></div></td>
            <td class="num">${s.conviction}${s.boost ? `<span class="conv-boost" title="+${s.boost} from your saved sources">+${s.boost}</span>` : ''}</td>
            <td class="num stop-target">${s.stop.toFixed(s.digits)} / ${s.target.toFixed(s.digits)}</td>
            <td><button class="btn small" data-action="execute" data-pair="${s.pair}">Execute</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>`;
  },

  trades() {
    const eq = equity();
    const closed = state.paper.closed;
    const wins = closed.filter((t) => t.pnl > 0).length;
    const list = tradeTab === 'open' ? positionsTable(state.paper.open) : (closed.length ? `
      <div class="table-wrap"><table>
        <thead><tr><th>PAIR</th><th>SIDE</th><th>ENTRY</th><th>EXIT</th><th>RESULT</th><th>CLOSED</th></tr></thead>
        <tbody>${closed.map((t) => `<tr>
          <td><span class="pair-sym">${t.pair}</span></td>
          <td><span class="side ${t.dir === 'LONG' ? 'long' : 'short'}">${t.dir}</span></td>
          <td class="num">${t.entry.toFixed(pairBySym(t.pair)?.digits ?? 5)}</td>
          <td class="num">${t.exit.toFixed(pairBySym(t.pair)?.digits ?? 5)}</td>
          <td class="num ${t.pnl >= 0 ? 'up' : 'down'}">${signed(t.pnl)}</td>
          <td class="num stop-target">${timeAgo(t.closedAt)}</td>
        </tr>`).join('')}</tbody>
      </table></div>` : '<div class="empty">No closed trades yet. Anything that hits its stop or target lands here.</div>');

    return `
      <div class="page-head"><h1>Positions</h1><p>Every fill Rikx has taken on the paper account, with full history.</p></div>
      <div class="stat-grid">
        <div class="stat"><span class="stat-label">Realized</span><span class="stat-value ${state.paper.realized >= 0 ? 'up' : 'down'}">${signed(state.paper.realized)}</span></div>
        <div class="stat"><span class="stat-label">Today</span><span class="stat-value ${eq - state.paper.dayStart >= 0 ? 'up' : 'down'}">${signed(eq - state.paper.dayStart)}</span></div>
        <div class="stat"><span class="stat-label">Win rate</span><span class="stat-value">${winRate()}%</span><span class="stat-foot">${closed.length} closed</span></div>
        <div class="stat"><span class="stat-label">Open</span><span class="stat-value">${state.paper.open.length}</span></div>
      </div>
      <div class="section">
        <div class="section-head">
          <h2>Live positions</h2>
          <div class="tabs" role="tablist">
            <button role="tab" aria-selected="${tradeTab === 'open'}" data-action="tab" data-tab="open">Open (${state.paper.open.length})</button>
            <button role="tab" aria-selected="${tradeTab === 'closed'}" data-action="tab" data-tab="closed">Closed (${closed.length})</button>
          </div>
        </div>
        ${list}
        <p class="hint" style="margin-top:.7rem">Account equity ${money(eq)} · simulated fills only, no live broker is connected.</p>
      </div>`;
  },

  messages() {
    const messages = state.messages.length ? state.messages : [{
      role: 'assistant',
      text: "This is your private line to Rikx. He answers with your live positions, the firewall rules and the current market read. Prices on this build are simulated.",
      ts: Date.now()
    }];
    return `
      <div class="page-head"><h1>Messages</h1><p>One private line to Rikx — he reads your live positions, the tape and the firewall, and answers with real numbers.</p></div>
      <div class="card chat-card">
        <div class="chat-head">
          <span class="chat-avatar">R</span>
          <div><strong>Rikx</strong><small>Desk assistant — reads your account and the tape</small></div>
          <span class="live-dot">LOCAL</span>
        </div>
        <div class="chat-log" id="chat-log">
          ${messages.map((msg) => `<div class="msg ${msg.role === 'user' ? 'mine' : ''}"><span class="msg-name">${msg.role === 'user' ? 'YOU' : 'RIKX'}</span><p>${esc(msg.text)}</p></div>`).join('')}
        </div>
        <div class="suggestions">
          ${['How are my positions doing?', "What's the read on EUR/USD?", 'Any setup worth taking right now?', 'How does the firewall size a trade?', 'What have you learned from my links?'].map((p) => `<button class="suggestion" type="button" data-action="suggest" data-prompt="${esc(p)}">${esc(p)}</button>`).join('')}
        </div>
        <form class="chat-form" id="chat-form">
          <label class="visually-hidden" for="chat-input">Message Rikx</label>
          <input class="input" id="chat-input" name="message" placeholder="Ask Rikx…" autocomplete="off" maxlength="400" required>
          <button class="btn primary" type="submit" aria-label="Send">${ICONS.send}</button>
        </form>
      </div>
      <div class="section card">
        <h2 class="card-title">How Rikx reaches you</h2>
        <ul class="rows">
          <li class="row"><span class="row-name">${ICONS.check}In-app messages</span><span class="row-value">Replies in this thread; payouts and stops go to Alerts</span></li>
          <li class="row"><span class="row-name">${ICONS.check}Browser notifications</span><span class="row-value">Optional, on this device only</span></li>
          <li class="row"><span class="row-name" style="color:var(--muted)">Background push</span><span class="row-value">Needs a published mobile build and a backend</span></li>
          <li class="row"><span class="row-name" style="color:var(--muted)">WhatsApp</span><span class="row-value">Needs a business number and channel setup</span></li>
        </ul>
        <button class="btn block" data-action="notify" type="button">Allow browser notifications</button>
      </div>`;
  },

  accounts() {
    return `
      <div class="page-head"><h1>Accounts</h1><p>The trading accounts Rikx may look at. There is no server on this build, so anything you enter stays in this browser and nothing can be verified.</p></div>
      <div class="card">
        ${state.accounts.length ? `<ul class="rows">${state.accounts.map((a) => `
          <li class="row">
            <span class="row-name">${ICONS.check}<span><strong style="color:var(--heading)">${esc(a.label)}</strong><br><span class="pair-meta">${esc(a.broker)} · ${esc(a.accountId)} · ${a.environment === 'live' ? 'LIVE' : 'practice'}</span></span></span>
            <span class="row-value"><button class="btn small danger" data-action="remove-account" data-id="${a.id}">Remove</button></span>
          </li>`).join('')}</ul>` : '<div class="empty">No accounts connected yet. Add one below — Rikx will list it, but nothing is transmitted.</div>'}
      </div>

      <div class="section card">
        <h2 class="card-title">Connect an account</h2>
        <p class="card-sub" style="margin-bottom:.9rem">On the original build these credentials were stored server-side against your login. Here they are kept in this browser only and never sent anywhere.</p>
        <div class="chip-group" role="group" aria-label="Broker">
          ${['OANDA', 'MetaTrader 4/5', 'cTrader'].map((b) => `<button class="chip" type="button" data-action="broker" data-broker="${b}" aria-pressed="${accountDraft.broker === b}">${b}</button>`).join('')}
        </div>
        <form id="account-form">
          <div class="field"><label class="field-label" for="acc-label">Label</label><input class="input" id="acc-label" name="label" value="${esc(accountDraft.broker)}" required></div>
          <div class="field"><label class="field-label" for="acc-id">Account ID</label><input class="input" id="acc-id" name="accountId" placeholder="101-004-1234567-001" required></div>
          <div class="field"><label class="field-label" for="acc-token">API token</label><input class="input" id="acc-token" name="token" type="password" placeholder="Stored locally, never transmitted" required></div>
          <div class="field"><label class="field-label" for="acc-env">Environment</label>
            <select class="select" id="acc-env" name="environment"><option value="practice">Practice / demo</option><option value="live">Live</option></select>
          </div>
          <p class="hint">No backend exists in this build, so the token cannot be verified and no orders can be sent.</p>
          <button class="btn primary" type="submit">${ICONS.plus}<span>Connect account</span></button>
        </form>
      </div>

      <div class="section card">
        <div class="section-head"><h2 class="card-title">Email</h2><span class="pill off">NOT CONNECTED</span></div>
        <p class="card-sub">The original app reads money mail (statements, payments, broker notices) through a server-side Gmail connection. This static build has no backend, so there is nothing to link and no inbox to show.</p>
        <div class="placeholder-list" style="margin-top:.8rem">
          <div class="placeholder-item"><span>${'Connect Gmail'}</span><span>needs a backend + OAuth</span></div>
          <div class="placeholder-item"><span>Email me a desk update</span><span>needs a mail provider</span></div>
        </div>
      </div>`;
  },

  firewall() {
    const L = state.limits;
    return `
      <div class="page-head"><h1>Firewall</h1><p>Every order passes these gates before a fill. On the original build the limits were enforced server-side; here they are enforced in this browser.</p></div>
      <div class="card">
        <div class="section-head"><h2 class="card-title">Firewall</h2><span class="pill armed">ARMED</span></div>
        <ul class="rows">${firewallRows()}</ul>
      </div>

      <div class="section card">
        <h2 class="card-title">Risk limits</h2>
        <p class="card-sub" style="margin-bottom:.6rem">Set how much Rikx is allowed to risk on your behalf.</p>
        <form id="limits-form">
          <div class="limits-row"><label for="lim-start">Starting balance (USD)</label><div class="limits-input"><input class="input" id="lim-start" name="startBalance" type="number" min="100" step="100" value="${L.startBalance}"><span>$</span></div></div>
          <div class="limits-row"><label for="lim-risk">Risk per trade</label><div class="limits-input"><input class="input" id="lim-risk" name="riskPct" type="number" min="0.1" max="10" step="0.1" value="${L.riskPct}"><span>%</span></div></div>
          <div class="limits-row"><label for="lim-daily">Daily loss limit</label><div class="limits-input"><input class="input" id="lim-daily" name="dailyLossPct" type="number" min="0.5" max="50" step="0.5" value="${L.dailyLossPct}"><span>%</span></div></div>
          <div class="limits-row"><label for="lim-max">Max open positions</label><div class="limits-input"><input class="input" id="lim-max" name="maxPositions" type="number" min="1" max="20" step="1" value="${L.maxPositions}"><span></span></div></div>
          <div class="limits-row"><label for="lim-conv">Conviction floor</label><div class="limits-input"><input class="input" id="lim-conv" name="convictionFloor" type="number" min="0" max="95" step="1" value="${L.convictionFloor}"><span></span></div></div>
          <button class="btn primary block" type="submit">Save limits</button>
        </form>
        <p class="hint">Live broker execution is not connected. Rikx sizes and simulates every position on the paper account, so no real money moves.</p>
      </div>`;
  },

  alerts() {
    return `
      <div class="page-head page-title-row">
        <div><h1>Alerts</h1><p>Payouts, stops, firewall blocks and requests from Rikx — all in one feed.</p></div>
        <button class="btn" data-action="mark-read" ${state.alerts.some((a) => !a.read) ? '' : 'disabled'}>Mark all read</button>
      </div>
      <div class="card">
        ${state.alerts.length ? state.alerts.map(alertHtml).join('') : '<div class="empty">No alerts yet. Rikx notifies you here when a position closes in profit.</div>'}
      </div>`;
  },

  security() {
    const s = state.security;
    const on = Boolean(s.pinHash || s.credentialId);
    return `
      <div class="page-head"><h1>Security</h1><p>How the desk opens on this device. Set a PIN, add your fingerprint, and lock Rikx whenever you hand the machine to someone else.</p></div>
      <div class="card">
        <div class="section-head"><h2 class="card-title">Device lock</h2><span class="pill ${on ? 'armed' : 'off'}">${on ? 'ON' : 'OFF'}</span></div>
        <p class="card-sub">${on ? 'The desk asks for your PIN when it loads.' : 'Off — the desk opens straight away.'}</p>

        <form id="pin-form" style="margin-top:1rem">
          <div class="field"><label class="field-label" for="pin-new">${s.pinHash ? 'Replace PIN' : 'Set a 6-digit PIN'}</label><input class="input pin-input" id="pin-new" name="pin" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="••••••" required></div>
          <button class="btn primary" type="submit">Save PIN</button>
        </form>
      </div>

      <div class="section card">
        <h2 class="card-title">Fingerprint</h2>
        <p class="card-sub">Uses this device's own sensor through WebAuthn. Needs a secure origin (https or localhost).</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem">
          <button class="btn" data-action="biometric-add">${s.credentialId ? 'Replace fingerprint' : 'Add fingerprint'}</button>
          <button class="btn" data-action="lock-now">Lock now</button>
          <button class="btn danger" data-action="security-off" ${on ? '' : 'disabled'}>Turn off</button>
        </div>
        <p class="hint">The lock lives on this device only — the PIN is stored as a salted PBKDF2 hash, never as text, and nothing is sent anywhere.</p>
      </div>`;
  },

  learn() {
    const done = completedWeeks();
    const count = done.size;
    const next = weeks.findIndex((_, i) => !done.has(i));
    return `
      <div class="page-head"><h1>Learn</h1><p>The 12-week forex program that started this project — about 3–5 hours a week, at your own pace.</p></div>
      <div class="card">
        <div class="section-head"><h2 class="card-title">Progress</h2><span class="row-value"><strong style="color:var(--heading)">${count}</strong> / ${weeks.length} weeks</span></div>
        <div class="progress-track"><span style="width:${(count / weeks.length) * 100}%"></span></div>
        <p class="hint">${count === weeks.length ? 'Program complete. Completion does not show a strategy works.' : next === -1 ? '' : `Next up: Week ${next + 1} — ${weeks[next].title}.`}</p>
      </div>
      <div class="section">
        ${weeks.map((w, i) => `
          <article class="week ${done.has(i) ? 'is-complete' : ''}">
            <details ${i === next ? 'open' : ''}>
              <summary>
                <span class="week-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="week-title"><small>${w.phase}</small><strong>${w.title}</strong></span>
                <span class="week-plus" aria-hidden="true">+</span>
              </summary>
              <div class="week-body">
                <p>${w.goal}</p>
                <h3>Study</h3>
                <ul>${w.lessons.map((l) => `<li>${l}</li>`).join('')}</ul>
                <h3>Practice</h3>
                <p>${w.practice}</p>
                <h3>Suggested sources</h3>
                <p style="color:var(--muted)">${w.sources.join(' · ')}</p>
                <label class="check-row"><input type="checkbox" data-action="week" data-index="${i}" ${done.has(i) ? 'checked' : ''}> Mark this week complete</label>
              </div>
            </details>
          </article>`).join('')}
      </div>
      <div class="section card">
        <h2 class="card-title">Trusted starting points</h2>
        <ul class="rows">
          <li class="row"><span class="row-name"><a href="https://www.cftc.gov/LearnAndProtect" target="_blank" rel="noopener noreferrer">U.S. CFTC — Learn &amp; Protect</a></span><span class="row-value">Consumer education</span></li>
          <li class="row"><span class="row-name"><a href="https://www.nfa.futures.org/investors/investor-resources.html" target="_blank" rel="noopener noreferrer">NFA — Investor Resources</a></span><span class="row-value">Futures and forex risk</span></li>
          <li class="row"><span class="row-name"><a href="https://www.bis.org/statistics/rpfx22.htm" target="_blank" rel="noopener noreferrer">BIS — Triennial Survey</a></span><span class="row-value">FX market statistics</span></li>
          <li class="row"><span class="row-name"><a href="https://www.federalreserve.gov/monetarypolicy.htm" target="_blank" rel="noopener noreferrer">Federal Reserve — Monetary Policy</a></span><span class="row-value">Primary-source policy</span></li>
          <li class="row"><span class="row-name"><a href="https://www.cmegroup.com/education.html" target="_blank" rel="noopener noreferrer">CME Group — Education</a></span><span class="row-value">Markets and risk</span></li>
        </ul>
      </div>`;
  },

  sources() {
    const reader = state.settings.reader || '';
    const themes = playbookThemes();
    return `
      <div class="page-head"><h1>Sources</h1><p>Send Rikx a link to a trader, thread or video. He opens it, picks out the concepts, and files them to a playbook he reads before scoring a setup.</p></div>

      <div class="card">
        <div class="section-head"><h2 class="card-title">Send a link</h2><span class="pill ${state.sources.length ? 'armed' : 'off'}">${state.sources.length} FILED</span></div>
        <form id="source-form">
          <div class="field"><label class="field-label" for="source-url">Link</label><input class="input" id="source-url" name="url" placeholder="https://www.youtube.com/watch?v=…" required></div>
          <div class="field">
            <label class="field-label" for="source-notes">Paste the transcript or notes <span class="pair-meta">— optional, and the reliable route</span></label>
            <textarea class="input textarea" id="source-notes" name="notes" rows="4" placeholder="Paste what the trader actually said…"></textarea>
          </div>
          <button class="btn primary block" type="submit">${ICONS.sources}<span>Send to Rikx</span></button>
        </form>
        <p class="hint">This build runs in the browser, so a link is only readable when the site allows cross-origin reads or the reader service below can fetch it. YouTube and X usually refuse; pasting the points always works.</p>
      </div>

      ${themes.length ? `<div class="section card">
        <h2 class="card-title">Playbook</h2>
        <p class="card-sub">What the filed sources lean on. Trending setups get +${playbookBonus('trending')} conviction, ranging +${playbookBonus('ranging')}.</p>
        <div class="chips" style="margin-top:.7rem">${themes.map(([label, n]) => `<span class="tag-chip">${esc(label)} · ${n}</span>`).join('')}</div>
      </div>` : ''}

      <div class="section">
        ${state.sources.length ? state.sources.map(sourceCard).join('') : '<div class="empty">Nothing filed yet. Send a link above and it lands here with the concepts Rikx picked out.</div>'}
      </div>

      <div class="section card">
        <h2 class="card-title">Reader service</h2>
        <p class="card-sub">Some sites refuse a direct read. A public reader can fetch the page on your behalf. It is only contacted when you send a link, and those links then pass through that third party.</p>
        <form id="reader-form" style="margin-top:.8rem">
          <div class="field"><label class="field-label" for="reader-url">Reader endpoint</label><input class="input" id="reader-url" name="reader" value="${esc(reader)}" placeholder="https://r.jina.ai/"></div>
          <button class="btn" type="submit">Save reader</button>
        </form>
        <p class="hint">Leave it blank to read links directly only. Only send public links — never a page behind your login.</p>
      </div>`;
  }
};

/* --------------------------------------------------------------- fragments */
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

function sourceCard(s) {
  const lessons = s.lessons || [];
  return `<article class="source">
    <div class="source-head">
      <div>
        <a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>
        <div class="source-meta">${esc(s.platform)} · ${esc(s.host)} · ${timeAgo(s.at)} · ${Number(s.chars || 0).toLocaleString('en-US')} chars · ${esc(s.via)}</div>
      </div>
      <button class="btn small danger" data-action="remove-source" data-id="${s.id}" aria-label="Forget this source">${ICONS.trash}</button>
    </div>
    <div class="chips">${lessons.length ? lessons.map((l) => `<span class="tag-chip" title="${esc(l.text)}">${esc(l.label)} · ${l.hits}</span>`).join('') : '<span class="pair-meta">No concept keywords found in this one.</span>'}</div>
    ${lessons.length ? `<details><summary>What Rikx filed</summary><ul class="lessons">${lessons.map((l) => `<li><strong>${esc(l.label)}</strong> — ${esc(l.text)}</li>`).join('')}</ul></details>` : ''}
  </article>`;
}

function alertHtml(alert) {
  return `<div class="alert-item ${alert.read ? '' : 'unread'}">
    <span class="alert-dot" aria-hidden="true"></span>
    <div><strong>${esc(alert.title)}</strong><p>${esc(alert.body)}</p></div>
    <span class="alert-time">${timeAgo(alert.ts)}</span>
  </div>`;
}

/* ------------------------------------------------------------------- toast */
let toastTimer = null;
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ----------------------------------------------------------------- actions */
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
      sendChat(button.dataset.prompt);
      if (route === 'messages') return;
    }
    navigate('messages');
    return;
  }
  if (action === 'remove-source') {
    state.sources = state.sources.filter((s) => s.id !== button.dataset.id);
    save(true);
    render();
    toast('Source forgotten — the playbook no longer uses it.');
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

document.addEventListener('submit', async (event) => {
  const form = event.target;

  if (form.id === 'chat-form') {
    event.preventDefault();
    const input = form.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendChat(text);
    return;
  }

  if (form.id === 'source-form') {
    event.preventDefault();
    const data = new FormData(form);
    const url = String(data.get('url') || '').trim();
    const notes = String(data.get('notes') || '');
    if (!url) return;
    const button = form.querySelector('button[type="submit"]');
    const label = button?.querySelector('span');
    if (button) button.disabled = true;
    if (label) label.textContent = 'Reading…';
    form.querySelector('#source-url').value = '';
    form.querySelector('#source-notes').value = '';
    const reply = await ingestLink(url, notes);
    state.messages.push({ role: 'user', text: `Shared a link: ${url}`, ts: Date.now() });
    state.messages.push({ role: 'assistant', text: reply, ts: Date.now() });
    state.messages = state.messages.slice(-60);
    save(true);
    render();
    toast(reply.startsWith('I could not open') ? 'That link blocked reading — paste the text instead.' : 'Filed to the playbook.');
    return;
  }

  if (form.id === 'reader-form') {
    event.preventDefault();
    const reader = String(new FormData(form).get('reader') || '').trim();
    if (reader && !/^https?:\/\//i.test(reader)) return toast('The reader needs a full https:// address.');
    state.settings.reader = reader;
    save(true);
    render();
    toast(reader ? 'Reader saved — it will be tried after a direct read.' : 'Reader cleared. Links are read directly only.');
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
      if (ok) {
        unlockDesk();
      } else {
        document.getElementById('lock-error').textContent = 'Wrong PIN. Try again.';
        form.querySelector('#unlock-pin').value = '';
      }
    });
  }
});

/* ------------------------------------------------------------------ crypto */
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

/* -------------------------------------------------------------- lock screen */
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

/* -------------------------------------------------------------------- boot */
window.addEventListener('hashchange', render);

tickMarket();
setInterval(() => {
  tickMarket();
  if (['desk', 'markets', 'trades'].includes(route)) render();
}, 1600);

render();

if (state.security.pinHash || state.security.credentialId) {
  lockDesk();
} else {
  document.getElementById('lock-copy').textContent = 'Enter your PIN to open the desk.';
}

if (!state.alerts.length) {
  addAlert('request', 'Desk ready', 'Paper account funded with $10,000 simulated. Set your risk limits before trading.');
}
save(true);
