export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols, type, q } = req.query;
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

  try {
    // Step 1: Get Yahoo Finance cookies
    const cookieRes = await fetch('https://finance.yahoo.com/', {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' }
    });
    const cookies = [];
    cookieRes.headers.forEach((val, key) => {
      if (key.toLowerCase() === 'set-cookie') cookies.push(val.split(';')[0]);
    });
    const cookieStr = cookies.join('; ');

    // Step 2: Get crumb token
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': cookieStr }
    });
    const crumb = await crumbRes.text();

    // Step 3: Build URL with crumb
    let url;
    if (type === 'news') {
      url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q||'india market')}&newsCount=8&crumb=${encodeURIComponent(crumb)}`;
    } else if (type === 'nifty') {
      url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5ENSEI&crumb=${encodeURIComponent(crumb)}`;
    } else {
      url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow&crumb=${encodeURIComponent(crumb)}`;
    }

    // Step 4: Fetch stock data
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Cookie': cookieStr, 'Accept': 'application/json' }
    });
    const text = await r.text();
    res.setHeader('Cache-Control', 's-maxage=30');
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
