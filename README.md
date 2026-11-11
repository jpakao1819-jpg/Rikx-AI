# Rikx-AI

**Rikx-AI is a forex paper-trading desk and learning project.** The current build is a static browser app: a simulated market feed, a paper account, a risk "firewall" that gates every order, a desk chat, alerts, account linking, a device lock, and the original 12-week learning program.

## Run it

Open `index.html` in a modern browser, or host the repo as a static site. No build step, account, API key, or external JavaScript dependency is required. Google Fonts load online with system-font fallbacks.

Everything you do is saved in that browser's local storage only — positions, closed trades, alerts, limits, chat, notes, saved accounts and the device lock. Nothing syncs across devices.

## The desk

- **Desk** — simulated FX ticker, equity / today / open P&L / win rate / realized, Rikx intelligence, live mark-to-market positions, firewall status, latest alerts.
- **Markets** — 15-minute-style structure scan across nine majors with sparkline, direction, conviction score, stop and target, and an **Execute** button.
- **Positions** — open and closed fills with full history.
- **Messages** — one thread with Rikx. He answers with your real numbers: open positions, the read on any pair, the best setup that clears the firewall, and the exact position-sizing math.
- **Accounts** — attach an OANDA / MetaTrader / cTrader label, account ID and token to this browser. Nothing is transmitted or verified.
- **Firewall** — the gates every order passes, plus editable risk limits: starting balance, risk per trade, daily loss limit, max open positions, conviction floor.
- **Alerts** — payouts, stops, firewall blocks and requests, with unread counts.
- **Security** — 6-digit PIN (salted PBKDF2 hash, never stored as text) and WebAuthn fingerprint, with a lock screen on load and a lock button in the header.
- **Sources** — send Rikx a link (a trader's thread, video, article) or paste a transcript; he reads what he can, files the concepts he recognises, and the playbook nudges his conviction. See below.
- **Learn** — the original 12-week curriculum and progress tracking.

### Teaching Rikx from links

Send a link on the **Sources** page, or paste one straight into the Messages thread. Rikx will:

1. Try to read the page directly. Wikipedia goes through its CORS-friendly API; anything else is attempted with a plain `fetch`.
2. If that is blocked, try the reader endpoint configured on the Sources page (defaults to `https://r.jina.ai/`, a public reader service; clear the field to switch it off). Links sent this way pass through that third party, so only send public pages.
3. Reject bot checks, consent walls and near-empty pages instead of filing them.
4. Scan the remaining text for eleven trading concepts — risk, invalidation, liquidity, trend, range, session timing, news, process/psychology, evidence, indicators and price action — and file each one it finds, with the number of mentions, against the link.
5. Fold the filed concepts into a **playbook**: each matching concept adds +1 conviction (capped at +5) to setups of that structure — trending setups read trend, price-action and indicator lessons, ranging setups read range, liquidity and price-action lessons. You can see the adjustment on the Markets table as a small `+n` beside the score, and delete any source to remove its influence.

This is **keyword digestion, not comprehension**. Rikx does not watch the video, does not read a chart image, and cannot summarise an argument. If a site refuses to be read, paste the transcript or the trader's main points into the field on the Sources page and the same digestion runs on that text.

### How the paper engine works

- Prices are a random walk seeded from recent-market levels and tick every ~1.6s in the browser.
- Each pair gets a direction (following the session when it is trending, fading it when it is ranging), a conviction score (session change, trend consistency, plus any playbook bonus), and a stop/target derived from a short-range ATR.
- An order is only filled if it clears every gate: conviction ≥ floor, free position slots, no duplicate pair, daily loss circuit not tripped, and no more than two positions betting the same way on USD.
- Size = `equity × risk% ÷ stop distance`. Hitting the stop or target closes the position and books realized P&L.
- Equity = starting balance + realized + open P&L.

## What is simulated — and what is not

This build has **no server**. Prices are generated locally, fills are simulated at the mid with no spread or slippage, and any broker credentials you enter are stored unencrypted in this browser's local storage. Treat the desk as a practice environment, not a tick-accurate simulator, and never paste a real, trade-enabled API token into it.

Not present, and requiring a backend:

- A real market feed (needs a licensed data provider).
- Genuine comprehension of a link: reading a video's audio, a chart image or a paywalled article needs a backend with a parser and a model.
- Real order routing to a broker.
- The Gmail "money mail" reader and email desk updates.
- Multi-device sync, background push, WhatsApp, and per-user accounts.
- Server-side enforcement of the firewall — here the limits are enforced in the page, so they are a guardrail, not a security boundary.

The original version of this project came from a Base44 app whose limits were enforced server-side. This static rebuild reproduces the interface and behaviour locally; it does not reproduce the server.

## For a true conversational Rikx

Connect the Messages thread to a backend that calls a language model. Keep the provider API key on the server, never in browser JavaScript, and add user-controlled memory with consent, deletion and export. See the README history for the earlier local chat demo.

## 12-week curriculum

Forex basics, market structure, leverage and risk, economic fundamentals, chart interpretation, testable hypotheses, position sizing, trading psychology, backtesting, evidence evaluation, paper trading, and a final review — roughly 3–5 hours per week, self-paced.

Learning references include public material from the U.S. Commodity Futures Trading Commission (CFTC), National Futures Association (NFA), Bank for International Settlements (BIS), Federal Reserve, and CME Group. Rikx does not scrape or ingest these sources; link reading only happens for links you send. Review current material, terms, and jurisdictional relevance.

## Risk notice

Forex trading involves substantial risk and may not be suitable for everyone. This project is for educational purposes and is not financial advice. Paper results prove nothing about live results, and no strategy or prediction can guarantee profits. Do not risk money you cannot afford to lose.
