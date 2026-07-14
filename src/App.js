// IndiaScope - api/finance.js
// Uses NSE for real-time Indian stock prices (true real-time, no delay)
// Falls back to Yahoo Finance if NSE fails

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// Fetch NSE session cookies (required for all NSE API calls)
async function getNSECookies() {
  const r = await fetch('https://www.nseindia.com/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }
  });
  const cookies = [];
  r.headers.forEach((val, key) => {
    if (key.toLowerCase() === 'set-cookie') cookies.push(val.split(';')[0]);
  });
  return cookies.join('; ');
}

// Convert NSE symbol format: ICICIBANK.NS → ICICIBANK
function toNSE(sym) { return sym.replace('.NS','').replace('.BO',''); }

// Fetch quote from NSE real-time API
async function fetchNSEQuote(symbol, cookieStr) {
  const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
  const r = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Referer': 'https://www.nseindia.com/',
      'Cookie': cookieStr,
    }
  });
  if (!r.ok) return null;
  const d = await r.json();
  const p = d?.priceInfo;
  if (!p) return null;
  const price = p.lastPrice;
  const prev = p.previousClose;
  const chg = price - prev;
  const pct = (chg / prev) * 100;
  return {
    symbol: symbol.endsWith('.NS') ? symbol : symbol + '.NS',
    regularMarketPrice: price,
    regularMarketChange: chg,
    regularMarketChangePercent: pct,
    regularMarketVolume: d?.marketDeptOrderBook?.tradeInfo?.totalTradedVolume || 0,
    averageDailyVolume3Month: d?.securityInfo?.issuedCap || 0,
    fiftyTwoWeekHigh: p.weekHighLow?.max || 0,
    fiftyTwoWeekLow: p.weekHighLow?.min || 0,
  };
}

// Yahoo Finance fallback
async function fetchYahoo(symbols) {
  const cookieRes = await fetch('https://finance.yahoo.com/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html' }
  });
  const cookies = [];
  cookieRes.headers.forEach((val, key) => {
    if (key.toLowerCase() === 'set-cookie') cookies.push(val.split(';')[0]);
  });
  const cookieStr = cookies.join('; ');
  const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookieStr }
  });
  const crumb = await crumbRes.text();
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Cookie': cookieStr, 'Accept': 'application/json' }
  });
  return r.text();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols, type } = req.query;

  // Nifty index - use Yahoo (NSE index API is different)
  if (type === 'nifty') {
    try {
      const cookieRes = await fetch('https://finance.yahoo.com/', { headers: { 'User-Agent': UA } });
      const cookies = [];
      cookieRes.headers.forEach((v, k) => { if (k.toLowerCase() === 'set-cookie') cookies.push(v.split(';')[0]); });
      const cookieStr = cookies.join('; ');
      const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', { headers: { 'User-Agent': UA, 'Cookie': cookieStr } });
      const crumb = await crumbRes.text();

      // Try NSE Nifty first
      try {
        const nr = await fetch('https://www.nseindia.com/api/allIndices', {
          headers: { 'User-Agent': UA, 'Accept': 'application/json', 'Referer': 'https://www.nseindia.com/' }
        });
        const nd = await nr.json();
        const nifty50 = nd?.data?.find(x => x.index === 'NIFTY 50');
        if (nifty50) {
          const prev = nifty50.previousClose || nifty50.last - nifty50.change;
          return res.json({ quoteResponse: { result: [{
            regularMarketPrice: nifty50.last,
            regularMarketChange: nifty50.change,
            regularMarketChangePercent: nifty50.percentChange,
          }], error: null }});
        }
      } catch(_) {}

      // Yahoo fallback for Nifty
      const nr = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI&crumb=${encodeURIComponent(crumb)}`, {
        headers: { 'User-Agent': UA, 'Cookie': cookieStr }
      });
      const text = await nr.text();
      res.setHeader('Content-Type', 'application/json');
      return res.send(text);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Stock quotes - try NSE first for real-time, fallback to Yahoo
  if (symbols) {
    const symList = symbols.split(',').map(s => s.trim());
    const results = [];

    try {
      // Get NSE cookies once
      const nseCookies = await getNSECookies();

      for (const sym of symList) {
        try {
          const nseSym = toNSE(sym);
          const q = await fetchNSEQuote(nseSym, nseCookies);
          if (q) {
            q.symbol = sym; // preserve original symbol for matching
            results.push(q);
          }
        } catch(_) {}
        // Small delay to avoid NSE rate limiting
        await new Promise(r => setTimeout(r, 100));
      }

      // If NSE got most results, return them
      if (results.length >= symList.length * 0.7) {
        return res.json({ quoteResponse: { result: results, error: null }});
      }
    } catch(_) {}

    // Fallback: Yahoo Finance for any missing
    try {
      const missing = symList.filter(s => !results.find(r => r.symbol === s));
      if (missing.length > 0) {
        const yahooText = await fetchYahoo(missing.join(','));
        const yahooData = JSON.parse(yahooText);
        const yahooResults = yahooData?.quoteResponse?.result || [];
        results.push(...yahooResults);
      }
      return res.json({ quoteResponse: { result: results, error: null }});
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'No symbols provided' });
}
