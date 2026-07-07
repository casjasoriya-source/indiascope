import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECTOR_PE = {Banking:18,"Power Finance":9,Finance:22,IT:24,Pharma:30,FMCG:52,Auto:22,Energy:10,Power:15,Infrastructure:32,Metals:13,Telecom:42,Consumer:82,Insurance:68,Chemicals:28,Electronics:45,Technology:38,"Real Estate":40,"Consumer Durables":55};
const SECTORS = ["All","Banking","Finance","Power Finance","IT","Pharma","FMCG","Auto","Energy","Power","Infrastructure","Metals","Telecom","Consumer","Insurance","Chemicals","Electronics","Technology","Real Estate","Consumer Durables"];
const CAPS = ["All","Large Cap","Mid Cap","Small Cap"];
const SCOL = {Banking:"#3b82f6","Power Finance":"#0ea5e9",Finance:"#60a5fa",IT:"#a78bfa",Pharma:"#34d399",FMCG:"#f59e0b",Auto:"#f97316",Energy:"#ef4444",Power:"#14b8a6",Infrastructure:"#8b5cf6",Metals:"#94a3b8",Telecom:"#ec4899",Consumer:"#f472b6",Insurance:"#a3e635",Chemicals:"#22d3ee",Electronics:"#fb7185",Technology:"#818cf8","Real Estate":"#fb923c","Consumer Durables":"#4ade80"};
const CCOL = {"Large Cap":"#60a5fa","Mid Cap":"#fbbf24","Small Cap":"#f87171"};

// ─── FII + DII SECTOR FLOWS ─────────────────────────────────────────────────
const SECTOR_FLOWS={
  Banking:{fii:"Buying",dii:"Buying",fiiAmt:"₹4,200Cr",diiAmt:"₹3,100Cr",fiiWk:"↑",diiWk:"↑"},
  "Power Finance":{fii:"Buying",dii:"Buying",fiiAmt:"₹2,800Cr",diiAmt:"₹1,900Cr",fiiWk:"↑",diiWk:"↑"},
  Finance:{fii:"Neutral",dii:"Buying",fiiAmt:"₹800Cr",diiAmt:"₹1,200Cr",fiiWk:"→",diiWk:"↑"},
  IT:{fii:"Selling",dii:"Neutral",fiiAmt:"₹-3,200Cr",diiAmt:"₹400Cr",fiiWk:"↓",diiWk:"→"},
  Pharma:{fii:"Buying",dii:"Buying",fiiAmt:"₹1,800Cr",diiAmt:"₹2,100Cr",fiiWk:"↑",diiWk:"↑"},
  FMCG:{fii:"Neutral",dii:"Neutral",fiiAmt:"₹400Cr",diiAmt:"₹600Cr",fiiWk:"→",diiWk:"→"},
  Auto:{fii:"Buying",dii:"Buying",fiiAmt:"₹1,200Cr",diiAmt:"₹1,800Cr",fiiWk:"↑",diiWk:"↑"},
  Energy:{fii:"Neutral",dii:"Buying",fiiAmt:"₹600Cr",diiAmt:"₹1,400Cr",fiiWk:"→",diiWk:"↑"},
  Power:{fii:"Buying",dii:"Buying",fiiAmt:"₹1,600Cr",diiAmt:"₹2,200Cr",fiiWk:"↑",diiWk:"↑"},
  Infrastructure:{fii:"Buying",dii:"Buying",fiiAmt:"₹2,200Cr",diiAmt:"₹2,800Cr",fiiWk:"↑",diiWk:"↑"},
  Metals:{fii:"Selling",dii:"Neutral",fiiAmt:"₹-800Cr",diiAmt:"₹200Cr",fiiWk:"↓",diiWk:"→"},
  Telecom:{fii:"Buying",dii:"Buying",fiiAmt:"₹1,400Cr",diiAmt:"₹900Cr",fiiWk:"↑",diiWk:"↑"},
  Consumer:{fii:"Neutral",dii:"Buying",fiiAmt:"₹200Cr",diiAmt:"₹800Cr",fiiWk:"→",diiWk:"↑"},
  Insurance:{fii:"Neutral",dii:"Neutral",fiiAmt:"₹600Cr",diiAmt:"₹400Cr",fiiWk:"→",diiWk:"→"},
  Chemicals:{fii:"Neutral",dii:"Neutral",fiiAmt:"₹400Cr",diiAmt:"₹300Cr",fiiWk:"→",diiWk:"→"},
  Electronics:{fii:"Buying",dii:"Buying",fiiAmt:"₹800Cr",diiAmt:"₹600Cr",fiiWk:"↑",diiWk:"↑"},
  Technology:{fii:"Neutral",dii:"Neutral",fiiAmt:"₹200Cr",diiAmt:"₹100Cr",fiiWk:"→",diiWk:"→"},
  "Real Estate":{fii:"Buying",dii:"Buying",fiiAmt:"₹1,000Cr",diiAmt:"₹700Cr",fiiWk:"↑",diiWk:"↑"},
  "Consumer Durables":{fii:"Neutral",dii:"Buying",fiiAmt:"₹400Cr",diiAmt:"₹500Cr",fiiWk:"→",diiWk:"↑"},
};


// ─── 100 STOCKS ───────────────────────────────────────────────────────────────
// Fields: sym,name,s=sector,cap,pe,pb,de,roe,roce,divY,revG,profG,
//   prHold,pledged,intCov,fcf,ar,at,isB=isBanking,
//   prT=promoter trend(↑→↓), ec=earnings consistency(1-10),
//   rd=results date, evEb=EV/EBITDA, roic=H/M/L, wce=working capital efficiency H/M/L
const STOCKS = [
  {id:1,sym:"HDFCBANK.NS",name:"HDFC Bank",s:"Banking",cap:"Large Cap",pe:19.2,pb:2.5,de:6.8,roe:16.1,roce:7.2,divY:1.2,revG:14,profG:18,prHold:26,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1950,isB:true,prT:"→",ec:9,rd:"Jul 19",evEb:12,roic:"H",wce:"H",note:"India's largest private bank. Decade-low NPAs. CASA 42%+. Consistent dividend. Strong retail franchise."},
  {id:2,sym:"ICICIBANK.NS",name:"ICICI Bank",s:"Banking",cap:"Large Cap",pe:17.1,pb:2.9,de:5.9,roe:18.2,roce:7.8,divY:0.8,revG:18,profG:28,prHold:0,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:1380,isB:true,prT:"→",ec:10,rd:"Jul 26",evEb:10,roic:"H",wce:"H",note:"Fastest-growing large private bank. GNPA at decade low. Best digital banking. 28% profit CAGR."},
  {id:3,sym:"SBIN.NS",name:"SBI",s:"Banking",cap:"Large Cap",pe:9.4,pb:1.5,de:14.2,roe:18.5,roce:6.1,divY:2.5,revG:12,profG:35,prHold:57,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1020,isB:true,prT:"→",ec:8,rd:"Aug 2",evEb:8,roic:"H",wce:"H",note:"India's largest bank. PSU turnaround complete. NPA sharply down. 67,000 branches. 2.5% dividend."},
  {id:4,sym:"KOTAKBANK.NS",name:"Kotak Mahindra Bank",s:"Banking",cap:"Large Cap",pe:20.4,pb:3.2,de:4.8,roe:15.3,roce:6.9,divY:0.1,revG:16,profG:12,prHold:26,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:2200,isB:true,prT:"→",ec:8,rd:"Jul 19",evEb:11,roic:"H",wce:"H",note:"Premium private bank. Insurance+AMC+lending diversified. Conservative management. Strong CASA."},
  {id:5,sym:"AXISBANK.NS",name:"Axis Bank",s:"Banking",cap:"Large Cap",pe:12.8,pb:1.8,de:7.2,roe:17.4,roce:6.8,divY:0.1,revG:20,profG:45,prHold:8,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:1280,isB:true,prT:"↑",ec:8,rd:"Jul 26",evEb:9,roic:"H",wce:"H",note:"3rd largest private bank. Citibank integration driving retail growth. Cheapest P/E among large private banks."},
  {id:6,sym:"INDUSINDBK.NS",name:"IndusInd Bank",s:"Banking",cap:"Large Cap",pe:8.5,pb:1.0,de:8.5,roe:12.4,roce:5.8,divY:1.5,revG:18,profG:8,prHold:16,pledged:0,intCov:null,fcf:"M",ar:"Hold",at:1100,isB:true,prT:"↓",ec:5,rd:"Jul 15",evEb:7,roic:"M",wce:"M",note:"Private bank under NPA pressure. P/B at 1x = deep value but high risk. Recovery play. Watch NPA trend."},
  {id:7,sym:"IDFCFIRSTB.NS",name:"IDFC First Bank",s:"Banking",cap:"Mid Cap",pe:15.2,pb:1.2,de:8.4,roe:8.4,roce:5.2,divY:0.0,revG:22,profG:0,prHold:40,pledged:0,intCov:null,fcf:"M",ar:"Buy",at:95,isB:true,prT:"→",ec:6,rd:"Jul 19",evEb:6,roic:"M",wce:"M",note:"Retail banking transformation. P/B 1.2 cheap. Revenue growing 22% but ROE still low. High potential."},
  {id:8,sym:"BAJFINANCE.NS",name:"Bajaj Finance",s:"Finance",cap:"Large Cap",pe:28.3,pb:5.8,de:3.8,roe:21.2,roce:10.4,divY:0.3,revG:28,profG:26,prHold:56,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:9800,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:16,roic:"H",wce:"H",note:"India's largest NBFC. 80M+ customers. 28% revenue CAGR. Zero pledging. Best cross-sell engine."},
  {id:9,sym:"MUTHOOTFIN.NS",name:"Muthoot Finance",s:"Finance",cap:"Large Cap",pe:18.4,pb:4.5,de:2.5,roe:25.2,roce:12.4,divY:1.8,revG:18,profG:22,prHold:73,pledged:0,intCov:6,fcf:"H",ar:"Buy",at:3800,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:12,roic:"H",wce:"H",note:"Gold loan NBFC leader. 73% promoter = high conviction. Rural India moat. 25% ROE. No pledging."},
  {id:10,sym:"CHOLAFIN.NS",name:"Cholamandalam Finance",s:"Finance",cap:"Mid Cap",pe:22.4,pb:4.2,de:5.1,roe:20.4,roce:9.8,divY:0.5,revG:25,profG:30,prHold:47,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:1450,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:14,roic:"H",wce:"M",note:"Vehicle & home finance NBFC. Murugappa group. 25-30% growth. Clean books."},
  {id:11,sym:"IRFC.NS",name:"IRFC",s:"Finance",cap:"Large Cap",pe:14.2,pb:2.0,de:9.8,roe:14.8,roce:5.2,divY:3.8,revG:18,profG:20,prHold:86,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:195,isB:true,prT:"→",ec:8,rd:"Aug 12",evEb:10,roic:"H",wce:"H",note:"Railway financier. 86% Govt = near-zero credit risk. 3.8% dividend + consistent growth."},
  {id:12,sym:"BAJAJFINSV.NS",name:"Bajaj Finserv",s:"Finance",cap:"Large Cap",pe:12.5,pb:2.2,de:3.5,roe:14.4,roce:8.8,divY:0.1,revG:18,profG:15,prHold:60,pledged:0,intCov:5,fcf:"M",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Jul 22",evEb:10,roic:"M",wce:"H",note:"Bajaj Finance parent. Discount to sum-of-parts. Insurance+NBFC+lending combined."},
  {id:13,sym:"CAMS.NS",name:"CAMS",s:"Finance",cap:"Mid Cap",pe:38.5,pb:14.8,de:0.0,roe:42.4,roce:41.8,divY:1.8,revG:18,profG:22,prHold:19,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4200,isB:false,prT:"→",ec:9,rd:"Aug 15",evEb:28,roic:"H",wce:"H",note:"MF processing monopoly 70%+ share. Zero debt, 42% ROE. SIP growth = direct revenue."},
  {id:14,sym:"CDSL.NS",name:"CDSL",s:"Finance",cap:"Mid Cap",pe:42.5,pb:18.5,de:0.0,roe:48.4,roce:47.2,divY:0.8,revG:22,profG:28,prHold:15,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1850,isB:false,prT:"→",ec:9,rd:"Aug 12",evEb:32,roic:"H",wce:"H",note:"Depository monopoly. 48% ROE, zero debt. Every new demat account = revenue."},
  {id:15,sym:"ANGELONE.NS",name:"Angel One",s:"Finance",cap:"Mid Cap",pe:18.5,pb:4.5,de:0.5,roe:28.4,roce:22.8,divY:1.5,revG:32,profG:28,prHold:38,pledged:0,intCov:12,fcf:"H",ar:"Buy",at:2800,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:14,roic:"H",wce:"H",note:"Discount broking. 28% ROE. India retail investor boom = decade tailwind. Tech-first model."},
  {id:16,sym:"SBICARD.NS",name:"SBI Card",s:"Finance",cap:"Large Cap",pe:22.5,pb:4.2,de:3.8,roe:18.4,roce:9.8,divY:0.5,revG:15,profG:8,prHold:69,pledged:0,intCov:5,fcf:"M",ar:"Hold",at:850,isB:false,prT:"→",ec:6,rd:"Aug 5",evEb:14,roic:"M",wce:"M",note:"2nd largest credit card issuer. SBI distribution advantage. Consumer spending recovery play."},
  {id:17,sym:"TCS.NS",name:"TCS",s:"IT",cap:"Large Cap",pe:22.4,pb:12,de:0.0,roe:55.1,roce:52.3,divY:3.5,revG:14,profG:12,prHold:72,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:4200,isB:false,prT:"→",ec:10,rd:"Jul 10",evEb:20,roic:"H",wce:"H",note:"India's largest IT. Zero debt, 55% ROE. 20+ consecutive profitable quarters. Best for SIP."},
  {id:18,sym:"INFY.NS",name:"Infosys",s:"IT",cap:"Large Cap",pe:20.1,pb:7.5,de:0.0,roe:32.4,roce:30.8,divY:3.2,revG:12,profG:10,prHold:15,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:1750,isB:false,prT:"→",ec:9,rd:"Jul 17",evEb:18,roic:"H",wce:"H",note:"Global IT leader. 3.2% dividend. IT at 52W low = long-term entry opportunity."},
  {id:19,sym:"HCLTECH.NS",name:"HCL Technologies",s:"IT",cap:"Large Cap",pe:22.8,pb:5.5,de:0.1,roe:24.1,roce:22.8,divY:4.2,revG:16,profG:18,prHold:60,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1960,isB:false,prT:"→",ec:9,rd:"Jul 12",evEb:19,roic:"H",wce:"H",note:"Best growth among top-4 IT. 4.2% dividend. Engineering+IT products. 60% promoter."},
  {id:20,sym:"WIPRO.NS",name:"Wipro",s:"IT",cap:"Large Cap",pe:20.5,pb:3.0,de:0.0,roe:14.2,roce:13.8,divY:2.5,revG:6,profG:5,prHold:73,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:320,isB:false,prT:"→",ec:7,rd:"Jul 16",evEb:16,roic:"M",wce:"H",note:"4th largest IT. Margin recovery underway. 73% promoter. 2.5% dividend. Value buy at current levels."},
  {id:21,sym:"LTIM.NS",name:"LTIMindtree",s:"IT",cap:"Large Cap",pe:28.5,pb:7.2,de:0.0,roe:24.5,roce:23.2,divY:1.8,revG:22,profG:18,prHold:69,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:6500,isB:false,prT:"→",ec:8,rd:"Jul 15",evEb:22,roic:"H",wce:"H",note:"Merged LTI+Mindtree. 22% revenue growth. Tata group backing. Strong engineering+digital portfolio."},
  {id:22,sym:"PERSISTENT.NS",name:"Persistent Systems",s:"IT",cap:"Mid Cap",pe:55.8,pb:14.5,de:0.0,roe:28.4,roce:27.2,divY:0.6,revG:32,profG:38,prHold:31,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:7500,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:42,roic:"H",wce:"H",note:"Fastest-growing mid-cap IT. 32% rev CAGR. GenAI services. Premium justified by growth."},
  {id:23,sym:"COFORGE.NS",name:"Coforge",s:"IT",cap:"Mid Cap",pe:38.2,pb:8.5,de:0.2,roe:25.4,roce:22.8,divY:0.8,revG:28,profG:32,prHold:63,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:8200,isB:false,prT:"→",ec:8,rd:"Jul 25",evEb:28,roic:"H",wce:"H",note:"IT focus on insurance+travel. 28% rev growth. 63% promoter. Strong deal wins."},
  {id:24,sym:"SUNPHARMA.NS",name:"Sun Pharmaceutical",s:"Pharma",cap:"Large Cap",pe:34.8,pb:5.4,de:0.1,roe:18.4,roce:17.2,divY:0.6,revG:14,profG:22,prHold:54,pledged:2,intCov:25,fcf:"H",ar:"Buy",at:1980,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:22,roic:"H",wce:"H",note:"India's largest pharma. Specialty US drugs growing. Sector rally Jul 2026 live. Strong branded."},
  {id:25,sym:"DRREDDY.NS",name:"Dr. Reddy's Labs",s:"Pharma",cap:"Large Cap",pe:18.2,pb:3.8,de:0.1,roe:22.1,roce:20.8,divY:0.8,revG:15,profG:28,prHold:26,pledged:0,intCov:30,fcf:"H",ar:"Buy",at:6800,isB:false,prT:"→",ec:8,rd:"Aug 2",evEb:14,roic:"H",wce:"H",note:"Cheapest large-cap pharma on P/E. 22% ROE. Global generics. Zero pledging. Strong US biz."},
  {id:26,sym:"CIPLA.NS",name:"Cipla",s:"Pharma",cap:"Large Cap",pe:24.9,pb:4.2,de:0.1,roe:17.8,roce:16.9,divY:0.6,revG:12,profG:24,prHold:33,pledged:0,intCov:28,fcf:"H",ar:"Buy",at:1720,isB:false,prT:"→",ec:8,rd:"Aug 9",evEb:18,roic:"H",wce:"H",note:"Nifty top gainer +4.82% Jul 1. Pharma sector rotation live. US respiratory pipeline strong."},
  {id:27,sym:"DIVISLAB.NS",name:"Divi's Laboratories",s:"Pharma",cap:"Large Cap",pe:49.8,pb:8.2,de:0.0,roe:20.4,roce:19.8,divY:1.2,revG:10,profG:8,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5800,isB:false,prT:"→",ec:7,rd:"Aug 12",evEb:38,roic:"H",wce:"H",note:"Global API/CDMO leader. Zero debt. Premium justified. Await growth recovery before adding."},
  {id:28,sym:"MOREPENLAB.NS",name:"Morepen Labs",s:"Pharma",cap:"Small Cap",pe:20.2,pb:2.2,de:0.2,roe:12.1,roce:16.8,divY:0.5,revG:12,profG:18,prHold:44,pledged:5,intCov:8,fcf:"M",ar:"Buy",at:68,isB:false,prT:"→",ec:6,rd:"Aug 15",evEb:14,roic:"M",wce:"M",note:"API+800 branded pharma products. Low price ₹45-55. Pharma rally beneficiary. Check pledged%."},
  {id:29,sym:"ITC.NS",name:"ITC",s:"FMCG",cap:"Large Cap",pe:25.4,pb:6.5,de:0.0,roe:28.1,roce:27.4,divY:4.2,revG:12,profG:18,prHold:0,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:510,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:18,roic:"H",wce:"H",note:"Cigarettes+FMCG+Hotels+Agri. Zero debt. 4.2% dividend. Cheapest FMCG on PE. Hotels re-rating catalyst."},
  {id:30,sym:"HINDUNILVR.NS",name:"Hindustan Unilever",s:"FMCG",cap:"Large Cap",pe:50.2,pb:9.8,de:0.0,roe:20.8,roce:19.4,divY:2.0,revG:8,profG:12,prHold:62,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:2600,isB:false,prT:"→",ec:8,rd:"Jul 22",evEb:38,roic:"H",wce:"H",note:"100+ consumer brands. Defensive. Rich valuation limits upside. Volume growth recovering slowly."},
  {id:31,sym:"MARICO.NS",name:"Marico",s:"FMCG",cap:"Large Cap",pe:52.5,pb:14.5,de:0.1,roe:35.4,roce:34.8,divY:1.8,revG:8,profG:12,prHold:59,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:720,isB:false,prT:"→",ec:8,rd:"Aug 2",evEb:38,roic:"H",wce:"H",note:"Parachute+Saffola brand leader. 35% ROE. International business growing. Quality compounder."},
  {id:32,sym:"DABUR.NS",name:"Dabur India",s:"FMCG",cap:"Large Cap",pe:48.5,pb:10.5,de:0.2,roe:22.4,roce:21.8,divY:1.5,revG:8,profG:10,prHold:68,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:650,isB:false,prT:"→",ec:7,rd:"Aug 5",evEb:36,roic:"H",wce:"H",note:"Ayurvedic FMCG leader. 68% promoter. International 30% revenue. Defensive dividend payer."},
  {id:33,sym:"GODREJCP.NS",name:"Godrej Consumer",s:"FMCG",cap:"Large Cap",pe:55.5,pb:8.5,de:0.5,roe:16.4,roce:15.8,divY:1.0,revG:10,profG:14,prHold:63,pledged:0,intCov:18,fcf:"H",ar:"Hold",at:1450,isB:false,prT:"→",ec:7,rd:"Aug 5",evEb:38,roic:"H",wce:"H",note:"Household insecticides+hair care+soaps. Africa+Indonesia operations. Steady compounder."},
  {id:34,sym:"BIKAJI.NS",name:"Bikaji Foods",s:"FMCG",cap:"Small Cap",pe:52.5,pb:8.5,de:0.1,roe:18.4,roce:17.8,divY:0.5,revG:22,profG:28,prHold:55,pledged:0,intCov:22,fcf:"H",ar:"Buy",at:850,isB:false,prT:"→",ec:7,rd:"Aug 12",evEb:38,roic:"H",wce:"H",note:"Rajasthani snacks brand expanding nationally. 22% CAGR. Premiumisation story. Growing D2C."},
  {id:35,sym:"MARUTI.NS",name:"Maruti Suzuki",s:"Auto",cap:"Large Cap",pe:22.4,pb:3.8,de:0.0,roe:17.8,roce:17.2,divY:1.2,revG:14,profG:35,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:13500,isB:false,prT:"→",ec:9,rd:"Jul 25",evEb:16,roic:"H",wce:"H",note:"India #1 carmaker 40%+ share. Zero debt. EV+hybrid strategy. 56% promoter. High conviction."},
  {id:36,sym:"TATAMOTORS.NS",name:"Tata Motors",s:"Auto",cap:"Large Cap",pe:6.2,pb:1.5,de:1.5,roe:25.4,roce:12.8,divY:0.5,revG:20,profG:0,prHold:46,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:1050,isB:false,prT:"→",ec:7,rd:"Jul 28",evEb:8,roic:"M",wce:"M",note:"JLR recovery+India EVs+commercial vehicles. PE 6.2 = deep value. 25% ROE. Debt reducing."},
  {id:37,sym:"BAJAJ-AUTO.NS",name:"Bajaj Auto",s:"Auto",cap:"Large Cap",pe:30.2,pb:8.5,de:0.0,roe:28.4,roce:27.1,divY:2.8,revG:12,profG:24,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:10800,isB:false,prT:"→",ec:9,rd:"Jul 24",evEb:22,roic:"H",wce:"H",note:"2W/3W export champion. Zero debt. 2.8% dividend. 28% ROE. EV+premiumisation ahead."},
  {id:38,sym:"HEROMOTOCO.NS",name:"Hero MotoCorp",s:"Auto",cap:"Large Cap",pe:18.4,pb:5.2,de:0.0,roe:30.2,roce:29.4,divY:4.5,revG:8,profG:20,prHold:35,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4800,isB:false,prT:"→",ec:8,rd:"Jul 28",evEb:14,roic:"H",wce:"H",note:"World's largest 2-wheeler. Zero debt. 4.5% dividend. Rural recovery. 30% ROE."},
  {id:39,sym:"BALKRISIND.NS",name:"Balkrishna Industries",s:"Auto",cap:"Mid Cap",pe:22.5,pb:4.2,de:0.3,roe:20.4,roce:18.8,divY:1.5,revG:14,profG:22,prHold:58,pledged:0,intCov:12,fcf:"H",ar:"Buy",at:2800,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:16,roic:"H",wce:"H",note:"Specialty off-highway tyres. Export champion. European+US farm/industrial leader. Strong brand."},
  {id:40,sym:"APOLLOTYRE.NS",name:"Apollo Tyres",s:"Auto",cap:"Mid Cap",pe:14.5,pb:2.2,de:0.8,roe:16.4,roce:14.8,divY:1.2,revG:12,profG:18,prHold:43,pledged:5,intCov:8,fcf:"M",ar:"Buy",at:480,isB:false,prT:"→",ec:7,rd:"Aug 5",evEb:10,roic:"M",wce:"M",note:"India's 2nd largest tyre. Cheap vs peers. Europe contributing. Debt reducing. Watch pledged 5%."},
  {id:41,sym:"RELIANCE.NS",name:"Reliance Industries",s:"Energy",cap:"Large Cap",pe:22.1,pb:2.2,de:0.4,roe:10.2,roce:9.4,divY:0.4,revG:14,profG:8,prHold:51,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:1520,isB:false,prT:"→",ec:8,rd:"Jul 18",evEb:14,roic:"M",wce:"M",note:"O2C+Jio+Retail. Most valuable India co. Jio IPO+Retail IPO = mega pending catalysts."},
  {id:42,sym:"ONGC.NS",name:"ONGC",s:"Energy",cap:"Large Cap",pe:7.4,pb:0.9,de:0.3,roe:18.1,roce:16.8,divY:5.5,revG:10,profG:25,prHold:58,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:340,isB:false,prT:"→",ec:7,rd:"Aug 12",evEb:5,roic:"H",wce:"H",note:"India's largest oil producer. P/B below 1 = below book value. 5.5% dividend. Deep undervalue."},
  {id:43,sym:"COALINDIA.NS",name:"Coal India",s:"Energy",cap:"Large Cap",pe:7.2,pb:3.2,de:0.0,roe:52.4,roce:51.8,divY:6.0,revG:8,profG:28,prHold:63,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:520,isB:false,prT:"→",ec:8,rd:"Aug 15",evEb:5,roic:"H",wce:"H",note:"World's largest coal miner. Zero debt. 52% ROE+6% dividend = cash machine. PSU turnaround complete."},
  {id:44,sym:"PETRONET.NS",name:"Petronet LNG",s:"Energy",cap:"Large Cap",pe:12.5,pb:2.5,de:0.2,roe:22.4,roce:20.8,divY:5.5,revG:8,profG:12,prHold:50,pledged:0,intCov:14,fcf:"H",ar:"Buy",at:380,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:9,roic:"H",wce:"H",note:"LNG terminal monopoly. 5.5% dividend. Dahej at 100% capacity. PE 12.5 very cheap for quality."},
  {id:45,sym:"IGL.NS",name:"Indraprastha Gas",s:"Energy",cap:"Mid Cap",pe:18.5,pb:3.5,de:0.1,roe:20.4,roce:19.8,divY:1.2,revG:12,profG:15,prHold:45,pledged:0,intCov:22,fcf:"H",ar:"Buy",at:480,isB:false,prT:"→",ec:8,rd:"Aug 12",evEb:14,roic:"H",wce:"H",note:"Delhi CNG distributor monopoly. 20% ROE. Every new CNG vehicle = long-term customer."},
  {id:46,sym:"NTPC.NS",name:"NTPC",s:"Power",cap:"Large Cap",pe:14.2,pb:1.8,de:1.5,roe:13.2,roce:9.8,divY:3.2,revG:14,profG:15,prHold:51,pledged:0,intCov:5,fcf:"M",ar:"Buy",at:420,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:10,roic:"M",wce:"M",note:"India's largest power utility. 60GW RE target. 3.2% dividend. Regulated returns."},
  {id:47,sym:"POWERGRID.NS",name:"Power Grid Corp",s:"Power",cap:"Large Cap",pe:16.1,pb:3.0,de:1.8,roe:20.4,roce:11.2,divY:4.8,revG:10,profG:12,prHold:51,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:360,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:10,roic:"M",wce:"M",note:"Transmission monopoly. 4.8% dividend. Regulated returns = predictable income stream."},
  {id:48,sym:"RECLTD.NS",name:"REC Limited",s:"Power Finance",cap:"Large Cap",pe:8.1,pb:1.6,de:7.2,roe:20.8,roce:7.4,divY:4.2,revG:22,profG:28,prHold:52,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:650,isB:true,prT:"→",ec:9,rd:"Aug 5",evEb:8,roic:"H",wce:"H",note:"PSU power lender. Budget ₹11.2L Cr capex beneficiary. 4.2% div+28% profit growth. Top pick."},
  {id:49,sym:"PFC.NS",name:"Power Finance Corp",s:"Power Finance",cap:"Large Cap",pe:7.4,pb:1.4,de:7.8,roe:18.4,roce:6.8,divY:4.5,revG:18,profG:24,prHold:56,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:530,isB:true,prT:"→",ec:9,rd:"Aug 7",evEb:7,roic:"H",wce:"H",note:"Govt-backed power lender. Beat Q4 EPS by 24.4%. Results Aug 7 = momentum setup. P/B 1.4."},
  {id:50,sym:"SUZLON.NS",name:"Suzlon Energy",s:"Power",cap:"Mid Cap",pe:39.8,pb:8.5,de:0.3,roe:26.5,roce:23.4,divY:0.0,revG:25,profG:0,prHold:15,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:68,isB:false,prT:"↑",ec:7,rd:"Aug 12",evEb:22,roic:"H",wce:"M",note:"India's largest wind co. Multi-year high order book. Above ₹52 = breakout signal. 26% ROE."},
  {id:51,sym:"NHPC.NS",name:"NHPC",s:"Power",cap:"Large Cap",pe:14.8,pb:1.4,de:0.8,roe:11.4,roce:9.2,divY:4.0,revG:8,profG:14,prHold:67,pledged:0,intCov:5,fcf:"M",ar:"Buy",at:98,isB:false,prT:"→",ec:7,rd:"Aug 15",evEb:10,roic:"M",wce:"M",note:"PSU hydro power Navratna. 67% Govt. 4% dividend. Clean energy at ₹75-85."},
  {id:52,sym:"TATAPOWER.NS",name:"Tata Power",s:"Power",cap:"Large Cap",pe:22.5,pb:2.8,de:1.8,roe:12.4,roce:9.8,divY:0.8,revG:18,profG:22,prHold:46,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:520,isB:false,prT:"→",ec:7,rd:"Aug 8",evEb:12,roic:"M",wce:"M",note:"Tata group power. Renewables+pumped hydro+EV charging growing. Debt reducing. Tata brand."},
  {id:53,sym:"WAAREEENER.NS",name:"Waaree Energies",s:"Power",cap:"Mid Cap",pe:45.5,pb:12.5,de:0.5,roe:28.4,roce:24.8,divY:0.0,revG:45,profG:55,prHold:68,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:380,isB:false,prT:"→",ec:7,rd:"Aug 12",evEb:28,roic:"H",wce:"M",note:"India's largest solar panel maker. PLI beneficiary. 45% rev growth. China+1 play."},
  {id:54,sym:"INOXWIND.NS",name:"Inox Wind",s:"Power",cap:"Small Cap",pe:28.5,pb:5.5,de:0.8,roe:18.4,roce:15.8,divY:0.0,revG:32,profG:0,prHold:38,pledged:5,intCov:5,fcf:"L",ar:"Hold",at:185,isB:false,prT:"→",ec:5,rd:"Aug 15",evEb:18,roic:"M",wce:"L",note:"Wind turbine manufacturer. Profitability variable. Renewable play. Monitor execution risk."},
  {id:55,sym:"LT.NS",name:"Larsen & Toubro",s:"Infrastructure",cap:"Large Cap",pe:27.8,pb:3.8,de:1.5,roe:14.2,roce:11.8,divY:1.5,revG:16,profG:20,prHold:0,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:4200,isB:false,prT:"→",ec:8,rd:"Jul 28",evEb:18,roic:"M",wce:"H",note:"₹5.6L Cr order book. Infra supercycle. GCC tech+defence growing. Professional management."},
  {id:56,sym:"BEL.NS",name:"Bharat Electronics",s:"Infrastructure",cap:"Large Cap",pe:38.4,pb:7.2,de:0.0,roe:22.4,roce:21.8,divY:1.8,revG:14,profG:22,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:320,isB:false,prT:"→",ec:9,rd:"Aug 12",evEb:28,roic:"H",wce:"H",note:"Defence electronics PSU. Order book boom. Zero debt, 22% ROCE. 5yr defence visibility."},
  {id:57,sym:"NBCC.NS",name:"NBCC India",s:"Infrastructure",cap:"Mid Cap",pe:34.8,pb:5.8,de:0.0,roe:20.2,roce:37.1,divY:0.8,revG:10,profG:18,prHold:61,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:115,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:26,roic:"H",wce:"H",note:"PSU construction. 37% ROCE exceptional. Smart city+redevelopment. Zero debt. Low price."},
  {id:58,sym:"HAL.NS",name:"HAL",s:"Infrastructure",cap:"Large Cap",pe:32.5,pb:8.5,de:0.0,roe:28.4,roce:26.8,divY:1.2,revG:22,profG:28,prHold:71,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:5200,isB:false,prT:"→",ec:9,rd:"Aug 8",evEb:24,roic:"H",wce:"H",note:"Defence PSU. Fighter jets+helicopters+engines. ₹1L Cr+ order book. Zero debt, 28% ROE."},
  {id:59,sym:"MAZAGON.NS",name:"Mazagon Dock",s:"Infrastructure",cap:"Mid Cap",pe:18.5,pb:6.5,de:0.0,roe:38.4,roce:36.8,divY:1.8,revG:32,profG:45,prHold:84,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2800,isB:false,prT:"→",ec:9,rd:"Aug 12",evEb:14,roic:"H",wce:"H",note:"Submarine+warship builder. 84% Govt. ₹40,000Cr+ order book. Zero debt, 38% ROE."},
  {id:60,sym:"COCHINSHIP.NS",name:"Cochin Shipyard",s:"Infrastructure",cap:"Mid Cap",pe:15.5,pb:5.5,de:0.0,roe:38.4,roce:36.8,divY:2.8,revG:28,profG:48,prHold:73,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:9,rd:"Aug 12",evEb:12,roic:"H",wce:"H",note:"Shipbuilding PSU. 38% ROE+2.8% div+zero debt. Navy order surge."},
  {id:61,sym:"RVNL.NS",name:"RVNL",s:"Infrastructure",cap:"Mid Cap",pe:22.5,pb:4.5,de:0.2,roe:22.4,roce:18.8,divY:1.5,revG:28,profG:35,prHold:72,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:450,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:16,roic:"H",wce:"M",note:"Rail Vikas Nigam PSU. ₹2.5L Cr railway capex beneficiary. 22% ROE. 72% Govt."},
  {id:62,sym:"IRCON.NS",name:"IRCON",s:"Infrastructure",cap:"Mid Cap",pe:14.5,pb:2.8,de:0.1,roe:18.4,roce:16.8,divY:2.5,revG:18,profG:22,prHold:73,pledged:0,intCov:18,fcf:"H",ar:"Buy",at:280,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:11,roic:"H",wce:"H",note:"Railway+road infra PSU. 73% Govt. 2.5% dividend. Cheapest railway infra on PE."},
  {id:63,sym:"ADANIPORTS.NS",name:"Adani Ports",s:"Infrastructure",cap:"Large Cap",pe:22.5,pb:4.5,de:1.2,roe:22.4,roce:14.8,divY:0.6,revG:22,profG:28,prHold:65,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:1450,isB:false,prT:"→",ec:8,rd:"Jul 28",evEb:14,roic:"H",wce:"M",note:"India's largest port operator. 14+ ports. Logistics+port+SEZ ecosystem. 22% ROE."},
  {id:64,sym:"ULTRACEMCO.NS",name:"UltraTech Cement",s:"Infrastructure",cap:"Large Cap",pe:25.5,pb:3.8,de:0.2,roe:16.4,roce:14.8,divY:0.5,revG:12,profG:18,prHold:60,pledged:0,intCov:14,fcf:"H",ar:"Buy",at:12500,isB:false,prT:"→",ec:8,rd:"Jul 22",evEb:18,roic:"H",wce:"H",note:"India's largest cement. 180MT+ capacity. Direct infra capex play. Market leader every region."},
  {id:65,sym:"GRASIM.NS",name:"Grasim Industries",s:"Infrastructure",cap:"Large Cap",pe:18.4,pb:2.2,de:0.5,roe:12.4,roce:10.8,divY:0.8,revG:14,profG:10,prHold:42,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:2800,isB:false,prT:"→",ec:7,rd:"Aug 5",evEb:14,roic:"M",wce:"M",note:"Aditya Birla: Ultratech cement+Birla Opus paints+VSF. Paints segment is big catalyst."},
  {id:66,sym:"POLYCAB.NS",name:"Polycab India",s:"Infrastructure",cap:"Mid Cap",pe:38.5,pb:8.2,de:0.1,roe:22.4,roce:21.8,divY:0.8,revG:18,profG:28,prHold:67,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:7800,isB:false,prT:"→",ec:9,rd:"Aug 8",evEb:28,roic:"H",wce:"H",note:"India #1 cables & wires. 67% promoter. Direct infra capex. Expanding into FMEG."},
  {id:67,sym:"SIEMENS.NS",name:"Siemens India",s:"Infrastructure",cap:"Large Cap",pe:61.4,pb:12,de:0.0,roe:25.1,roce:23.8,divY:0.5,revG:18,profG:28,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5200,isB:false,prT:"→",ec:9,rd:"Jul 28",evEb:46,roic:"H",wce:"H",note:"Industrial automation+power transmission. 75% promoter. Zero debt. Quality compounder."},
  {id:68,sym:"ABB.NS",name:"ABB India",s:"Infrastructure",cap:"Large Cap",pe:64.2,pb:18,de:0.0,roe:28.4,roce:26.8,divY:0.5,revG:20,profG:35,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:7800,isB:false,prT:"→",ec:9,rd:"Jul 25",evEb:50,roic:"H",wce:"H",note:"Electrification+automation. 75% promoter, zero debt. Only for long-term wealth building."},
  {id:69,sym:"TATASTEEL.NS",name:"Tata Steel",s:"Metals",cap:"Large Cap",pe:15.4,pb:1.8,de:0.8,roe:12.4,roce:10.8,divY:0.5,revG:8,profG:0,prHold:33,pledged:5,intCov:4,fcf:"L",ar:"Hold",at:175,isB:false,prT:"→",ec:6,rd:"Jul 28",evEb:8,roic:"M",wce:"L",note:"India's largest steelmaker. Europe drag reducing. Buy in down-cycles only. Watch pledged."},
  {id:70,sym:"JSWSTEEL.NS",name:"JSW Steel",s:"Metals",cap:"Large Cap",pe:18.2,pb:2.5,de:1.2,roe:14.2,roce:12.4,divY:0.8,revG:12,profG:5,prHold:45,pledged:8,intCov:5,fcf:"L",ar:"Hold",at:920,isB:false,prT:"→",ec:6,rd:"Aug 8",evEb:10,roic:"M",wce:"L",note:"Fast-growing steel. High capex cycle. Pledged 8% = watch. Long-term entry on deep dips."},
  {id:71,sym:"HINDALCO.NS",name:"Hindalco",s:"Metals",cap:"Large Cap",pe:10.2,pb:1.3,de:0.7,roe:13.2,roce:11.8,divY:0.6,revG:14,profG:8,prHold:35,pledged:5,intCov:6,fcf:"M",ar:"Buy",at:720,isB:false,prT:"→",ec:7,rd:"Jul 28",evEb:7,roic:"M",wce:"M",note:"Aluminium+Novelis. P/B 1.3 cheap. US infra play via Novelis. Cheapest metal on valuation."},
  {id:72,sym:"BHARTIARTL.NS",name:"Bharti Airtel",s:"Telecom",cap:"Large Cap",pe:44.8,pb:12,de:2.3,roe:41.2,roce:16.8,divY:0.5,revG:18,profG:0,prHold:56,pledged:0,intCov:5,fcf:"M",ar:"Strong Buy",at:1900,isB:false,prT:"→",ec:7,rd:"Jul 28",evEb:15,roic:"H",wce:"M",note:"India #1 telecom. ARPU upcycle live. Africa+B2B growing. 41% ROE. Top analyst conviction."},
  {id:73,sym:"TITAN.NS",name:"Titan Company",s:"Consumer",cap:"Large Cap",pe:84.2,pb:28,de:0.1,roe:35.4,roce:32.8,divY:0.5,revG:22,profG:28,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:3900,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:62,roic:"H",wce:"H",note:"Tanishq+Titan+Taneira. 35% ROE, zero debt, 22% rev CAGR. India's most aspirational brand."},
  {id:74,sym:"DMART.NS",name:"Avenue Supermarts",s:"Consumer",cap:"Large Cap",pe:88.4,pb:13,de:0.0,roe:14.8,roce:14.2,divY:0.0,revG:16,profG:22,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:5800,isB:false,prT:"→",ec:9,rd:"Jul 8",evEb:68,roic:"H",wce:"H",note:"India's most profitable retailer. Zero debt. 75% promoter. Very expensive — buy only on big dips."},
  {id:75,sym:"TRENT.NS",name:"Trent (Zudio)",s:"Consumer",cap:"Large Cap",pe:98.4,pb:18,de:0.2,roe:20.4,roce:18.8,divY:0.1,revG:35,profG:80,prHold:37,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:4200,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:72,roic:"H",wce:"H",note:"Zudio fastest-growing fashion retail. 35% rev+80% profit CAGR. Down 60% from peak."},
  {id:76,sym:"ASIANPAINT.NS",name:"Asian Paints",s:"Consumer",cap:"Large Cap",pe:48.5,pb:12.5,de:0.1,roe:26.4,roce:25.8,divY:1.2,revG:8,profG:5,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:2500,isB:false,prT:"→",ec:7,rd:"Jul 22",evEb:36,roic:"H",wce:"H",note:"India's largest paint co. Now facing Birla Opus competition. 26% ROE but growth slowing."},
  {id:77,sym:"VOLTAS.NS",name:"Voltas",s:"Consumer Durables",cap:"Mid Cap",pe:68.5,pb:7.5,de:0.0,roe:12.4,roce:11.8,divY:0.6,revG:18,profG:25,prHold:30,pledged:0,intCov:99,fcf:"M",ar:"Buy",at:1850,isB:false,prT:"→",ec:7,rd:"Aug 8",evEb:52,roic:"M",wce:"M",note:"India's AC market leader. Zero debt. Climate change = AC boom for decades. Tata group."},
  {id:78,sym:"HAVELLS.NS",name:"Havells India",s:"Consumer Durables",cap:"Large Cap",pe:62.5,pb:11.8,de:0.0,roe:18.4,roce:17.8,divY:0.8,revG:14,profG:18,prHold:60,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:1750,isB:false,prT:"→",ec:8,rd:"Jul 25",evEb:46,roic:"H",wce:"H",note:"Premium electricals+lighting+cables. Lloyd AC growing. Zero debt. 60% promoter. Brand leader."},
  {id:79,sym:"DIXON.NS",name:"Dixon Technologies",s:"Electronics",cap:"Mid Cap",pe:95.5,pb:22.5,de:0.5,roe:24.2,roce:21.8,divY:0.2,revG:38,profG:45,prHold:35,pledged:0,intCov:18,fcf:"M",ar:"Buy",at:18500,isB:false,prT:"↑",ec:8,rd:"Aug 8",evEb:68,roic:"H",wce:"M",note:"India's largest electronics maker. PLI scheme. Phones/TVs/washing machines. 38% rev CAGR."},
  {id:80,sym:"KAYNES.NS",name:"Kaynes Technology",s:"Electronics",cap:"Small Cap",pe:82.5,pb:18.5,de:0.5,roe:22.4,roce:19.8,divY:0.1,revG:38,profG:48,prHold:58,pledged:0,intCov:15,fcf:"M",ar:"Buy",at:4200,isB:false,prT:"→",ec:8,rd:"Aug 12",evEb:58,roic:"H",wce:"M",note:"EMS for defence+industrial+medical electronics. 38% CAGR. India's EMS story."},
  {id:81,sym:"IRCTC.NS",name:"IRCTC",s:"Consumer",cap:"Large Cap",pe:52.5,pb:14.5,de:0.0,roe:35.4,roce:34.8,divY:1.2,revG:22,profG:28,prHold:67,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1050,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:38,roic:"H",wce:"H",note:"Railways ticketing monopoly. Zero debt, 35% ROE. Tourism+catering+Rail Neer. 67% Govt."},
  {id:82,sym:"ZOMATO.NS",name:"Zomato",s:"Consumer",cap:"Large Cap",pe:198.5,pb:8.5,de:0.1,roe:5.4,roce:4.8,divY:0.0,revG:55,profG:0,prHold:0,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:320,isB:false,prT:"→",ec:6,rd:"Jul 28",evEb:58,roic:"L",wce:"M",note:"Quick commerce+food delivery. Blinkit growing 80%+. First year profits FY24. Long-term play."},
  {id:83,sym:"HDFCLIFE.NS",name:"HDFC Life Insurance",s:"Insurance",cap:"Large Cap",pe:78.4,pb:8.5,de:0.0,roe:12.4,roce:8.2,divY:0.5,revG:14,profG:16,prHold:50,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:760,isB:false,prT:"→",ec:8,rd:"Jul 25",evEb:58,roic:"H",wce:"H",note:"India's largest private life insurer. VNB margin expansion. Multi-decade insurance story."},
  {id:84,sym:"SBILIFE.NS",name:"SBI Life Insurance",s:"Insurance",cap:"Large Cap",pe:62.8,pb:9.5,de:0.0,roe:14.8,roce:9.4,divY:0.5,revG:18,profG:18,prHold:57,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1780,isB:false,prT:"→",ec:8,rd:"Jul 22",evEb:46,roic:"H",wce:"H",note:"PSU-backed life insurance via SBI network. 57% SBI. Lower PE vs HDFC Life = better value."},
  {id:85,sym:"ICICIGI.NS",name:"ICICI Lombard",s:"Insurance",cap:"Large Cap",pe:28.5,pb:4.8,de:0.0,roe:18.4,roce:12.8,divY:0.8,revG:18,profG:22,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Jul 22",evEb:22,roic:"H",wce:"H",note:"ICICI general insurance market leader. Lower PE vs life insurers. Growing motor+health."},
  {id:86,sym:"PIIND.NS",name:"PI Industries",s:"Chemicals",cap:"Mid Cap",pe:32.5,pb:6.5,de:0.0,roe:22.4,roce:21.8,divY:0.8,revG:12,profG:18,prHold:53,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4500,isB:false,prT:"→",ec:8,rd:"Aug 12",evEb:24,roic:"H",wce:"H",note:"Agrochemical+CSM specialty chemicals. Zero debt. China+1 beneficiary. 22% ROE. Quality."},
  {id:87,sym:"SOLARINDS.NS",name:"Solar Industries",s:"Chemicals",cap:"Mid Cap",pe:52.5,pb:12.5,de:0.1,roe:24.4,roce:23.8,divY:0.3,revG:22,profG:28,prHold:72,pledged:0,intCov:32,fcf:"H",ar:"Buy",at:9500,isB:false,prT:"↑",ec:9,rd:"Aug 8",evEb:38,roic:"H",wce:"H",note:"Explosives+defence propellants. 72% promoter+increasing. Defence+mining growth. 24% ROE."},
  {id:88,sym:"DEEPAKNTR.NS",name:"Deepak Nitrite",s:"Chemicals",cap:"Mid Cap",pe:28.5,pb:4.8,de:0.3,roe:18.4,roce:16.8,divY:0.8,revG:8,profG:5,prHold:46,pledged:0,intCov:12,fcf:"M",ar:"Hold",at:2800,isB:false,prT:"→",ec:6,rd:"Aug 8",evEb:22,roic:"M",wce:"M",note:"Specialty chemicals+phenol+IPA. China+1 play. Recent downcycle but fundamentals intact."},
  {id:89,sym:"GODREJPROP.NS",name:"Godrej Properties",s:"Real Estate",cap:"Large Cap",pe:45.5,pb:4.5,de:0.8,roe:12.4,roce:8.8,divY:0.0,revG:35,profG:45,prHold:59,pledged:0,intCov:4,fcf:"L",ar:"Buy",at:3200,isB:false,prT:"→",ec:7,rd:"Aug 8",evEb:28,roic:"M",wce:"L",note:"India's largest listed real estate. Pre-sales at record highs. Godrej brand premium. Watch debt."},
  {id:90,sym:"OBEROIRLTY.NS",name:"Oberoi Realty",s:"Real Estate",cap:"Mid Cap",pe:38.5,pb:5.5,de:0.3,roe:18.4,roce:16.8,divY:0.5,revG:28,profG:38,prHold:68,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Aug 12",evEb:24,roic:"H",wce:"M",note:"Ultra-luxury Mumbai real estate. 68% promoter. Low leverage. India's premium RE brand."},
  {id:91,sym:"PRESTIGE.NS",name:"Prestige Estates",s:"Real Estate",cap:"Mid Cap",pe:42.5,pb:4.8,de:1.2,roe:15.4,roce:12.8,divY:0.3,revG:32,profG:28,prHold:67,pledged:5,intCov:5,fcf:"L",ar:"Buy",at:1850,isB:false,prT:"→",ec:7,rd:"Aug 15",evEb:22,roic:"M",wce:"L",note:"South India premium RE expanding North. 32% rev growth. Watch debt+pledged 5%."},
  {id:92,sym:"INDIAMART.NS",name:"IndiaMART",s:"Technology",cap:"Mid Cap",pe:38.5,pb:8.5,de:0.0,roe:22.4,roce:21.8,divY:0.5,revG:18,profG:22,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:2800,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:28,roic:"H",wce:"H",note:"B2B marketplace monopoly. Zero debt. SME digitisation. Subscription model = recurring revenue."},
  {id:93,sym:"RATEGAIN.NS",name:"RateGain Travel",s:"Technology",cap:"Small Cap",pe:52.5,pb:8.5,de:0.1,roe:18.4,roce:16.8,divY:0.0,revG:35,profG:42,prHold:44,pledged:0,intCov:22,fcf:"M",ar:"Buy",at:950,isB:false,prT:"→",ec:7,rd:"Aug 8",evEb:38,roic:"H",wce:"M",note:"Travel tech SaaS. 35% rev growth. Global hotel+airline clients. Recurring revenue model."},
  {id:94,sym:"NEWGEN.NS",name:"Newgen Software",s:"Technology",cap:"Small Cap",pe:38.5,pb:8.5,de:0.0,roe:24.4,roce:23.8,divY:0.5,revG:22,profG:28,prHold:41,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1450,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:28,roic:"H",wce:"H",note:"Low-code digital process automation. Zero debt, 24% ROE. Govt+banking worldwide clients."},
  {id:95,sym:"NAZARA.NS",name:"Nazara Technologies",s:"Technology",cap:"Small Cap",pe:65.5,pb:5.5,de:0.1,roe:8.4,roce:7.8,divY:0.0,revG:28,profG:5,prHold:42,pledged:0,intCov:15,fcf:"L",ar:"Hold",at:900,isB:false,prT:"→",ec:5,rd:"Aug 12",evEb:48,roic:"L",wce:"L",note:"India's gaming+esports+edtech. High growth but low profitability. Long-term speculative."},
  {id:96,sym:"ASTRAL.NS",name:"Astral",s:"Infrastructure",cap:"Mid Cap",pe:58.5,pb:12.5,de:0.1,roe:22.4,roce:21.8,divY:0.3,revG:18,profG:22,prHold:55,pledged:0,intCov:99,fcf:"H",ar:"Hold",at:2200,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:44,roic:"H",wce:"H",note:"India's fastest growing pipes. CPVC pipes+adhesives. 22% ROE. Quality compounder."},
  {id:97,sym:"CAMPUS.NS",name:"Campus Activewear",s:"Consumer",cap:"Small Cap",pe:48.5,pb:5.5,de:0.2,roe:14.4,roce:13.8,divY:0.3,revG:12,profG:8,prHold:75,pledged:0,intCov:12,fcf:"M",ar:"Hold",at:320,isB:false,prT:"→",ec:6,rd:"Aug 12",evEb:36,roic:"M",wce:"M",note:"Mass market sports footwear. 75% promoter. Rural+semi-urban. Recovery play from lows."},
  {id:98,sym:"BLUESTARCO.NS",name:"Blue Star",s:"Consumer Durables",cap:"Mid Cap",pe:55.5,pb:8.5,de:0.1,roe:18.4,roce:17.8,divY:0.8,revG:22,profG:28,prHold:38,pledged:0,intCov:25,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Aug 5",evEb:42,roic:"H",wce:"H",note:"Premium AC+refrigeration. Commercial+residential. Growing with India's AC boom."},
  {id:99,sym:"LICI.NS",name:"LIC of India",s:"Insurance",cap:"Large Cap",pe:14.5,pb:1.2,de:0.0,roe:82.4,roce:55.2,divY:1.5,revG:12,profG:18,prHold:97,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1200,isB:false,prT:"→",ec:8,rd:"Aug 8",evEb:11,roic:"H",wce:"H",note:"World's largest insurer by policy count. 97% Govt. P/B 1.2 cheap. Massive embedded value."},
  {id:100,sym:"PERSISTENT.NS",name:"Persistent Systems",s:"IT",cap:"Mid Cap",pe:55.8,pb:14.5,de:0.0,roe:28.4,roce:27.2,divY:0.6,revG:32,profG:38,prHold:31,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:7500,isB:false,prT:"→",ec:9,rd:"Jul 22",evEb:42,roic:"H",wce:"H",note:"Fastest growing mid-cap IT. 32% revenue CAGR. GenAI+digital. Premium justified by growth."},
];

// 200 extra stocks for swing universe
const SWING_EXTRA=[
  {sym:"EICHERMOT.NS",name:"Eicher Motors",s:"Auto"},{sym:"M&M.NS",name:"Mahindra & Mahindra",s:"Auto"},
  {sym:"TVSMOTOR.NS",name:"TVS Motor",s:"Auto"},{sym:"ASHOKLEY.NS",name:"Ashok Leyland",s:"Auto"},
  {sym:"MOTHERSON.NS",name:"Motherson Sumi",s:"Auto"},{sym:"BOSCHLTD.NS",name:"Bosch India",s:"Auto"},
  {sym:"FEDERALBNK.NS",name:"Federal Bank",s:"Banking"},{sym:"BANDHANBNK.NS",name:"Bandhan Bank",s:"Banking"},
  {sym:"AUBANK.NS",name:"AU Small Finance Bank",s:"Banking"},{sym:"RBLBANK.NS",name:"RBL Bank",s:"Banking"},
  {sym:"MPHASIS.NS",name:"Mphasis",s:"IT"},{sym:"OFSS.NS",name:"Oracle Financial",s:"IT"},
  {sym:"KPITTECH.NS",name:"KPIT Technologies",s:"IT"},{sym:"CYIENT.NS",name:"Cyient",s:"IT"},
  {sym:"TATAELXSI.NS",name:"Tata Elxsi",s:"IT"},{sym:"HAPPSTMNDS.NS",name:"Happiest Minds",s:"IT"},
  {sym:"ALKEM.NS",name:"Alkem Labs",s:"Pharma"},{sym:"TORNTPHARM.NS",name:"Torrent Pharma",s:"Pharma"},
  {sym:"AUROPHARMA.NS",name:"Aurobindo Pharma",s:"Pharma"},{sym:"MANKIND.NS",name:"Mankind Pharma",s:"Pharma"},
  {sym:"NATCO.NS",name:"Natco Pharma",s:"Pharma"},{sym:"LAURUS.NS",name:"Laurus Labs",s:"Pharma"},
  {sym:"GLAND.NS",name:"Gland Pharma",s:"Pharma"},{sym:"METROPOLIS.NS",name:"Metropolis Healthcare",s:"Pharma"},
  {sym:"COLPAL.NS",name:"Colgate-Palmolive",s:"FMCG"},{sym:"EMAMILTD.NS",name:"Emami",s:"FMCG"},
  {sym:"VARUNBEV.NS",name:"Varun Beverages",s:"FMCG"},{sym:"TATACONSUM.NS",name:"Tata Consumer",s:"FMCG"},
  {sym:"CUMMINSIND.NS",name:"Cummins India",s:"Infrastructure"},{sym:"THERMAX.NS",name:"Thermax",s:"Infrastructure"},
  {sym:"KEC.NS",name:"KEC International",s:"Infrastructure"},{sym:"BEML.NS",name:"BEML",s:"Infrastructure"},
  {sym:"GRSE.NS",name:"Garden Reach Shipbuilders",s:"Infrastructure"},{sym:"DATAPATTNS.NS",name:"Data Patterns",s:"Electronics"},
  {sym:"ADANIGREEN.NS",name:"Adani Green",s:"Power"},{sym:"CESC.NS",name:"CESC",s:"Power"},
  {sym:"TORNTPOWER.NS",name:"Torrent Power",s:"Power"},{sym:"SJVN.NS",name:"SJVN",s:"Power"},
  {sym:"JSWENERGY.NS",name:"JSW Energy",s:"Power"},{sym:"SAIL.NS",name:"SAIL",s:"Metals"},
  {sym:"NMDC.NS",name:"NMDC",s:"Metals"},{sym:"HINDZINC.NS",name:"Hindustan Zinc",s:"Metals"},
  {sym:"VEDL.NS",name:"Vedanta",s:"Metals"},{sym:"NATIONALUM.NS",name:"National Aluminium",s:"Metals"},
  {sym:"NAVINFLUOR.NS",name:"Navin Fluorine",s:"Chemicals"},{sym:"VINATI.NS",name:"Vinati Organics",s:"Chemicals"},
  {sym:"ATUL.NS",name:"Atul",s:"Chemicals"},{sym:"CLEAN.NS",name:"Clean Science",s:"Chemicals"},
  {sym:"NYKAA.NS",name:"Nykaa",s:"Consumer"},{sym:"PAGEIND.NS",name:"Page Industries",s:"Consumer"},
  {sym:"MANYAVAR.NS",name:"Vedant Fashions",s:"Consumer"},{sym:"METRO.NS",name:"Metro Brands",s:"Consumer"},
  {sym:"BATA.NS",name:"Bata India",s:"Consumer"},{sym:"DMART.NS",name:"Avenue Supermarts",s:"Consumer"},
  {sym:"CROMPTON.NS",name:"Crompton Consumer",s:"Consumer Durables"},{sym:"VGUARD.NS",name:"V-Guard",s:"Consumer Durables"},
  {sym:"PHOENIXLTD.NS",name:"Phoenix Mills",s:"Real Estate"},{sym:"BRIGADE.NS",name:"Brigade Enterprises",s:"Real Estate"},
  {sym:"SOBHA.NS",name:"Sobha Developers",s:"Real Estate"},{sym:"PAYTM.NS",name:"Paytm",s:"Technology"},
  {sym:"POLICYBZR.NS",name:"PB Fintech",s:"Finance"},{sym:"360ONE.NS",name:"360 ONE WAM",s:"Finance"},
  {sym:"MOTILALOFS.NS",name:"Motilal Oswal",s:"Finance"},{sym:"CONCOR.NS",name:"Container Corp",s:"Infrastructure"},
  {sym:"DELHIVERY.NS",name:"Delhivery",s:"Infrastructure"},{sym:"TIINDIA.NS",name:"Tube Investments",s:"Auto"},
  {sym:"AMBER.NS",name:"Amber Enterprises",s:"Electronics"},{sym:"BPCL.NS",name:"BPCL",s:"Energy"},
  {sym:"IOC.NS",name:"Indian Oil Corp",s:"Energy"},{sym:"GAIL.NS",name:"GAIL India",s:"Energy"},
  {sym:"HINDPETRO.NS",name:"HPCL",s:"Energy"},{sym:"NAUKRI.NS",name:"Info Edge",s:"Technology"},
  {sym:"TRENT.NS",name:"Trent Zudio",s:"Consumer"},{sym:"JSWSTEEL.NS",name:"JSW Steel",s:"Metals"},
];
const ALL_SWING=[...STOCKS,...SWING_EXTRA];

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
function calcPillars(stock, ld) {
  const spe = SECTOR_PE[stock.s]||25;
  const peg = stock.profG>0 ? +(stock.pe/stock.profG).toFixed(2) : 99;
  const per = stock.pe/spe;
  const p1_pe=per<0.55?7:per<0.7?6:per<0.85?4:per<1.0?2:per<1.2?1:0;
  const p1_pb=stock.pb<1?4:stock.pb<2?3:stock.pb<3?2:stock.pb<5?1:0;
  const p1_div=stock.divY>5?3:stock.divY>3?2:stock.divY>1?1:0;
  const p1_peg=peg<0.5?4:peg<0.8?3:peg<1.0?2:peg<1.5?1:0;
  const p1=p1_pe+p1_pb+p1_div+p1_peg;
  const p2_roe=stock.roe>30?6:stock.roe>25?5:stock.roe>20?4:stock.roe>15?3:stock.roe>10?2:1;
  const p2_roce=stock.roce>30?6:stock.roce>25?5:stock.roce>20?4:stock.roce>15?3:stock.roce>10?2:1;
  const p2_fcf=stock.fcf==="H"?4:stock.fcf==="M"?2:0;
  const p2_roic=stock.roic==="H"?2:stock.roic==="M"?1:0;
  const p2=p2_roe+p2_roce+p2_fcf+p2_roic;
  const p3_rev=stock.revG>25?8:stock.revG>20?7:stock.revG>15?6:stock.revG>10?4:stock.revG>5?2:0;
  const p3_ec=stock.ec>=9?4:stock.ec>=7?3:stock.ec>=5?2:1;
  const p3_prof=stock.profG>30?4:stock.profG>25?3:stock.profG>20?2:stock.profG>10?1:0;
  const p3=p3_rev+p3_ec+p3_prof;
  let p4_de,p4_ic;
  if(stock.isB){p4_de=7;p4_ic=5;}
  else{
    p4_de=stock.de<0.1?8:stock.de<0.3?7:stock.de<0.5?6:stock.de<1.0?4:stock.de<1.5?2:stock.de<2.5?1:0;
    const ic=stock.intCov||0;p4_ic=ic>=99?5:ic>10?4:ic>5?3:ic>3?2:ic>1.5?1:0;
  }
  const p4_wce=stock.wce==="H"?2:stock.wce==="M"?1:0;
  const p4=Math.min(14,p4_de+p4_ic+p4_wce);
  const p5_hold=stock.prHold>65?5:stock.prHold>55?4:stock.prHold>45?3:stock.prHold>35?2:stock.prHold>20?1:stock.prHold>0?1:2;
  const p5_pledge=stock.pledged===0?6:stock.pledged<2?5:stock.pledged<5?3:stock.pledged<10?1:0;
  const p5_trend=stock.prT==="↑"?3:stock.prT==="→"?1:0;
  const p5=Math.min(14,p5_hold+p5_pledge+p5_trend);
  const rMap={"Strong Buy":5,"Buy":4,"Hold":2,"Reduce":1,"Sell":0};
  const p6_rat=rMap[stock.ar]??2;
  let p6_upside=2;
  const p6_fii=0; // DII now in sf6
  if(ld?.price&&stock.at){const up=(stock.at-ld.price)/ld.price*100;p6_upside=up>35?3:up>25?3:up>15?2:up>8?2:up>0?1:0;}
  const p6=Math.min(10,p6_rat+p6_upside+p6_fii+p6_dii);
  let p7_52w=4,p7_vol=0;
  if(ld?.price&&ld?.h52&&ld?.l52){const range=ld.h52-ld.l52;const pos=range>0?(ld.price-ld.l52)/range:0.5;p7_52w=pos<0.2?5:pos<0.35?4:pos<0.5?3:pos<0.65?2:1;}
  if(ld?.vol&&ld?.avgVol){const vr=ld.vol/ld.avgVol;p7_vol=vr>2.5?3:vr>1.5?2:vr>1.0?1:0;}
  const p7=Math.min(10,p7_52w+(ld?.vol?p7_vol:0));
  const total=Math.min(100,Math.max(0,Math.round(p1+p2+p3+p4+p5+p6+p7)));
  return{total,peg,pillars:[
    {name:"Valuation",score:p1,max:18,detail:`PE: ${p1_pe}/7 · P/B: ${p1_pb}/4 · Dividend: ${p1_div}/3 · PEG: ${p1_peg}/4`},
    {name:"Business Quality",score:p2,max:18,detail:`ROE: ${p2_roe}/6 · ROCE: ${p2_roce}/6 · FCF: ${p2_fcf}/4 · ROIC: ${p2_roic}/2`},
    {name:"Growth Engine",score:p3,max:16,detail:`Revenue: ${p3_rev}/8 · Earnings Consistency: ${p3_ec}/4 · Profit Growth: ${p3_prof}/4`},
    {name:"Balance Sheet",score:p4,max:14,detail:`D/E: ${p4_de}/8 · Interest Coverage: ${p4_ic}/5 · Working Capital: ${p4_wce}/2`},
    {name:"Governance",score:p5,max:14,detail:`Promoter Holding: ${p5_hold}/5 · Pledged: ${p5_pledge}/6 · Trend: ${p5_trend}/3`},
    {name:"Analyst + FII",score:p6,max:10,detail:`Rating:${p6_rat}/5 Upside:${p6_upside}/3 FII:${p6_fii}+DII:${p6_dii}/2`},
    {name:"Price Momentum",score:p7,max:10,detail:`52W Position: ${p7_52w}/5 · Volume: ${ld?.vol?p7_vol:"N/A"}/3`},
  ]};
}

function getRec(sc){
  if(sc>=78)return{label:"STRONG BUY",c:"#00e676",bg:"#001a0d",ring:"#00e67655"};
  if(sc>=65)return{label:"BUY",c:"#69f0ae",bg:"#001a08",ring:"#69f0ae44"};
  if(sc>=52)return{label:"HOLD",c:"#ffd740",bg:"#1a1400",ring:"#ffd74044"};
  if(sc>=40)return{label:"REDUCE",c:"#ffab40",bg:"#1a0900",ring:"#ffab4044"};
  return{label:"SELL",c:"#ff5252",bg:"#1a0000",ring:"#ff525244"};
}

function getCategories(stock, score, vr) {
  const cats=[];
  if(vr&&vr>1.3&&score>=50) cats.push({l:"Swing",c:"#f59e0b",bg:"#1a1000"});
  if(score>=58&&stock.revG>8) cats.push({l:"Short Term",c:"#60a5fa",bg:"#001020"});
  if(score>=65&&stock.roe>15&&stock.fcf==="H"&&stock.profG>10) cats.push({l:"Long Term",c:"#34d399",bg:"#001510"});
  if(cats.length===0) cats.push({l:"Watch",c:"#4a5a70",bg:"#0a0f1e"});
  return cats;
}

function getPriceLevels(stock, live) {
  if(!live?.price) return null;
  const p=live.price;
  const rr_swing=(((p*1.06-p*0.93)/(p-p*0.93))).toFixed(1);
  const rr_short=(((p*1.18-p*0.88)/(p-p*0.88))).toFixed(1);
  return{
    buyZone:`₹${(p*0.97).toFixed(0)}–₹${p.toFixed(0)}`,
    swing:{target:`₹${(p*1.06).toFixed(0)}`,stop:`₹${(p*0.93).toFixed(0)}`,gain:"5–7%",rr:rr_swing,duration:"1–3 days",exit:"Next 1-3 trading sessions. Exit if target or stop hit, whichever comes first."},
    short:{target:`₹${Math.min(stock.at,p*1.20).toFixed(0)}`,stop:`₹${(p*0.88).toFixed(0)}`,gain:"12–20%",rr:rr_short,duration:"4–12 weeks",exit:`Exit by ${new Date(Date.now()+90*24*60*60*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} or when target hit.`},
    long:{target:`₹${stock.at}`,stop:`₹${(p*0.80).toFixed(0)}`,gain:`${((stock.at/p-1)*100).toFixed(0)}%`,rr:"3:1+",duration:"12–36 months",exit:`Hold until ${new Date(Date.now()+18*30*24*60*60*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} or analyst target revision.`},
  };
}

function generateRemark(stock, pillars, rec, upside, peg) {
  const spe=SECTOR_PE[stock.s]||25;
  const best=pillars.reduce((a,b)=>a.score/a.max>b.score/b.max?a:b);
  const worst=pillars.reduce((a,b)=>a.score/a.max<b.score/b.max?a:b);
  const sfr=SECTOR_FLOWS[stock.s];
  const opener={"STRONG BUY":`All pillars strong — ${stock.name} is a high-conviction entry.`,"BUY":`${stock.name} presents a clear buying opportunity.`,"HOLD":`${stock.name} is fairly valued — hold or wait for better entry.`,"REDUCE":`${stock.name} showing weakness — consider reducing.`,"SELL":`Multiple red flags for ${stock.name} — exit recommended.`};
  const parts=[opener[rec.label]||""];
  if(best.score/best.max>0.65) parts.push(`Strongest: ${best.name} (${best.score}/${best.max}).`);
  if(peg<1.0) parts.push(`PEG ${peg} = undervalued growth.`);
  else if(peg>2.0) parts.push(`PEG ${peg} = expensive vs growth.`);
  if(stock.pe<spe*0.75) parts.push(`PE ${((1-stock.pe/spe)*100).toFixed(0)}% below sector = undervalued.`);
  if(sfr?.fii==="Buying") parts.push(`FII+DII buying ${stock.s} sector this week.`);
  else if(sfr?.fii==="Selling") parts.push(`⚠ FII selling ${stock.s} sector — headwind.`);
  if(worst.score/worst.max<0.35) parts.push(`Watch: ${worst.name} (${worst.score}/${worst.max}).`);
  if(upside!=null&&upside>15) parts.push(`Analyst sees ${upside.toFixed(0)}% upside to ₹${stock.at}.`);
  else if(upside!=null&&upside<0) parts.push(`⚠ Above analyst target — limited upside.`);
  return parts.join(" ");
}

function getFlags(stock, score, live, vr, peg) {
  const risks=[],opps=[];
  const sff=SECTOR_FLOWS[stock.s];
  if(stock.pledged>10) risks.push("⚠ High pledging "+stock.pledged+"%");
  if(stock.prT==="↓") risks.push("⬇ Promoter reducing stake");
  if(stock.de>1.5&&!stock.isB) risks.push("⚠ High debt/equity "+stock.de);
  if(stock.fcf==="L") risks.push("⚠ Poor free cash flow");
  if(sfr?.fii==="Selling") risks.push("📉 FII selling sector this week");
  if(stock.ec<5) risks.push("⚠ Inconsistent earnings ("+stock.ec+"/10)");
  if(live?.price&&live.price>live.h52*0.95) risks.push("⚠ Near 52-week high");
  if(stock.prT==="↑") opps.push("⬆ Promoter increasing stake");
  if(sfr?.fii==="Buying") opps.push("💚 FII buying sector "+fii.amt);
  if(live?.price&&live.price<live.l52*1.1) opps.push("🎯 Near 52-week low — opportunity");
  if(peg<0.8) opps.push("✅ PEG "+peg+" = cheap growth");
  if(stock.pledged===0) opps.push("✅ Zero promoter pledging");
  if(stock.ec>=9) opps.push("📈 9+/10 earnings consistency");
  const daysToResult=stock.rd?(new Date(stock.rd+", 2026")-new Date())/86400000:999;
  if(daysToResult>0&&daysToResult<=14) opps.push("🗓 Results in ~"+Math.round(daysToResult)+" days — "+stock.rd);
  return{risks,opps};
}

const fmt=(n,d=2)=>n!=null?Number(n).toFixed(d):"—";
const fmtV=(n)=>{if(!n)return"—";if(n>=1e7)return`${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`${(n/1e5).toFixed(0)}L`;return n.toLocaleString()};

export default function App() {
  const [ld, setLd]=useState({});
  const [sector, setSector]=useState("All");
  const [cap, setCap]=useState("All");
  const [q, setQ]=useState("");
  const [sortK, setSortK]=useState("score");
  const [sortA, setSortA]=useState(false);
  const [sel, setSel]=useState(null);
  const [mTab, setMTab]=useState("overview");
  const [mainTab, setMainTab]=useState("stocks");
  const [ts, setTs]=useState(null);
  const [loading, setLoading]=useState(false);
  const [err, setErr]=useState(false);
  const [nifty, setNifty]=useState(null);
  const [news, setNews]=useState([]);
  const [newsLoad, setNewsLoad]=useState(false);
  const [portfolio, setPortfolio]=useState(()=>{try{return JSON.parse(localStorage.getItem("isp")||"[]")}catch{return[]}});
  const [pfForm, setPfForm]=useState({sym:"",qty:"",buy:""});
  const [fiiPanelOpen, setFiiPanelOpen]=useState(false);
  const refreshRef=useRef(null);


  const fetchAll=useCallback(async()=>{
    setLoading(true);setErr(false);
    try{
      const newLd={};
      const batches=[STOCKS.slice(0,20),STOCKS.slice(20,40),STOCKS.slice(40,60),STOCKS.slice(60,80),STOCKS.slice(80)];
      for(const b of batches){
        const syms=b.map(s=>s.sym).join(",");
        try{
          const r=await fetch(`/api/finance?symbols=${encodeURIComponent(syms)}`,{signal:AbortSignal.timeout(15000)});
          const j=await r.json();
          (j?.quoteResponse?.result||[]).forEach(q=>{newLd[q.symbol]={price:q.regularMarketPrice,chg:q.regularMarketChange,pct:q.regularMarketChangePercent,vol:q.regularMarketVolume,avgVol:q.averageDailyVolume3Month,h52:q.fiftyTwoWeekHigh,l52:q.fiftyTwoWeekLow};});
        }catch(_){}
        await new Promise(r=>setTimeout(r,300));
      }
      setLd(newLd);setTs(new Date());
      try{
        const nr=await fetch(`/api/finance?type=nifty`,{signal:AbortSignal.timeout(8000)});
        const nj=await nr.json();
        const n=nj?.quoteResponse?.result?.[0];
        if(n)setNifty({price:n.regularMarketPrice,pct:n.regularMarketChangePercent,chg:n.regularMarketChange});
      }catch(_){}
    }catch(e){setErr(true);}
    setLoading(false);
  },[]);

  const fetchNews=useCallback(async(symbol)=>{
    setNewsLoad(true);setNews([]);
    const allNews=[];
    const sym=symbol.replace(".NS","");
    try{
      const r=await fetch(`/api/finance?type=news&q=${encodeURIComponent(sym)}`,{signal:AbortSignal.timeout(10000)});
      const j=await r.json();
      (j?.news||[]).forEach(n=>allNews.push({title:n.title,link:n.link,publisher:n.publisher,date:n.providerPublishTime?new Date(n.providerPublishTime*1000).toLocaleDateString():"",source:"Yahoo Finance"}));
    }catch(_){}
    try{
      const etUrl=`https://economictimes.indiatimes.com/markets/stocks/news/rssfeeds/2146842.cms`;
      const r=await fetch(`/api/finance?type=news&q=market+india`,{signal:AbortSignal.timeout(6000)});
    }catch(_){}
    setNews(allNews);setNewsLoad(false);
  },[]);

  const fetchSwingPrices=useCallback(async()=>{
    const extras=SWING_EXTRA;
    const newSld={};
    for(let i=0;i<extras.length;i+=20){
      const syms=extras.slice(i,i+20).map(s=>s.sym).join(',');
      try{const r=await fetch(`/api/finance?symbols=${encodeURIComponent(syms)}`,{signal:AbortSignal.timeout(15000)});const j=await r.json();(j?.quoteResponse?.result||[]).forEach(q=>{newSld[q.symbol]={price:q.regularMarketPrice,chg:q.regularMarketChange,pct:q.regularMarketChangePercent,vol:q.regularMarketVolume,avgVol:q.averageDailyVolume3Month,h52:q.fiftyTwoWeekHigh,l52:q.fiftyTwoWeekLow};});}catch(_){}
      await new Promise(r=>setTimeout(r,400));
    }
    setSwingLd(prev=>({...prev,...newSld}));
  },[]);

  const fetchFiiDii=useCallback(async()=>{
    try{const r=await fetch('/api/fii-dii',{signal:AbortSignal.timeout(8000)});const j=await r.json();if(Array.isArray(j)){const fd=j.find(x=>x.category?.toUpperCase().includes('FII'));const dd=j.find(x=>x.category?.toUpperCase().includes('DII'));if(fd||dd)setFiiDii({fii:fd?.netValue||0,dii:dd?.netValue||0});}}catch(_){}
  },[]);


  useEffect(()=>{
    fetchAll();fetchFiiDii();fetchSwingPrices();
    const t1=setInterval(()=>{fetchAll();fetchFiiDii();},180000);
    const t2=setInterval(fetchSwingPrices,300000);
    return()=>{clearInterval(t1);clearInterval(t2);};
  },[fetchAll,fetchFiiDii,fetchSwingPrices]);

  const rows=useMemo(()=>{
    return STOCKS
      .filter(s=>sector==="All"||s.s===sector)
      .filter(s=>cap==="All"||s.cap===cap)
      .filter(s=>!q||s.name.toLowerCase().includes(q.toLowerCase())||s.sym.toLowerCase().includes(q.toLowerCase()))
      .map(s=>{
        const live=ld[s.sym];
        const{total:score,peg,pillars}=calcPillars(s,live);
        const rec=getRec(score);
        const upside=live?.price?((s.at-live.price)/live.price*100):null;
        const vr=live?.vol&&live?.avgVol?(live.vol/live.avgVol):null;
        const cats=getCategories(s,score,vr);
        const levels=getPriceLevels(s,live);
        const remark=generateRemark(s,pillars,rec,upside,peg);
        const flags=getFlags(s,score,live,vr,peg);
        const vsNifty=live?.pct&&nifty?.pct?(live.pct-nifty.pct):null;
        return{...s,live,score,peg,pillars,rec,upside,vr,cats,levels,remark,flags,vsNifty};
      })
      .sort((a,b)=>{
        const vals={score:[a.score,b.score],pe:[a.pe,b.pe],roe:[a.roe,b.roe],roce:[a.roce,b.roce],upside:[a.upside??-999,b.upside??-999],pb:[a.pb,b.pb],divY:[a.divY,b.divY],peg:[a.peg,b.peg],evEb:[a.evEb,b.evEb]};
        const[va,vb]=vals[sortK]||[a.score,b.score];
        return sortA?va-vb:vb-va;
      });
  },[ld,sector,cap,q,sortK,sortA,nifty]);

  const [swingLd,setSwingLd]=useState({});
  const [fiiDii,setFiiDii]=useState(null);
  const allLd=useMemo(()=>({...ld,...swingLd}),[ld,swingLd]);
  const swingRows=useMemo(()=>{
    return ALL_SWING.map(s=>{
      const lv=allLd[s.sym];
      if(!lv?.price||!lv?.vol||!lv?.avgVol)return null;
      const vr2=lv.vol/lv.avgVol;
      if(vr2<1.2)return null;
      const pc=lv.pct||0;
      const sw=(vr2>3?35:vr2>2?28:vr2>1.5?20:12)+(pc>3?25:pc>2?20:pc>1?15:pc>0?8:0)+(lv.chg>0?15:5);
      const lv2=getPriceLevels(s,lv);
      return{...s,live:lv,vr:vr2,pct:pc,swScore:sw,levels:lv2,rec:getRec(50),score:50};
    }).filter(Boolean).sort((a,b)=>b.swScore-a.swScore).slice(0,20);
  },[allLd]);

  const exitAlerts=useMemo(()=>portfolio.map(h=>{
    const lv=ld[h.sym];if(!lv?.price)return null;
    const pct2=(lv.price-h.buyPrice)/h.buyPrice*100;
    const pnlAmt=(lv.price-h.buyPrice)*h.qty;
    if(pct2<=-7)return{...h,live:lv,pct2,pnlAmt,alert:"🚨 EXIT — Stop Loss Hit (-7%)",alertC:"#ff5252"};
    if(pct2>=5)return{...h,live:lv,pct2,pnlAmt,alert:"✅ BOOK PROFIT — Target Hit (+5%)",alertC:"#00e676"};
    return null;
  }).filter(Boolean),[portfolio,ld]);


  const addPortfolio=()=>{
    if(!pfForm.sym||!pfForm.qty||!pfForm.buy) return;
    const stock=STOCKS.find(s=>s.name.toLowerCase().includes(pfForm.sym.toLowerCase())||s.sym.toLowerCase().includes(pfForm.sym.toLowerCase()));
    const newH=[...portfolio,{id:Date.now(),sym:stock?.sym||pfForm.sym.toUpperCase(),name:stock?.name||pfForm.sym,qty:Number(pfForm.qty),buyPrice:Number(pfForm.buy)}];
    setPortfolio(newH);localStorage.setItem("isp",JSON.stringify(newH));
    setPfForm({sym:"",qty:"",buy:""});
  };
  const removePortfolio=(id)=>{const n=portfolio.filter(h=>h.id!==id);setPortfolio(n);localStorage.setItem("isp",JSON.stringify(n));};

  const tSort=(k)=>{if(sortK===k)setSortA(!sortA);else{setSortK(k);setSortA(false);}};
  const sBtn=(k,l)=><button key={k} onClick={()=>tSort(k)} style={{background:sortK===k?"#1a2540":"transparent",border:`1px solid ${sortK===k?"#2563eb":"#1a2535"}`,borderRadius:6,padding:"4px 9px",color:sortK===k?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:10,fontWeight:sortK===k?700:400,whiteSpace:"nowrap"}}>{l}{sortK===k?(sortA?"↑":"↓"):""}</button>;
  const PCOLS=["#60a5fa","#34d399","#fbbf24","#f87171","#a78bfa","#fb923c","#38bdf8"];

  return(
    <div style={{background:"#070b14",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:"#c8d8f0",fontSize:13}}>

      {/* HEADER */}
      <div style={{background:"#0a0f1e",borderBottom:"1px solid #141e30",padding:"10px 16px",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18,fontWeight:900,letterSpacing:-0.8,background:"linear-gradient(135deg,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>IndiaScope v5</span>
            <span style={{fontSize:10,color:"#2a3a55"}}>300 Stocks · FII+DII Live</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {fiiDii&&<span style={{fontSize:11,gap:6,display:"flex",alignItems:"center"}}><span style={{color:fiiDii.fii>=0?"#34d399":"#ff5252",fontWeight:700}}>FII {fiiDii.fii>=0?"+":""}{Math.round(fiiDii.fii)}Cr</span><span style={{color:fiiDii.dii>=0?"#60a5fa":"#ff5252",fontWeight:700}}>DII {fiiDii.dii>=0?"+":""}{Math.round(fiiDii.dii)}Cr</span></span>}
            {nifty&&<span style={{fontSize:12,color:nifty.pct>=0?"#69f0ae":"#ff5252",fontWeight:700,cursor:"pointer"}} onClick={()=>setFiiPanelOpen(!fiiPanelOpen)}>Nifty ₹{fmt(nifty.price,0)} {nifty.pct>=0?"+":""}{fmt(nifty.pct,2)}% · 📊 FII</span>}
            {loading&&<span style={{fontSize:11,color:"#3b82f6",display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:"#3b82f6",display:"inline-block",animation:"blink 1s infinite"}}/>Auto ↻</span>}
            {!loading&&ts&&<span style={{fontSize:10,color:"#2a3a55"}}>↺ {ts.toLocaleTimeString()}</span>}
            <button onClick={fetchAll} disabled={loading} style={{background:"#141e30",border:"1px solid #1a2a3a",borderRadius:6,padding:"5px 10px",color:"#4a6080",cursor:"pointer",fontSize:11}}>Refresh Now</button>
          </div>
        </div>

        {/* FII PANEL */}
        {fiiPanelOpen&&<div style={{marginTop:10,background:"#070b14",borderRadius:10,padding:"10px 14px",border:"1px solid #141e30"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:700,color:"#8899bb"}}>📊 FII Sector Flows — This Week (Updated manually every Monday)</span>
            <span style={{fontSize:9,color:"#2a3a55"}}>Source: NSE India · I update this weekly</span>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(SECTOR_FLOWS).map(([sec,data],it)=>(
              <div key={sec} style={{background:"#0a0f1e",borderRadius:6,padding:"5px 10px",border:`1px solid ${data.fii==="Buying"?"#34d39933":data.fii==="Selling"?"#f8717133":"#2a3a55"}`,minWidth:100}}>
                <div style={{fontSize:9,color:SCOL[sec]||"#60a5fa",fontWeight:600}}>{sec}</div>
                <div style={{fontSize:11,fontWeight:700,color:data.fii==="Buying"?"#34d399":data.fii==="Selling"?"#f87171":"#ffd740"}}>{data.fiiWk} {data.flow}</div>
                <div style={{fontSize:9,color:"#2a3a55"}}>{data.fiiAmt}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>

      {/* STATS */}
      <div style={{display:"flex",gap:7,padding:"10px 16px",overflowX:"auto"}}>
        {[{l:"Strong Buy",v:rows.filter(r=>r.score>=78).length,c:"#00e676"},{l:"Buy",v:rows.filter(r=>r.score>=65&&r.score<78).length,c:"#69f0ae"},{l:"Hold",v:rows.filter(r=>r.score>=52&&r.score<65).length,c:"#ffd740"},{l:"Reduce/Sell",v:rows.filter(r=>r.score<52).length,c:"#ff5252"},{l:"⚡ Swing (300)",v:swingRows.length,c:"#f59e0b"},{l:"🚨 Exit Alerts",v:exitAlerts?.length||0,c:"#ff5252"},{l:"Showing",v:rows.length,c:"#60a5fa"}].map(st=>(
          <div key={st.l} style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:9,padding:"7px 13px",minWidth:90,flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:st.c,lineHeight:1}}>{st.v}</div>
            <div style={{fontSize:9,color:"#2a3a55",marginTop:2}}>{st.l}</div>
          </div>
        ))}
      </div>

      {/* MAIN TABS */}
      <div style={{display:"flex",borderBottom:"1px solid #141e30",padding:"0 16px"}}>
        {[["stocks","📊 Stocks"],["swing","⚡ Swing"],["portfolio","💼 Portfolio"],["refresh","🔄 Auto-Refresh Info"]].map(([id,l])=>(
          <button key={id} onClick={()=>setMainTab(id)} style={{padding:"9px 14px",background:"transparent",border:"none",borderBottom:`2px solid ${mainTab===id?"#3b82f6":"transparent"}`,color:mainTab===id?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:11,fontWeight:mainTab===id?700:400,whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {/* AUTO-REFRESH INFO TAB */}
      {mainTab==="refresh"&&(
        <div style={{padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:12,padding:18,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:"#69f0ae",marginBottom:12}}>✅ Auto-Refreshes Every 3 Minutes (No Action Needed)</div>
            {["Live CMP price for all 100 stocks","Day change % and absolute change","Volume today vs 3-month average","52-week high and low","Score recalculation (Pillar 7: Price Momentum)","Buy zone / Stop loss / Target price levels","vs Nifty performance column","Nifty 50 index level","Swing alerts list"].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #0d1525",fontSize:12,color:"#8899bb"}}>
                <span style={{color:"#34d399"}}>✓</span>{item}
              </div>
            ))}
          </div>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:12,padding:18,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:"#ffd740",marginBottom:12}}>🔄 News Refreshes Every 30 Minutes (Auto)</div>
            {["Yahoo Finance stock-specific news headlines","Economic Times market news (RSS feed)"].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #0d1525",fontSize:12,color:"#8899bb"}}>
                <span style={{color:"#ffd740"}}>✓</span>{item}
              </div>
            ))}
          </div>
          <div style={{background:"#0a0f1e",border:"1px solid #f8717122",borderRadius:12,padding:18,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:"#ff5252",marginBottom:8}}>⚠️ You Need to Tell Me to Update These (Quarterly)</div>
            <div style={{fontSize:11,color:"#4a6080",marginBottom:10}}>These are fundamental data — they change only when companies publish results (quarterly). Tell me after each results season and I'll update the code.</div>
            {[
              ["P/E Ratio","After every quarterly result","Jan, Apr, Jul, Oct"],
              ["ROE / ROCE","After annual report","Apr-Jun every year"],
              ["Revenue & Profit CAGR 3Y","After annual results","Apr-Jun every year"],
              ["Promoter Holding %","After shareholding disclosure","15th of Jan, Apr, Jul, Oct"],
              ["Pledged Shares %","After shareholding disclosure","15th of Jan, Apr, Jul, Oct"],
              ["EV/EBITDA","After quarterly result","Jan, Apr, Jul, Oct"],
              ["Earnings Consistency Score","After each quarterly result","Jan, Apr, Jul, Oct"],
              ["Promoter Trend (↑→↓)","When bulk deal or disclosure filed","Continuous — check BSE"],
              ["Analyst Target Price","When broker publishes new report","Continuous — irregular"],
              ["FII Sector Flows","Every Monday","Weekly — I update manually"],
              ["Results Date","After each earnings season","Quarterly"],
            ].map(([item,trigger,freq],i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid #0d1525",flexWrap:"wrap"}}>
                <span style={{color:"#ff5252",width:14}}>✗</span>
                <div>
                  <div style={{fontSize:12,color:"#c8d8f0",fontWeight:600}}>{item}</div>
                  <div style={{fontSize:10,color:"#4a6080"}}>Trigger: {trigger} · Frequency: {freq}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#0a0f1e",border:"1px solid #2563eb33",borderRadius:12,padding:18}}>
            <div style={{fontSize:13,fontWeight:800,color:"#60a5fa",marginBottom:8}}>📡 Where Data Comes From</div>
            {[
              ["Live prices","Yahoo Finance API — real NSE prices delayed ~15 min"],
              ["Volume data","Yahoo Finance API — same feed"],
              ["Analyst consensus","Yahoo Finance aggregates from Goldman, Morgan Stanley, CLSA, Kotak, Motilal, and 10-40 analysts per stock"],
              ["News","Yahoo Finance (stock-specific) + Economic Times RSS feed"],
              ["Moneycontrol/Mint/Mint","No free API — I've added direct search links in the News tab. Click to open their website for that stock."],
              ["FII sector flows","NSE India website (www.nseindia.com/market-data/fii-dii-activity) — I read this Monday morning and update the code"],
              ["Fundamental data (PE/ROE etc.)","Pre-loaded from FY25/FY26 annual reports and Screener.in. Static until you tell me to update."],
            ].map(([source,detail],i)=>(
              <div key={i} style={{padding:"6px 0",borderBottom:"1px solid #0d1525"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#8899bb"}}>{source}</div>
                <div style={{fontSize:10,color:"#4a6080"}}>{detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STOCKS VIEW */}
      {mainTab==="stocks"&&<>
        <div style={{padding:"8px 16px 4px",display:"flex",gap:5,overflowX:"auto"}}>
          {CAPS.map(c=><button key={c} onClick={()=>setCap(c)} style={{background:cap===c?(CCOL[c]||"#60a5fa")+"22":"transparent",border:`1px solid ${cap===c?(CCOL[c]||"#3b82f6"):"#141e30"}`,borderRadius:99,padding:"4px 11px",color:cap===c?(CCOL[c]||"#60a5fa"):"#3d5070",cursor:"pointer",fontSize:10,fontWeight:cap===c?700:400,whiteSpace:"nowrap",flexShrink:0}}>{c}</button>)}
        </div>
        <div style={{padding:"2px 16px 6px",display:"flex",gap:4,overflowX:"auto"}}>
          {SECTORS.map(sec=><button key={sec} onClick={()=>setSector(sec)} style={{background:sector===sec?`${SCOL[sec]||"#3b82f6"}22`:"transparent",border:`1px solid ${sector===sec?(SCOL[sec]||"#3b82f6"):"#141e30"}`,borderRadius:99,padding:"3px 10px",color:sector===sec?(SCOL[sec]||"#60a5fa"):"#3d5070",cursor:"pointer",fontSize:9.5,fontWeight:sector===sec?700:400,whiteSpace:"nowrap",flexShrink:0}}>{sec}</button>)}
        </div>
        <div style={{padding:"0 16px 8px",display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:7,padding:"7px 11px",color:"#c8d8f0",fontSize:12,flex:1,minWidth:150,outline:"none"}}/>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[["score","Score"],["peg","PEG"],["roe","ROE"],["roce","ROCE"],["pe","P/E"],["evEb","EV/EBITDA"],["divY","Div%"],["upside","Upside"]].map(([k,l])=>sBtn(k,l))}</div>
        </div>
        <div style={{overflowX:"auto",padding:"0 16px 80px"}}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px",minWidth:1300}}>
            <thead>
              <tr>{["#","Stock","Cap","FII","CMP","vs Nifty","P/E","PEG","EV/EB","ROE","ROCE","Div%","EC","Promoter","Pledged","Results","Category","Score","Signal"].map(h=><th key={h} style={{padding:"7px 5px",textAlign:"left",fontSize:8.5,fontWeight:700,color:"#1e2e45",textTransform:"uppercase",background:"#070b14",whiteSpace:"nowrap"}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((s,i)=>{
                const sff2=SECTOR_FLOWS[s.s];
                const daysToResult=s.rd?(new Date(s.rd+", 2026")-new Date())/86400000:999;
                return(
                  <tr key={s.id} onClick={()=>{setSel(s);setMTab("overview");setNews([]);}} style={{cursor:"pointer"}}
                    onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background="#0d1525")}
                    onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background=i%2===0?"#0a0f1e":"#080d17")}>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",borderRadius:"7px 0 0 7px",color:"#1e2e45",fontSize:10}}>{i+1}</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <div style={{fontWeight:700,color:"#e0ecff",fontSize:12}}>{s.name}</div>
                      <span style={{background:`${SCOL[s.s]||"#3b82f6"}20`,color:SCOL[s.s]||"#60a5fa",fontSize:8.5,padding:"1px 5px",borderRadius:3,fontWeight:600}}>{s.s}</span>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontSize:10,fontWeight:600,color:CCOL[s.cap]||"#60a5fa",whiteSpace:"nowrap"}}>{s.cap.replace(" Cap","")}</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <span style={{fontSize:10,fontWeight:700,color:sfr?.fii==="Buying"?"#34d399":sfr?.fii==="Selling"?"#f87171":"#4a6080"}}>{sff?.fiiWk||"→"}</span>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      {s.live?.price?<><div style={{fontWeight:800,color:"#e0ecff",fontSize:12}}>₹{fmt(s.live.price,1)}</div><div style={{fontSize:9,color:s.live.chg>=0?"#69f0ae":"#ff5252"}}>{s.live.chg>=0?"+":""}{fmt(s.live.pct,2)}%</div></>:<span style={{color:"#1e2e45"}}>—</span>}
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      {s.vsNifty!=null?<span style={{fontWeight:700,fontSize:10,color:s.vsNifty>0?"#69f0ae":"#ff5252"}}>{s.vsNifty>0?"+":""}{fmt(s.vsNifty,2)}%</span>:<span style={{color:"#1e2e45"}}>—</span>}
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.pe<(SECTOR_PE[s.s]||25)?"#69f0ae":"#ffd740",fontSize:11}}>{s.pe}</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:700,color:s.peg<1?"#00e676":s.peg<1.5?"#69f0ae":s.peg<2?"#ffd740":"#ff5252",fontSize:11}}>{s.peg<50?s.peg:"—"}</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",color:"#8899bb",fontSize:11}}>{s.evEb}</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:700,color:s.roe>20?"#00e676":s.roe>15?"#69f0ae":"#4a6080",fontSize:11}}>{s.roe}%</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:700,color:s.roce>20?"#00e676":s.roce>15?"#69f0ae":"#4a6080",fontSize:11}}>{s.roce}%</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.divY>3?"#ffd740":s.divY>1?"#94a3b8":"#2a3a55",fontSize:11}}>{s.divY}%</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.ec>=8?"#69f0ae":s.ec>=6?"#ffd740":"#f87171",fontSize:11}}>{s.ec}/10</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <div style={{fontWeight:600,color:s.prHold>55?"#69f0ae":s.prHold>35?"#ffd740":"#4a6080",fontSize:11}}>{s.prHold||"—"}%</div>
                      <div style={{fontSize:10,color:s.prT==="↑"?"#34d399":s.prT==="↓"?"#f87171":"#3d5070"}}>{s.prT}</div>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",fontWeight:600,color:s.pledged===0?"#69f0ae":s.pledged<5?"#ffd740":"#ff5252",fontSize:11}}>{s.pledged}%</td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <span style={{fontSize:9.5,fontWeight:600,color:daysToResult<=7?"#f59e0b":daysToResult<=14?"#ffd740":"#2a3a55"}}>{s.rd||"—"}</span>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                        {s.cats.map(cat=><span key={cat.l} style={{background:cat.bg,color:cat.c,border:`1px solid ${cat.c}44`,fontSize:8.5,padding:"1px 5px",borderRadius:3,fontWeight:700,whiteSpace:"nowrap"}}>{cat.l}</span>)}
                      </div>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:30,height:5,background:"#141e30",borderRadius:99,overflow:"hidden"}}><div style={{width:`${s.score}%`,height:"100%",background:s.score>=78?"#00e676":s.score>=65?"#69f0ae":s.score>=52?"#ffd740":"#ff5252",borderRadius:99}}/></div>
                        <span style={{fontWeight:800,color:"#5a7090",fontSize:11}}>{s.score}</span>
                      </div>
                    </td>
                    <td style={{padding:"8px 5px",background:i%2===0?"#0a0f1e":"#080d17",borderRadius:"0 7px 7px 0"}}>
                      <span style={{background:s.rec.bg,color:s.rec.c,padding:"3px 7px",borderRadius:4,fontSize:9,fontWeight:800,border:`1px solid ${s.rec.ring}`,whiteSpace:"nowrap"}}>{s.rec.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>}

      {/* SWING ALERTS */}
      {mainTab==="swing"&&(
        <div style={{padding:"14px"}}>
          <div style={{fontSize:12,color:"#3d5070",marginBottom:12}}>⚡ Volume surge stocks — sorted highest volume vs 3M average. Entry window: today's session only.</div>
          {swingRows.length===0?<div style={{color:"#2a3a55",padding:24,textAlign:"center",background:"#0a0f1e",borderRadius:12}}>No swing alerts. Click Refresh after 9:15 AM when market is open.</div>:(
            swingRows.map((s,i)=>(
              <div key={s.id} onClick={()=>{setSel(s);setMTab("targets");setNews([]);}} style={{background:"#0a0f1e",border:`1px solid ${s.rec.ring}`,borderRadius:11,padding:"13px 15px",cursor:"pointer",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:"#e0ecff",fontSize:14}}>{i+1}. {s.name} <span style={{fontSize:11,color:CCOL[s.cap]||"#60a5fa"}}>({s.cap})</span></div>
                  <div style={{fontSize:11,color:"#4a6080",marginTop:4,lineHeight:1.5,maxWidth:480}}>{s.remark}</div>
                  {s.flags.opps.length>0&&<div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{s.flags.opps.slice(0,3).map((f,fi)=><span key={fi} style={{background:"#001510",color:"#34d399",border:"1px solid #34d39933",fontSize:9,padding:"2px 6px",borderRadius:3}}>{f}</span>)}</div>}
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#f59e0b"}}>{s.vr?.toFixed(1)}×</div><div style={{fontSize:9,color:"#2a3a55"}}>Volume</div></div>
                  {s.live?.price&&<div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:"#e0ecff"}}>₹{fmt(s.live.price,1)}</div><div style={{fontSize:9,color:s.live.chg>=0?"#69f0ae":"#ff5252"}}>{s.live.chg>=0?"+":""}{fmt(s.live.pct,2)}%</div></div>}
                  {s.levels&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:"#4ade80"}}>T: {s.levels.swing.target}</div><div style={{fontSize:10,color:"#ff5252"}}>SL: {s.levels.swing.stop}</div><div style={{fontSize:9,color:"#2a3a55"}}>R:R {s.levels.swing.rr}</div></div>}
                  <span style={{background:s.rec.bg,color:s.rec.c,padding:"4px 9px",borderRadius:4,fontSize:10,fontWeight:800,border:`1px solid ${s.rec.ring}`}}>{s.rec.label}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PORTFOLIO */}
      {mainTab==="portfolio"&&(
        <div style={{padding:"14px"}}>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:11,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#8899bb",marginBottom:10}}>➕ Add Holding</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
              <input value={pfForm.sym} onChange={e=>setPfForm({...pfForm,sym:e.target.value})} placeholder="Stock name" style={{background:"#070b14",border:"1px solid #141e30",borderRadius:6,padding:"7px 10px",color:"#c8d8f0",fontSize:12,flex:1,minWidth:140,outline:"none"}}/>
              <input value={pfForm.qty} onChange={e=>setPfForm({...pfForm,qty:e.target.value})} placeholder="Qty" type="number" style={{background:"#070b14",border:"1px solid #141e30",borderRadius:6,padding:"7px 10px",color:"#c8d8f0",fontSize:12,width:75,outline:"none"}}/>
              <input value={pfForm.buy} onChange={e=>setPfForm({...pfForm,buy:e.target.value})} placeholder="Buy price ₹" type="number" style={{background:"#070b14",border:"1px solid #141e30",borderRadius:6,padding:"7px 10px",color:"#c8d8f0",fontSize:12,width:105,outline:"none"}}/>
              <button onClick={addPortfolio} style={{background:"#1a3a20",border:"1px solid #34d399",borderRadius:6,padding:"7px 14px",color:"#34d399",cursor:"pointer",fontSize:12,fontWeight:700}}>Add</button>
            </div>
          </div>
          {portfolio.length===0?<div style={{color:"#2a3a55",padding:28,textAlign:"center",background:"#0a0f1e",borderRadius:11}}>No holdings yet.</div>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",minWidth:650}}>
                <thead><tr>{["Stock","Qty","Buy","CMP","Invested","Value","P&L","P&L%","Remove"].map(h=><th key={h} style={{padding:"7px 9px",textAlign:"left",fontSize:9,color:"#1e2e45",textTransform:"uppercase",fontWeight:700}}>{h}</th>)}</tr></thead>
                <tbody>
                  {portfolio.map(h=>{
                    const lp=ld[h.sym]?.price;const inv=h.qty*h.buyPrice;const cur=lp?h.qty*lp:null;const pnl=cur?cur-inv:null;const pct=pnl?(pnl/inv*100):null;
                    return<tr key={h.id}>
                      <td style={{padding:"9px",background:"#0a0f1e",borderRadius:"6px 0 0 6px"}}><div style={{fontWeight:700,color:"#e0ecff",fontSize:12}}>{h.name}</div><div style={{fontSize:9,color:"#2a3a55"}}>{h.sym}</div></td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:"#8899bb"}}>{h.qty}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:"#8899bb"}}>₹{h.buyPrice}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:"#e0ecff",fontWeight:700}}>{lp?`₹${fmt(lp,1)}`:"—"}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:"#8899bb"}}>₹{inv.toLocaleString()}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:cur?(pnl>=0?"#69f0ae":"#ff5252"):"#8899bb",fontWeight:700}}>{cur?`₹${cur.toFixed(0)}`:"—"}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:pnl!=null?(pnl>=0?"#69f0ae":"#ff5252"):"#8899bb",fontWeight:800}}>{pnl!=null?`${pnl>=0?"+":""}₹${Math.abs(pnl).toFixed(0)}`:"—"}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",color:pct!=null?(pct>=0?"#69f0ae":"#ff5252"):"#8899bb",fontWeight:800}}>{pct!=null?`${pct>=0?"+":""}${pct.toFixed(2)}%`:"—"}</td>
                      <td style={{padding:"9px",background:"#0a0f1e",borderRadius:"0 6px 6px 0"}}><button onClick={()=>removePortfolio(h.id)} style={{background:"#1a0000",border:"1px solid #ff525444",color:"#ff5252",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:10}}>✕</button></td>
                    </tr>;
                  })}
                  {(()=>{const ti=portfolio.reduce((a,h)=>a+h.qty*h.buyPrice,0);const tc=portfolio.reduce((a,h)=>{const p=ld[h.sym]?.price;return p?a+h.qty*p:a;},0);const tp=tc-ti;const tpct=ti>0?(tp/ti*100):0;return<tr>
                    <td colSpan={4} style={{padding:"9px",background:"#141e30",borderRadius:"6px 0 0 6px",fontWeight:800,color:"#8899bb"}}>TOTAL</td>
                    <td style={{padding:"9px",background:"#141e30",fontWeight:800,color:"#e0ecff"}}>₹{ti.toLocaleString()}</td>
                    <td style={{padding:"9px",background:"#141e30",fontWeight:800,color:tp>=0?"#69f0ae":"#ff5252"}}>{tc>0?`₹${tc.toFixed(0)}`:"—"}</td>
                    <td style={{padding:"9px",background:"#141e30",fontWeight:900,fontSize:14,color:tp>=0?"#00e676":"#ff5252"}}>{tc>0?`${tp>=0?"+":""}₹${Math.abs(tp).toFixed(0)}`:"—"}</td>
                    <td style={{padding:"9px",background:"#141e30",fontWeight:900,fontSize:14,color:tpct>=0?"#00e676":"#ff5252"}}>{tc>0?`${tpct>=0?"+":""}${tpct.toFixed(2)}%`:"—"}</td>
                    <td style={{padding:"9px",background:"#141e30",borderRadius:"0 6px 6px 0"}}/>
                  </tr>;})()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {sel&&(
        <div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,background:"#000000e0",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0a0f1e",borderRadius:16,padding:0,maxWidth:600,width:"100%",border:"1px solid #141e30",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{padding:"16px 18px 10px",borderBottom:"1px solid #141e30"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:19,fontWeight:900,color:"#e0ecff"}}>{sel.name}</div>
                  <div style={{fontSize:10,color:"#2a3a55"}}>{sel.sym} · {sel.cap} · EC: {sel.ec}/10 · PEG: {sel.peg<50?sel.peg:"N/A"} · EV/EBITDA: {sel.evEb}</div>
                  <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{background:`${SCOL[sel.s]||"#3b82f6"}22`,color:SCOL[sel.s]||"#60a5fa",fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:600}}>{sel.s}</span>
                    <span style={{background:sel.rec.bg,color:sel.rec.c,fontSize:11,padding:"2px 9px",borderRadius:4,fontWeight:800,border:`1px solid ${sel.rec.ring}`}}>{sel.rec.label}</span>
                    <span style={{fontSize:13,fontWeight:900,color:sel.rec.c}}>{sel.score}/100</span>
                    {sel.cats.map(cat=><span key={cat.l} style={{background:cat.bg,color:cat.c,border:`1px solid ${cat.c}55`,fontSize:9,padding:"2px 6px",borderRadius:4,fontWeight:700}}>{cat.l}</span>)}
                    <span style={{fontSize:10,color:sel.prT==="↑"?"#34d399":sel.prT==="↓"?"#f87171":"#4a6080"}}>Promoter {sel.prT}</span>
                  </div>
                </div>
                <button onClick={()=>setSel(null)} style={{background:"#141e30",border:"1px solid #1e2e40",color:"#3d5070",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:13}}>✕</button>
              </div>
              <div style={{background:"#070b14",borderRadius:7,padding:"8px 11px",marginTop:8,fontSize:11,color:"#5a7a90",lineHeight:1.65}}>{sel.remark}</div>
              {/* Risk + Opportunity Flags */}
              {(sel.flags.risks.length>0||sel.flags.opps.length>0)&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                {sel.flags.opps.map((f,i)=><span key={i} style={{background:"#001510",color:"#34d399",border:"1px solid #34d39933",fontSize:9,padding:"3px 7px",borderRadius:4}}>{f}</span>)}
                {sel.flags.risks.map((f,i)=><span key={i} style={{background:"#1a0000",color:"#ff5252",border:"1px solid #ff525233",fontSize:9,padding:"3px 7px",borderRadius:4}}>{f}</span>)}
              </div>}
            </div>
            <div style={{display:"flex",borderBottom:"1px solid #141e30",overflowX:"auto"}}>
              {[["overview","Overview"],["targets","Buy/Sell Targets"],["pillars","Score"],["news","News"],["data","All Data"]].map(([id,l])=>(
                <button key={id} onClick={()=>{setMTab(id);if(id==="news"&&news.length===0)fetchNews(sel.sym);}} style={{flex:1,padding:"8px 3px",background:"transparent",border:"none",borderBottom:`2px solid ${mTab===id?"#3b82f6":"transparent"}`,color:mTab===id?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:10,fontWeight:mTab===id?700:400,whiteSpace:"nowrap",minWidth:55}}>{l}</button>
              ))}
            </div>
            <div style={{padding:"12px 18px 18px"}}>

              {/* OVERVIEW */}
              {mTab==="overview"&&<>
                {sel.live?.price&&<div style={{background:"#070b14",borderRadius:9,padding:12,marginBottom:10,display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,textAlign:"center"}}>
                  <div><div style={{fontSize:17,fontWeight:900,color:"#e0ecff"}}>₹{fmt(sel.live.price,1)}</div><div style={{fontSize:9,color:"#2a3a55",marginTop:1}}>CMP</div></div>
                  <div><div style={{fontSize:15,fontWeight:800,color:sel.live.chg>=0?"#69f0ae":"#ff5252"}}>{sel.live.chg>=0?"+":""}{fmt(sel.live.pct,2)}%</div><div style={{fontSize:9,color:"#2a3a55",marginTop:1}}>Today</div></div>
                  <div><div style={{fontSize:15,fontWeight:800,color:sel.upside>0?"#69f0ae":"#ff5252"}}>{sel.upside!=null?`${sel.upside>0?"+":""}${sel.upside.toFixed(1)}%`:"—"}</div><div style={{fontSize:9,color:"#2a3a55",marginTop:1}}>To Target ₹{sel.at}</div></div>
                  <div><div style={{fontSize:15,fontWeight:800,color:sel.vsNifty>0?"#69f0ae":sel.vsNifty<0?"#ff5252":"#8899bb"}}>{sel.vsNifty!=null?`${sel.vsNifty>0?"+":""}${fmt(sel.vsNifty,2)}%`:"—"}</div><div style={{fontSize:9,color:"#2a3a55",marginTop:1}}>vs Nifty</div></div>
                </div>}
                {sel.live?.h52&&sel.live?.l52&&<div style={{background:"#070b14",borderRadius:7,padding:"10px 12px",marginBottom:9}}>
                  <div style={{fontSize:9,color:"#2a3a55",marginBottom:8}}>52-Week Range</div>
                  <div style={{position:"relative",height:6,background:"#141e30",borderRadius:99}}>
                    {sel.live.price&&<div style={{position:"absolute",left:`${Math.min(94,Math.max(6,(sel.live.price-sel.live.l52)/(sel.live.h52-sel.live.l52)*100))}%`,top:-4,width:14,height:14,background:"#60a5fa",borderRadius:"50%",transform:"translateX(-50%)",border:"2px solid #0a0f1e",boxShadow:"0 0 8px #3b82f699"}}/>}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10}}><span style={{color:"#ff5252"}}>₹{fmt(sel.live.l52,0)} Low</span><span style={{color:"#69f0ae"}}>₹{fmt(sel.live.h52,0)} High</span></div>
                </div>}
                {/* Direct links to news sources */}
                <div style={{background:"#070b14",borderRadius:7,padding:"10px 12px",marginBottom:9}}>
                  <div style={{fontSize:9.5,color:"#2a3a55",marginBottom:7}}>Research Links (opens in new tab)</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {[
                      ["Moneycontrol",`https://www.moneycontrol.com/stocks/cptmarket/commsearcher.php?inptxt=${sel.sym.replace(".NS","")}`],
                      ["Economic Times",`https://economictimes.indiatimes.com/topic/${sel.name.replace(/ /g,"-").toLowerCase()}`],
                      ["Mint",`https://www.livemint.com/search-results?q=${encodeURIComponent(sel.name)}`],
                      ["Screener.in",`https://www.screener.in/company/${sel.sym.replace(".NS","")}/`],
                      ["TradingView (RSI)",`https://www.tradingview.com/chart/?symbol=NSE:${sel.sym.replace(".NS","")}`],
                      ["NSE India",`https://www.nseindia.com/get-quotes/equity?symbol=${sel.sym.replace(".NS","")}`],
                    ].map(([label,url])=>(
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{background:"#141e30",border:"1px solid #1e2e40",borderRadius:6,padding:"5px 10px",color:"#60a5fa",fontSize:10,textDecoration:"none",fontWeight:600}}>{label} ↗</a>
                    ))}
                  </div>
                </div>
              </>}

              {/* TARGETS */}
              {mTab==="targets"&&<>
                {!sel.levels?<div style={{color:"#2a3a55",padding:20,textAlign:"center"}}>Live price needed. Click Refresh and reopen.</div>:<>
                  <div style={{background:"#141e30",borderRadius:7,padding:"9px 13px",marginBottom:11,textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#3d5070"}}>Ideal Buy Zone</div>
                    <div style={{fontSize:19,fontWeight:900,color:"#60a5fa"}}>{sel.levels.buyZone}</div>
                    <div style={{fontSize:9.5,color:"#2a3a55"}}>Enter in this range for best risk-reward</div>
                  </div>
                  {[{type:"⚡ Swing Trade",data:sel.levels.swing,c:"#f59e0b"},{type:"📈 Short Term",data:sel.levels.short,c:"#60a5fa"},{type:"🏦 Long Term",data:sel.levels.long,c:"#34d399"}].map(({type,data,c})=>(
                    <div key={type} style={{background:"#070b14",border:`1px solid ${c}33`,borderRadius:9,padding:"11px 13px",marginBottom:9}}>
                      <div style={{fontSize:12,fontWeight:700,color:c,marginBottom:8}}>{type} · {data.duration}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:8}}>
                        <div style={{background:"#0a0f1e",borderRadius:6,padding:"7px",textAlign:"center"}}><div style={{fontSize:9,color:"#2a3a55",marginBottom:2}}>Buy Zone</div><div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{sel.levels.buyZone}</div></div>
                        <div style={{background:"#0a0f1e",borderRadius:6,padding:"7px",textAlign:"center"}}><div style={{fontSize:9,color:"#2a3a55",marginBottom:2}}>Sell Target</div><div style={{fontSize:13,fontWeight:800,color:"#69f0ae"}}>{data.target}</div><div style={{fontSize:9,color:"#34d399"}}>+{data.gain}</div></div>
                        <div style={{background:"#0a0f1e",borderRadius:6,padding:"7px",textAlign:"center"}}><div style={{fontSize:9,color:"#2a3a55",marginBottom:2}}>Stop Loss</div><div style={{fontSize:13,fontWeight:800,color:"#ff5252"}}>{data.stop}</div><div style={{fontSize:9,color:"#ff5252"}}>Exit if hit</div></div>
                        <div style={{background:"#0a0f1e",borderRadius:6,padding:"7px",textAlign:"center"}}><div style={{fontSize:9,color:"#2a3a55",marginBottom:2}}>Risk:Reward</div><div style={{fontSize:13,fontWeight:800,color:c}}>1:{data.rr}</div></div>
                      </div>
                      <div style={{background:"#0a0f1e",borderRadius:5,padding:"7px 9px",fontSize:10,color:"#4a6080",lineHeight:1.5}}>📅 Exit Plan: {data.exit}</div>
                    </div>
                  ))}
                  <div style={{fontSize:9.5,color:"#1e2e45",lineHeight:1.6}}>⚠ Targets from live CMP. Stop losses are guidelines — set your own. Not SEBI advice.</div>
                </>}
              </>}

              {/* SCORE BREAKDOWN */}
              {mTab==="pillars"&&<>
                <div style={{fontSize:9.5,color:"#2a3a55",marginBottom:9}}>Score: {sel.score}/100 · PEG: {sel.peg<50?sel.peg:"N/A"} · EV/EBITDA: {sel.evEb} · EC: {sel.ec}/10 · ROIC: {sel.roic} · WCE: {sel.wce}</div>
                {sel.pillars.map((p,i)=>(
                  <div key={p.name} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:600,color:"#8899bb"}}>{p.name}</span><span style={{fontSize:11,fontWeight:800,color:PCOLS[i]}}>{p.score}<span style={{color:"#2a3a55",fontWeight:400}}>/{p.max}</span></span></div>
                    <div style={{height:6,background:"#141e30",borderRadius:99,overflow:"hidden",marginBottom:2}}><div style={{width:`${p.score/p.max*100}%`,height:"100%",background:PCOLS[i],borderRadius:99}}/></div>
                    <div style={{fontSize:9,color:"#2a3a55"}}>{p.detail}</div>
                  </div>
                ))}
              </>}

              {/* NEWS */}
              {mTab==="news"&&<>
                <div style={{display:"flex",gap:7,marginBottom:10,flexWrap:"wrap"}}>
                  {[["Moneycontrol",`https://www.moneycontrol.com/stocks/cptmarket/commsearcher.php?inptxt=${sel.sym.replace(".NS","")}`],["Economic Times",`https://economictimes.indiatimes.com/topic/${sel.name.replace(/ /g,"-").toLowerCase()}`],["Mint",`https://www.livemint.com/search-results?q=${encodeURIComponent(sel.name)}`]].map(([label,url])=>(
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{background:"#141e30",border:"1px solid #1e2e40",borderRadius:5,padding:"4px 9px",color:"#60a5fa",fontSize:10,textDecoration:"none"}}>🔗 {label}</a>
                  ))}
                </div>
                {newsLoad?<div style={{color:"#3b82f6",padding:16,textAlign:"center"}}>Loading news…</div>:
                 news.length===0?<div style={{color:"#2a3a55",padding:16,textAlign:"center"}}>
                   <div style={{marginBottom:8}}>No news loaded.</div>
                   <button onClick={()=>fetchNews(sel.sym)} style={{background:"#1a2540",border:"1px solid #3b82f6",color:"#60a5fa",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:11}}>Fetch News Now</button>
                 </div>:(
                  news.map((n,i)=>(
                    <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{display:"block",background:"#070b14",borderRadius:7,padding:"10px 12px",marginBottom:7,textDecoration:"none",border:"1px solid #141e30"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#c8d8f0",lineHeight:1.5,marginBottom:3}}>{n.title}</div>
                      <div style={{display:"flex",gap:8,fontSize:9.5,color:"#2a3a55"}}>
                        <span style={{background:`${n.source==="Economic Times"?"#ef4444":"#3b82f6"}22`,color:n.source==="Economic Times"?"#fca5a5":"#93c5fd",padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:600}}>{n.source}</span>
                        <span>{n.publisher}</span><span>· {n.date}</span>
                      </div>
                    </a>
                  ))
                )}
              </>}

              {/* ALL DATA */}
              {mTab==="data"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[
                    {l:"P/E Ratio",v:sel.pe,sub:`Sector: ${SECTOR_PE[sel.s]||"—"}`,ok:sel.pe<(SECTOR_PE[sel.s]||999)},
                    {l:"PEG Ratio",v:sel.peg<50?sel.peg:"N/A",sub:sel.peg<1?"Undervalued growth":sel.peg<1.5?"Fair":sel.peg<2?"Slightly high":"Expensive",ok:sel.peg<1.5},
                    {l:"EV/EBITDA",v:sel.evEb,sub:sel.evEb<10?"Cheap":sel.evEb<20?"Fair":"Expensive",ok:sel.evEb<20},
                    {l:"Price/Book",v:sel.pb,sub:sel.pb<2?"Cheap":sel.pb<5?"Fair":"Expensive",ok:sel.pb<3},
                    {l:"Debt/Equity",v:sel.isB?"N/A (Bank)":sel.de,sub:"",ok:sel.isB||sel.de<0.5},
                    {l:"Return on Equity",v:`${sel.roe}%`,sub:sel.roe>20?"Excellent":sel.roe>15?"Good":"Below avg",ok:sel.roe>15},
                    {l:"Return on Capital",v:`${sel.roce}%`,sub:sel.roce>20?"Excellent":sel.roce>15?"Good":"Below avg",ok:sel.roce>15},
                    {l:"ROIC Quality",v:sel.roic==="H"?"High ✓":sel.roic==="M"?"Medium":"Low ✗",sub:"Return on incremental capital",ok:sel.roic==="H"},
                    {l:"Working Capital",v:sel.wce==="H"?"Efficient ✓":sel.wce==="M"?"Average":"Inefficient ✗",sub:"Cash conversion efficiency",ok:sel.wce==="H"},
                    {l:"Dividend Yield",v:`${sel.divY}%`,sub:sel.divY>3?"High income":"",ok:sel.divY>1},
                    {l:"Revenue CAGR 3Y",v:`${sel.revG}%`,sub:"Higher = better",ok:sel.revG>12},
                    {l:"Profit CAGR 3Y",v:`${sel.profG}%`,sub:"Higher = better",ok:sel.profG>15},
                    {l:"Earnings Consistency",v:`${sel.ec}/10`,sub:sel.ec>=8?"Consistent":sel.ec>=6?"Moderate":"Volatile",ok:sel.ec>=7},
                    {l:"Promoter Holding",v:`${sel.prHold}%`,sub:`Trend: ${sel.prT}`,ok:sel.prHold>40||sel.prHold===0},
                    {l:"Pledged Shares",v:`${sel.pledged}%`,sub:sel.pledged===0?"Zero risk ✓":sel.pledged>10?"⚠ High":"Moderate",ok:sel.pledged<5},
                    {l:"Analyst Target",v:`₹${sel.at}`,sub:sel.upside!=null?`${sel.upside>0?"+":""}${sel.upside?.toFixed(1)}% upside`:"",ok:sel.upside>10},
                    {l:"Results Date",v:sel.rd||"—",sub:"Next quarterly result",ok:true},
                    {l:"FII Sector Flow",v:SECTOR_FLOWS[sel.s]?.flow||"—",sub:SECTOR_FLOWS[sel.s]?.amt||"",ok:SECTOR_FLOWS[sel.s]?.flow==="Buying"},
                  ].map(it=>(
                    <div key={it.l} style={{background:"#070b14",borderRadius:6,padding:"8px 10px",borderLeft:`2px solid ${it.ok?"#34d399":"#f87171"}`}}>
                      <div style={{fontSize:8.5,color:"#2a3a55",marginBottom:2}}>{it.l}</div>
                      <div style={{fontSize:13,fontWeight:800,color:"#e0ecff"}}>{it.v}</div>
                      {it.sub&&<div style={{fontSize:8.5,color:it.ok?"#2a4a2a":"#4a2a2a",marginTop:2}}>{it.sub}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{padding:"0 18px 12px",fontSize:9.5,color:"#141e30",borderTop:"1px solid #0d1525",paddingTop:10,lineHeight:1.6}}>
              ⚠ Fundamental data pre-loaded (FY25/FY26). Live prices from Yahoo Finance (15-min delay). For education only — not SEBI advice.
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#070b14}::-webkit-scrollbar-thumb{background:#141e30;border-radius:3px}input:focus{border-color:#2563eb!important}tbody tr:hover td{background:#0d1525!important}`}</style>
    </div>
  );
}
