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
- **Learn** — the original 12-week curriculum and progress tracking.

### How the paper engine works

- Prices are a random walk seeded from recent-market levels and tick every ~1.6s in the browser.
- Each pair gets a direction, a conviction score (from session change plus trend consistency), and a stop/target derived from a short-range ATR.
- An order is only filled if it clears every gate: conviction ≥ floor, free position slots, no duplicate pair, daily loss circuit not tripped, and no more than two positions betting the same way on USD.
- Size = `equity × risk% ÷ stop distance`. Hitting the stop or target closes the position and books realized P&L.
- Equity = starting balance + realized + open P&L.

## What is simulated — and what is not

This build has **no server**. Prices are generated locally, fills are simulated at the mid with no spread or slippage, and any broker credentials you enter are stored unencrypted in this browser's local storage. Treat the desk as a practice environment, not a tick-accurate simulator, and never paste a real, trade-enabled API token into it.

Not present, and requiring a backend:

- A real market feed (needs a licensed data provider).
- Real order routing to a broker.
- The Gmail "money mail" reader and email desk updates.
- Multi-device sync, background push, WhatsApp, and per-user accounts.
- Server-side enforcement of the firewall — here the limits are enforced in the page, so they are a guardrail, not a security boundary.

The original version of this project came from a Base44 app whose limits were enforced server-side. This static rebuild reproduces the interface and behaviour locally; it does not reproduce the server.

## For a true conversational Rikx

Connect the Messages thread to a backend that calls a language model. Keep the provider API key on the server, never in browser JavaScript, and add user-controlled memory with consent, deletion and export. See the README history for the earlier local chat demo.

## 12-week curriculum

Forex basics, market structure, leverage and risk, economic fundamentals, chart interpretation, testable hypotheses, position sizing, trading psychology, backtesting, evidence evaluation, paper trading, and a final review — roughly 3–5 hours per week, self-paced.

Learning references include public material from the U.S. Commodity Futures Trading Commission (CFTC), National Futures Association (NFA), Bank for International Settlements (BIS), Federal Reserve, and CME Group. Rikx does not scrape or ingest these sources. Review current material, terms, and jurisdictional relevance.

## Risk notice

Forex trading involves substantial risk and may not be suitable for everyone. This project is for educational purposes and is not financial advice. Paper results prove nothing about live results, and no strategy or prediction can guarantee profits. Do not risk money you cannot afford to lose.
