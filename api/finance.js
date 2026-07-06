export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols, type, q } = req.query;

  try {
    let url;
    if (type === 'news') {
      url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=8&enableFuzzyQuery=false`;
    } else if (type === 'nifty') {
      url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;
    } else {
      url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
      },
    });

    if (!response.ok) throw new Error(`Yahoo returned ${response.status}`);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
