# Rikx-AI

**Rikx-AI is a forex learning and decision-support project.** The current version includes a browser-based 12-week study program, progress tracking, and a small local chat demo that answers selected educational questions.

## Run the learning program

Open `index.html` in a modern browser, or host the repository as a static website. No build step, account, API key, or external JavaScript dependency is required. Week progress, chat history, and notes you explicitly ask Rikx to remember are saved in local storage on that browser/device; they do not sync across devices. Use **Clear chat & memory** to remove the locally stored conversation and notes. Google Fonts load online, with local font fallbacks.

## Talk with Rikx

The chat demo can answer a limited set of questions about forex basics, risk, leverage, spreads, backtesting, and the curriculum. It can remember a short learning preference or note on the current device when you say, for example, `Remember that I prefer simple explanations.` This is local browser storage and simple response logic—not model training, a live AI service, or persistent learning across users/devices. Avoid entering sensitive or financial account information.

To make Rikx a true conversational AI that can adapt across conversations, connect the interface to a backend service that calls a language model. Keep the provider API key on the server, not in browser JavaScript; provide user-controlled memory, consent, deletion/export controls, and clear limits. Real-time forex data requires a separately selected and properly licensed data provider. Rikx currently has no live market feed, personalized trading advice, broker connection, or order placement.

## 12-week curriculum

The curriculum covers forex basics, market structure, leverage and risk, economic fundamentals, chart interpretation, testable hypotheses, position sizing, trading psychology, backtesting, evidence evaluation, paper trading, and a final review. It is designed for roughly 3–5 hours per week and can be completed at your own pace.

Learning references include public material from the U.S. Commodity Futures Trading Commission (CFTC), National Futures Association (NFA), Bank for International Settlements (BIS), Federal Reserve, and CME Group. Rikx does not scrape or ingest these sources automatically. Review current material, terms, and jurisdictional relevance.

## Planned product direction

- Real-time read-only market dashboard with timestamps and stale-data indicators.
- Explainable analysis that communicates uncertainty and cites data inputs.
- User-configurable alerts, backtesting with realistic costs, paper trading, and a trade journal.
- Secure, opt-in AI conversations with explicit controls over any saved learning memory.

## Risk notice

Forex trading involves substantial risk and may not be suitable for everyone. This project is for educational purposes and is not financial advice. AI-generated analysis can be wrong, and no strategy or prediction can guarantee profits. Do not risk money you cannot afford to lose.
