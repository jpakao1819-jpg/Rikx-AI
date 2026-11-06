# Rikx-AI

**Rikx-AI is a forex trading AI project focused on real-time market information, explainable analysis, and safer trading practice.**

> **Project status:** The capabilities below describe the product direction and planned features; they should not be considered available until they are implemented and connected to reliable market-data and broker services.

## Product goals

Rikx-AI aims to help users follow forex markets, understand potential trade setups, and practice strategies. It is intended as a decision-support tool—not a guarantee of results or a substitute for independent judgment.

## Planned features

- **Real-time market dashboard:** Show live currency-pair prices, charts, trends, and forex session status, with visible data timestamps and connection status.
- **AI market analysis:** Summarize price action and selected indicators, and explain factors that may be influencing a currency pair.
- **Explainable trade ideas:** Present possible entry, stop-loss, and take-profit levels alongside the analysis, assumptions, and uncertainty. Signals are not guarantees.
- **Alerts:** Notify users when a chosen pair reaches a price or meets user-defined conditions.
- **Backtesting:** Test strategies against historical data, accounting for fees and slippage where data is available.
- **Paper trading:** Practice with simulated funds before considering real-money trading.
- **Trade journal:** Record decisions and outcomes to help users review performance and learn from past trades.

## Real-time operation

Real-time updates are a key goal for Rikx-AI. To provide them, the application will need a suitable live forex market-data provider and a reliable way to stream or frequently refresh quotes. Provider availability, licensing, latency, and outages can affect the data. Rikx-AI should display when information was last updated and clearly indicate delayed, stale, or unavailable data rather than presenting it as live.

Live market data is separate from live trading. Broker integration and automated order placement are not implied by this project description. Any future live-trading capability should be opt-in, require explicit user confirmation, and include thoroughly tested risk controls.

## Safety, transparency, and privacy

- Make risk visible before a trade; support configurable position-size limits and daily-loss guardrails.
- Keep automated trading off by default and put users in control of trade decisions.
- Explain which data and indicators informed an analysis, and communicate uncertainty clearly.
- Handle missing, delayed, or disconnected market data safely.
- Protect account credentials and minimize the collection and retention of personal or financial data.
- Remind users that forex trading involves substantial risk and AI-generated analysis can be wrong.

## Suggested development order

1. Build a read-only dashboard with reliable data timestamps and connection indicators.
2. Add explainable analysis and user-configurable alerts.
3. Add paper trading and a trade journal.
4. Add historical backtesting with realistic costs.
5. Evaluate any broker or live-trading integration only after security and risk controls are implemented and tested.

## Disclaimer

Rikx-AI is for informational and educational purposes. Market analysis and trade ideas are not financial advice, and no prediction or strategy can guarantee profits. Forex trading can result in the loss of some or all of your investment. Verify data independently and make your own decisions.
