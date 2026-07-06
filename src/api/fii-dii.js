export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
  try {
    const r = await fetch('https://www.nseindia.com/api/fiidiiTradeReact', {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com/market-data/fii-dii-activity',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (r.ok) {
      const data = await r.json();
      res.setHeader('Cache-Control', 's-maxage=180');
      return res.json(data);
    }
    return res.status(502).json({ error: 'NSE unavailable' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
