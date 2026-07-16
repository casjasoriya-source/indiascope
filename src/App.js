import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECTOR_PE = {Banking:18,"Power Finance":9,Finance:22,IT:24,Pharma:30,FMCG:52,Auto:22,Energy:10,Power:15,Infrastructure:32,Metals:13,Telecom:42,Consumer:82,Insurance:68,Chemicals:28,Electronics:45,Technology:38,"Real Estate":40,"Consumer Durables":55};
const SECTORS = ["All","Banking","Finance","Power Finance","IT","Pharma","FMCG","Auto","Energy","Power","Infrastructure","Metals","Telecom","Consumer","Insurance","Chemicals","Electronics","Technology","Real Estate","Consumer Durables"];
const CAPS = ["All","Large Cap","Mid Cap","Small Cap"];
const SCOL = {Banking:"#3b82f6","Power Finance":"#0ea5e9",Finance:"#60a5fa",IT:"#a78bfa",Pharma:"#34d399",FMCG:"#f59e0b",Auto:"#f97316",Energy:"#ef4444",Power:"#14b8a6",Infrastructure:"#8b5cf6",Metals:"#94a3b8",Telecom:"#ec4899",Consumer:"#f472b6",Insurance:"#a3e635",Chemicals:"#22d3ee",Electronics:"#fb7185",Technology:"#818cf8","Real Estate":"#fb923c","Consumer Durables":"#4ade80"};
const CCOL = {"Large Cap":"#60a5fa","Mid Cap":"#fbbf24","Small Cap":"#f87171"};

// ─── FII + DII SECTOR FLOWS ─────────────────────────────────────────────────
const SF={
  Banking:{fi:"Buying",di:"Buying",fa:"₹4,200Cr",da:"₹3,100Cr",fw:"↑",dw:"↑"},
  "Power Finance":{fi:"Buying",di:"Buying",fa:"₹2,800Cr",da:"₹1,900Cr",fw:"↑",dw:"↑"},
  Finance:{fi:"Neutral",di:"Buying",fa:"₹800Cr",da:"₹1,200Cr",fw:"→",dw:"↑"},
  IT:{fi:"Selling",di:"Neutral",fa:"₹-3,200Cr",da:"₹400Cr",fw:"↓",dw:"→"},
  Pharma:{fi:"Buying",di:"Buying",fa:"₹1,800Cr",da:"₹2,100Cr",fw:"↑",dw:"↑"},
  FMCG:{fi:"Neutral",di:"Neutral",fa:"₹400Cr",da:"₹600Cr",fw:"→",dw:"→"},
  Auto:{fi:"Buying",di:"Buying",fa:"₹1,200Cr",da:"₹1,800Cr",fw:"↑",dw:"↑"},
  Energy:{fi:"Neutral",di:"Buying",fa:"₹600Cr",da:"₹1,400Cr",fw:"→",dw:"↑"},
  Power:{fi:"Buying",di:"Buying",fa:"₹1,600Cr",da:"₹2,200Cr",fw:"↑",dw:"↑"},
  Infrastructure:{fi:"Buying",di:"Buying",fa:"₹2,200Cr",da:"₹2,800Cr",fw:"↑",dw:"↑"},
  Metals:{fi:"Selling",di:"Neutral",fa:"₹-800Cr",da:"₹200Cr",fw:"↓",dw:"→"},
  Telecom:{fi:"Buying",di:"Buying",fa:"₹1,400Cr",da:"₹900Cr",fw:"↑",dw:"↑"},
  Consumer:{fi:"Neutral",di:"Buying",fa:"₹200Cr",da:"₹800Cr",fw:"→",dw:"↑"},
  Insurance:{fi:"Neutral",di:"Neutral",fa:"₹600Cr",da:"₹400Cr",fw:"→",dw:"→"},
  Chemicals:{fi:"Neutral",di:"Neutral",fa:"₹400Cr",da:"₹300Cr",fw:"→",dw:"→"},
  Electronics:{fi:"Buying",di:"Buying",fa:"₹800Cr",da:"₹600Cr",fw:"↑",dw:"↑"},
  Technology:{fi:"Neutral",di:"Neutral",fa:"₹200Cr",da:"₹100Cr",fw:"→",dw:"→"},
  "Real Estate":{fi:"Buying",di:"Buying",fa:"₹1,000Cr",da:"₹700Cr",fw:"↑",dw:"↑"},
  "Consumer Durables":{fi:"Neutral",di:"Buying",fa:"₹400Cr",da:"₹500Cr",fw:"→",dw:"↑"},
};

// ─── 100 STOCKS ───────────────────────────────────────────────────────────────
// Fields: sym,name,s=sector,cap,pe,pb,de,roe,roce,divY,revG,profG,
//   prHold,pledged,intCov,fcf,ar,at,isB=isBanking,
//   prT=promoter trend(↑→↓), ec=earnings consistency(1-10),
//   rd=results date, evEb=EV/EBITDA, roic=H/M/L, wce=working capital efficiency H/M/L
const STOCKS=[
// ── 20 LARGE CAP ANCHORS — Stability + 12-15% CAGR ───────────────────────
{id:1,sym:"ICICIBANK.NS",name:"ICICI Bank",s:"Banking",cap:"Large Cap",pe:17.1,pb:2.9,de:5.9,roe:18.2,roce:7.8,divY:0.8,revG:18,profG:28,prHold:0,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:1600,isB:true,prT:"→",ec:10,rd:"Oct 26",evEb:10,roic:"H",wce:"H",note:"Best-run private bank. GNPA decade low. 28% profit CAGR. Digital banking leader. A."},
{id:2,sym:"BHARTIARTL.NS",name:"Bharti Airtel",s:"Telecom",cap:"Large Cap",pe:44.8,pb:12,de:2.3,roe:41.2,roce:16.8,divY:0.5,revG:18,profG:35,prHold:56,pledged:0,intCov:5,fcf:"M",ar:"Strong Buy",at:2100,isB:false,prT:"→",ec:8,rd:"Oct 28",evEb:15,roic:"H",wce:"M",note:"India #1 telecom. ARPU upcycle just starting. Africa business undervalued. 41% ROE."},
{id:3,sym:"BAJFINANCE.NS",name:"Bajaj Finance",s:"Finance",cap:"Large Cap",pe:28.3,pb:5.8,de:3.8,roe:21.2,roce:10.4,divY:0.3,revG:28,profG:26,prHold:56,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:9800,isB:false,prT:"→",ec:9,rd:"Oct 22",evEb:16,roic:"H",wce:"H",note:"India NBFC king. 80M+ customers. Cross-sell machine. 28% revenue CAGR is structura."},
{id:4,sym:"ITC.NS",name:"ITC",s:"FMCG",cap:"Large Cap",pe:25.4,pb:6.5,de:0.0,roe:28.1,roce:27.4,divY:4.2,revG:12,profG:18,prHold:0,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:580,isB:false,prT:"→",ec:9,rd:"Oct 22",evEb:18,roic:"H",wce:"H",note:"4.2% dividend + FMCG growth + hotels re-rating catalyst. Zero debt. Cheapest FMCG ."},
{id:5,sym:"COALINDIA.NS",name:"Coal India",s:"Energy",cap:"Large Cap",pe:7.2,pb:3.2,de:0.0,roe:52.4,roce:51.8,divY:6.0,revG:8,profG:28,prHold:63,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:580,isB:false,prT:"→",ec:8,rd:"Nov 15",evEb:5,roic:"H",wce:"H",note:"World's largest coal miner. 6% dividend + zero debt + 52% ROE. India power demand ."},
{id:6,sym:"RECLTD.NS",name:"REC Limited",s:"Power Finance",cap:"Large Cap",pe:8.1,pb:1.6,de:7.2,roe:20.8,roce:7.4,divY:4.2,revG:22,profG:28,prHold:52,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:700,isB:true,prT:"→",ec:9,rd:"Nov 5",evEb:8,roic:"H",wce:"H",note:"PSU power lender. ₹11.2L Cr budget capex direct beneficiary. PE 8x + 4.2% dividend."},
{id:7,sym:"PFC.NS",name:"Power Finance Corp",s:"Power Finance",cap:"Large Cap",pe:7.4,pb:1.4,de:7.8,roe:18.4,roce:6.8,divY:4.5,revG:18,profG:24,prHold:56,pledged:0,intCov:null,fcf:"H",ar:"Strong Buy",at:600,isB:true,prT:"→",ec:9,rd:"Nov 7",evEb:7,roic:"H",wce:"H",note:"Cheapest quality PSU. PE 7.4 + 4.5% dividend. Power sector capex will run for a de."},
{id:8,sym:"COCHINSHIP.NS",name:"Cochin Shipyard",s:"Infrastructure",cap:"Mid Cap",pe:15.5,pb:5.5,de:0.0,roe:38.4,roce:36.8,divY:2.8,revG:28,profG:48,prHold:73,pledged:0,intCov:99,fcf:"H",ar:"Strong Buy",at:2800,isB:false,prT:"→",ec:9,rd:"Nov 12",evEb:12,roic:"H",wce:"H",note:"India's best shipbuilder. 38% ROE + zero debt + Navy order boom. Defence shipbuild."},
{id:9,sym:"MAZAGON.NS",name:"Mazagon Dock",s:"Infrastructure",cap:"Mid Cap",pe:18.5,pb:6.5,de:0.0,roe:38.4,roce:36.8,divY:1.8,revG:32,profG:45,prHold:84,pledged:0,intCov:99,fcf:"H",ar:"Strong Buy",at:3500,isB:false,prT:"→",ec:9,rd:"Nov 12",evEb:14,roic:"H",wce:"H",note:"Submarine + warship monopoly. 84% Govt. ₹40,000Cr+ order book. Zero debt, 38% ROE.."},
{id:10,sym:"HAL.NS",name:"HAL",s:"Infrastructure",cap:"Large Cap",pe:32.5,pb:8.5,de:0.0,roe:28.4,roce:26.8,divY:1.2,revG:22,profG:28,prHold:71,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:6000,isB:false,prT:"→",ec:9,rd:"Nov 8",evEb:24,roic:"H",wce:"H",note:"Fighter jets + helicopters + engines. ₹1L Cr+ order book. Zero debt, 28% ROE. Make."},
{id:11,sym:"MUTHOOTFIN.NS",name:"Muthoot Finance",s:"Finance",cap:"Large Cap",pe:18.4,pb:4.5,de:2.5,roe:25.2,roce:12.4,divY:1.8,revG:18,profG:22,prHold:73,pledged:0,intCov:6,fcf:"H",ar:"Buy",at:4200,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:12,roic:"H",wce:"H",note:"Gold loan NBFC king. 73% promoter. Rural India moat nobody can replicate. 25% ROE.."},
{id:12,sym:"BAJAJ-AUTO.NS",name:"Bajaj Auto",s:"Auto",cap:"Large Cap",pe:30.2,pb:8.5,de:0.0,roe:28.4,roce:27.1,divY:2.8,revG:12,profG:24,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:12000,isB:false,prT:"→",ec:9,rd:"Oct 24",evEb:22,roic:"H",wce:"H",note:"2W/3W export champion. Zero debt, 2.8% dividend, 28% ROE. EV + premiumisation ahea."},
{id:13,sym:"HCLTECH.NS",name:"HCL Technologies",s:"IT",cap:"Large Cap",pe:22.8,pb:5.5,de:0.1,roe:24.1,roce:22.8,divY:4.2,revG:16,profG:18,prHold:60,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:9,rd:"Oct 12",evEb:19,roic:"H",wce:"H",note:"Best growth among top-4 IT. 4.2% dividend. Engineering + IT products diversificati."},
{id:14,sym:"SUNPHARMA.NS",name:"Sun Pharmaceutical",s:"Pharma",cap:"Large Cap",pe:34.8,pb:5.4,de:0.1,roe:18.4,roce:17.2,divY:0.6,revG:14,profG:22,prHold:54,pledged:2,intCov:25,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:22,roic:"H",wce:"H",note:"India pharma king. US specialty drugs growing 20%+. EBIT margins expanding. Specia."},
{id:15,sym:"ONGC.NS",name:"ONGC",s:"Energy",cap:"Large Cap",pe:7.4,pb:0.9,de:0.3,roe:18.1,roce:16.8,divY:5.5,revG:10,profG:25,prHold:58,pledged:0,intCov:8,fcf:"H",ar:"Buy",at:380,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:5,roic:"H",wce:"H",note:"P/B below 1 = buying below book value. 5.5% dividend. Highest quality PSU value bu."},
{id:16,sym:"IRFC.NS",name:"IRFC",s:"Finance",cap:"Large Cap",pe:14.2,pb:2.0,de:9.8,roe:14.8,roce:5.2,divY:3.8,revG:18,profG:20,prHold:86,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:230,isB:true,prT:"→",ec:8,rd:"Nov 12",evEb:10,roic:"H",wce:"H",note:"Railway financier. 86% Govt = zero credit risk. 3.8% dividend. Every railway budge."},
{id:17,sym:"MARUTI.NS",name:"Maruti Suzuki",s:"Auto",cap:"Large Cap",pe:22.4,pb:3.8,de:0.0,roe:17.8,roce:17.2,divY:1.2,revG:14,profG:35,prHold:56,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:14000,isB:false,prT:"→",ec:9,rd:"Oct 25",evEb:16,roic:"H",wce:"H",note:"India #1 carmaker 40%+ share. Zero debt. Hybrid + CNG leadership. Suzuki Japan bac."},
{id:18,sym:"LT.NS",name:"Larsen & Toubro",s:"Infrastructure",cap:"Large Cap",pe:27.8,pb:3.8,de:1.5,roe:14.2,roce:11.8,divY:1.5,revG:16,profG:20,prHold:0,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:4800,isB:false,prT:"→",ec:8,rd:"Oct 28",evEb:18,roic:"M",wce:"H",note:"₹5.6L Cr order book. Professional management. Infra + defence + GCC tech. Rides ev."},
{id:19,sym:"TITAN.NS",name:"Titan Company",s:"Consumer",cap:"Large Cap",pe:84.2,pb:28,de:0.1,roe:35.4,roce:32.8,divY:0.5,revG:22,profG:28,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:5200,isB:false,prT:"→",ec:9,rd:"Oct 22",evEb:62,roic:"H",wce:"H",note:"India's aspirational brand engine. Tanishq jewellery in underpenetrated market. 35."},
{id:20,sym:"HDFCBANK.NS",name:"HDFC Bank",s:"Banking",cap:"Large Cap",pe:19.2,pb:2.5,de:6.8,roe:16.1,roce:7.2,divY:1.2,revG:14,profG:18,prHold:26,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:2100,isB:true,prT:"→",ec:9,rd:"Oct 19",evEb:12,roic:"H",wce:"H",note:"India's largest private bank. Post-merger integration benefits just starting. Best."},
// ── 40 MID CAP COMPOUNDERS — Core Wealth Creators 20-25% CAGR ─────────────
{id:21,sym:"CDSL.NS",name:"CDSL",s:"Finance",cap:"Mid Cap",pe:42.5,pb:18.5,de:0.0,roe:48.4,roce:47.2,divY:0.8,revG:22,profG:28,prHold:15,pledged:0,intCov:99,fcf:"H",ar:"Strong Buy",at:2200,isB:false,prT:"→",ec:9,rd:"Oct 12",evEb:32,roic:"H",wce:"H",note:"Depository monopoly. 48% ROE, zero debt. Every new demat account = pure revenue. I."},
{id:22,sym:"CAMS.NS",name:"CAMS",s:"Finance",cap:"Mid Cap",pe:38.5,pb:14.8,de:0.0,roe:42.4,roce:41.8,divY:1.8,revG:18,profG:22,prHold:19,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4500,isB:false,prT:"→",ec:9,rd:"Oct 15",evEb:28,roic:"H",wce:"H",note:"MF processing monopoly 70%+ share. Zero debt, 42% ROE. SIP flows compounding = rev."},
{id:23,sym:"SOLARINDS.NS",name:"Solar Industries",s:"Chemicals",cap:"Mid Cap",pe:52.5,pb:12.5,de:0.1,roe:24.4,roce:23.8,divY:0.3,revG:22,profG:28,prHold:72,pledged:0,intCov:32,fcf:"H",ar:"Strong Buy",at:11000,isB:false,prT:"↑",ec:9,rd:"Nov 8",evEb:38,roic:"H",wce:"H",note:"Explosives + defence propellants + ammunition. 72% promoter + increasing. India de."},
{id:24,sym:"POLYCAB.NS",name:"Polycab India",s:"Infrastructure",cap:"Mid Cap",pe:38.5,pb:8.2,de:0.1,roe:22.4,roce:21.8,divY:0.8,revG:18,profG:28,prHold:67,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:8500,isB:false,prT:"→",ec:9,rd:"Nov 8",evEb:28,roic:"H",wce:"H",note:"India #1 cables & wires. Direct infra capex play. 67% promoter. FMEG (fans, lights."},
{id:25,sym:"DIXON.NS",name:"Dixon Technologies",s:"Electronics",cap:"Mid Cap",pe:95.5,pb:22.5,de:0.5,roe:24.2,roce:21.8,divY:0.2,revG:38,profG:45,prHold:35,pledged:0,intCov:18,fcf:"M",ar:"Buy",at:20000,isB:false,prT:"↑",ec:8,rd:"Nov 8",evEb:68,roic:"H",wce:"M",note:"India EMS king. PLI scheme winner. Phones + TVs + washing machines. China+1 play. ."},
{id:26,sym:"KAYNES.NS",name:"Kaynes Technology",s:"Electronics",cap:"Small Cap",pe:82.5,pb:18.5,de:0.5,roe:22.4,roce:19.8,divY:0.1,revG:38,profG:48,prHold:58,pledged:0,intCov:15,fcf:"M",ar:"Buy",at:5000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:58,roic:"H",wce:"M",note:"EMS for defence + industrial + medical electronics. Still undiscovered. 38% CAGR. ."},
{id:27,sym:"WAAREEENER.NS",name:"Waaree Energies",s:"Power",cap:"Mid Cap",pe:45.5,pb:12.5,de:0.5,roe:28.4,roce:24.8,divY:0.0,revG:45,profG:55,prHold:68,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:500,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:28,roic:"H",wce:"M",note:"India's largest solar panel maker. 45% revenue growth. China+1 biggest beneficiary."},
{id:28,sym:"PIIND.NS",name:"PI Industries",s:"Chemicals",cap:"Mid Cap",pe:32.5,pb:6.5,de:0.0,roe:22.4,roce:21.8,divY:0.8,revG:12,profG:18,prHold:53,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:5000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:24,roic:"H",wce:"H",note:"Agrochemical + CSM specialty chemicals. Zero debt. China+1 play. Long-term supply ."},
{id:29,sym:"PERSISTENT.NS",name:"Persistent Systems",s:"IT",cap:"Mid Cap",pe:55.8,pb:14.5,de:0.0,roe:28.4,roce:27.2,divY:0.6,revG:32,profG:38,prHold:31,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:8500,isB:false,prT:"→",ec:9,rd:"Oct 22",evEb:42,roic:"H",wce:"H",note:"Fastest-growing mid-cap IT. 32% CAGR. GenAI + digital engineering. Premium justifi."},
{id:30,sym:"COFORGE.NS",name:"Coforge",s:"IT",cap:"Mid Cap",pe:38.2,pb:8.5,de:0.2,roe:25.4,roce:22.8,divY:0.8,revG:28,profG:32,prHold:63,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:9000,isB:false,prT:"→",ec:8,rd:"Oct 25",evEb:28,roic:"H",wce:"H",note:"Insurance + travel + BFS IT. 28% revenue growth. BFSI vertical dominance. Deal win."},
{id:31,sym:"CHOLAFIN.NS",name:"Cholamandalam Finance",s:"Finance",cap:"Mid Cap",pe:22.4,pb:4.2,de:5.1,roe:20.4,roce:9.8,divY:0.5,revG:25,profG:30,prHold:47,pledged:0,intCov:4,fcf:"M",ar:"Buy",at:1600,isB:false,prT:"→",ec:8,rd:"Nov 8",evEb:14,roic:"H",wce:"M",note:"Murugappa group NBFC. Vehicle + home finance. 25-30% growth. Clean books. Rural + ."},
{id:32,sym:"ANGELONE.NS",name:"Angel One",s:"Finance",cap:"Mid Cap",pe:18.5,pb:4.5,de:0.5,roe:28.4,roce:22.8,divY:1.5,revG:32,profG:28,prHold:38,pledged:0,intCov:12,fcf:"H",ar:"Buy",at:3200,isB:false,prT:"→",ec:8,rd:"Nov 8",evEb:14,roic:"H",wce:"H",note:"Discount broking + fintech. India retail investor boom = structural tailwind. 28% ."},
{id:33,sym:"GRSE.NS",name:"Garden Reach Shipbuilders",s:"Infrastructure",cap:"Mid Cap",pe:28.5,pb:6.2,de:0.0,roe:22.5,roce:21.8,divY:1.8,revG:28,profG:35,prHold:74,pledged:0,intCov:99,fcf:"H",ar:"Strong Buy",at:3200,isB:false,prT:"→",ec:8,rd:"Nov 15",evEb:22,roic:"H",wce:"H",note:"2nd largest warship builder. 74% Govt. Order book exploding with Navy expansion. Z."},
{id:34,sym:"DATAPATTNS.NS",name:"Data Patterns",s:"Electronics",cap:"Small Cap",pe:65.0,pb:14.5,de:0.0,roe:24.5,roce:23.8,divY:0.5,revG:22,profG:28,prHold:48,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:3800,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:50,roic:"H",wce:"H",note:"Defence electronics — radar, sonar, avionics. Zero debt, 24% ROE. India's most cre."},
{id:35,sym:"OBEROIRLTY.NS",name:"Oberoi Realty",s:"Real Estate",cap:"Mid Cap",pe:38.5,pb:5.5,de:0.3,roe:18.4,roce:16.8,divY:0.5,revG:28,profG:38,prHold:68,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:2500,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:24,roic:"H",wce:"M",note:"Ultra-luxury Mumbai real estate. 68% promoter. Low leverage vs peers. India premiu."},
{id:36,sym:"NAVINFLUOR.NS",name:"Navin Fluorine",s:"Chemicals",cap:"Mid Cap",pe:35.0,pb:5.5,de:0.1,roe:18.5,roce:17.2,divY:0.5,revG:12,profG:15,prHold:28,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4500,isB:false,prT:"→",ec:7,rd:"Nov 5",evEb:28,roic:"H",wce:"H",note:"Fluorochemicals specialist. CDMO + refrigerants. Zero debt. China+1 in fluorine ch."},
{id:37,sym:"VINATI.NS",name:"Vinati Organics",s:"Chemicals",cap:"Mid Cap",pe:40.2,pb:7.8,de:0.0,roe:20.5,roce:19.8,divY:0.4,revG:15,profG:18,prHold:74,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2500,isB:false,prT:"→",ec:8,rd:"Nov 8",evEb:32,roic:"H",wce:"H",note:"IBB + ATBS global leader. 74% promoter. Zero debt. Niche chemicals with global mon."},
{id:38,sym:"CUMMINSIND.NS",name:"Cummins India",s:"Infrastructure",cap:"Large Cap",pe:48.0,pb:12.5,de:0.0,roe:28.5,roce:27.8,divY:1.2,revG:18,profG:25,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:4800,isB:false,prT:"→",ec:9,rd:"Oct 25",evEb:38,roic:"H",wce:"H",note:"Industrial engines + power generation. Zero debt, 28% ROE. India infrastructure + ."},
{id:39,sym:"THERMAX.NS",name:"Thermax",s:"Infrastructure",cap:"Large Cap",pe:55.0,pb:9.5,de:0.0,roe:18.5,roce:17.8,divY:0.5,revG:18,profG:22,prHold:62,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:5500,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:42,roic:"H",wce:"H",note:"Industrial boilers + energy + environment solutions. Zero debt. Every new factory,."},
{id:40,sym:"METROPOLIS.NS",name:"Metropolis Healthcare",s:"Pharma",cap:"Mid Cap",pe:52.0,pb:10.5,de:0.1,roe:22.5,roce:21.8,divY:0.8,revG:15,profG:18,prHold:49,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2800,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:35,roic:"H",wce:"H",note:"Diagnostics chain. India healthcare penetration = structural tailwind. B2C + B2B m."},
{id:41,sym:"MEDANTA.NS",name:"Global Health (Medanta)",s:"Pharma",cap:"Mid Cap",pe:65.0,pb:8.5,de:0.2,roe:18.5,roce:16.8,divY:0.0,revG:25,profG:35,prHold:66,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:1200,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:38,roic:"H",wce:"M",note:"Premium hospital chain. Tier 1 + Tier 2 expansion. 66% promoter. India hospital be."},
{id:42,sym:"KIMS.NS",name:"KIMS Hospitals",s:"Pharma",cap:"Mid Cap",pe:45.0,pb:6.5,de:0.2,roe:18.5,roce:16.8,divY:0.5,revG:22,profG:28,prHold:42,pledged:0,intCov:12,fcf:"H",ar:"Buy",at:800,isB:false,prT:"→",ec:7,rd:"Nov 8",evEb:30,roic:"H",wce:"M",note:"South India hospital network. Fastest-growing regional hospital chain. AP + Telang."},
{id:43,sym:"BEML.NS",name:"BEML",s:"Infrastructure",cap:"Mid Cap",pe:45.0,pb:5.5,de:0.3,roe:12.5,roce:11.8,divY:0.8,revG:18,profG:22,prHold:54,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:5000,isB:false,prT:"→",ec:7,rd:"Nov 15",evEb:35,roic:"M",wce:"M",note:"Defence + mining + railways equipment. Metro coaches + military vehicles + mining ."},
{id:44,sym:"IRCON.NS",name:"IRCON",s:"Infrastructure",cap:"Mid Cap",pe:14.5,pb:2.8,de:0.1,roe:18.4,roce:16.8,divY:2.5,revG:18,profG:22,prHold:73,pledged:0,intCov:18,fcf:"H",ar:"Buy",at:320,isB:false,prT:"→",ec:8,rd:"Nov 8",evEb:11,roic:"H",wce:"H",note:"Railway + road PSU. 73% Govt. 2.5% dividend. Cheapest railway infra stock. ₹2.5L C."},
{id:45,sym:"KEC.NS",name:"KEC International",s:"Infrastructure",cap:"Mid Cap",pe:28.5,pb:4.5,de:1.2,roe:14.5,roce:12.8,divY:0.5,revG:22,profG:28,prHold:52,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:1400,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:18,roic:"M",wce:"M",note:"Power T&D + railways + civil. RPG Group. Global operations + domestic infra boom. ."},
{id:46,sym:"ADANIPORTS.NS",name:"Adani Ports",s:"Infrastructure",cap:"Large Cap",pe:22.5,pb:4.5,de:1.2,roe:22.4,roce:14.8,divY:0.6,revG:22,profG:28,prHold:65,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:1600,isB:false,prT:"→",ec:8,rd:"Oct 28",evEb:14,roic:"H",wce:"M",note:"India's largest port operator. 14+ ports. India trade volumes to double by 2030. L."},
{id:47,sym:"RVNL.NS",name:"RVNL",s:"Infrastructure",cap:"Mid Cap",pe:22.5,pb:4.5,de:0.2,roe:22.4,roce:18.8,divY:1.5,revG:28,profG:35,prHold:72,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:520,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:16,roic:"H",wce:"M",note:"Railway infra PSU. 72% Govt. ₹2.5L Cr railway annual budget = direct RVNL opportun."},
{id:48,sym:"ASTRAL.NS",name:"Astral",s:"Infrastructure",cap:"Mid Cap",pe:58.5,pb:12.5,de:0.1,roe:22.4,roce:21.8,divY:0.3,revG:18,profG:22,prHold:55,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2500,isB:false,prT:"→",ec:8,rd:"Nov 8",evEb:44,roic:"H",wce:"H",note:"India's fastest growing pipes + adhesives. Quality compounder. 22% ROE. India hous."},
{id:49,sym:"DLF.NS",name:"DLF",s:"Real Estate",cap:"Large Cap",pe:68.0,pb:5.5,de:0.2,roe:10.5,roce:8.8,divY:0.5,revG:35,profG:55,prHold:75,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:1000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:35,roic:"M",wce:"L",note:"India's largest real estate developer. 75% promoter. Luxury + premium segment. DLF."},
{id:50,sym:"GODREJPROP.NS",name:"Godrej Properties",s:"Real Estate",cap:"Large Cap",pe:45.5,pb:4.5,de:0.8,roe:12.4,roce:8.8,divY:0.0,revG:35,profG:45,prHold:59,pledged:0,intCov:4,fcf:"L",ar:"Buy",at:3500,isB:false,prT:"→",ec:7,rd:"Nov 8",evEb:28,roic:"M",wce:"L",note:"India's largest listed real estate. Record pre-sales every quarter. Godrej brand p."},
{id:51,sym:"NBCC.NS",name:"NBCC India",s:"Infrastructure",cap:"Mid Cap",pe:34.8,pb:5.8,de:0.0,roe:20.2,roce:37.1,divY:0.8,revG:10,profG:18,prHold:61,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:140,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:26,roic:"H",wce:"H",note:"PSU construction. 37% ROCE exceptional — highest in construction sector. Smart cit."},
{id:52,sym:"KALPATPOWR.NS",name:"Kalpataru Power",s:"Infrastructure",cap:"Mid Cap",pe:22.0,pb:3.8,de:0.8,roe:18.5,roce:15.8,divY:1.0,revG:22,profG:28,prHold:38,pledged:0,intCov:6,fcf:"M",ar:"Buy",at:2000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:16,roic:"M",wce:"M",note:"Power T&D + railways + oil/gas. International operations. Renewable energy grid ex."},
{id:53,sym:"AMBER.NS",name:"Amber Enterprises",s:"Electronics",cap:"Mid Cap",pe:55.0,pb:8.5,de:0.8,roe:14.5,roce:12.8,divY:0.1,revG:32,profG:35,prHold:41,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:8000,isB:false,prT:"→",ec:7,rd:"Nov 8",evEb:40,roic:"M",wce:"M",note:"AC + washing machine EMS. PLI beneficiary. India AC penetration at 8% vs 60%+ in d."},
{id:54,sym:"IREDA.NS",name:"IREDA",s:"Finance",cap:"Mid Cap",pe:18.5,pb:3.5,de:8.5,roe:16.5,roce:6.2,divY:1.5,revG:28,profG:35,prHold:75,pledged:0,intCov:null,fcf:"H",ar:"Buy",at:310,isB:true,prT:"→",ec:7,rd:"Nov 12",evEb:12,roic:"H",wce:"H",note:"Renewable energy finance PSU. 75% Govt. India's 500GW green target needs ₹30L Cr+ ."},
{id:55,sym:"DHANUKA.NS",name:"Dhanuka Agritech",s:"Chemicals",cap:"Small Cap",pe:22.0,pb:3.5,de:0.0,roe:22.5,roce:21.8,divY:1.5,revG:12,profG:18,prHold:75,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1800,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:16,roic:"H",wce:"H",note:"Agri-input distribution. 75% promoter, zero debt, 22% ROE. India agriculture produ."},
{id:56,sym:"ELGIEQUIP.NS",name:"Elgi Equipments",s:"Infrastructure",cap:"Mid Cap",pe:42.0,pb:7.5,de:0.1,roe:22.5,roce:21.8,divY:1.0,revG:15,profG:18,prHold:45,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:32,roic:"H",wce:"H",note:"Air compressors. Global operations 120+ countries. India + international manufactu."},
{id:57,sym:"GRINDWELL.NS",name:"Grindwell Norton",s:"Infrastructure",cap:"Mid Cap",pe:45.0,pb:8.5,de:0.0,roe:22.5,roce:21.8,divY:0.8,revG:12,profG:15,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:3000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:34,roic:"H",wce:"H",note:"Abrasives + ceramics + plastics. Saint-Gobain parent. Zero debt. Every manufacturi."},
{id:58,sym:"PRINCEPIPE.NS",name:"Prince Pipes",s:"Infrastructure",cap:"Mid Cap",pe:28.0,pb:4.5,de:0.2,roe:18.5,roce:17.2,divY:0.5,revG:18,profG:22,prHold:51,pledged:0,intCov:18,fcf:"H",ar:"Buy",at:1000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:20,roic:"H",wce:"H",note:"Pipes + fittings. Jal Jeevan Mission direct beneficiary. Every rural household wat."},
{id:59,sym:"SRF.NS",name:"SRF",s:"Chemicals",cap:"Large Cap",pe:38.0,pb:5.5,de:0.5,roe:18.5,roce:16.8,divY:0.5,revG:12,profG:15,prHold:50,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:3000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:22,roic:"M",wce:"M",note:"Fluorochemicals + specialty chemicals + technical textiles. Diversified quality. R."},
{id:60,sym:"SYRMA.NS",name:"Syrma SGS Tech",s:"Electronics",cap:"Small Cap",pe:45.0,pb:6.5,de:0.3,roe:14.5,roce:12.8,divY:0.1,revG:35,profG:40,prHold:50,pledged:0,intCov:15,fcf:"M",ar:"Buy",at:900,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:32,roic:"M",wce:"M",note:"EMS for defence + automotive + consumer electronics. 35% CAGR. India EMS sector at."},
// ── 30 SMALL CAP HIGH GROWTH — 30-40% CAGR Potential ──────────────────────
{id:61,sym:"MTARTECH.NS",name:"MTAR Technologies",s:"Infrastructure",cap:"Small Cap",pe:55.0,pb:8.5,de:0.2,roe:14.5,roce:12.8,divY:0.1,revG:25,profG:30,prHold:45,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:2800,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:40,roic:"M",wce:"M",note:"Precision components for defence/nuclear/space. DRDO + ISRO + HAL supplier. India'."},
{id:62,sym:"PARAS.NS",name:"Paras Defence",s:"Electronics",cap:"Small Cap",pe:85.0,pb:12.5,de:0.0,roe:18.5,roce:17.8,divY:0.2,revG:22,profG:28,prHold:45,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1800,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:65,roic:"H",wce:"H",note:"Defence optics + space + drone electronics. Zero debt. Only listed company in Indi."},
{id:63,sym:"KPIGREEN.NS",name:"KPI Green Energy",s:"Power",cap:"Small Cap",pe:32.0,pb:8.5,de:0.5,roe:28.5,roce:22.8,divY:0.1,revG:45,profG:55,prHold:72,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:1200,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:22,roic:"H",wce:"M",note:"Solar energy developer + IPP. 72% promoter. 45% revenue growth. Small but fastest-."},
{id:64,sym:"INOXWIND.NS",name:"Inox Wind",s:"Power",cap:"Small Cap",pe:28.5,pb:5.5,de:0.8,roe:18.4,roce:15.8,divY:0.0,revG:32,profG:0,prHold:38,pledged:5,intCov:5,fcf:"L",ar:"Hold",at:220,isB:false,prT:"→",ec:5,rd:"Nov 15",evEb:18,roic:"M",wce:"L",note:"Wind turbine manufacturer. Multi-year order book. India wind capacity target 10x b."},
{id:65,sym:"RATEGAIN.NS",name:"RateGain Travel Tech",s:"Technology",cap:"Small Cap",pe:52.5,pb:8.5,de:0.1,roe:18.4,roce:16.8,divY:0.0,revG:35,profG:42,prHold:44,pledged:0,intCov:22,fcf:"M",ar:"Buy",at:1100,isB:false,prT:"→",ec:7,rd:"Nov 8",evEb:38,roic:"H",wce:"M",note:"Travel tech SaaS. Hotel + airline clients globally. 35% revenue growth. India trav."},
{id:66,sym:"NEWGEN.NS",name:"Newgen Software",s:"Technology",cap:"Small Cap",pe:38.5,pb:8.5,de:0.0,roe:24.4,roce:23.8,divY:0.5,revG:22,profG:28,prHold:41,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1600,isB:false,prT:"→",ec:8,rd:"Nov 5",evEb:28,roic:"H",wce:"H",note:"Low-code digital process automation. Zero debt, 24% ROE. Banking + govt clients wo."},
{id:67,sym:"RADICO.NS",name:"Radico Khaitan",s:"FMCG",cap:"Mid Cap",pe:45.0,pb:8.5,de:0.5,roe:18.5,roce:15.8,divY:0.8,revG:15,profG:20,prHold:47,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:2500,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:28,roic:"M",wce:"M",note:"Premium spirits. Rampur Single Malt going global. India premiumisation trend = vol."},
{id:68,sym:"BIKAJI.NS",name:"Bikaji Foods",s:"FMCG",cap:"Small Cap",pe:52.5,pb:8.5,de:0.1,roe:18.4,roce:17.8,divY:0.5,revG:22,profG:28,prHold:55,pledged:0,intCov:22,fcf:"H",ar:"Buy",at:950,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:38,roic:"H",wce:"H",note:"Rajasthani snacks going national. 22% CAGR. D2C + modern trade expansion. India or."},
{id:69,sym:"PGEL.NS",name:"PG Electroplast",s:"Electronics",cap:"Small Cap",pe:35.0,pb:6.5,de:0.3,roe:18.5,roce:15.8,divY:0.0,revG:32,profG:38,prHold:52,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:550,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:25,roic:"M",wce:"M",note:"EMS for white goods + smart meters. PLI beneficiary. India AC + washing machine ma."},
{id:70,sym:"VENUSPIPES.NS",name:"Venus Pipes",s:"Metals",cap:"Small Cap",pe:25.0,pb:4.5,de:0.2,roe:20.5,roce:18.8,divY:0.5,revG:28,profG:35,prHold:55,pledged:0,intCov:15,fcf:"M",ar:"Buy",at:2500,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:18,roic:"H",wce:"M",note:"Stainless steel pipes + tubes. Oil & gas + pharma + food sectors. Import substitut."},
{id:71,sym:"SANSERA.NS",name:"Sansera Engineering",s:"Auto",cap:"Small Cap",pe:28.0,pb:4.5,de:0.5,roe:18.5,roce:15.8,divY:0.5,revG:18,profG:22,prHold:42,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:1400,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:20,roic:"M",wce:"M",note:"Precision forged components for auto. EV-agnostic — components needed regardless o."},
{id:72,sym:"TDPOWERSYS.NS",name:"TD Power Systems",s:"Infrastructure",cap:"Small Cap",pe:28.0,pb:4.5,de:0.0,roe:18.5,roce:17.8,divY:1.0,revG:18,profG:22,prHold:68,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:700,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:22,roic:"H",wce:"H",note:"Generators for power plants. Zero debt, 68% promoter. Data centre boom + renewable."},
{id:73,sym:"TECHNOEI.NS",name:"Techno Electric",s:"Power",cap:"Small Cap",pe:32.0,pb:5.5,de:0.0,roe:18.5,roce:17.8,divY:1.2,revG:15,profG:20,prHold:52,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1600,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:24,roic:"H",wce:"H",note:"Power T&D EPC + wind energy. Zero debt. India grid modernisation for renewables = ."},
{id:74,sym:"SUDARSCHEM.NS",name:"Sudarshan Chemical",s:"Chemicals",cap:"Small Cap",pe:35.0,pb:5.5,de:0.2,roe:18.5,roce:17.2,divY:1.0,revG:15,profG:18,prHold:52,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:1400,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:26,roic:"M",wce:"M",note:"Pigments manufacturer. Global position in organic pigments. Paints + plastics + pr."},
{id:75,sym:"DEEPAKFERT.NS",name:"Deepak Fertilisers",s:"Chemicals",cap:"Mid Cap",pe:15.0,pb:2.5,de:0.5,roe:18.5,roce:16.8,divY:1.5,revG:12,profG:18,prHold:46,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:1600,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:12,roic:"M",wce:"M",note:"Fertilisers + TAN (mining chemical). India mining boom = TAN demand. Cheap PE 15 f."},
{id:76,sym:"IDEAFORGE.NS",name:"ideaForge Technology",s:"Technology",cap:"Small Cap",pe:999,pb:4.5,de:0.2,roe:5.5,roce:4.8,divY:0.0,revG:28,profG:0,prHold:18,pledged:0,intCov:8,fcf:"L",ar:"Hold",at:900,isB:false,prT:"→",ec:4,rd:"Nov 12",evEb:40,roic:"L",wce:"L",note:"India's largest drone manufacturer. Defence + surveillance. India drone policy = m."},
{id:77,sym:"AARTIIND.NS",name:"Aarti Industries",s:"Chemicals",cap:"Mid Cap",pe:38.0,pb:5.5,de:0.8,roe:15.5,roce:12.8,divY:0.5,revG:12,profG:10,prHold:45,pledged:0,intCov:8,fcf:"M",ar:"Hold",at:700,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:20,roic:"M",wce:"M",note:"Benzene derivatives + pharma chemicals. China+1 play. Currently in capex cycle. Ma."},
{id:78,sym:"LATENTVIEW.NS",name:"LatentView Analytics",s:"Technology",cap:"Small Cap",pe:45.0,pb:6.5,de:0.0,roe:18.5,roce:17.8,divY:0.5,revG:25,profG:30,prHold:35,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:550,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:32,roic:"H",wce:"H",note:"Data analytics + AI services. Zero debt. Fortune 500 US clients. Analytics becomin."},
{id:79,sym:"CAMPUS.NS",name:"Campus Activewear",s:"Consumer",cap:"Small Cap",pe:48.5,pb:5.5,de:0.2,roe:14.4,roce:13.8,divY:0.3,revG:12,profG:8,prHold:75,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:380,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:36,roic:"M",wce:"M",note:"Mass market sports footwear. 75% promoter. 50Cr+ pairs/year market. India footwear."},
{id:80,sym:"DODLA.NS",name:"Dodla Dairy",s:"FMCG",cap:"Small Cap",pe:28.0,pb:4.5,de:0.5,roe:18.5,roce:15.8,divY:0.5,revG:15,profG:18,prHold:60,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:1200,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:18,roic:"M",wce:"M",note:"South India dairy. High promoter holding. India dairy organised market only 20% pe."},
{id:81,sym:"HATSUN.NS",name:"Hatsun Agro",s:"FMCG",cap:"Mid Cap",pe:65.0,pb:12.5,de:1.2,roe:22.5,roce:15.8,divY:0.5,revG:15,profG:18,prHold:68,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:1300,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:22,roic:"M",wce:"M",note:"South India ice cream + dairy king. Arun brand dominance. 68% promoter. Premium da."},
{id:82,sym:"ALKYLAMINE.NS",name:"Alkyl Amines",s:"Chemicals",cap:"Mid Cap",pe:28.5,pb:5.2,de:0.1,roe:18.5,roce:17.4,divY:1.2,revG:10,profG:12,prHold:72,pledged:0,intCov:15,fcf:"H",ar:"Buy",at:3000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:22,roic:"H",wce:"H",note:"Amines manufacturer. 72% promoter, zero debt. Pharma + agrochemical inputs. China+."},
{id:83,sym:"FINEORG.NS",name:"Fine Organic Industries",s:"Chemicals",cap:"Mid Cap",pe:32.5,pb:6.5,de:0.0,roe:20.8,roce:20.2,divY:1.5,revG:12,profG:15,prHold:50,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:6000,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:26,roic:"H",wce:"H",note:"Oleochemical additives. Zero debt. Global leader in polymer additives. Niche = pri."},
{id:84,sym:"MRSFOODPRD.NS",name:"Mrs Bectors Food",s:"FMCG",cap:"Small Cap",pe:45.0,pb:8.5,de:0.2,roe:18.5,roce:16.8,divY:0.3,revG:18,profG:22,prHold:49,pledged:0,intCov:18,fcf:"M",ar:"Buy",at:850,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:28,roic:"M",wce:"M",note:"Premium biscuits + bakery. McDonald's, KFC supplier in India. B2B + B2C model. Pre."},
{id:85,sym:"JAMNAAUTO.NS",name:"Jamna Auto",s:"Auto",cap:"Small Cap",pe:18.0,pb:3.5,de:0.5,roe:18.5,roce:16.8,divY:1.5,revG:15,profG:18,prHold:48,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:160,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:12,roic:"M",wce:"M",note:"Leaf springs + suspension. Commercial vehicle auto ancillary. India CV upcycle = J."},
{id:86,sym:"CLEAN.NS",name:"Clean Science Technology",s:"Chemicals",cap:"Mid Cap",pe:45.0,pb:10.2,de:0.0,roe:22.5,roce:21.8,divY:0.3,revG:15,profG:20,prHold:53,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:38,roic:"H",wce:"H",note:"Performance chemicals — MEHQ, BHA, Guaiacol. Zero debt. World's lowest-cost produc."},
{id:87,sym:"NAZARA.NS",name:"Nazara Technologies",s:"Technology",cap:"Small Cap",pe:65.5,pb:5.5,de:0.1,roe:8.4,roce:7.8,divY:0.0,revG:28,profG:5,prHold:42,pledged:0,intCov:15,fcf:"L",ar:"Hold",at:1100,isB:false,prT:"→",ec:5,rd:"Nov 12",evEb:48,roic:"L",wce:"L",note:"India gaming + esports + edtech. First mover. India gaming market will be $8Bn by ."},
{id:88,sym:"RHIM.NS",name:"RHI Magnesita India",s:"Chemicals",cap:"Small Cap",pe:22.0,pb:3.5,de:0.2,roe:18.5,roce:16.8,divY:1.5,revG:12,profG:15,prHold:70,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:800,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:16,roic:"M",wce:"M",note:"Refractory materials for steel + cement + glass. 70% promoter (global MNC parent).."},
{id:89,sym:"ELGIEQUIP.NS",name:"Elgi Equipments",s:"Infrastructure",cap:"Mid Cap",pe:42.0,pb:7.5,de:0.1,roe:22.5,roce:21.8,divY:1.0,revG:15,profG:18,prHold:45,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:32,roic:"H",wce:"H",note:"Air compressors. 120+ countries. Quality engineering brand. India manufacturing + ."},
{id:90,sym:"PGEL.NS",name:"PG Electroplast",s:"Electronics",cap:"Small Cap",pe:35.0,pb:6.5,de:0.3,roe:18.5,roce:15.8,divY:0.0,revG:32,profG:38,prHold:52,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:550,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:25,roic:"M",wce:"M",note:"EMS white goods. PLI beneficiary. AC + washing machine + smart meters manufacturin."},
// ── 10 EMERGING — High Risk, 5-10x Potential ──────────────────────────────
{id:91,sym:"MSTC.NS",name:"MSTC",s:"Technology",cap:"Small Cap",pe:12.0,pb:2.5,de:0.0,roe:22.5,roce:21.8,divY:2.5,revG:8,profG:12,prHold:64,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:700,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:10,roic:"H",wce:"H",note:"Govt e-commerce + recycling. 64% Govt. Scrap recycling + auction platform. India c."},
{id:92,sym:"OPTIEMUS.NS",name:"Optiemus Electronics",s:"Electronics",cap:"Small Cap",pe:25.0,pb:3.5,de:0.3,roe:15.5,roce:13.8,divY:0.0,revG:35,profG:40,prHold:52,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:500,isB:false,prT:"→",ec:5,rd:"Nov 12",evEb:20,roic:"M",wce:"M",note:"EMS for smartphones + IoT. PLI beneficiary. Nokia handsets + smart devices. India ."},
{id:93,sym:"WPIL.NS",name:"WPIL",s:"Infrastructure",cap:"Small Cap",pe:18.0,pb:3.5,de:0.3,roe:18.5,roce:16.8,divY:1.5,revG:12,profG:15,prHold:65,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:1800,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:14,roic:"M",wce:"M",note:"Pumps for water + oil/gas + power. 65% promoter. Jal Jeevan Mission + irrigation +."},
{id:94,sym:"TRANSPEK.NS",name:"Transpek Industry",s:"Chemicals",cap:"Small Cap",pe:12.0,pb:2.5,de:0.2,roe:18.5,roce:17.2,divY:2.0,revG:12,profG:15,prHold:60,pledged:0,intCov:12,fcf:"M",ar:"Buy",at:2000,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:10,roic:"M",wce:"M",note:"Chlorination chemistry. Pharma + agrochemical inputs. 60% promoter, low PE 12. Chi."},
{id:95,sym:"JBCHEPHARM.NS",name:"JB Chemicals",s:"Pharma",cap:"Mid Cap",pe:42.0,pb:8.5,de:0.0,roe:22.5,roce:21.8,divY:0.5,revG:18,profG:22,prHold:54,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:2200,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:32,roic:"H",wce:"H",note:"Pharma brand + CDMO. KKR backed. Russia + Romania strong markets. Zero debt, 22% R."},
{id:96,sym:"ERIS.NS",name:"Eris Lifesciences",s:"Pharma",cap:"Mid Cap",pe:28.0,pb:5.5,de:0.5,roe:22.5,roce:20.8,divY:0.8,revG:15,profG:18,prHold:52,pledged:0,intCov:12,fcf:"H",ar:"Buy",at:1500,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:20,roic:"H",wce:"H",note:"Chronic disease pharma. Diabetes + cardiac. India chronic disease burden growing 1."},
{id:97,sym:"HFCL.NS",name:"HFCL",s:"Technology",cap:"Small Cap",pe:28.0,pb:4.5,de:0.5,roe:15.5,roce:13.8,divY:0.3,revG:18,profG:22,prHold:38,pledged:0,intCov:8,fcf:"M",ar:"Buy",at:180,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:18,roic:"M",wce:"M",note:"Telecom cables + defence communication. 5G + Jio Bharat = massive fibre deployment."},
{id:98,sym:"SUVEN.NS",name:"Suven Pharmaceuticals",s:"Pharma",cap:"Small Cap",pe:45.0,pb:8.5,de:0.0,roe:22.5,roce:21.8,divY:0.3,revG:22,profG:28,prHold:50,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:1200,isB:false,prT:"→",ec:7,rd:"Nov 12",evEb:35,roic:"H",wce:"H",note:"CDMO for global innovator drugs. Zero debt, 22% ROE. Long-term contracts with Eli ."},
{id:99,sym:"AARTIDRUGS.NS",name:"Aarti Drugs",s:"Pharma",cap:"Small Cap",pe:28.0,pb:3.5,de:0.3,roe:15.5,roce:14.2,divY:0.5,revG:12,profG:15,prHold:52,pledged:0,intCov:10,fcf:"M",ar:"Buy",at:700,isB:false,prT:"→",ec:6,rd:"Nov 12",evEb:18,roic:"M",wce:"M",note:"API manufacturer. Metformin + anti-infectives. China+1 API shift. Cheap valuation ."},
{id:100,sym:"PGHL.NS",name:"Procter & Gamble Health",s:"Pharma",cap:"Small Cap",pe:32.0,pb:8.5,de:0.0,roe:35.5,roce:34.8,divY:2.5,revG:10,profG:15,prHold:51,pledged:0,intCov:99,fcf:"H",ar:"Buy",at:6000,isB:false,prT:"→",ec:8,rd:"Nov 12",evEb:25,roic:"H",wce:"H",note:"P&G consumer health. Vicks + Neurobion. 35% ROE, zero debt, 2.5% dividend. MNC qua."},
];

const SWING_EXTRA=[
  {sym:"EICHERMOT.NS",name:"Eicher Motors",s:"Auto",cap:"Large Cap"},{sym:"TVSMOTOR.NS",name:"TVS Motor",s:"Auto",cap:"Large Cap"},{sym:"ASHOKLEY.NS",name:"Ashok Leyland",s:"Auto",cap:"Large Cap"},{sym:"MOTHERSON.NS",name:"Motherson Sumi",s:"Auto",cap:"Mid Cap"},{sym:"EXIDEIND.NS",name:"Exide Industries",s:"Auto",cap:"Mid Cap"},{sym:"BOSCHLTD.NS",name:"Bosch India",s:"Auto",cap:"Large Cap"},
  {sym:"CANBK.NS",name:"Canara Bank",s:"Banking",cap:"Large Cap"},{sym:"PNB.NS",name:"Punjab National Bank",s:"Banking",cap:"Large Cap"},{sym:"BANKBARODA.NS",name:"Bank of Baroda",s:"Banking",cap:"Large Cap"},{sym:"FEDERALBNK.NS",name:"Federal Bank",s:"Banking",cap:"Mid Cap"},{sym:"BANDHANBNK.NS",name:"Bandhan Bank",s:"Banking",cap:"Large Cap"},{sym:"YESBANK.NS",name:"Yes Bank",s:"Banking",cap:"Large Cap"},
  {sym:"LTFH.NS",name:"L&T Finance",s:"Finance",cap:"Large Cap"},{sym:"MANAPPURAM.NS",name:"Manappuram Finance",s:"Finance",cap:"Mid Cap"},{sym:"POLICYBZR.NS",name:"PB Fintech",s:"Finance",cap:"Large Cap"},{sym:"360ONE.NS",name:"360 ONE WAM",s:"Finance",cap:"Mid Cap"},
  {sym:"INFY.NS",name:"Infosys",s:"IT",cap:"Large Cap"},{sym:"TCS.NS",name:"TCS",s:"IT",cap:"Large Cap"},{sym:"WIPRO.NS",name:"Wipro",s:"IT",cap:"Large Cap"},{sym:"TECHM.NS",name:"Tech Mahindra",s:"IT",cap:"Large Cap"},{sym:"MPHASIS.NS",name:"Mphasis",s:"IT",cap:"Large Cap"},{sym:"HEXAWARE.NS",name:"Hexaware",s:"IT",cap:"Large Cap"},{sym:"KPITTECH.NS",name:"KPIT Technologies",s:"IT",cap:"Mid Cap"},
  {sym:"DRREDDY.NS",name:"Dr Reddy Labs",s:"Pharma",cap:"Large Cap"},{sym:"CIPLA.NS",name:"Cipla",s:"Pharma",cap:"Large Cap"},{sym:"DIVISLAB.NS",name:"Divi Labs",s:"Pharma",cap:"Large Cap"},{sym:"AUROPHARMA.NS",name:"Aurobindo Pharma",s:"Pharma",cap:"Large Cap"},{sym:"TORNTPHARM.NS",name:"Torrent Pharma",s:"Pharma",cap:"Large Cap"},{sym:"ALKEM.NS",name:"Alkem Labs",s:"Pharma",cap:"Large Cap"},{sym:"MANKIND.NS",name:"Mankind Pharma",s:"Pharma",cap:"Large Cap"},{sym:"APOLLOHOSP.NS",name:"Apollo Hospitals",s:"Pharma",cap:"Large Cap"},{sym:"FORTIS.NS",name:"Fortis Healthcare",s:"Pharma",cap:"Large Cap"},{sym:"MAXHEALTH.NS",name:"Max Healthcare",s:"Pharma",cap:"Large Cap"},
  {sym:"NESTLEIND.NS",name:"Nestle India",s:"FMCG",cap:"Large Cap"},{sym:"BRITANNIA.NS",name:"Britannia",s:"FMCG",cap:"Large Cap"},{sym:"EMAMILTD.NS",name:"Emami",s:"FMCG",cap:"Mid Cap"},{sym:"VARUNBEV.NS",name:"Varun Beverages",s:"FMCG",cap:"Large Cap"},{sym:"TATACONSUM.NS",name:"Tata Consumer",s:"FMCG",cap:"Large Cap"},{sym:"UBL.NS",name:"United Breweries",s:"FMCG",cap:"Large Cap"},
  {sym:"BPCL.NS",name:"BPCL",s:"Energy",cap:"Large Cap"},{sym:"IOC.NS",name:"Indian Oil",s:"Energy",cap:"Large Cap"},{sym:"HINDPETRO.NS",name:"HPCL",s:"Energy",cap:"Large Cap"},{sym:"GAIL.NS",name:"GAIL India",s:"Energy",cap:"Large Cap"},{sym:"MGL.NS",name:"Mahanagar Gas",s:"Energy",cap:"Mid Cap"},{sym:"GUJGASLTD.NS",name:"Gujarat Gas",s:"Energy",cap:"Mid Cap"},
  {sym:"NTPC.NS",name:"NTPC",s:"Power",cap:"Large Cap"},{sym:"POWERGRID.NS",name:"Power Grid",s:"Power",cap:"Large Cap"},{sym:"NHPC.NS",name:"NHPC",s:"Power",cap:"Large Cap"},{sym:"TATAPOWER.NS",name:"Tata Power",s:"Power",cap:"Large Cap"},{sym:"CESC.NS",name:"CESC",s:"Power",cap:"Mid Cap"},{sym:"IEX.NS",name:"Indian Energy Exchange",s:"Power",cap:"Mid Cap"},
  {sym:"ULTRACEMCO.NS",name:"UltraTech Cement",s:"Infrastructure",cap:"Large Cap"},{sym:"JKCEMENT.NS",name:"JK Cement",s:"Infrastructure",cap:"Large Cap"},{sym:"SIEMENS.NS",name:"Siemens India",s:"Infrastructure",cap:"Large Cap"},{sym:"ABB.NS",name:"ABB India",s:"Infrastructure",cap:"Large Cap"},{sym:"CONCOR.NS",name:"Container Corp",s:"Infrastructure",cap:"Large Cap"},{sym:"DELHIVERY.NS",name:"Delhivery",s:"Infrastructure",cap:"Large Cap"},
  {sym:"TATASTEEL.NS",name:"Tata Steel",s:"Metals",cap:"Large Cap"},{sym:"JSWSTEEL.NS",name:"JSW Steel",s:"Metals",cap:"Large Cap"},{sym:"SAIL.NS",name:"SAIL",s:"Metals",cap:"Large Cap"},{sym:"HINDALCO.NS",name:"Hindalco",s:"Metals",cap:"Large Cap"},{sym:"VEDL.NS",name:"Vedanta",s:"Metals",cap:"Large Cap"},{sym:"NMDC.NS",name:"NMDC",s:"Metals",cap:"Large Cap"},{sym:"HINDZINC.NS",name:"Hindustan Zinc",s:"Metals",cap:"Large Cap"},{sym:"JSL.NS",name:"Jindal Stainless",s:"Metals",cap:"Mid Cap"},
  {sym:"ASIANPAINT.NS",name:"Asian Paints",s:"Consumer",cap:"Large Cap"},{sym:"BERGEPAINT.NS",name:"Berger Paints",s:"Consumer",cap:"Large Cap"},{sym:"PIDILITIND.NS",name:"Pidilite Industries",s:"Consumer",cap:"Large Cap"},{sym:"PAGEIND.NS",name:"Page Industries",s:"Consumer",cap:"Large Cap"},{sym:"MANYAVAR.NS",name:"Vedant Fashions",s:"Consumer",cap:"Large Cap"},{sym:"METRO.NS",name:"Metro Brands",s:"Consumer",cap:"Mid Cap"},{sym:"BATA.NS",name:"Bata India",s:"Consumer",cap:"Mid Cap"},
  {sym:"VOLTAS.NS",name:"Voltas",s:"Consumer Durables",cap:"Mid Cap"},{sym:"BLUESTARCO.NS",name:"Blue Star",s:"Consumer Durables",cap:"Mid Cap"},{sym:"WHIRLPOOL.NS",name:"Whirlpool India",s:"Consumer Durables",cap:"Mid Cap"},{sym:"CROMPTON.NS",name:"Crompton Consumer",s:"Consumer Durables",cap:"Mid Cap"},
  {sym:"STARHEALTH.NS",name:"Star Health Insurance",s:"Insurance",cap:"Large Cap"},{sym:"MFSL.NS",name:"Max Financial Services",s:"Insurance",cap:"Large Cap"},
  {sym:"DLF.NS",name:"DLF",s:"Real Estate",cap:"Large Cap"},{sym:"LODHA.NS",name:"Macrotech Developers",s:"Real Estate",cap:"Large Cap"},{sym:"PHOENIXLTD.NS",name:"Phoenix Mills",s:"Real Estate",cap:"Large Cap"},{sym:"BRIGADE.NS",name:"Brigade Enterprises",s:"Real Estate",cap:"Mid Cap"},
  {sym:"IDEA.NS",name:"Vodafone Idea",s:"Telecom",cap:"Large Cap"},{sym:"TATACOMM.NS",name:"Tata Communications",s:"Telecom",cap:"Large Cap"},{sym:"INDUSTOWER.NS",name:"Indus Towers",s:"Telecom",cap:"Large Cap"},
  {sym:"NAUKRI.NS",name:"Info Edge",s:"Technology",cap:"Large Cap"},{sym:"PAYTM.NS",name:"Paytm",s:"Technology",cap:"Large Cap"},{sym:"ZOMATO.NS",name:"Zomato",s:"Technology",cap:"Large Cap"},{sym:"TANLA.NS",name:"Tanla Platforms",s:"Technology",cap:"Mid Cap"},{sym:"INDIAMART.NS",name:"IndiaMART",s:"Technology",cap:"Mid Cap"},
  {sym:"TATACHEM.NS",name:"Tata Chemicals",s:"Chemicals",cap:"Large Cap"},{sym:"AARTIIND.NS",name:"Aarti Industries",s:"Chemicals",cap:"Mid Cap"},{sym:"SRF.NS",name:"SRF",s:"Chemicals",cap:"Large Cap"},
];
const _syms=new Set(STOCKS.map(s=>s.sym));
const ALL_SWING=[...STOCKS,...SWING_EXTRA.filter(s=>!_syms.has(s.sym))];

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
  const sf6=SF[stock.s];
  const p6_fii=sf6?.fi==="Buying"?1:0;
  const p6_dii=sf6?.di==="Buying"?1:0;
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
    {name:"Analyst + FII",score:p6,max:10,detail:`Rating: ${p6_rat}/5 · Upside: ${p6_upside}/3 · FII Flow: ${p6_fii}/2`},
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

function getPriceLevels(stock,live){
  if(!live?.price)return null;
  const p=live.price;
  const spe=SECTOR_PE[stock.s]||25;
  // Swing: volume-driven
  const vr=(live.vol&&live.avgVol)?live.vol/live.avgVol:1;
  const su=vr>=4?0.09:vr>=3?0.07:vr>=2?0.06:0.05;
  const ss=vr>=3?0.05:0.07;
  const swT=p*(1+su),swS=p*(1-ss);
  const swRR=((swT-p)/(p-swS)).toFixed(1);
  // Short: PE + 52W + growth
  const range=(live.h52&&live.l52)?live.h52-live.l52:0;
  const pos52=range>0?(p-live.l52)/range:0.5;
  const momentum=pos52<0.3?0.22:pos52<0.5?0.16:pos52<0.7?0.12:0.08;
  const peDisc=stock.pe>0?Math.max(0,(spe-stock.pe)/spe):0;
  const growthB=(stock.revG||0)>25?0.05:(stock.revG||0)>15?0.03:0;
  const stUp=momentum+(peDisc*0.15)+growthB;
  const stT=Math.round(p*(1+stUp)),stS=Math.round(p*0.88);
  const stRR=((stT-p)/(p-stS)).toFixed(1);
  // Long: ROE-based or analyst target
  let ltT;
  if(stock.at&&stock.at>p*1.05){ltT=stock.at;}
  else{const bvG=(stock.roe||15)/100;const fairPE=Math.min(spe*1.15,stock.pe*(1+(stock.profG||10)/100));const rExp=fairPE>stock.pe?(fairPE/stock.pe-1)*0.5:0;ltT=Math.round(p*(1+bvG*1.5+rExp));}
  return{
    buyZone:`₹${(p*0.97).toFixed(0)}–₹${p.toFixed(0)}`,
    swing:{target:`₹${swT.toFixed(0)}`,stop:`₹${swS.toFixed(0)}`,gain:`${(su*100).toFixed(0)}%`,rr:swRR,duration:"1–3 days",exit:"Exit at target OR stop — whichever hits first."},
    short:{target:`₹${stT}`,stop:`₹${stS}`,gain:`~${(stUp*100).toFixed(0)}%`,rr:stRR,duration:"4–12 weeks",exit:`Exit by ${new Date(Date.now()+90*24*60*60*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} or target hit.`,basis:`PE vs sector: ${peDisc>0.1?"cheap":"fair"} · 52W: ${pos52<0.35?"near low":"mid"} · Growth: ${stock.revG||0}% CAGR`},
    long:{target:`₹${ltT}`,stop:`₹${Math.round(p*0.80)}`,gain:`${((ltT/p-1)*100).toFixed(0)}%`,rr:"3:1+",duration:"12–36 months",exit:`Hold until ${new Date(Date.now()+18*30*24*60*60*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} or target revision.`,basis:stock.at&&stock.at>p*1.05?"Analyst consensus target":`ROE ${stock.roe}% driven book value growth`},
  };
}

function generateRemark(stock, pillars, rec, upside, peg) {
  const spe=SECTOR_PE[stock.s]||25;
  const best=pillars.reduce((a,b)=>a.score/a.max>b.score/b.max?a:b);
  const worst=pillars.reduce((a,b)=>a.score/a.max<b.score/b.max?a:b);
  const sfr=SF[stock.s];
  const opener={"STRONG BUY":`All pillars strong — ${stock.name} is a high-conviction entry.`,"BUY":`${stock.name} presents a clear buying opportunity.`,"HOLD":`${stock.name} is fairly valued — hold or wait for better entry.`,"REDUCE":`${stock.name} showing weakness — consider reducing.`,"SELL":`Multiple red flags for ${stock.name} — exit recommended.`};
  const parts=[opener[rec.label]||""];
  if(best.score/best.max>0.65) parts.push(`Strongest: ${best.name} (${best.score}/${best.max}).`);
  if(peg<1.0) parts.push(`PEG ${peg} = undervalued growth.`);
  else if(peg>2.0) parts.push(`PEG ${peg} = expensive vs growth.`);
  if(stock.pe<spe*0.75) parts.push(`PE ${((1-stock.pe/spe)*100).toFixed(0)}% below sector = undervalued.`);
  if(sfr?.fi==="Buying") parts.push(`FII buying ${stock.s} sector this week.`);
  else if(sfr?.fi==="Selling") parts.push(`⚠ FII selling ${stock.s} sector — headwind.`);
  if(worst.score/worst.max<0.35) parts.push(`Watch: ${worst.name} (${worst.score}/${worst.max}).`);
  if(upside!=null&&upside>15) parts.push(`Analyst sees ${upside.toFixed(0)}% upside to ₹${stock.at}.`);
  else if(upside!=null&&upside<0) parts.push(`⚠ Above analyst target — limited upside.`);
  return parts.join(" ");
}

function getFlags(stock, score, live, vr, peg) {
  const risks=[],opps=[];
  const sfg=SF[stock.s];
  if(stock.pledged>10) risks.push("⚠ High pledging "+stock.pledged+"%");
  if(stock.prT==="↓") risks.push("⬇ Promoter reducing stake");
  if(stock.de>1.5&&!stock.isB) risks.push("⚠ High debt/equity "+stock.de);
  if(stock.fcf==="L") risks.push("⚠ Poor free cash flow");
  if(sfg?.fi==="Selling") risks.push("📉 FII selling sector this week");
  if(stock.ec<5) risks.push("⚠ Inconsistent earnings ("+stock.ec+"/10)");
  if(live?.price&&live.price>live.h52*0.95) risks.push("⚠ Near 52-week high");
  if(stock.prT==="↑") opps.push("⬆ Promoter increasing stake");
  if(sfg?.fi==="Buying") opps.push("💚 FII+DII buying sector "+sfg?.fa);
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
  const [fiiDii,setFiiDii]=useState(null);
  const [swingLd,setSwingLd]=useState({});
  const [news, setNews]=useState([]);
  const [newsLoad, setNewsLoad]=useState(false);
  const [portfolio, setPortfolio]=useState(()=>{try{return JSON.parse(localStorage.getItem("isp")||"[]")}catch{return[]}});
  const [pfForm, setPfForm]=useState({sym:"",qty:"",buy:""});
  const [fiiPanelOpen, setFiiPanelOpen]=useState(false);
  const [brief,setBrief]=useState(null);
  const [newsAnn,setNewsAnn]=useState(null);
  const [depth,setDepth]=useState(null);
  const [depthLoading,setDepthLoading]=useState(false);
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
    const newSld={};
    const extras=SWING_EXTRA.filter(s=>!STOCKS.find(x=>x.sym===s.sym));
    for(let i=0;i<extras.length;i+=20){
      const syms=extras.slice(i,i+20).map(s=>s.sym).join(',');
      try{const r=await fetch('/api/finance?symbols='+encodeURIComponent(syms),{signal:AbortSignal.timeout(15000)});const j=await r.json();(j?.quoteResponse?.result||[]).forEach(q=>{if(q.regularMarketPrice)newSld[q.symbol]={price:q.regularMarketPrice,chg:q.regularMarketChange,pct:q.regularMarketChangePercent,vol:q.regularMarketVolume,avgVol:q.averageDailyVolume3Month,h52:q.fiftyTwoWeekHigh,l52:q.fiftyTwoWeekLow};});}catch(_){}
      await new Promise(r=>setTimeout(r,400));
    }
    setSwingLd(prev=>({...prev,...newSld}));
  },[]);

  const fetchFiiDii=useCallback(async()=>{
    try{const r=await fetch('/api/fii-dii',{signal:AbortSignal.timeout(8000)});const j=await r.json();if(Array.isArray(j)){const fd=j.find(x=>x.category&&x.category.toUpperCase().includes('FII'));const dd=j.find(x=>x.category&&x.category.toUpperCase().includes('DII'));if(fd||dd)setFiiDii({fii:fd?fd.netValue:0,dii:dd?dd.netValue:0});}}catch(_){}
  },[]);

  const fetchBrief=useCallback(async()=>{
    try{const syms='^GSPC,^IXIC,^N225,^HSI,CL=F,GC=F,USDINR=X';const r=await fetch('/api/finance?symbols='+encodeURIComponent(syms),{signal:AbortSignal.timeout(15000)});const j=await r.json();const m={};(j?.quoteResponse?.result||[]).forEach(x=>{m[x.symbol]=x;});setBrief({sp500:m['^GSPC'],nasdaq:m['^IXIC'],nikkei:m['^N225'],hsi:m['^HSI'],crude:m['CL=F'],gold:m['GC=F'],usdinr:m['USDINR=X'],at:new Date()});}catch(_){}
  },[]);


  const fetchNews2=useCallback(async()=>{
    try{const r=await fetch('/api/announcements',{signal:AbortSignal.timeout(15000)});
    const j=await r.json();setNewsAnn(j);}catch(_){}
  },[]);

  const fetchDepth=useCallback(async()=>{
    setDepthLoading(true);
    // Scan top 40 stocks by market cap for intraday signals
    const topSyms=STOCKS.slice(0,40).map(s=>s.sym.replace('.NS','')).join(',');
    try{const r=await fetch('/api/depth?symbols='+encodeURIComponent(topSyms),{signal:AbortSignal.timeout(30000)});
    const j=await r.json();setDepth(j);}catch(_){}
    setDepthLoading(false);
  },[]);


  useEffect(()=>{
    fetchAll();fetchFiiDii();fetchSwingPrices();fetchNews2();
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

  const allLd=useMemo(()=>Object.assign({},ld,swingLd),[ld,swingLd]);
  const swingRows=useMemo(()=>{
    return ALL_SWING.map(s=>{
      const lv=allLd[s.sym];
      if(!lv||!lv.price||!lv.vol||!lv.avgVol)return null;
      const vr2=lv.vol/lv.avgVol;
      if(vr2<1.0)return null;
      const pc2=lv.pct||0;
      const sw=(vr2>3?35:vr2>2?28:vr2>1.5?20:12)+(pc2>3?25:pc2>2?20:pc2>1?15:pc2>0?8:0)+(lv.chg>0?15:5);
      const lvl=getPriceLevels(s,lv);
      return{...s,live:lv,vr:vr2,pct:pc2,swScore:sw,levels:lvl,rec:{label:"BUY",c:"#69f0ae",bg:"#001a08",ring:"#69f0ae44"},score:50};
    }).filter(Boolean).sort((a,b)=>b.swScore-a.swScore).slice(0,20);
  },[allLd]);


  const exitAlerts=useMemo(()=>portfolio.map(h=>{
    const lv=ld[h.sym];if(!lv||!lv.price)return null;
    const pctChg=(lv.price-h.buyPrice)/h.buyPrice*100;
    const pnlAmt=(lv.price-h.buyPrice)*h.qty;
    if(pctChg<=-7)return{...h,live:lv,pctChg,pnlAmt,alert:"EXIT — Stop Loss Hit (-7%)",alertC:"#ff5252"};
    if(pctChg>=5)return{...h,live:lv,pctChg,pnlAmt,alert:"BOOK PROFIT — Target Hit (+5%)",alertC:"#00e676"};
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
            <span style={{fontSize:10,color:"#2a3a55"}}>300 Stocks · FII+DII · Wealth Focus</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {fiiDii&&<span style={{fontSize:11,display:"flex",gap:6}}><span style={{color:fiiDii.fii>=0?"#34d399":"#ff5252",fontWeight:700}}>FII {fiiDii.fii>=0?"+":""}{Math.round(fiiDii.fii)}Cr</span><span style={{color:fiiDii.dii>=0?"#60a5fa":"#ff5252",fontWeight:700}}>DII {fiiDii.dii>=0?"+":""}{Math.round(fiiDii.dii)}Cr</span></span>}
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
            {Object.entries(SF).map(([sec,data],idx)=>(
              <div key={sec} style={{background:"#0a0f1e",borderRadius:6,padding:"5px 10px",border:`1px solid ${data.fi==="Buying"?"#34d39933":data.fi==="Selling"?"#f8717133":"#2a3a55"}`,minWidth:100}}>
                <div style={{fontSize:9,color:SCOL[sec]||"#60a5fa",fontWeight:600}}>{sec}</div>
                <div style={{fontSize:11,fontWeight:700,color:data.fi==="Buying"?"#34d399":data.fi==="Selling"?"#f87171":"#ffd740"}}>{data.fw} {data.fi}</div>
                <div style={{fontSize:9,color:"#2a3a55"}}>{data.fa}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>

      {/* STATS */}
      <div style={{display:"flex",gap:7,padding:"10px 16px",overflowX:"auto"}}>
        {[{l:"Strong Buy",v:rows.filter(r=>r.score>=78).length,c:"#00e676"},{l:"Buy",v:rows.filter(r=>r.score>=65&&r.score<78).length,c:"#69f0ae"},{l:"Hold",v:rows.filter(r=>r.score>=52&&r.score<65).length,c:"#ffd740"},{l:"Reduce/Sell",v:rows.filter(r=>r.score<52).length,c:"#ff5252"},{l:"⚡ Swing (300)",v:swingRows.length,c:"#f59e0b"},{l:"🚨 Exits",v:exitAlerts.length,c:"#ff5252"},{l:"Showing",v:rows.length,c:"#60a5fa"}].map(st=>(
          <div key={st.l} style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:9,padding:"7px 13px",minWidth:90,flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:st.c,lineHeight:1}}>{st.v}</div>
            <div style={{fontSize:9,color:"#2a3a55",marginTop:2}}>{st.l}</div>
          </div>
        ))}
      </div>

      {/* MAIN TABS */}
      <div style={{display:"flex",borderBottom:"1px solid #141e30",padding:"0 16px"}}>
        {[["stocks","📊 Stocks"],["swing","⚡ Swing (300)"],["intraday","🎯 Intraday"],["news","📰 News Signals"],["portfolio","💼 Portfolio"],["brief","🌅 Morning Brief"],["refresh","🔄 Info"]].map(([id,l])=>(
          <button key={id} onClick={()=>setMainTab(id)} style={{padding:"9px 14px",background:"transparent",border:"none",borderBottom:`2px solid ${mainTab===id?"#3b82f6":"transparent"}`,color:mainTab===id?"#60a5fa":"#3d5070",cursor:"pointer",fontSize:11,fontWeight:mainTab===id?700:400,whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {/* AUTO-REFRESH INFO TAB */}

      {mainTab==="brief"&&(
        <div style={{padding:14}}>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:12,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800,color:"#e0ecff"}}>🌅 Morning Briefing — Global Markets</div>
              <button onClick={fetchBrief} style={{background:"#141e30",border:"1px solid #3b82f6",borderRadius:5,padding:"5px 12px",color:"#60a5fa",cursor:"pointer",fontSize:11}}>Refresh Now</button>
            </div>
            {!brief&&<div style={{color:"#2a3a55",textAlign:"center",padding:28,fontSize:12}}>Click Refresh Now. Best viewed before 9:15 AM.</div>}
            {brief&&<>
              <div style={{fontSize:10,color:"#2a3a55",marginBottom:10}}>Updated: {brief.at&&brief.at.toLocaleTimeString()}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:14}}>
                {[["S&P 500",brief.sp500],["Nasdaq",brief.nasdaq],["Nikkei",brief.nikkei],["Hang Seng",brief.hsi],["Crude Oil",brief.crude],["Gold",brief.gold],["USD/INR",brief.usdinr]].map(function(item){
                  const d=item[1];if(!d)return null;
                  const pct=d.regularMarketChangePercent||0;
                  return <div key={item[0]} style={{background:"#070b14",borderRadius:8,padding:"9px 11px",border:"1px solid "+(pct>=0?"#34d39922":"#f8717122")}}>
                    <div style={{fontSize:9,color:"#2a3a55",marginBottom:2}}>{item[0]}</div>
                    <div style={{fontSize:14,fontWeight:800,color:"#e0ecff"}}>{(d.regularMarketPrice||0).toFixed(item[0]==="USD/INR"?2:0)}</div>
                    <div style={{fontSize:11,fontWeight:700,color:pct>=0?"#69f0ae":"#ff5252"}}>{(pct>=0?"+":"")+pct.toFixed(2)+"%"}</div>
                  </div>;
                })}
              </div>
              <div style={{background:"#070b14",borderRadius:8,padding:"11px 13px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#8899bb",marginBottom:7}}>📊 Today's Impact on Indian Sectors</div>
                {(function(){
                  const sp=brief.sp500?brief.sp500.regularMarketChangePercent:0;
                  const cr=brief.crude?brief.crude.regularMarketChangePercent:0;
                  const go=brief.gold?brief.gold.regularMarketChangePercent:0;
                  const impacts=[];
                  if(sp<-1)impacts.push({s:"IT",c:"#ff5252",m:"US markets down "+sp.toFixed(1)+"% → IT stocks may open weak"});
                  else if(sp>1)impacts.push({s:"IT",c:"#34d399",m:"US markets up "+sp.toFixed(1)+"% → IT stocks likely to open strong"});
                  if(cr>2)impacts.push({s:"Energy",c:"#34d399",m:"Crude up "+cr.toFixed(1)+"% → ONGC, Petronet positive"});
                  else if(cr<-2)impacts.push({s:"Energy",c:"#ffd740",m:"Crude down "+Math.abs(cr).toFixed(1)+"% → OMC margins improve"});
                  if(go>1)impacts.push({s:"Finance",c:"#34d399",m:"Gold up "+go.toFixed(1)+"% → Muthoot Finance positive"});
                  if(impacts.length===0)impacts.push({s:"All",c:"#ffd740",m:"Markets stable overnight. Normal open expected."});
                  return impacts.map((x,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #0d1525"}}>
                    <span style={{color:SCOL[x.s]||"#60a5fa",fontSize:10,fontWeight:600,minWidth:60}}>{x.s}</span>
                    <span style={{fontSize:11,color:x.c}}>{x.m}</span>
                  </div>);
                })()}
              </div>
            </>}
          </div>
        </div>
      )}

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
              <tr>{["#","Stock","Cap","FII","DII","CMP","vs Nifty","P/E","PEG","ROE","ROCE","Div%","EC","Promoter","Pledged","Results","Category","Score","Signal"].map(h=><th key={h} style={{padding:"7px 5px",textAlign:"left",fontSize:8.5,fontWeight:700,color:"#1e2e45",textTransform:"uppercase",background:"#070b14",whiteSpace:"nowrap"}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((s,i)=>{
                const sft=SF[s.s];
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
                      <span style={{fontSize:10,fontWeight:700,color:sft?.fi==="Buying"?"#34d399":sft?.fi==="Selling"?"#f87171":"#4a6080"}}>{sft?.fw||"→"}</span>
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
                      <span style={{background:s.rec?.bg||"#001a08",color:s.rec?.c||"#69f0ae",padding:"3px 7px",borderRadius:4,fontSize:9,fontWeight:800,border:"1px solid "+(s.rec?.ring||"#ffffff22"),whiteSpace:"nowrap"}}>{s.rec?.label||"BUY"}</span>
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
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:8,padding:"10px 14px",marginBottom:10,fontSize:11,color:"#4a6080"}}>
            ⚡ <strong style={{color:"#f59e0b"}}>Live Swing Scanner — 300 stocks</strong> · Top 20 by volume surge + momentum · Refreshes every 3 min
            <span style={{color:"#3d5070"}}> · Search any stock in Stocks tab → click → All Data tab for analysis</span>
          </div>
          {swingRows.length>0&&swingRows.length<10&&<div style={{background:"#131c2e",border:"1px solid #1a2540",borderRadius:6,padding:"7px 12px",marginBottom:8,fontSize:10,color:"#3b82f6"}}>⏳ Loading extended universe... {swingRows.length}/20 picks loaded. Full list in ~60 sec.</div>}
          {swingRows.length===0
            ?<div style={{color:"#2a3a55",padding:24,textAlign:"center",background:"#0a0f1e",borderRadius:10,fontSize:12}}>No swing signals yet. Click Refresh after 9:15 AM when market opens.</div>
            :swingRows.map((s,i)=>{
              const lvl=s.levels||null;
              return(
                <div key={s.sym||String(i)} onClick={()=>{setSel({...s,pillars:s.pillars||[],cats:[{l:"Swing",c:"#f59e0b",bg:"#1a1000"}],remark:s.remark||("Vol "+(s.vr||0).toFixed(1)+"x avg"),flags:s.flags||{risks:[],opps:[]}});setMTab("targets");setNews([]);}} style={{background:"#0a0f1e",border:"2px solid #f59e0b33",borderRadius:11,padding:"12px 14px",cursor:"pointer",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontWeight:800,color:"#e0ecff",fontSize:14}}>{i+1}. {s.name}</div>
                    <div style={{fontSize:10,color:"#4a6080",marginTop:2}}>
                      <span style={{color:"#f59e0b",fontWeight:700}}>Vol {(s.vr||0).toFixed(1)}×</span>
                      {" · "}<span style={{color:((s.pct||0)>=0?"#69f0ae":"#ff5252"),fontWeight:700}}>{(s.pct||0)>=0?"+":""}{(s.pct||0).toFixed(2)}% today</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    {s.live&&s.live.price&&<div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:"#e0ecff"}}>₹{fmt(s.live.price,1)}</div></div>}
                    {lvl&&<div style={{background:"#070b14",borderRadius:7,padding:"7px 12px",textAlign:"right"}}>
                      <div style={{fontSize:11,color:"#69f0ae",fontWeight:700}}>🟢 Buy: {lvl.buyZone}</div>
                      <div style={{fontSize:11,color:"#4ade80"}}>Target: {lvl.swing.target} ({lvl.swing.gain})</div>
                      <div style={{fontSize:10,color:"#ff5252"}}>Stop: {lvl.swing.stop}</div>
                      <div style={{fontSize:9,color:"#2a3a55"}}>Exit within {lvl.swing.duration}</div>
                    </div>}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {mainTab==="intraday"&&(
        <div style={{padding:14}}>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <span style={{fontSize:13,fontWeight:800,color:"#e0ecff"}}>🎯 Intraday Order Book Analysis</span>
              <div style={{fontSize:10,color:"#4a6080",marginTop:2}}>Demand vs Supply from NSE live order book · Scans top 40 stocks · Refreshes on demand</div>
            </div>
            <button onClick={fetchDepth} style={{background:depthLoading?"#1a2540":"#1a3a1a",border:"1px solid "+(depthLoading?"#3b82f6":"#34d399"),borderRadius:6,padding:"7px 14px",color:depthLoading?"#60a5fa":"#34d399",cursor:"pointer",fontSize:11,fontWeight:700}}>
              {depthLoading?"⏳ Scanning...":"⚡ Scan Now"}
            </button>
          </div>

          {!depth&&!depthLoading&&<div style={{textAlign:"center",padding:32,color:"#2a3a55",fontSize:12,background:"#0a0f1e",borderRadius:10}}>
            Click "Scan Now" to analyse order book depth across top 40 stocks.<br/>
            <span style={{fontSize:10,color:"#1a2a40"}}>Best used between 10 AM – 2 PM when order books are deepest.</span>
          </div>}

          {depthLoading&&<div style={{textAlign:"center",padding:32,color:"#3b82f6",fontSize:12}}>⏳ Fetching live order book from NSE for 40 stocks...</div>}

          {depth?.results&&<>
            {/* Summary bar */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
              {[
                ["Strong Buy",depth.results.filter(r=>r.signal==="STRONG BUY").length,"#00e676"],
                ["Buy",depth.results.filter(r=>r.signal==="BUY").length,"#34d399"],
                ["Sell/Avoid",depth.results.filter(r=>r.signal==="SELL"||r.signal==="STRONG SELL").length,"#ff5252"],
                ["Neutral",depth.results.filter(r=>r.signal==="NEUTRAL").length,"#ffd740"],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:"#2a3a55"}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Top signals */}
            {["STRONG BUY","BUY","STRONG SELL","SELL"].map(sig=>{
              const items=depth.results.filter(r=>r.signal===sig);
              if(!items.length)return null;
              return(
                <div key={sig} style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:items[0].signalColor,marginBottom:6,padding:"4px 10px",background:items[0].signalColor+"11",borderRadius:4,display:"inline-block"}}>{sig} ({items.length})</div>
                  {items.map((s,i)=>(
                    <div key={i} style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                      {/* Header */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
                        <div>
                          <span style={{fontWeight:800,color:"#e0ecff",fontSize:14}}>{s.symbol}</span>
                          <span style={{fontSize:10,color:"#4a6080",marginLeft:8}}>₹{s.price}</span>
                          <span style={{fontSize:10,color:s.price>=s.vwap?"#34d399":"#ff5252",marginLeft:6}}>VWAP ₹{s.vwap}</span>
                        </div>
                        <span style={{background:s.signalColor+"22",color:s.signalColor,border:"1px solid "+s.signalColor+"44",borderRadius:5,padding:"3px 10px",fontSize:11,fontWeight:800}}>{s.signal}</span>
                      </div>

                      {/* Order book visual */}
                      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#34d399",fontWeight:700,marginBottom:3}}>BUYERS ({s.buyPct}%)</div>
                          <div style={{background:"#001510",borderRadius:4,overflow:"hidden",height:8}}>
                            <div style={{background:"#34d399",height:"100%",width:s.buyPct+"%",transition:"width 0.3s"}}/>
                          </div>
                          <div style={{fontSize:9,color:"#2a3a55",marginTop:2}}>{(s.totalBidQty/1000).toFixed(0)}K qty</div>
                        </div>
                        <div style={{fontSize:11,fontWeight:900,color:s.obi>0?"#34d399":"#ff5252"}}>
                          {s.obi>0?"▶":"◀"} {Math.abs(s.obi*100).toFixed(0)}%
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#ff5252",fontWeight:700,marginBottom:3,textAlign:"right"}}>SELLERS ({100-s.buyPct}%)</div>
                          <div style={{background:"#150000",borderRadius:4,overflow:"hidden",height:8}}>
                            <div style={{background:"#ff5252",height:"100%",width:(100-s.buyPct)+"%",float:"right",transition:"width 0.3s"}}/>
                          </div>
                          <div style={{fontSize:9,color:"#2a3a55",marginTop:2,textAlign:"right"}}>{(s.totalAskQty/1000).toFixed(0)}K qty</div>
                        </div>
                      </div>

                      {/* Trade levels */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
                        <div style={{background:"#070b14",borderRadius:6,padding:"7px 8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#2a3a55"}}>Entry</div>
                          <div style={{fontSize:11,fontWeight:700,color:"#60a5fa"}}>{s.entry}</div>
                        </div>
                        <div style={{background:"#070b14",borderRadius:6,padding:"7px 8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#2a3a55"}}>Target 1</div>
                          <div style={{fontSize:11,fontWeight:700,color:"#34d399"}}>{s.target1}</div>
                        </div>
                        <div style={{background:"#070b14",borderRadius:6,padding:"7px 8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#2a3a55"}}>Target 2</div>
                          <div style={{fontSize:11,fontWeight:700,color:"#4ade80"}}>{s.target2}</div>
                        </div>
                        <div style={{background:"#070b14",borderRadius:6,padding:"7px 8px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#2a3a55"}}>Stop Loss</div>
                          <div style={{fontSize:11,fontWeight:700,color:"#ff5252"}}>{s.stopLoss}</div>
                        </div>
                      </div>

                      {/* Day range + key levels */}
                      <div style={{fontSize:10,color:"#3d5070"}}>
                        Support: <span style={{color:"#34d399"}}>₹{s.bidSupport}</span> · 
                        Resistance: <span style={{color:"#ff5252"}}>₹{s.askResistance}</span> · 
                        Day: ₹{s.dayLow}–₹{s.dayHigh} · 
                        Spread: {s.spreadPct.toFixed(2)}%
                      </div>

                      {/* Bid/Ask ladder */}
                      <div style={{display:"flex",gap:8,marginTop:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#34d399",fontWeight:700,marginBottom:3}}>📗 BID (Buyers)</div>
                          {s.bids.map((b,bi)=>(
                            <div key={bi} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"1px 0",borderBottom:"1px solid #070b14"}}>
                              <span style={{color:"#34d399"}}>₹{b.price}</span>
                              <span style={{color:"#4a6080"}}>{(b.quantity/1000).toFixed(1)}K</span>
                            </div>
                          ))}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#ff5252",fontWeight:700,marginBottom:3}}>📕 ASK (Sellers)</div>
                          {s.asks.map((a,ai)=>(
                            <div key={ai} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"1px 0",borderBottom:"1px solid #070b14"}}>
                              <span style={{color:"#ff5252"}}>₹{a.price}</span>
                              <span style={{color:"#4a6080"}}>{(a.quantity/1000).toFixed(1)}K</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{fontSize:9,color:"#1a2a40",textAlign:"center",padding:8}}>Updated: {new Date(depth.at).toLocaleTimeString()}</div>
          </>}
        </div>
      )}


      {mainTab==="news"&&(
        <div style={{padding:14}}>
          <div style={{background:"#0a0f1e",border:"1px solid #141e30",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <span style={{fontSize:13,fontWeight:800,color:"#e0ecff"}}>📰 News & Corporate Signals</span>
              <div style={{fontSize:10,color:"#4a6080",marginTop:2}}>NSE corporate announcements · Orders, contracts, results, penalties · Auto-analysed</div>
            </div>
            <button onClick={fetchNews2} style={{background:"#1a2540",border:"1px solid #3b82f6",borderRadius:6,padding:"7px 14px",color:"#60a5fa",cursor:"pointer",fontSize:11,fontWeight:700}}>🔄 Refresh</button>
          </div>

          {!newsAnn&&<div style={{textAlign:"center",padding:28,color:"#2a3a55",fontSize:12,background:"#0a0f1e",borderRadius:10}}>Loading NSE announcements...</div>}

          {newsAnn?.error&&<div style={{textAlign:"center",padding:20,color:"#ff5252",fontSize:11}}>{newsAnn.error}</div>}

          {newsAnn?.announcements&&<>
            <div style={{fontSize:10,color:"#2a3a55",marginBottom:10}}>{newsAnn.total} total announcements today · {newsAnn.announcements.length} with clear signal · {new Date(newsAnn.at).toLocaleTimeString()}</div>

            {/* BUY signals first */}
            {["BUY","WATCH","AVOID"].map(sig=>{
              const items=newsAnn.announcements.filter(a=>a.signal===sig);
              if(!items.length)return null;
              const sigColor=sig==="BUY"?"#34d399":sig==="AVOID"?"#ff5252":"#ffd740";
              return(
                <div key={sig} style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:sigColor,marginBottom:8,padding:"4px 10px",background:sigColor+"11",borderRadius:4,display:"inline-block"}}>
                    {sig==="BUY"?"✅":sig==="AVOID"?"🚫":"👀"} {sig} SIGNAL ({items.length} stocks)
                  </div>
                  {items.map((a,i)=>(
                    <div key={i} style={{background:"#0a0f1e",border:"1px solid "+sigColor+"33",borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                          <span style={{fontWeight:800,color:"#e0ecff",fontSize:13}}>{a.symbol}</span>
                          <span style={{fontSize:9,color:"#3d5070"}}>{a.name}</span>
                          <span style={{fontSize:9,color:"#2a3a55"}}>{a.time}</span>
                        </div>
                        <div style={{fontSize:11,color:"#8899bb",lineHeight:1.5}}>{a.subject}</div>
                        <div style={{fontSize:10,color:sigColor,marginTop:4}}>📌 {a.reason}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{background:sigColor+"22",color:sigColor,border:"1px solid "+sigColor+"44",borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sig}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>}
        </div>
      )}


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
                    <span style={{background:sel.rec?.bg||'#001a08',color:sel.rec?.c||'#69f0ae',fontSize:11,padding:"2px 9px",borderRadius:4,fontWeight:800,border:`1px solid ${sel.rec?.ring||'#ffffff22'}`}}>{sel.rec?.label||'BUY'}</span>
                    <span style={{fontSize:13,fontWeight:900,color:sel.rec?.c||'#69f0ae'}}>{sel.score}/100</span>
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
                    {l:"FII Sector Flow",v:SF[sel.s]?.flow||"—",sub:SF[sel.s]?.amt||"",ok:SF[sel.s]?.fi==="Buying"},
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
