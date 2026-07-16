// api/announcements.js — NSE corporate announcements + sentiment analysis
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function getNSECookies() {
  const r = await fetch('https://www.nseindia.com/', {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }
  });
  const cookies = [];
  r.headers.forEach((v, k) => { if (k.toLowerCase() === 'set-cookie') cookies.push(v.split(';')[0]); });
  return cookies.join('; ');
}

// Keyword-based signal detection
function analyzeAnnouncement(subject, desc) {
  const text = (subject + ' ' + (desc||'')).toLowerCase();
  
  const bullish = ['order received','contract awarded','wins order','bagged order','new order',
    'dividend','bonus issue','buyback','record date','acquisition','merger approved',
    'capacity expansion','new plant','partnership','mou signed','export order',
    'revenue growth','profit growth','beats estimate','strong quarter','upgrade'];
  
  const bearish = ['loss','penalty','fine','show cause','sebi notice','cbi','ed notice',
    'plant shutdown','recall','downgrade','insolvency','default','npa','fraud',
    'promoter pledge','stake sale','management change','ceo resign','miss estimate'];
  
  const neutral = ['board meeting','agm','change in director','auditor','financial results',
    'intimation','clarification','trading window'];

  let score = 0;
  let matched = [];
  
  for (const kw of bullish) { if (text.includes(kw)) { score += 2; matched.push(kw); } }
  for (const kw of bearish) { if (text.includes(kw)) { score -= 2; matched.push('⚠ '+kw); } }
  for (const kw of neutral) { if (text.includes(kw)) score += 0; }
  
  return {
    signal: score >= 2 ? 'BUY' : score <= -2 ? 'AVOID' : 'WATCH',
    color: score >= 2 ? '#34d399' : score <= -2 ? '#ff5252' : '#ffd740',
    score,
    reason: matched.slice(0,2).join(', ') || 'General announcement'
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  try {
    const cookies = await getNSECookies();
    
    // Get today and yesterday dates
    const today = new Date();
    const yesterday = new Date(today - 86400000);
    const fmt = d => `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    
    const url = `https://www.nseindia.com/api/corporate-announcements?index=equities&from_date=${fmt(yesterday)}&to_date=${fmt(today)}`;
    
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json', 
                 'Referer': 'https://www.nseindia.com/', 'Cookie': cookies }
    });
    
    if (!r.ok) throw new Error('NSE announcements unavailable');
    
    const data = await r.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    
    // Filter and analyze meaningful announcements
    const analyzed = items
      .filter(a => a.symbol && a.desc)
      .map(a => ({
        symbol: a.symbol,
        name: a.sm_name || a.symbol,
        subject: a.desc || '',
        time: a.an_dt || '',
        exchange: 'NSE',
        ...analyzeAnnouncement(a.desc, a.attchmntText || '')
      }))
      .filter(a => a.score !== 0) // Remove pure noise
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score)) // Most impactful first
      .slice(0, 40);
    
    return res.json({ announcements: analyzed, total: items.length, at: new Date().toISOString() });
    
  } catch(e) {
    // Fallback: try Yahoo Finance news
    try {
      const r = await fetch('https://finance.yahoo.com/rss/topstories', {
        headers: { 'User-Agent': UA }
      });
      const xml = await r.text();
      return res.json({ announcements: [], total: 0, error: 'NSE unavailable', at: new Date().toISOString() });
    } catch(_) {
      return res.status(500).json({ error: e.message });
    }
  }
}
