// api/depth.js — Intraday analysis via Yahoo Finance (NSE blocks Vercel server requests)
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function getYahooCrumb() {
  const r = await fetch('https://finance.yahoo.com/', { headers: { 'User-Agent': UA } });
  const cookies = [];
  r.headers.forEach((v, k) => { if (k.toLowerCase() === 'set-cookie') cookies.push(v.split(';')[0]); });
  const cookieStr = cookies.join('; ');
  const cr = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookieStr }
  });
  return { crumb: await cr.text(), cookies: cookieStr };
}

function analyzeStock(q) {
  const price  = q.regularMarketPrice || 0;
  const open   = q.regularMarketOpen || price;
  const high   = q.regularMarketDayHigh || price;
  const low    = q.regularMarketDayLow || price;
  const prev   = q.regularMarketPreviousClose || price;
  const vol    = q.regularMarketVolume || 0;
  const avgVol = q.averageDailyVolume3Month || 1;
  if (!price || price < 1) return null;

  // VWAP approximation
  const vwap = +((high + low + price) / 3).toFixed(1);
  // Volume ratio vs expected intraday volume (6.25 trading hours)
  const vr = +(vol / (avgVol / 6.25)).toFixed(2);
  // Day range position: 0=at low, 1=at high
  const dayRange = high - low || 1;
  const rangePos = +((price - low) / dayRange).toFixed(2);
  // Intraday momentum from open
  const openChg = +((price - open) / open * 100).toFixed(2);
  // Gap from previous close
  const gapPct = +((open - prev) / prev * 100).toFixed(2);

  // --- Demand/Supply Score ---
  let s = 0;
  // 1. Price vs VWAP: above = buyers in control
  if (price > vwap * 1.002) s += 2;
  else if (price > vwap) s += 1;
  else if (price < vwap * 0.998) s -= 2;
  else s -= 1;
  // 2. Volume surge confirms direction
  if (vr > 2.0) s += (openChg > 0 ? 3 : -3);
  else if (vr > 1.5) s += (openChg > 0 ? 2 : -2);
  else if (vr > 1.2) s += (openChg > 0 ? 1 : -1);
  // 3. Position in day's range
  if (rangePos < 0.25) s += 2;      // Near day low = buyers coming in
  else if (rangePos < 0.40) s += 1;
  else if (rangePos > 0.75) s -= 2; // Near day high = sellers entering
  else if (rangePos > 0.60) s -= 1;
  // 4. Gap analysis
  if (gapPct > 1.0) s += 1;
  else if (gapPct < -1.0) s -= 1;

  const signal = s >= 5 ? 'STRONG BUY' : s >= 3 ? 'BUY' : s <= -5 ? 'STRONG SELL' : s <= -3 ? 'SELL' : 'NEUTRAL';
  const signalColor = s >= 5 ? '#00e676' : s >= 3 ? '#34d399' : s <= -5 ? '#ff1744' : s <= -3 ? '#ff5252' : '#ffd740';

  // Buyer% estimation from available signals
  let buyPct = 50 + Math.round(s * 4);
  buyPct = Math.max(20, Math.min(80, buyPct));
  const obi = +((buyPct - 50) / 50).toFixed(3);

  // Support/resistance from day range
  const support    = +(low  + dayRange * 0.15).toFixed(1);
  const resistance = +(high - dayRange * 0.15).toFixed(1);

  // Entry / targets / stop
  let entry, target1, target2, stopLoss;
  const isBuy = s >= 3;
  const isSell = s <= -3;
  if (isBuy) {
    entry    = `₹${(price * 0.999).toFixed(1)}–₹${price.toFixed(1)}`;
    target1  = `₹${(price * 1.007).toFixed(1)}`;
    target2  = `₹${(price * 1.014).toFixed(1)}`;
    stopLoss = `₹${(price * 0.993).toFixed(1)}`;
  } else if (isSell) {
    entry    = `₹${price.toFixed(1)}–₹${(price * 1.001).toFixed(1)}`;
    target1  = `₹${(price * 0.993).toFixed(1)}`;
    target2  = `₹${(price * 0.986).toFixed(1)}`;
    stopLoss = `₹${(price * 1.007).toFixed(1)}`;
  } else {
    entry    = `₹${price.toFixed(1)}`;
    target1  = `₹${(price * 1.005).toFixed(1)}`;
    target2  = `₹${(price * 1.010).toFixed(1)}`;
    stopLoss = `₹${(price * 0.995).toFixed(1)}`;
  }
  const t1 = parseFloat(target1.replace('₹',''));
  const gainPct = isBuy ? +((t1-price)/price*100).toFixed(2) : +((price-t1)/price*100).toFixed(2);

  // Simulated bid/ask ladder from price range
  const step = dayRange / 8 || price * 0.001;
  const bids = [0,1,2,3,4].map(i => ({
    price: +(price - step*(i+0.5)*0.6).toFixed(1),
    quantity: Math.round((5-i)*18000*(1+obi*0.5))
  }));
  const asks = [0,1,2,3,4].map(i => ({
    price: +(price + step*(i+0.5)*0.6).toFixed(1),
    quantity: Math.round((5-i)*15000*(1-obi*0.5))
  }));
  const totalBidQty = bids.reduce((a,b)=>a+b.quantity,0);
  const totalAskQty = asks.reduce((a,b)=>a+b.quantity,0);

  return {
    symbol: q.symbol, name: q.shortName || q.symbol,
    price, vwap, open, dayHigh: high, dayLow: low, prev,
    volRatio: vr, totalBidQty, totalAskQty, buyPct, obi,
    bidSupport: support, askResistance: resistance,
    bestBid: bids[0].price, bestAsk: asks[0].price,
    spreadPct: +((asks[0].price-bids[0].price)/price*100).toFixed(3),
    rangePos, openChg, gapPct,
    score: s, signal, signalColor, entry, target1, target2, stopLoss,
    gain: `${gainPct}%`, bids, asks,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  try {
    const { crumb, cookies } = await getYahooCrumb();
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketPreviousClose,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow,shortName&crumb=${encodeURIComponent(crumb)}`;

    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Cookie': cookies, 'Accept': 'application/json' }
    });
    const data = await r.json();
    const quotes = data?.quoteResponse?.result || [];

    if (!quotes.length) return res.status(502).json({ error: 'No data from Yahoo Finance' });

    const results = quotes
      .map(q => analyzeStock(q))
      .filter(Boolean)
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

    return res.json({ results, total: results.length, at: new Date().toISOString() });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
