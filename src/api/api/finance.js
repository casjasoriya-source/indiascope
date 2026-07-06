export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols, type, q } = req.query;

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
  };

  function buildUrl(base) {
    if (type === 'news') return `${base}/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=8`;
    if (type === 'nifty') return `${base}/v7/finance/quote?symbols=%5ENSEI`;
    return `${base}/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow`;
  }

  for (const base of ['https://query1.finance.yahoo.com','https://query2.finance.yahoo.com']) {
    try {
      const r = await fetch(buildUrl(base), { headers: HEADERS });
      if (r.ok) {
        const data = await r.json();
        res.setHeader('Cache-Control', 's-maxage=30');
        return res.json(data);
      }
    } catch(e) { continue; }
  }
  return res.status(500).json({ error: 'Yahoo Finance unavailable' });
}
