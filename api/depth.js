// api/depth.js — NSE Order Book depth for intraday analysis
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getNSECookies() {
  const r = await fetch('https://www.nseindia.com/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }
  });
  const cookies = [];
  r.headers.forEach((v, k) => { if (k.toLowerCase() === 'set-cookie') cookies.push(v.split(';')[0]); });
  return cookies.join('; ');
}

// Core intraday analysis from order book
function analyzeDepth(symbol, priceInfo, depth) {
  const price = priceInfo.lastPrice;
  const open = priceInfo.open;
  const vwap = priceInfo.vwap || price;
  const dayHigh = priceInfo.intraDayHighLow?.max || price;
  const dayLow = priceInfo.intraDayHighLow?.min || price;
  const prevClose = priceInfo.previousClose;
  
  const bids = depth.buy || [];
  const asks = depth.sell || [];
  
  // Total bid/ask quantities (demand vs supply)
  const totalBidQty = bids.reduce((a, b) => a + (b.quantity || 0), 0);
  const totalAskQty = asks.reduce((a, b) => a + (b.quantity || 0), 0);
  const totalQty = totalBidQty + totalAskQty;
  
  // Order Book Imbalance: +1 = all buyers, -1 = all sellers
  const obi = totalQty > 0 ? (totalBidQty - totalAskQty) / totalQty : 0;
  const buyPct = totalQty > 0 ? Math.round(totalBidQty / totalQty * 100) : 50;
  
  // Support = weighted avg bid price (where buyers are clustered)
  const bidSupport = totalBidQty > 0 
    ? bids.reduce((a, b) => a + b.price * b.quantity, 0) / totalBidQty 
    : price * 0.99;
  
  // Resistance = weighted avg ask price (where sellers are clustered)  
  const askResistance = totalAskQty > 0
    ? asks.reduce((a, b) => a + b.price * b.quantity, 0) / totalAskQty
    : price * 1.01;
  
  // Best bid/ask
  const bestBid = bids[0]?.price || price * 0.999;
  const bestAsk = asks[0]?.price || price * 1.001;
  const spread = bestAsk - bestBid;
  const spreadPct = (spread / price) * 100;
  
  // Day range position: 0 = at day low, 1 = at day high
  const dayRange = dayHigh - dayLow;
  const rangePos = dayRange > 0 ? (price - dayLow) / dayRange : 0.5;
  
  // Score components (each -2 to +2)
  let s = 0;
  // 1. Order book: buyers >> sellers
  if (obi > 0.4) s += 3;
  else if (obi > 0.2) s += 2;
  else if (obi > 0.05) s += 1;
  else if (obi < -0.4) s -= 3;
  else if (obi < -0.2) s -= 2;
  else if (obi < -0.05) s -= 1;
  
  // 2. Price vs VWAP (institutional buying reference)
  if (price > vwap * 1.002) s += 1;
  else if (price < vwap * 0.998) s -= 1;
  
  // 3. Range position (contrarian — buy near low, sell near high)
  if (rangePos < 0.3) s += 1;  // Near day low = bounce opportunity
  else if (rangePos > 0.7) s -= 1; // Near day high = reversal risk
  
  // 4. Opening gap (momentum direction)
  if (open > prevClose * 1.005) s += 1; // Gap up = bullish
  else if (open < prevClose * 0.995) s -= 1; // Gap down = bearish
  
  const signal = s >= 4 ? 'STRONG BUY' : s >= 2 ? 'BUY' : s <= -4 ? 'STRONG SELL' : s <= -2 ? 'SELL' : 'NEUTRAL';
  const signalColor = s >= 4 ? '#00e676' : s >= 2 ? '#34d399' : s <= -4 ? '#ff1744' : s <= -2 ? '#ff5252' : '#ffd740';
  
  // Intraday targets
  let entryFrom, entryTo, target1, target2, stopLoss;
  
  if (s >= 2) { // BUY
    entryFrom = bestBid;
    entryTo = bestAsk;
    target1 = +(askResistance * 1.003).toFixed(1);
    target2 = +(askResistance * 1.008).toFixed(1);
    stopLoss = +(bidSupport * 0.997).toFixed(1);
  } else if (s <= -2) { // SELL
    entryFrom = bestAsk;
    entryTo = bestBid;
    target1 = +(bidSupport * 0.997).toFixed(1);
    target2 = +(bidSupport * 0.992).toFixed(1);
    stopLoss = +(askResistance * 1.003).toFixed(1);
  } else {
    entryFrom = bestBid;
    entryTo = bestAsk;
    target1 = +(price * 1.005).toFixed(1);
    target2 = +(price * 1.010).toFixed(1);
    stopLoss = +(price * 0.995).toFixed(1);
  }
  
  const gainPct = s >= 2 
    ? +((target1 - price) / price * 100).toFixed(2)
    : +((price - target1) / price * 100).toFixed(2);
    
  return {
    symbol, price, vwap: +vwap.toFixed(1),
    open, dayHigh, dayLow,
    totalBidQty, totalAskQty, buyPct,
    obi: +obi.toFixed(3),
    bidSupport: +bidSupport.toFixed(1),
    askResistance: +askResistance.toFixed(1),
    bestBid: +bestBid.toFixed(1),
    bestAsk: +bestAsk.toFixed(1),
    spreadPct: +spreadPct.toFixed(3),
    rangePos: +rangePos.toFixed(2),
    score: s, signal, signalColor,
    entry: `₹${entryFrom.toFixed(1)}–₹${entryTo.toFixed(1)}`,
    target1: `₹${target1}`, target2: `₹${target2}`,
    stopLoss: `₹${stopLoss}`,
    gain: `${gainPct}%`,
    bids: bids.slice(0,5),
    asks: asks.slice(0,5),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });
  
  const symList = symbols.split(',').map(s => s.trim().replace('.NS',''));
  
  try {
    const cookies = await getNSECookies();
    const results = [];
    
    for (const sym of symList) {
      try {
        const r = await fetch(`https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(sym)}`, {
          headers: { 'User-Agent': UA, 'Accept': 'application/json',
                     'Referer': 'https://www.nseindia.com/', 'Cookie': cookies }
        });
        if (!r.ok) continue;
        const d = await r.json();
        if (!d?.priceInfo || !d?.marketDeptOrderBook) continue;
        
        const analysis = analyzeDepth(sym, d.priceInfo, d.marketDeptOrderBook);
        results.push(analysis);
      } catch(_) {}
      await new Promise(r => setTimeout(r, 150)); // Rate limit
    }
    
    // Sort by absolute score (strongest signals first)
    results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
    return res.json({ results, at: new Date().toISOString() });
    
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
