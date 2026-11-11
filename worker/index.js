const ALLOWED_PAIRS = new Set([
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'USD/CHF', 'NZD/USD', 'EUR/JPY', 'EUR/GBP'
]);
const RATE_URL = 'https://open.er-api.com/v6/latest/USD';
const RATE_CACHE_SECONDS = 21600;
const QUOTE_CACHE_SECONDS = 60;

function corsHeaders(origin) {
  // Public read-only quotes only. Restrict browser callers to the Rikx Pages site.
  const allowedOrigin = 'https://jpakao1819-jpg.github.io';
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function normalizePair(value) {
  return String(value || '').trim().toUpperCase().replace('-', '/');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'GET') return json({ error: 'GET only' }, 405, origin);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'rikx-market-data', quotesConfigured: Boolean(env.TWELVE_DATA_API_KEY) }, 200, origin);
    }

    if (url.pathname === '/rates') {
      const cache = caches.default;
      const cacheKey = new Request(`${url.origin}/_cache/usd-pgk-rates`);
      let cached = await cache.match(cacheKey);
      if (!cached) {
        const upstream = await fetch(RATE_URL, { headers: { Accept: 'application/json' } });
        if (!upstream.ok) return json({ error: 'Exchange-rate source unavailable' }, 502, origin);
        const payload = await upstream.json();
        const rate = Number(payload?.rates?.PGK);
        if (!Number.isFinite(rate) || rate <= 0) return json({ error: 'Exchange-rate source returned no valid PGK rate' }, 502, origin);
        cached = new Response(JSON.stringify({
          base: 'USD',
          quote: 'PGK',
          rate,
          provider: 'ExchangeRate-API Open Access',
          updatedAt: payload.time_last_update_utc || null,
          nextUpdateAt: payload.time_next_update_utc || null,
          indicative: true
        }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${RATE_CACHE_SECONDS}` } });
        ctx.waitUntil(cache.put(cacheKey, cached.clone()));
      }
      return new Response(cached.body, { status: cached.status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' } });
    }

    if (url.pathname === '/quote') {
      if (!env.TWELVE_DATA_API_KEY) return json({ error: 'Live quote provider is not configured. Set TWELVE_DATA_API_KEY as a Worker secret.' }, 503, origin);
      const pair = normalizePair(url.searchParams.get('pair'));
      if (!ALLOWED_PAIRS.has(pair)) return json({ error: 'Pair is not supported' }, 400, origin);

      const cache = caches.default;
      const cacheKey = new Request(`${url.origin}/_cache/quote/${encodeURIComponent(pair)}`);
      let cached = await cache.match(cacheKey);
      if (!cached) {
        const upstreamUrl = new URL('https://api.twelvedata.com/quote');
        upstreamUrl.searchParams.set('symbol', pair);
        upstreamUrl.searchParams.set('apikey', env.TWELVE_DATA_API_KEY);
        const upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
        if (!upstream.ok) return json({ error: 'Market-data provider request failed', providerStatus: upstream.status }, 502, origin);
        const payload = await upstream.json();
        const price = Number(payload.close);
        if (!Number.isFinite(price) || price <= 0 || payload.status === 'error') {
          return json({ error: payload.message || 'Provider returned no valid quote' }, 502, origin);
        }
        cached = new Response(JSON.stringify({
          pair,
          price,
          provider: 'Twelve Data',
          providerTimestamp: payload.datetime || payload.timestamp || null,
          fetchedAt: new Date().toISOString(),
          marketStatus: payload.is_market_open || null,
          freshness: 'provider-dependent; check your Twelve Data plan for delays',
          paperTradingOnly: true
        }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${QUOTE_CACHE_SECONDS}` } });
        ctx.waitUntil(cache.put(cacheKey, cached.clone()));
      }
      return new Response(cached.body, { status: cached.status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' } });
    }

    return json({ error: 'Not found. Use /health, /rates, or /quote?pair=EUR/USD' }, 404, origin);
  }
};
