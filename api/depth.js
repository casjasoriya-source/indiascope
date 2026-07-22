// api/depth.js v2 — robust Yahoo Finance fetch with fallback crumb methods
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function fetchWithYahoo(symbols) {
  // Method 1: Get crumb via cookie flow
  try {
    const init = await fetch('https://finance.yahoo.com/', {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' }
    });
    const cookies = [];
    init.headers.forEach((v, k) => { if (k.toLowerCase() === 'set-cookie') cookies.push(v.split(';')[0]); });
    const cookieStr = cookies.join('; ');

    const cr = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': cookieStr, 'Accept': '*/*' }
    });
    const crumb = await cr.text();

    if (crumb && !crumb.includes('<') && crumb.length < 20) {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=${encodeURIComponent(crumb)}`;
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Cookie': cookieStr, 'Accept': 'application/json' } });
      const d = await r.json();
      const result = d?.quoteResponse?.result;
      if (result && result.length > 0) return result;
    }
  } catch(_) {}

  // Method 2: Try without crumb (works for some endpoints)
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
    const d = await r.json();
    const result = d?.quoteResponse?.result;
    if (result && result.length > 0) return result;
  } catch(_) {}

  // Method 3: v8 endpoint
  try {
    const symList = symbols.split(',');
    const results = [];
    for (const sym of symList.slice(0, 20)) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1m&range=1d`;
        const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
        const d = await r.json();
        const meta = d?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          results.push({
            symbol: sym,
            shortName: meta.symbol,
            regularMarketPrice: meta.regularMarketPrice,
            regularMarketOpen: meta.regularMarketOpen || meta.chartPreviousClose,
            regularMarketDayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice * 1.01,
            regularMarketDayLow: meta.regularMarketDayLow || meta.regularMarketPrice * 0.99,
            regularMarketPreviousClose: meta.previousClose || meta.chartPreviousClose,
            regularMarketVolume: meta.regularMarketVolume || 0,
            averageDailyVolume3Month: meta.regularMarketVolume * 5 || 1000000,
          });
        }
      } catch(_) {}
    }
    if (results.length > 0) return results;
  } catch(_) {}

  return null;
}

function analyzeStock(q) {
  const price  = q.regularMarketPrice || 0;
  const open   = q.regularMarketOpen || price;
  const high   = q.regularMarketDayHigh || price * 1.01;
  const low    = q.regularMarketDayLow  || price * 0.99;
  const prev   = q.regularMarketPreviousClose || price;
  const vol    = q.regularMarketVolume || 0;
  const avgVol = q.averageDailyVolume3Month || 1;
  if (!price || price < 1) return null;

  const vwap     = +((high + low + price) / 3).toFixed(1);
  const vr       = +(vol / Math.max(avgVol / 6.25, 1)).toFixed(2);
  const dayRange = Math.max(high - low, price * 0.005);
  const rangePos = +((price - low) / dayRange).toFixed(2);
  const openChg  = +((price - open) / Math.max(open, 1) * 100).toFixed(2);
  const gapPct   = +((open - prev) / Math.max(prev, 1) * 100).toFixed(2);

  let s = 0;
  // Price vs VWAP
  if (price > vwap * 1.002) s += 2; else if (price > vwap) s += 1;
  else if (price < vwap * 0.998) s -= 2; else s -= 1;
  // Volume × direction
  const volScore = vr > 2 ? 3 : vr > 1.5 ? 2 : vr > 1.2 ? 1 : 0;
  s += openChg > 0 ? volScore : -volScore;
  // Range position
  if (rangePos < 0.25) s += 2; else if (rangePos < 0.4) s += 1;
  else if (rangePos > 0.75) s -= 2; else if (rangePos > 0.6) s -= 1;
  // Gap
  if (gapPct > 1) s += 1; else if (gapPct < -1) s -= 1;

  const signal = s >= 5 ? 'STRONG BUY' : s >= 3 ? 'BUY' : s <= -5 ? 'STRONG SELL' : s <= -3 ? 'SELL' : 'NEUTRAL';
  const signalColor = s >= 5 ? '#00e676' : s >= 3 ? '#34d399' : s <= -5 ? '#ff1744' : s <= -3 ? '#ff5252' : '#ffd740';

  let buyPct = Math.max(20, Math.min(80, 50 + s * 4));
  const obi = +((buyPct - 50) / 50).toFixed(3);

  const support    = +(low  + dayRange * 0.15).toFixed(1);
  const resistance = +(high - dayRange * 0.15).toFixed(1);
  const step = dayRange / 8;

  const bids = [0,1,2,3,4].map(i => ({ price: +(price - step*(i+0.5)*0.6).toFixed(1), quantity: Math.round((5-i)*18000) }));
  const asks = [0,1,2,3,4].map(i => ({ price: +(price + step*(i+0.5)*0.6).toFixed(1), quantity: Math.round((5-i)*15000) }));

  const isBuy = s >= 3, isSell = s <= -3;
  const entry    = isBuy  ? `₹${(price*0.999).toFixed(1)}–₹${price.toFixed(1)}` : isSell ? `₹${price.toFixed(1)}–₹${(price*1.001).toFixed(1)}` : `₹${price.toFixed(1)}`;
  const target1  = isBuy  ? `₹${(price*1.007).toFixed(1)}` : isSell ? `₹${(price*0.993).toFixed(1)}` : `₹${(price*1.005).toFixed(1)}`;
  const target2  = isBuy  ? `₹${(price*1.014).toFixed(1)}` : isSell ? `₹${(price*0.986).toFixed(1)}` : `₹${(price*1.010).toFixed(1)}`;
  const stopLoss = isBuy  ? `₹${(price*0.993).toFixed(1)}` : isSell ? `₹${(price*1.007).toFixed(1)}` : `₹${(price*0.995).toFixed(1)}`;
  const t1 = parseFloat(target1.replace('₹',''));
  const gain = `${isBuy ? +((t1-price)/price*100).toFixed(2) : +((price-t1)/price*100).toFixed(2)}%`;

  return {
    symbol: q.symbol, name: q.shortName || q.symbol,
    price, vwap, open, dayHigh: high, dayLow: low,
    volRatio: vr, buyPct, obi, totalBidQty: bids.reduce((a,b)=>a+b.quantity,0),
    totalAskQty: asks.reduce((a,b)=>a+b.quantity,0),
    bidSupport: support, askResistance: resistance,
    bestBid: bids[0].price, bestAsk: asks[0].price,
    spreadPct: +((asks[0].price-bids[0].price)/price*100).toFixed(3),
    rangePos, openChg, gapPct, score: s, signal, signalColor,
    entry, target1, target2, stopLoss, gain, bids, asks,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const quotes = await fetchWithYahoo(symbols);
  if (!quotes) return res.status(502).json({ error: 'All Yahoo Finance methods failed. Try again in 1 minute.' });

  const results = quotes.map(q => analyzeStock(q)).filter(Boolean)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return res.json({ results, total: results.length, at: new Date().toISOString() });
}
