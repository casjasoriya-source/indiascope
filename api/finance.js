export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols, type, q } = req.query;

  const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
  };

  let url;
  if (type === 'news') url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q || 'india market')}&newsCount=8`;
  else if (type === 'nifty') url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI`;
  else url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow`;

  try {
    const r = await fetch(url, { headers: H });
    const text = await r.text();
    res.setHeader('Cache-Control', 's-maxage=30');
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
