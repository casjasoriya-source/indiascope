import React, { useState, useEffect, useMemo } from "react";

// ─── SECTOR BENCHMARKS ───────────────────────────────────────────────────────
const SECTOR_PE = {
  Banking:18,"Power Finance":9,Finance:22,IT:24,Pharma:30,
  FMCG:52,Auto:22,Energy:10,Power:15,Infrastructure:32,
  Metals:13,Telecom:42,Consumer:82,Insurance:68,
};
const SECTORS = ["All","Banking","Finance","Power Finance","IT","Pharma","FMCG","Auto","Energy","Power","Infrastructure","Metals","Telecom","Consumer","Insurance"];
const SCOL = {Banking:"#3b82f6","Power Finance":"#0ea5e9",Finance:"#60a5fa",IT:"#a78bfa",Pharma:"#34d399",FMCG:"#f59e0b",Auto:"#f97316",Energy:"#ef4444",Power:"#14b8a6",Infrastructure:"#8b5cf6",Metals:"#94a3b8",Telecom:"#ec4899",Consumer:"#f472b6",Insurance:"#a3e635"};

// ─── 50 STOCKS ────────────────────────────────────────────────────────────────
// Fields: sym, name, s=sector, pe, pb, de, roe, roce, divY=dividend yield%,
//   revG=revenue 3Y CAGR%, profG=profit 3Y CAGR%, prHold=promoter holding%,
//   pledged=pledged%, intCov=interest coverage (null for banks/financial),
//   fcf=free cash flow quality(H/M/L), ar=analyst rating, at=analyst target,
//   isB=is bank/financial (D/E not relevant), note=description
const STOCKS = [
  // ── BANKING ──
  {id:1,sym:"HDFCBANK.NS",name:"HDFC Bank",s:"Banking",pe:19.2,pb:2.5,de:6.8,roe:16.1,roce:7.2,divY:1.2,revG:14,profG:18,prHold:26,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1950,isB:true,
    note:"India's largest private bank. Consistently low NPAs, strong CASA ratio. Widening loan book across retail, SME and corporate."},
  {id:2,sym:"ICICIBANK.NS",name:"ICICI Bank",s:"Banking",pe:17.1,pb:2.9,de:5.9,roe:18.2,roce:7.8,divY:0.8,revG:18,profG:28,prHold:0,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:1380,isB:true,
    note:"Fastest-growing large private bank. GNPA at decade low. Best digital banking in India. No promoter = clean governance."},
  {id:3,sym:"SBIN.NS",name:"State Bank of India",s:"Banking",pe:9.4,pb:1.5,de:14.2,roe:18.5,roce:6.1,divY:2.5,revG:12,profG:35,prHold:57,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1020,isB:true,
    note:"India's largest bank. Turnaround complete. NPAs sharply reduced. 67,000+ branches = unmatched distribution. P/B still below peers."},
  {id:4,sym:"KOTAKBANK.NS",name:"Kotak Mahindra Bank",s:"Banking",pe:20.4,pb:3.2,de:4.8,roe:15.3,roce:6.9,divY:0.1,revG:16,profG:12,prHold:26,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:2200,isB:true,
    note:"Premium private bank with diversified financial services (insurance, AMC, lending). Conservative management. Strong CASA."},
  {id:5,sym:"AXISBANK.NS",name:"Axis Bank",s:"Banking",pe:12.8,pb:1.8,de:7.2,roe:17.4,roce:6.8,divY:0.1,revG:20,profG:45,prHold:8,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1280,isB:true,
    note:"3rd largest private bank. Citibank integration driving retail growth. Improving ROE trajectory. Cheapest P/E among large private banks."},
  {id:6,sym:"IDFCFIRSTB.NS",name:"IDFC First Bank",s:"Banking",pe:15.2,pb:1.2,de:8.4,roe:8.4,roce:5.2,divY:0.0,revG:22,profG:0,prHold:40,pledged:0,intCov:null,fcf:"M",ar:"Buy",at:95,isB:true,
    note:"Retail banking transformation underway. Very cheap P/B. Revenue growing fast but ROE still improving. Higher risk, higher potential."},
  // ── FINANCE / NBFC ──
  {id:7,sym:"BAJFINANCE.NS",name:"Bajaj Finance",s:"Finance",pe:28.3,pb:5.8,de:3.8,roe:21.2,roce:10.4,divY:0.3,revG:28,profG:26,prHold:56,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:9800,isB:false,
    note:"India's largest NBFC. 80M+ customers, strong cross-sell. Premium P/B justified by best-in-class growth. No promoter pledging."},
  {id:8,sym:"MUTHOOTFIN.NS",name:"Muthoot Finance",s:"Finance",pe:18.4,pb:4.5,de:2.5,roe:25.2,roce:12.4,divY:1.8,revG:18,profG:22,prHold:73,pledged:0,intCov:6,fcf:"H",ar:"Buy",at:3800,isB:false,
    note:"India's largest gold loan NBFC. 73% promoter holding = strong alignment. Rural brand moat. RBI regulation is only risk."},
  {id:9,sym:"CHOLAFIN.NS",name:"Cholamandalam Finance",s:"Finance",pe:22.4,pb:4.2,de:5.1,roe:20.4,roce:9.8,divY:0.5,revG:25,profG:30,prHold:47,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:1450,isB:false,
    note:"Vehicle & home finance NBFC backed by Murugappa group. High growth, clean books. Interest coverage improving with rate cuts."},
  {id:10,sym:"IRFC.NS",name:"IRFC",s:"Finance",pe:14.2,pb:2.0,de:9.8,roe:14.8,roce:5.2,divY:3.8,revG:18,profG:20,prHold:86,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:195,isB:true,
    note:"Railway infrastructure financier. 86% govt holding = ultimate safe PSU. Near-zero credit risk. Consistent dividend. Low PE."},
  // ── IT ──
  {id:11,sym:"TCS.NS",name:"TCS",s:"IT",pe:22.4,pb:12,de:0.0,roe:55.1,roce:52.3,divY:3.5,revG:14,profG:12,prHold:72,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:4200,isB:false,
    note:"India's largest IT company. Zero debt, 55% ROE = exceptional quality. Cautious near-term on US tech spend. Excellent for long-term SIP."},
  {id:12,sym:"INFY.NS",name:"Infosys",s:"IT",pe:20.1,pb:7.5,de:0.0,roe:32.4,roce:30.8,divY:3.2,revG:12,profG:10,prHold:15,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:1750,isB:false,
    note:"Global IT services giant. Strong cash generation, high dividend. Near-term guidance muted. IT sector at 52-week low = entry opportunity."},
  {id:13,sym:"HCLTECH.NS",name:"HCL Technologies",s:"IT",pe:22.8,pb:5.5,de:0.1,roe:24.1,roce:22.8,divY:4.2,revG:16,profG:18,prHold:60,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1960,isB:false,
    note:"Engineering services + IT products + services. Best growth among top-4 IT. High 4.2% dividend yield = income + growth combo."},
  {id:14,sym:"TECHM.NS",name:"Tech Mahindra",s:"IT",pe:20.5,pb:3.2,de:0.2,roe:15.2,roce:14.4,divY:2.8,revG:8,profG:5,prHold:36,pledged:0,intCov:99,fcf:"M",ar:"Buy",at:1820,isB:false,
    note:"Telecom + digital IT. Margin turnaround underway under new management. Cheapest large IT on P/B. High risk, high recovery potential."},
  // ── PHARMA ──
  {id:15,sym:"SUNPHARMA.NS",name:"Sun Pharmaceutical",s:"Pharma",pe:34.8,pb:5.4,de:0.1,roe:18.4,roce:17.2,divY:0.6,revG:14,profG:22,prHold:54,pledged:2,intCov:25,fcf:"H",ar:"Buy",at:1980,isB:false,
    note:"India's largest pharma. Strong branded US pipeline in specialty drugs. Sector rally in progress. Low debt, strong cash."},
  {id:16,sym:"DRREDDY.NS",name:"Dr. Reddy's Labs",s:"Pharma",pe:18.2,pb:3.8,de:0.1,roe:22.1,roce:20.8,divY:0.8,revG:15,profG:28,prHold:26,pledged:0,intCov:30,fcf:"H",ar:"Buy",at:6800,isB:false,
    note:"Global generics powerhouse with strong US business. Cheapest large-cap pharma on P/E. Strong profit growth. Zero pledging."},
  {id:17,sym:"CIPLA.NS",name:"Cipla",s:"Pharma",pe:24.9,pb:4.2,de:0.1,roe:17.8,roce:16.9,divY:0.6,revG:12,profG:24,prHold:33,pledged:0,intCov:28,fcf:"H",ar:"Buy",at:1720,isB:false,
    note:"Branded generics + US respiratory pipeline. Nifty's top gainer on Jul 1 (+4.82%). IT→Pharma rotation is live. Strong momentum."},
  {id:18,sym:"DIVISLAB.NS",name:"Divi's Laboratories",s:"Pharma",pe:49.8,pb:8.2,de:0.0,roe:20.4,roce:19.8,divY:1.2,revG:10,profG:8,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5800,isB:false,
    note:"Global API/CDMO leader. Zero debt, 100%+ interest coverage. Premium justified by quality moat. Growth recovery needed."},
  {id:19,sym:"MOREPENLAB.NS",name:"Morepen Laboratories",s:"Pharma",pe:20.2,pb:2.2,de:0.2,roe:12.1,roce:16.8,divY:0.5,revG:12,profG:18,prHold:44,pledged:5,intCov:8,fcf:"M",ar:"Buy",at:68,isB:false,
    note:"API + 800+ branded pharma products. Low price ₹40-55. Pharma rally beneficiary. Check pledging % before entry."},
  // ── FMCG ──
  {id:20,sym:"ITC.NS",name:"ITC",s:"FMCG",pe:25.4,pb:6.5,de:0.0,roe:28.1,roce:27.4,divY:4.2,revG:12,profG:18,prHold:0,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:510,isB:false,
    note:"Cigarettes + FMCG + Hotels + Agri. Zero debt. 4.2% dividend + capital gains = double income. Cheapest FMCG stock on P/E. No promoter concern."},
  {id:21,sym:"HINDUNILVR.NS",name:"Hindustan Unilever",s:"FMCG",pe:50.2,pb:9.8,de:0.0,roe:20.8,roce:19.4,divY:2.0,revG:8,profG:12,prHold:62,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:2600,isB:false,
    note:"100+ consumer brands. Defensive investment, consistent dividend. Volume growth tepid. Rich valuation limits upside at current price."},
  {id:22,sym:"BRITANNIA.NS",name:"Britannia Industries",s:"FMCG",pe:48.2,pb:22,de:0.2,roe:51.4,roce:48.8,divY:2.5,revG:10,profG:15,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5800,isB:false,
    note:"India's biscuit leader. Exceptional 51% ROE. High P/B a concern. Steady compounder but limited near-term upside at current valuation."},
  // ── AUTO ──
  {id:23,sym:"MARUTI.NS",name:"Maruti Suzuki",s:"Auto",pe:22.4,pb:3.8,de:0.0,roe:17.8,roce:17.2,divY:1.2,revG:14,profG:35,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:13500,isB:false,
    note:"India's #1 carmaker with 40%+ market share. Zero debt. EV + hybrid strategy in place. Strong promoter holding. Profit up 35% in 3 years."},
  {id:24,sym:"TATAMOTORS.NS",name:"Tata Motors",s:"Auto",pe:6.2,pb:1.5,de:1.5,roe:25.4,roce:12.8,divY:0.5,revG:20,profG:0,prHold:46,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:1050,isB:false,
    note:"JLR recovery + domestic commercial vehicles + India EV leader. PE of 6.2 = deep value. Debt is reducing. ROE 25%+ = high quality."},
  {id:25,sym:"BAJAJ-AUTO.NS",name:"Bajaj Auto",s:"Auto",pe:30.2,pb:8.5,de:0.0,roe:28.4,roce:27.1,divY:2.8,revG:12,profG:24,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:10800,isB:false,
    note:"2-wheeler and 3-wheeler export champion. Zero debt, consistent 28% ROE. High dividend. Premiumisation + EV transition = next growth leg."},
  {id:26,sym:"HEROMOTOCO.NS",name:"Hero MotoCorp",s:"Auto",pe:18.4,pb:5.2,de:0.0,roe:30.2,roce:29.4,divY:4.5,revG:8,profG:20,prHold:35,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4800,isB:false,
    note:"World's largest 2-wheeler company. Zero debt. 4.5% dividend yield. Rural India recovery play. 30% ROE is exceptional for auto."},
  // ── ENERGY ──
  {id:27,sym:"RELIANCE.NS",name:"Reliance Industries",s:"Energy",pe:22.1,pb:2.2,de:0.4,roe:10.2,roce:9.4,divY:0.4,revG:14,profG:8,prHold:51,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:1520,isB:false,
    note:"O2C + Jio + Retail. India's most valuable company. Jio IPO + Reliance Retail IPO are pending mega-catalysts. Low div but huge upside potential."},
  {id:28,sym:"ONGC.NS",name:"ONGC",s:"Energy",pe:7.4,pb:0.9,de:0.3,roe:18.1,roce:16.8,divY:5.5,revG:10,profG:25,prHold:58,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:340,isB:false,
    note:"India's largest oil & gas producer. P/B below 1 = trading below book value. 5.5% dividend. Deeply undervalued vs global peers."},
  {id:29,sym:"COALINDIA.NS",name:"Coal India",s:"Energy",pe:7.2,pb:3.2,de:0.0,roe:52.4,roce:51.8,divY:6.0,revG:8,profG:28,prHold:63,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:520,isB:false,
    note:"World's largest coal miner. Zero debt. 52% ROE + 6% dividend = cash machine. PE of 7.2 is extremely cheap. PSU turnaround complete."},
  // ── POWER ──
  {id:30,sym:"NTPC.NS",name:"NTPC",s:"Power",pe:14.2,pb:1.8,de:1.5,roe:13.2,roce:9.8,divY:3.2,revG:14,profG:15,prHold:51,pledged:0,intCov:5,fcf:"M",ar:"Buy",at:420,isB:false,
    note:"India's largest power utility. Aggressive 60GW renewable energy target. 3.2% dividend. Regulated returns = low risk. Debt manageable."},
  {id:31,sym:"POWERGRID.NS",name:"Power Grid Corp",s:"Power",pe:16.1,pb:3.0,de:1.8,roe:20.4,roce:11.2,divY:4.8,revG:10,profG:12,prHold:51,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:360,isB:false,
    note:"Central transmission monopoly. 4.8% dividend + stable capital appreciation. Regulated returns model = highly predictable income."},
  {id:32,sym:"RECLTD.NS",name:"REC Limited",s:"Power Finance",pe:8.1,pb:1.6,de:7.2,roe:20.8,roce:7.4,divY:4.2,revG:22,profG:28,prHold:52,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:650,isB:true,
    note:"PSU power lender. Direct Budget capex beneficiary (₹11.2L Cr). 4.2% dividend + 28% profit growth. Top Nifty Financial gainer recently."},
  {id:33,sym:"PFC.NS",name:"Power Finance Corp",s:"Power Finance",pe:7.4,pb:1.4,de:7.8,roe:18.4,roce:6.8,divY:4.5,revG:18,profG:24,prHold:56,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:530,isB:true,
    note:"Govt-backed power lender. Beat Q4 EPS by 24.4%. Aug 7 results due = pre-results momentum. P/B 1.4 is cheap. 4.5% dividend."},
  {id:34,sym:"SUZLON.NS",name:"Suzlon Energy",s:"Power",pe:39.8,pb:8.5,de:0.3,roe:26.5,roce:23.4,divY:0.0,revG:25,profG:0,prHold:15,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:68,isB:false,
    note:"India's largest wind energy company. Multi-year high order book. Breakout above ₹52 = strong buy signal. 26% ROE. Turnaround play."},
  {id:35,sym:"NHPC.NS",name:"NHPC",s:"Power",pe:14.8,pb:1.4,de:0.8,roe:11.4,roce:9.2,divY:4.0,revG:8,profG:14,prHold:67,pledged:0,intCov:5,fcf:"M",ar:"Buy",at:98,isB:false,
    note:"PSU hydro power, Navratna status. 67% govt holding. 4% dividend. Clean energy play at ₹75-85. Low price = high unit ownership."},
  // ── INFRASTRUCTURE ──
  {id:36,sym:"LT.NS",name:"Larsen & Toubro",s:"Infrastructure",pe:27.8,pb:3.8,de:1.5,roe:14.2,roce:11.8,divY:1.5,revG:16,profG:20,prHold:0,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:4200,isB:false,
    note:"₹5.6L Cr order book. Infra supercycle beneficiary. GCC tech services + defence growing. No promoter = professional management."},
  {id:37,sym:"BEL.NS",name:"Bharat Electronics",s:"Infrastructure",pe:38.4,pb:7.2,de:0.0,roe:22.4,roce:21.8,divY:1.8,revG:14,profG:22,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:320,isB:false,
    note:"Defence electronics PSU. Order book boom. Zero debt, 22% ROCE. India defence spending up = 5+ year visibility on growth."},
  {id:38,sym:"NBCC.NS",name:"NBCC India",s:"Infrastructure",pe:34.8,pb:5.8,de:0.0,roe:20.2,roce:37.1,divY:0.8,revG:10,profG:18,prHold:61,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:115,isB:false,
    note:"PSU construction. 37% ROCE is exceptional for construction sector. Smart city + redevelopment projects. Zero debt. Low price ₹80-95."},
  {id:39,sym:"SIEMENS.NS",name:"Siemens India",s:"Infrastructure",pe:61.4,pb:12,de:0.0,roe:25.1,roce:23.8,divY:0.5,revG:18,profG:28,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5200,isB:false,
    note:"Industrial automation + power transmission. 75% promoter. Zero debt. Premium justified by quality but expensive. Long-term compounder."},
  {id:40,sym:"GRASIM.NS",name:"Grasim Industries",s:"Infrastructure",pe:18.4,pb:2.2,de:0.5,roe:12.4,roce:10.8,divY:0.8,revG:14,profG:10,prHold:42,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:2800,isB:false,
    note:"Aditya Birla flagship: Ultratech cement + Birla Opus paints (new) + VSF. Paints business is a big long-term catalyst. Cheap P/E for conglomerate."},
  {id:41,sym:"ABB.NS",name:"ABB India",s:"Infrastructure",pe:64.2,pb:18,de:0.0,roe:28.4,roce:26.8,divY:0.5,revG:20,profG:35,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:7800,isB:false,
    note:"Electrification & industrial automation. 75% promoter, zero debt, 28% ROE. Premium valuation — only for long-term wealth building, not trading."},
  // ── METALS ──
  {id:42,sym:"TATASTEEL.NS",name:"Tata Steel",s:"Metals",pe:15.4,pb:1.8,de:0.8,roe:12.4,roce:10.8,divY:0.5,revG:8,profG:0,prHold:33,pledged:5,intCov:4,fcf:"L",ar:"Hold",at:175,isB:false,
    note:"India's largest integrated steelmaker. Europe drag on profits. Domestic business strong. Debt reducing. Cyclical stock — buy in down-cycles."},
  {id:43,sym:"HINDALCO.NS",name:"Hindalco Industries",s:"Metals",pe:10.2,pb:1.3,de:0.7,roe:13.2,roce:11.8,divY:0.6,revG:14,profG:8,prHold:35,pledged:5,intCov:6,fcf:"M",ar:"Buy",at:720,isB:false,
    note:"Aluminium + Novelis downstream operations. P/B 1.3 = cheap. US infrastructure play via Novelis. Cheapest metal stock by PE + PB combo."},
  // ── TELECOM ──
  {id:44,sym:"BHARTIARTL.NS",name:"Bharti Airtel",s:"Telecom",pe:44.8,pb:12,de:2.3,roe:41.2,roce:16.8,divY:0.5,revG:18,profG:0,prHold:56,pledged:0,intCov:5,fcf:"M",ar:"Strong Buy",at:1900,isB:false,
    note:"India's #1 telecom. ARPU upcycle in progress. Africa + B2B enterprise growing. 41% ROE despite high debt = exceptional business quality. Top analyst pick."},
  // ── CONSUMER ──
  {id:45,sym:"TITAN.NS",name:"Titan Company",s:"Consumer",pe:84.2,pb:28,de:0.1,roe:35.4,roce:32.8,divY:0.5,revG:22,profG:28,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:3900,isB:false,
    note:"Tanishq jewellery + Titan watches. 35% ROE, zero debt, 22% revenue CAGR. India's most aspirational brand. Premium justified by exceptional quality."},
  {id:46,sym:"DMART.NS",name:"Avenue Supermarts",s:"Consumer",pe:88.4,pb:13,de:0.0,roe:14.8,roce:14.2,divY:0.0,revG:16,profG:22,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5800,isB:false,
    note:"India's most profitable retailer. Zero debt, 75% promoter holding. Consistently beating competition. Very expensive — buy only on big dips."},
  {id:47,sym:"TRENT.NS",name:"Trent (Zudio/Westside)",s:"Consumer",pe:98.4,pb:18,de:0.2,roe:20.4,roce:18.8,divY:0.1,revG:35,profG:80,prHold:37,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:4200,isB:false,
    note:"Zudio fastest-growing fashion retail. 35% revenue CAGR + 80% profit growth = exceptional business. Down 60% from peak = partial re-entry opportunity."},
  // ── INSURANCE ──
  {id:48,sym:"HDFCLIFE.NS",name:"HDFC Life Insurance",s:"Insurance",pe:78.4,pb:8.5,de:0.0,roe:12.4,roce:8.2,divY:0.5,revG:14,profG:16,prHold:50,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:760,isB:false,
    note:"India's largest private life insurer. VNB margin expansion. 50% HDFC group holding. Insurance penetration story = multi-decade growth."},
  {id:49,sym:"SBILIFE.NS",name:"SBI Life Insurance",s:"Insurance",pe:62.8,pb:9.5,de:0.0,roe:14.8,roce:9.4,divY:0.5,revG:18,profG:18,prHold:57,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1780,isB:false,
    note:"PSU-backed life insurance. SBI's 57% holding + SBI network distribution = unmatched access. Lower P/E vs HDFC Life = better value pick."},
  // ── EXTRA ──
  {id:50,sym:"JSWSTEEL.NS",name:"JSW Steel",s:"Metals",pe:18.2,pb:2.5,de:1.2,roe:14.2,roce:12.4,divY:0.8,revG:12,profG:5,prHold:45,pledged:8,intCov:5,fcf:"L",ar:"Hold",at:920,isB:false,
    note:"India's fastest-growing steelmaker. High capex cycle limiting near-term returns. Watch pledged shares. Good for long-term entry on deep dips."},
];

// ─── 7-PILLAR SCORING ENGINE ──────────────────────────────────────────────────
/*
  PILLAR 1: VALUATION         — 18 pts
  PILLAR 2: BUSINESS QUALITY  — 18 pts (ROE + ROCE + FCF)
  PILLAR 3: GROWTH ENGINE     — 16 pts (Revenue + Profit CAGR)
  PILLAR 4: BALANCE SHEET     — 14 pts (D/E + Interest Coverage)
  PILLAR 5: GOVERNANCE        — 14 pts (Promoter + Pledging)
  PILLAR 6: ANALYST SIGNAL    — 10 pts (Rating + Target Upside)
  PILLAR 7: PRICE MOMENTUM    — 10 pts (52W position + Volume)
  TOTAL                       = 100 pts
*/
function calcPillars(stock, ld) {
  const spe = SECTOR_PE[stock.s] || 25;

  // PILLAR 1: VALUATION (18 pts)
  const per = stock.pe / spe;
  const p1_pe = per<0.55?9:per<0.7?7:per<0.85?5:per<1.0?3:per<1.2?1:0;
  const p1_pb = stock.pb<1?5:stock.pb<2?4:stock.pb<3?3:stock.pb<5?2:stock.pb<8?1:0;
  const p1_div = stock.divY>5?4:stock.divY>3?3:stock.divY>2?2:stock.divY>1?1:0;
  const p1 = p1_pe+p1_pb+p1_div;

  // PILLAR 2: BUSINESS QUALITY (18 pts)
  const p2_roe = stock.roe>30?6:stock.roe>25?5:stock.roe>20?4:stock.roe>15?3:stock.roe>10?2:1;
  const p2_roce = stock.roce>30?6:stock.roce>25?5:stock.roce>20?4:stock.roce>15?3:stock.roce>10?2:1;
  const p2_fcf = stock.fcf==="H"?6:stock.fcf==="M"?3:0;
  const p2 = p2_roe+p2_roce+p2_fcf;

  // PILLAR 3: GROWTH ENGINE (16 pts)
  const p3_rev = stock.revG>25?8:stock.revG>20?7:stock.revG>15?6:stock.revG>10?4:stock.revG>5?2:0;
  const p3_prof = stock.profG>30?8:stock.profG>25?7:stock.profG>20?6:stock.profG>15?4:stock.profG>10?2:0;
  const p3 = p3_rev+p3_prof;

  // PILLAR 4: BALANCE SHEET (14 pts)
  let p4_de, p4_ic;
  if(stock.isB){ p4_de=7; p4_ic=7; } // banks: neutral
  else {
    p4_de = stock.de<0.1?8:stock.de<0.3?7:stock.de<0.5?6:stock.de<1.0?4:stock.de<1.5?2:stock.de<2.5?1:0;
    const ic = stock.intCov||0;
    p4_ic = ic>=99?6:ic>10?5:ic>5?4:ic>3?3:ic>1.5?1:0;
  }
  const p4 = Math.min(14, p4_de+p4_ic);

  // PILLAR 5: GOVERNANCE (14 pts)
  const p5_hold = stock.prHold>65?6:stock.prHold>55?5:stock.prHold>45?4:stock.prHold>35?3:stock.prHold>20?2:stock.prHold>0?1:2; // 0 = no promoter (institutions)
  const p5_pledge = stock.pledged===0?8:stock.pledged<2?6:stock.pledged<5?4:stock.pledged<10?2:0;
  const p5 = Math.min(14, p5_hold+p5_pledge);

  // PILLAR 6: ANALYST SIGNAL (10 pts)
  const rMap = {"Strong Buy":6,"Buy":5,"Hold":3,"Reduce":1,"Sell":0};
  const p6_rat = rMap[stock.ar]??3;
  let p6_upside = 3;
  if(ld?.price&&stock.at){
    const up = (stock.at-ld.price)/ld.price*100;
    p6_upside = up>35?4:up>25?4:up>15?3:up>8?2:up>0?1:0;
  }
  const p6 = Math.min(10, p6_rat+p6_upside);

  // PILLAR 7: PRICE MOMENTUM (10 pts)
  let p7_52w=5, p7_vol=0;
  if(ld?.price&&ld?.h52&&ld?.l52){
    const range=ld.h52-ld.l52;
    const pos=range>0?(ld.price-ld.l52)/range:0.5;
    p7_52w = pos<0.2?6:pos<0.35?5:pos<0.5?4:pos<0.65?3:pos<0.8?2:1;
  }
  if(ld?.vol&&ld?.avgVol){
    const vr=ld.vol/ld.avgVol;
    p7_vol = vr>2.5?4:vr>1.5?3:vr>1.0?2:1;
  }
  const p7 = Math.min(10, p7_52w+(ld?.vol?p7_vol:0));

  const total = Math.min(100, p1+p2+p3+p4+p5+p6+p7);
  return {
    total,
    pillars:[
      {name:"Valuation",score:p1,max:18,detail:`PE vs Sector: ${p1_pe}/9 · P/B: ${p1_pb}/5 · Dividend: ${p1_div}/4`},
      {name:"Business Quality",score:p2,max:18,detail:`ROE: ${p2_roe}/6 · ROCE: ${p2_roce}/6 · Free Cash Flow: ${p2_fcf}/6`},
      {name:"Growth Engine",score:p3,max:16,detail:`Revenue CAGR: ${p3_rev}/8 · Profit CAGR: ${p3_prof}/8`},
      {name:"Balance Sheet",score:p4,max:14,detail:`Debt/Equity: ${p4_de}/8 · Interest Coverage: ${p4_ic}/6`},
      {name:"Governance",score:p5,max:14,detail:`Promoter Holding: ${p5_hold}/6 · Pledged Shares: ${p5_pledge}/8`},
      {name:"Analyst Signal",score:p6,max:10,detail:`Rating: ${p6_rat}/6 · Target Upside: ${p6_upside}/4`},
      {name:"Price Momentum",score:p7,max:10,detail:`52W Position: ${p7_52w}/6 · Volume: ${ld?.vol?p7_vol:"N/A"}/4`},
    ]
  };
}

function getRec(sc){
  if(sc>=78) return {label:"STRONG BUY",c:"#00e676",bg:"#001a0d",ring:"#00e67655"};
  if(sc>=65) return {label:"BUY",c:"#69f0ae",bg:"#001a08",ring:"#69f0ae44"};
  if(sc>=52) return {label:"HOLD",c:"#ffd740",bg:"#1a1400",ring:"#ffd74044"};
  if(sc>=40) return {label:"REDUCE",c:"#ffab40",bg:"#1a0900",ring:"#ffab4044"};
  return {label:"SELL",c:"#ff5252",bg:"#1a0000",ring:"#ff525244"};
}

const fmt=(n,d=2)=>n!=null&&n!==undefined?Number(n).toFixed(d):"—";
const fmtV=(n)=>{if(!n)return"—";if(n>=1e7)return`${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`${(n/1e5).toFixed(0)}L`;return n.toLocaleString()};
const fmtAt=(n)=>n>=10000?`₹${(n/1000).toFixed(1)}k`:n>=1000?`₹${(n/1000).toFixed(1)}k`:`₹${n}`;

export default function App() {
  const [ld, setLd] = useState({});
  const [sector, setSector] = useState("All");
  const [q, setQ] = useState("");
  const [sortK, setSortK] = useState("score");
  const [sortA, setSortA] = useState(false);
  const [sel, setSel] = useState(null);
  const [ts, setTs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("overview"); // modal tab

  const fetchAll = async () => {
    setLoading(true); setErr(false);
    try {
      const newLd = {};
      const batches = [STOCKS.slice(0,17), STOCKS.slice(17,34), STOCKS.slice(34)];
      for (const b of batches) {
        const syms = b.map(s=>s.sym).join(",");
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow`;
        try {
          const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {signal:AbortSignal.timeout(10000)});
          const j = await r.json();
          (j?.quoteResponse?.result||[]).forEach(q => {
            newLd[q.symbol] = {price:q.regularMarketPrice,chg:q.regularMarketChange,pct:q.regularMarketChangePercent,vol:q.regularMarketVolume,avgVol:q.averageDailyVolume3Month,h52:q.fiftyTwoWeekHigh,l52:q.fiftyTwoWeekLow};
          });
        } catch(_) {}
        await new Promise(r => setTimeout(r,500));
      }
      setLd(newLd); setTs(new Date());
    } catch(e) { setErr(true); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); const t=setInterval(fetchAll,180000); return()=>clearInterval(t); }, []);

  const rows = useMemo(() => {
    return STOCKS
      .filter(s => sector==="All" || s.s===sector)
      .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.sym.toLowerCase().includes(q.toLowerCase()))
      .map(s => {
        const live = ld[s.sym];
        const {total:score, pillars} = calcPillars(s, live);
        const rec = getRec(score);
        const upside = live?.price ? ((s.at - live.price)/live.price*100) : null;
        const vr = live?.vol && live?.avgVol ? (live.vol/live.avgVol) : null;
        return {...s, live, score, pillars, rec, upside, vr};
      })
      .sort((a,b) => {
        const vals = {score:[a.score,b.score],pe:[a.pe,b.pe],roe:[a.roe,b.roe],roce:[a.roce,b.roce],upside:[a.upside??-999,b.upside??-999],pb:[a.pb,b.pb],divY:[a.divY,b.divY]};
        const [va,vb] = vals[sortK] || [a.score,b.score];
        return sortA ? va-vb : vb-va;
      });
  }, [ld, sector, q, sortK, sortA]);

  const toggleSort = (k) => { if(sortK===k) setSortA(!sortA); else {setSortK(k); setSortA(false);} };
  const sBtn = (k,l) => (
    <button key={k} onClick={()=>toggleSort(k)} style={{background:sortK===k?"#1a2540":"transparent",border:`1px solid ${sortK===k?"#2563eb":"#1a2535"}`,borderRadius:6,padding:"5px 10px",color:sortK===k?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:11,fontWeight:sortK===k?700:400,whiteSpace:"nowrap"}}>
      {l}{sortK===k?(sortA?"↑":"↓"):""}
    </button>
  );

  const PILLAR_COLORS = ["#60a5fa","#34d399","#fbbf24","#f87171","#a78bfa","#fb923c","#38bdf8"];

  return (
    <div style={{background:"#070b14",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:"#c8d8f0",fontSize:13}}>

      {/* ── HEADER ── */}
      <div style={{background:"#0a0f1e",borderBottom:"1px solid #141e30",padding:"11px 16px",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div>
              <span style={{fontSize:18,fontWeight:900,letterSpacing:-0.8,background:"linear-gradient(135deg,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>IndiaScope</span>
              <span style={{fontSize:12,color:"#2a3a55",marginLeft:8}}>50 Stocks · 7-Pillar Analysis</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {loading && <span style={{fontSize:11,color:"#3b82f6",display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:"#3b82f6",display:"inline-block",animation:"blink 1s infinite"}}/>Live data</span>}
            {err && <span style={{fontSize:11,color:"#ff5252"}}>⚠ Fetch failed · Fundamentals only</span>}
            {ts && !loading && <span style={{fontSize:11,color:"#2a3a55"}}>↺ {ts.toLocaleTimeString()}</span>}
            <button onClick={fetchAll} disabled={loading} style={{background:"#141e30",border:"1px solid #1a2a3a",borderRadius:6,padding:"5px 11px",color:"#4a6080",cursor:loading?"not-allowed":"pointer",fontSize:12}}>Refresh</button>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto"}}>
        {[
          {l:"Strong Buy",v:rows.filter(r=>r.score>=78).length,c:"#00e676"},
          {l:"Buy",v:rows.filter(r=>r.score>=65&&r.score<78).length,c:"#69f0ae"},
          {l:"Hold",v:rows.filter(r=>r.score>=52&&r.score<65).length,c:"#ffd740"},
          {l:"Reduce/Sell",v:rows.filter(r=>r.score<52).length,c:"#ff5252"},
          {l:"Showing",v:rows.length,c:"#60a5fa"},
        ].map(st=>(
          <div key={st.l} style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:10,padding:"9px 16px",minWidth:100,flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:900,color:st.c,lineHeight:1}}>{st.v}</div>
            <div style={{fontSize:10,color:"#2a3a55",marginTop:3}}>{st.l}</div>
          </div>
        ))}
      </div>

      {/* ── SECTOR CHIPS ── */}
      <div style={{display:"flex",gap:6,padding:"0 16px 10px",overflowX:"auto"}}>
        {SECTORS.map(sec=>(
          <button key={sec} onClick={()=>setSector(sec)} style={{
            background:sector===sec?`${SCOL[sec]||"#3b82f6"}22`:"transparent",
            border:`1px solid ${sector===sec?(SCOL[sec]||"#3b82f6"):"#141e30"}`,
            borderRadius:99,padding:"5px 13px",color:sector===sec?(SCOL[sec]||"#60a5fa"):"#3d5070",
            cursor:"pointer",fontSize:11,fontWeight:sector===sec?700:400,whiteSpace:"nowrap",flexShrink:0
          }}>{sec}</button>
        ))}
      </div>

      {/* ── CONTROLS ── */}
      <div style={{padding:"0 16px 12px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or symbol…"
          style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:8,padding:"8px 12px",color:"#c8d8f0",fontSize:13,flex:1,minWidth:180,outline:"none"}}/>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[["score","Score"],["roe","ROE"],["roce","ROCE"],["pe","P/E"],["pb","P/B"],["divY","Div%"],["upside","Upside"]].map(([k,l])=>sBtn(k,l))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{overflowX:"auto",padding:"0 16px 100px"}}>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px",minWidth:1050}}>
          <thead>
            <tr>
              {["#","Stock · Sector","CMP · Chg","P/E vs Sector","P/B","D/E","ROE","ROCE","Div%","Rev 3Y","Prof 3Y","Promoter","Pledged","Score","Signal"].map(h=>(
                <th key={h} style={{padding:"8px 7px",textAlign:"left",fontSize:9.5,fontWeight:700,color:"#1e2e45",textTransform:"uppercase",letterSpacing:0.4,background:"#070b14",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s,i)=>(
              <tr key={s.id} onClick={()=>{setSel(s);setTab("overview");}} style={{cursor:"pointer"}}
                onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background="#0d1525")}
                onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background=i%2===0?"#0a0f1e":"#080d17")}>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",borderRadius:"8px 0 0 8px",color:"#1e2e45",fontSize:11}}>{i+1}</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                  <div style={{fontWeight:700,color:"#e0ecff",fontSize:13}}>{s.name}</div>
                  <span style={{background:`${SCOL[s.s]||"#3b82f6"}20`,color:SCOL[s.s]||"#60a5fa",fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:600}}>{s.s}</span>
                </td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                  {s.live?.price ? (
                    <><div style={{fontWeight:800,color:"#e0ecff"}}>₹{fmt(s.live.price,1)}</div>
                    <div style={{fontSize:10,color:s.live.chg>=0?"#69f0ae":"#ff5252"}}>{s.live.chg>=0?"+":""}{fmt(s.live.chg,1)} ({fmt(s.live.pct,2)}%)</div></>
                  ):<span style={{color:"#1e2e45",fontSize:11}}>—</span>}
                </td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                  <span style={{fontWeight:600,color:s.pe<(SECTOR_PE[s.s]||25)?"#69f0ae":"#ffd740"}}>{s.pe}</span>
                  <span style={{color:"#1e2e45",fontSize:10}}> /{SECTOR_PE[s.s]||"—"}</span>
                </td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.pb<2?"#69f0ae":s.pb<5?"#ffd740":"#94a3b8"}}>{s.pb}</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.isB?"#2a3a55":s.de<0.5?"#69f0ae":s.de<1?"#ffd740":"#ff5252"}}>{s.isB?"—":s.de}</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:700,color:s.roe>25?"#00e676":s.roe>15?"#69f0ae":"#4a6080"}}>{s.roe}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:700,color:s.roce>25?"#00e676":s.roce>15?"#69f0ae":"#4a6080"}}>{s.roce}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.divY>3?"#ffd740":s.divY>1?"#94a3b8":"#2a3a55"}}>{s.divY}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.revG>20?"#69f0ae":s.revG>10?"#ffd740":"#4a6080"}}>{s.revG}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.profG>25?"#69f0ae":s.profG>10?"#ffd740":"#4a6080"}}>{s.profG}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.prHold>55?"#69f0ae":s.prHold>35?"#ffd740":"#4a6080"}}>{s.prHold||"—"}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.pledged===0?"#69f0ae":s.pledged<5?"#ffd740":"#ff5252"}}>{s.pledged}%</td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:38,height:5,background:"#141e30",borderRadius:99,overflow:"hidden"}}>
                      <div style={{width:`${s.score}%`,height:"100%",background:s.score>=78?"#00e676":s.score>=65?"#69f0ae":s.score>=52?"#ffd740":"#ff5252",borderRadius:99,transition:"width 0.5s"}}/>
                    </div>
                    <span style={{fontWeight:800,color:"#5a7090",fontSize:12,minWidth:20}}>{s.score}</span>
                  </div>
                </td>
                <td style={{padding:"9px 7px",background:i%2===0?"#0a0f1e":"#080d17",borderRadius:"0 8px 8px 0"}}>
                  <span style={{background:s.rec.bg,color:s.rec.c,padding:"3px 8px",borderRadius:4,fontSize:10,fontWeight:800,border:`1px solid ${s.rec.ring}`,whiteSpace:"nowrap"}}>{s.rec.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL ── */}
      {sel && (
        <div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,background:"#000000e0",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0a0f1e",borderRadius:18,padding:0,maxWidth:560,width:"100%",border:"1px solid #141e30",maxHeight:"90vh",overflowY:"auto"}}>

            {/* Modal header */}
            <div style={{padding:"20px 22px 14px",borderBottom:"1px solid #141e30"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:20,fontWeight:900,color:"#e0ecff"}}>{sel.name}</div>
                  <div style={{fontSize:11,color:"#2a3a55",marginTop:1}}>{sel.sym}</div>
                  <div style={{display:"flex",gap:6,marginTop:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{background:`${SCOL[sel.s]||"#3b82f6"}22`,color:SCOL[sel.s]||"#60a5fa",fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:600}}>{sel.s}</span>
                    <span style={{background:sel.rec.bg,color:sel.rec.c,fontSize:12,padding:"2px 10px",borderRadius:4,fontWeight:800,border:`1px solid ${sel.rec.ring}`}}>{sel.rec.label}</span>
                    <span style={{fontSize:13,fontWeight:900,color:sel.rec.c}}>{sel.score}/100</span>
                  </div>
                </div>
                <button onClick={()=>setSel(null)} style={{background:"#141e30",border:"1px solid #1e2e40",color:"#3d5070",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:0,borderBottom:"1px solid #141e30"}}>
              {[["overview","Overview"],["pillars","Score Breakdown"],["data","All Data"]].map(([id,l])=>(
                <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===id?"#3b82f6":"transparent"}`,color:tab===id?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:12,fontWeight:tab===id?700:400}}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{padding:"16px 22px 22px"}}>

            {/* TAB: OVERVIEW */}
            {tab==="overview" && <>
              {/* Live price */}
              {sel.live?.price && (
                <div style={{background:"#070b14",borderRadius:10,padding:14,marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                  <div><div style={{fontSize:20,fontWeight:900,color:"#e0ecff"}}>₹{fmt(sel.live.price,1)}</div><div style={{fontSize:10,color:"#2a3a55",marginTop:2}}>Live CMP</div></div>
                  <div><div style={{fontSize:18,fontWeight:800,color:sel.live.chg>=0?"#69f0ae":"#ff5252"}}>{sel.live.chg>=0?"+":""}{fmt(sel.live.pct,2)}%</div><div style={{fontSize:10,color:"#2a3a55",marginTop:2}}>Today</div></div>
                  <div><div style={{fontSize:18,fontWeight:800,color:sel.upside>0?"#69f0ae":"#ff5252"}}>{sel.upside!=null?`${sel.upside>0?"+":""}${sel.upside.toFixed(1)}%`:"—"}</div><div style={{fontSize:10,color:"#2a3a55",marginTop:2}}>To Target {fmtAt(sel.at)}</div></div>
                </div>
              )}

              {/* 52W range */}
              {sel.live?.h52 && sel.live?.l52 && (
                <div style={{background:"#070b14",borderRadius:8,padding:"12px 14px",marginBottom:12}}>
                  <div style={{fontSize:10,color:"#2a3a55",marginBottom:10}}>52-Week Range</div>
                  <div style={{position:"relative",height:6,background:"#141e30",borderRadius:99}}>
                    {sel.live.price && (
                      <div style={{position:"absolute",left:`${Math.min(94,Math.max(6,(sel.live.price-sel.live.l52)/(sel.live.h52-sel.live.l52)*100))}%`,top:-4,width:14,height:14,background:"#60a5fa",borderRadius:"50%",transform:"translateX(-50%)",border:"2px solid #0a0f1e",boxShadow:"0 0 10px #3b82f699"}}/>
                    )}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:7,fontSize:11}}>
                    <span style={{color:"#ff5252"}}>₹{fmt(sel.live.l52,0)} Low</span>
                    <span style={{color:"#69f0ae"}}>₹{fmt(sel.live.h52,0)} High</span>
                  </div>
                </div>
              )}

              {/* Volume */}
              {sel.vr && (
                <div style={{background:"#070b14",borderRadius:8,padding:"10px 14px",marginBottom:12,borderLeft:`3px solid ${sel.vr>1.5?"#00e676":"#ffd740"}`}}>
                  <div style={{fontSize:10,color:"#2a3a55",marginBottom:3}}>Volume vs Average</div>
                  <div style={{fontWeight:800,color:sel.vr>2?"#00e676":sel.vr>1.5?"#69f0ae":"#ffd740",fontSize:15}}>{sel.vr.toFixed(1)}× avg volume</div>
                  <div style={{fontSize:11,color:"#2a3a55",marginTop:2}}>Today: {fmtV(sel.live?.vol)} · 3M avg: {fmtV(sel.live?.avgVol)}</div>
                </div>
              )}

              {/* Analyst notes */}
              <div style={{background:"#070b14",borderRadius:8,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:10,color:"#2a3a55",marginBottom:5}}>Why This Stock</div>
                <div style={{fontSize:12,color:"#5a7090",lineHeight:1.7}}>{sel.note}</div>
              </div>

              {/* Key flags */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {l:"Analyst Rating",v:sel.ar,ok:sel.ar.includes("Buy")},
                  {l:"Dividend Yield",v:`${sel.divY}%`,ok:sel.divY>2},
                  {l:"FCF Quality",v:{H:"High ✓",M:"Medium",L:"Low ✗"}[sel.fcf],ok:sel.fcf==="H"},
                  {l:"Pledged Shares",v:`${sel.pledged}%`,ok:sel.pledged===0},
                ].map(it=>(
                  <div key={it.l} style={{background:"#070b14",borderRadius:8,padding:"10px 12px",borderLeft:`2px solid ${it.ok?"#34d399":"#f87171"}`}}>
                    <div style={{fontSize:9,color:"#2a3a55",marginBottom:3}}>{it.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:it.ok?"#34d399":"#f87171"}}>{it.v}</div>
                  </div>
                ))}
              </div>
            </>}

            {/* TAB: SCORE BREAKDOWN */}
            {tab==="pillars" && <>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#2a3a55",marginBottom:10}}>How the {sel.score}/100 score is built</div>
                {sel.pillars.map((p,i)=>{
                  const pct = p.score/p.max*100;
                  return (
                    <div key={p.name} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:12,fontWeight:600,color:"#8899bb"}}>{p.name}</span>
                        <span style={{fontSize:12,fontWeight:800,color:PILLAR_COLORS[i]}}>{p.score}<span style={{color:"#2a3a55",fontWeight:400}}>/{p.max}</span></span>
                      </div>
                      <div style={{height:8,background:"#141e30",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                        <div style={{width:`${pct}%`,height:"100%",background:PILLAR_COLORS[i],borderRadius:99,transition:"width 0.6s",opacity:0.85}}/>
                      </div>
                      <div style={{fontSize:10,color:"#2a3a55"}}>{p.detail}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{background:"#070b14",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#2a3a55",lineHeight:1.8}}>
                <strong style={{color:"#3d5070"}}>Score guide:</strong> ≥78 Strong Buy · ≥65 Buy · ≥52 Hold · ≥40 Reduce · &lt;40 Sell
              </div>
            </>}

            {/* TAB: ALL DATA */}
            {tab==="data" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {l:"P/E Ratio",v:sel.pe,sub:`Sector avg: ${SECTOR_PE[sel.s]||"—"}`,ok:sel.pe<(SECTOR_PE[sel.s]||999)},
                  {l:"Price/Book (P/B)",v:sel.pb,sub:sel.pb<2?"Cheap":sel.pb<5?"Fair":"Expensive",ok:sel.pb<3},
                  {l:"Debt/Equity",v:sel.isB?"N/A (Bank)":sel.de,sub:sel.isB?"Use NIM/NPA instead":"",ok:sel.isB||sel.de<0.5},
                  {l:"Return on Equity",v:`${sel.roe}%`,sub:sel.roe>20?"Excellent":sel.roe>15?"Good":"Below average",ok:sel.roe>15},
                  {l:"Return on Capital",v:`${sel.roce}%`,sub:sel.roce>20?"Excellent":sel.roce>15?"Good":"Below average",ok:sel.roce>15},
                  {l:"Dividend Yield",v:`${sel.divY}%`,sub:sel.divY>3?"High income":"Growth focused",ok:sel.divY>1},
                  {l:"Revenue Growth 3Y",v:`${sel.revG}%`,sub:"CAGR — higher = better",ok:sel.revG>12},
                  {l:"Profit Growth 3Y",v:`${sel.profG}%`,sub:"CAGR — higher = better",ok:sel.profG>15},
                  {l:"Promoter Holding",v:`${sel.prHold}%`,sub:sel.prHold>50?"High conviction":"Check trend",ok:sel.prHold>40||sel.prHold===0},
                  {l:"Pledged Shares",v:`${sel.pledged}%`,sub:sel.pledged===0?"Zero risk ✓":sel.pledged>10?"⚠ High risk":"Moderate",ok:sel.pledged<5},
                  {l:"Free Cash Flow",v:{H:"High ✓",M:"Medium",L:"Low ✗"}[sel.fcf],sub:"Is profit backed by real cash?",ok:sel.fcf==="H"},
                  {l:"Analyst Target",v:fmtAt(sel.at),sub:sel.upside!=null?`${sel.upside>0?"+":""}${sel.upside?.toFixed(1)}% upside`:"",ok:sel.upside>10},
                ].map(it=>(
                  <div key={it.l} style={{background:"#070b14",borderRadius:8,padding:"10px 12px",borderLeft:`2px solid ${it.ok?"#34d399":"#f87171"}`}}>
                    <div style={{fontSize:9,color:"#2a3a55",marginBottom:3}}>{it.l}</div>
                    <div style={{fontSize:14,fontWeight:800,color:"#e0ecff"}}>{it.v}</div>
                    {it.sub&&<div style={{fontSize:9,color:it.ok?"#2a4a2a":"#4a2a2a",marginTop:2}}>{it.sub}</div>}
                  </div>
                ))}
              </div>
            )}

            </div>
            <div style={{padding:"0 22px 16px",fontSize:10,color:"#141e30",borderTop:"1px solid #0d1525",paddingTop:12,lineHeight:1.6,marginTop:4}}>
              ⚠ Fundamental data is pre-loaded (approximate FY25/FY26 values). Live prices via Yahoo Finance. For educational reference only — verify before investing. Not SEBI-registered advice.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#070b14}
        ::-webkit-scrollbar-thumb{background:#141e30;border-radius:3px}
        input:focus{border-color:#2563eb!important}
        tbody tr:hover td{background:#0d1525!important}
      `}</style>
    </div>
  );
}
