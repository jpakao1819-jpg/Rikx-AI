# Rikx live-data service setup

This Worker provides a small server-side proxy for an indicative USD→PGK rate and optional FX quotes. It keeps the Twelve Data API key out of the public GitHub Pages JavaScript. **It does not place orders or turn Rikx into a live trading bot.**

## Endpoints

- `GET /health` — checks whether a quote API key is configured.
- `GET /rates` — returns an indicative USD/PGK exchange rate. The upstream public rate is cached for up to six hours. It is not a trading rate.
- `GET /quote?pair=EUR/USD` — returns one allow-listed FX quote, cached for 60 seconds. Quote delay and availability depend on the Twelve Data plan and market session.

The supported quote pairs are EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, USD/CHF, NZD/USD, EUR/JPY, and EUR/GBP. The service is read-only and has no broker or order endpoints.

## Deploy the Worker

1. Install Node.js, then in this directory run `npm install --global wrangler` and `wrangler login`.
2. Create a Twelve Data account and API key. Check that the plan permits the intended FX symbols, quote endpoint, and request frequency.
3. Set the key as a Worker secret; do not commit it or put it in Rikx's browser code:

   ```sh
   wrangler secret put TWELVE_DATA_API_KEY
   ```

4. Deploy from this directory:

   ```sh
   wrangler deploy
   ```

5. Test `https://<worker-name>.<your-account>.workers.dev/health`, `/rates`, and `/quote?pair=EUR/USD`.

The Worker currently allows browser CORS from `https://jpakao1819-jpg.github.io`. If the site uses a custom domain, change the allowed origin in `index.js` before deployment. CORS is not authentication; do not add private account data or trading operations to this public read-only service. Configure provider quotas and monitor usage.

## Important: the browser app is not yet using this service

Deploying this Worker alone does not change the Rikx UI. The current desk still generates simulated market prices in `app.js`; it does not fetch `/quote`. The current currency display should also be treated as an indicative conversion, not as verified PGK-denominated accounting. The next integration step is to wire the app to a configured Worker URL, display provider timestamps and stale/error states, and convert each trade's realized and unrealized P&L from its quote currency into PGK. Until those changes are completed and tested, keep the app labelled simulated and paper-only.

GitHub Pages is static hosting; it cannot run this Worker or securely hold provider secrets. Deploy the Worker separately using the steps above. See [GitHub's Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
