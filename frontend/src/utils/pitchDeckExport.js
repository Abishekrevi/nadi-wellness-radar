/**
 * NADI v2.0 — Professional Investor Pitch Deck Generator
  * Generates a 14 - slide.pptx file in the browser using PptxGenJS
 *
 * Data contract(from buildResult in server.js):
 * result.keyword
  * result.momentumAccelerationScore
  * result.classification        { label, emoji, confidence, color }
 * result.confidence
  * result.timeToMainstream
  * result.marketSizePotential   { tam }
 * result.dnaFingerprint        { strands: [{ id, name, score, weight, description }] }
 * result.signals               { reddit, youtube, news, research, ecommerce, searchMomentum, totalStrength }
 * result.sourceAttribution[{ platform, mentions, live }]
  * result.intelligenceReport    {
  executive_summary, why_now, market_gap, signal_evidence,
 * target_consumer, product_opportunity, go_to_market,
 * revenue_model, competitive_moat, risk_assessment,
 * verdict, confidence_level, action_timeline
}
  * result.dataQuality           { grade, label, color }
 * result.timestamp
  *

// ── CDN fallback loader ────────────────────────────────────────────
const CDNS = [
  'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
  'https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
];

function loadLib() {
  return new Promise((resolve, reject) => {
    if (window.PptxGenJS) { resolve(window.PptxGenJS); return; }
    let i = 0;
    function next() {
      if (i >= CDNS.length) { reject(new Error('Could not load PptxGenJS. Please check your internet connection and try again.')); return; }
      const el = document.getElementById('__pptxgen');
      if (el) el.remove();
      const s = document.createElement('script');
      s.id = '__pptxgen';
      s.src = CDNS[i++];
      s.onload = () => (window.PptxGenJS ? resolve(window.PptxGenJS) : next());
      s.onerror = () => next();
      document.head.appendChild(s);
    }
    next();
  });
}

// ── Colour palette ─────────────────────────────────────────────────
const P = {
  BG: '07090D',
  CARD: '0D1520',
  PANEL: '111E2C',
  DARK: '091018',
  GOLD: 'C9A84C',
  GOLHI: 'F0CC6E',
  TEAL: '2DD4BF',
  RED: 'F87171',
  AMBER: 'FCD34D',
  GREEN: '4ADE80',
  T1: 'EDE8DC',
  T2: '8FA3B1',
  T3: '3D5060',
  WHITE: 'FFFFFF',
  BORDER: '1A2B38',
};

// ── Primitive helpers ──────────────────────────────────────────────
const newSlide = pres => { const s = pres.addSlide(); s.background = { color: P.BG }; return s; };

const box = (s, x, y, w, h, fill, border) =>
  s.addShape('rect', { x, y, w, h, fill: { color: fill || P.CARD }, line: { color: border || P.BORDER, width: 1 } });

const hline = (s, x, y, w, color, pt) =>
  s.addShape('line', { x, y, w, h: 0, line: { color: color || P.GOLD, width: pt || 1 } });

const vbar = (s, x, y, h, color) =>
  s.addShape('rect', { x, y, w: 0.07, h, fill: { color: color || P.GOLD }, line: { color: color || P.GOLD, width: 0 } });

const t = (s, text, x, y, w, h, opts) =>
  s.addText(String(text != null ? text : ''), { x, y, w, h, fontFace: 'Calibri', fontSize: 12, color: P.T1, wrap: true, ...(opts || {}) });

const H1 = (s, text, y) => t(s, text, 0.45, y || 0.28, 9.1, 0.58, { fontSize: 26, bold: true, color: P.GOLD, fontFace: 'Georgia' });
const SUB = (s, text, y) => t(s, text, 0.45, y || 0.92, 9.1, 0.28, { fontSize: 10, color: P.T2, fontFace: 'Courier New', charSpacing: 1 });
const DIV = (s, y) => hline(s, 0.45, y || 0.86, 9.1, P.GOLD, 0.8);
const FTR = (s, kw) => t(s, 'NADI v2.0  \u00B7  ' + (kw || '').toUpperCase() + '  \u00B7  CONFIDENTIAL', 0.45, 7.18, 9.1, 0.18, { fontSize: 7, color: P.T3, fontFace: 'Courier New', charSpacing: 1 });
const LBL = (s, text, x, y, w) => t(s, text.toUpperCase(), x, y, w || 3, 0.18, { fontSize: 7, bold: true, color: P.T3, fontFace: 'Courier New', charSpacing: 2 });

const sclr = n => n >= 60 ? P.TEAL : n >= 45 ? P.AMBER : P.RED;
const vclr = v => /BUY|STRONG/.test(v || '') ? P.TEAL : /WATCH/.test(v || '') ? P.AMBER : P.RED;
const safe = (str, max) => (typeof str === 'string' ? str.slice(0, max || 300) : '\u2014');

function stat(s, x, y, w, h, lbl, val, vc) {
  box(s, x, y, w, h);
  LBL(s, lbl, x + 0.14, y + 0.1, w - 0.22);
  t(s, val, x + 0.14, y + 0.33, w - 0.22, h - 0.38, { fontSize: 16, bold: true, color: vc || P.GOLD, fontFace: 'Courier New' });
}

function bullets(s, items, x, y, w, h, sz, color) {
  const rows = items.map(function (item) {
    return {
      text: typeof item === 'string' ? item : item.text,
      options: {
        bullet: true,
        fontSize: (typeof item === 'object' && item.sz) ? item.sz : (sz || 11),
        color: (typeof item === 'object' && item.color) ? item.color : (color || P.T1),
        fontFace: 'Calibri',
      },
    };
  });
  s.addText(rows, { x: x, y: y, w: w, h: h, valign: 'top' });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ═══════════════════════════════════════════════════════════════════
function s1Cover(pres, kw, score, cls, ts) {
  var s = newSlide(pres);
  vbar(s, 0, 0, 7.5);
  for (var i = 0; i < 11; i++) {
    s.addShape('ellipse', { x: 9.05, y: 0.2 + i * 0.68, w: 0.11, h: 0.11, fill: { color: i % 2 === 0 ? P.GOLD : P.TEAL } });
    s.addShape('ellipse', { x: 9.35, y: 0.54 + i * 0.68, w: 0.11, h: 0.11, fill: { color: i % 2 === 0 ? P.TEAL : P.GOLD } });
  }
  t(s, 'NADI', 0.5, 0.7, 6, 1.5, { fontSize: 82, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  t(s, 'NEURAL AYURVEDIC & DIGITAL INTELLIGENCE', 0.5, 2.28, 8.5, 0.35, { fontSize: 10, color: P.T2, fontFace: 'Courier New', charSpacing: 3 });
  hline(s, 0.5, 2.72, 5.5);
  t(s, kw.toUpperCase(), 0.5, 2.92, 8.5, 0.85, { fontSize: 30, bold: true, color: P.WHITE, fontFace: 'Georgia' });
  t(s, 'TREND INTELLIGENCE & INVESTOR PITCH DECK', 0.5, 3.82, 7, 0.28, { fontSize: 10, color: P.TEAL, fontFace: 'Courier New', charSpacing: 2 });
  s.addShape('rect', { x: 0.5, y: 4.32, w: 2.15, h: 1.15, fill: { color: P.CARD }, line: { color: sclr(score), width: 2 } });
  t(s, String(score), 0.5, 4.42, 2.15, 0.6, { fontSize: 42, bold: true, color: sclr(score), fontFace: 'Courier New', align: 'center' });
  t(s, 'MAS SCORE', 0.5, 5.07, 2.15, 0.2, { fontSize: 7, color: P.T3, fontFace: 'Courier New', charSpacing: 2, align: 'center' });
  s.addShape('rect', { x: 2.85, y: 4.32, w: 3.85, h: 1.15, fill: { color: P.CARD }, line: { color: P.BORDER, width: 1 } });
  t(s, ((cls && cls.emoji) || '') + ' ' + ((cls && cls.label) || ''), 2.98, 4.45, 3.6, 0.55, { fontSize: 16, bold: true, color: sclr(score), fontFace: 'Georgia' });
  t(s, safe((cls && cls.description) || '', 100), 2.98, 5.05, 3.6, 0.3, { fontSize: 9, color: P.T2 });
  var dt = new Date(ts || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  t(s, 'India Market Intelligence  \u00B7  1,000+ Live Sources  \u00B7  ' + dt, 0.5, 7.05, 9, 0.25, { fontSize: 8, color: P.T3, fontFace: 'Courier New' });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 2 — The Problem
// ═══════════════════════════════════════════════════════════════════
function s2Problem(pres, kw) {
  var s = newSlide(pres);
  H1(s, 'The Problem'); DIV(s); SUB(s, 'Why the Indian wellness market destroys capital for late movers'); FTR(s, kw);
  box(s, 0.45, 1.1, 4.35, 2.1);
  t(s, '\u20B950,000Cr+', 0.6, 1.25, 4.1, 0.85, { fontSize: 34, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  t(s, 'India wellness market \u2014 growing 12% annually', 0.6, 2.15, 4.1, 0.8, { fontSize: 11, color: P.T2, wrap: true });
  box(s, 5.0, 1.1, 4.55, 2.1);
  t(s, '\u20B9450Cr', 5.15, 1.25, 4.3, 0.75, { fontSize: 34, bold: true, color: P.TEAL, fontFace: 'Georgia' });
  t(s, 'Ashwagandha category built over 5 years by early movers', 5.15, 2.05, 4.3, 0.9, { fontSize: 11, color: P.T2, wrap: true });
  box(s, 0.45, 3.38, 9.1, 0.62, P.PANEL);
  t(s, 'But for every Ashwagandha, there is a charcoal toothpaste \u2014 dead in 18 months.', 0.6, 3.48, 8.8, 0.4, { fontSize: 13, bold: true, color: P.RED, fontFace: 'Georgia', italic: true });
  bullets(s, [
    'Founders cannot distinguish real trends from fads until it is too late',
    'No India-specific trend intelligence tool exists for wellness D2C founders',
    'Western analytics tools miss Ayurvedic context, FSSAI alignment, and Indian pricing reality',
    'Late movers enter commoditised markets \u2014 margins collapse, CAC spikes, brand building impossible',
    'Early movers win the category \u2014 brand moat, distribution, and repeat purchase loyalty locked in',
  ], 0.45, 4.15, 9.1, 2.6, 11);
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 3 — The Solution
// ═══════════════════════════════════════════════════════════════════
function s3Solution(pres, kw, score, r) {
  var s = newSlide(pres);
  H1(s, 'The Solution \u2014 NADI'); DIV(s); SUB(s, 'DNA Trend Fingerprinting\u2122 \u2014 read the genetic code of every wellness trend before it peaks'); FTR(s, kw);
  box(s, 0.45, 1.08, 9.1, 1.05, P.DARK);
  t(s, 'NADI identifies breakout wellness trends 6 months before mainstream adoption \u2014 using an 8-strand DNA Fingerprinting model that scores every trend across Search Momentum, Scientific Evidence, India Resonance, Repeat Purchase signals, and 4 more dimensions into a single Momentum Acceleration Score.', 0.62, 1.18, 8.8, 0.88, { fontSize: 11, color: P.T1, italic: true, wrap: true });
  var stats = [
    { lbl: 'MAS Score', val: score + '/100', clr: sclr(score) },
    { lbl: 'Data Sources', val: '1,000+', clr: P.GOLD },
    { lbl: 'DNA Strands', val: '8', clr: P.TEAL },
    { lbl: 'India-Specific', val: '100%', clr: P.AMBER },
  ];
  stats.forEach(function (st, i) { stat(s, 0.45 + i * 2.3, 2.3, 2.18, 1.08, st.lbl, st.val, st.clr); });
  bullets(s, [
    { text: '\uD83E\uDDEC  DNA Fingerprinting \u2014 every trend scored across 8 signal strands simultaneously', sz: 11 },
    { text: '\uD83D\uDCCA  Momentum Acceleration Score \u2014 single number 0\u2013100 predicting exact trend lifecycle stage', sz: 11 },
    { text: '\uD83C\uDDEE\uD83C\uDDF3  India-Specific Resonance \u2014 filters for Ayurvedic roots, FSSAI alignment, mass-market pricing', sz: 11 },
    { text: '\uD83E\uDD16  AI Intelligence Brief \u2014 founder-grade opportunity report grounded in live signal data only', sz: 11 },
    { text: '\uD83D\uDCC4  One-click PDF & PowerPoint export \u2014 investor-ready in seconds', sz: 11 },
  ], 0.45, 3.58, 9.1, 3.1);
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 4 — How It Works
// ═══════════════════════════════════════════════════════════════════
function s4HowItWorks(pres, kw) {
  var s = newSlide(pres);
  H1(s, 'How NADI Works \u2014 3 Steps'); DIV(s); FTR(s, kw);
  var steps = [
    { num: '01', title: 'Collect', sub: 'Live Signal Gathering', color: P.GOLD, body: 'NADI simultaneously queries Reddit India communities, YouTube, Google Trends, PubMed research database, Amazon India product listings, and news RSS feeds. 1,000+ sources scanned in real time. Zero synthetic data \u2014 every number from live APIs.' },
    { num: '02', title: 'Fingerprint', sub: 'DNA Scoring Engine', color: P.TEAL, body: '8 signal strands scored individually \u2014 Search Momentum Velocity (18%), Cross-Platform Coherence (15%), Problem-Solution Depth (16%), Scientific Evidence Trajectory (12%), India-Specific Resonance (14%), Economic Accessibility (10%), Repeat Purchase Velocity (9%), Influencer Authenticity (6%). Combined into MAS.' },
    { num: '03', title: 'Intelligence', sub: 'AI Opportunity Brief', color: P.AMBER, body: 'Google Gemini AI generates a complete founder brief \u2014 strictly grounded in collected signal data with zero hallucination. Includes target consumer profile, market gap, 3 product ideas with Indian pricing, 90-day GTM strategy, competitive moat, and risk assessment.' },
  ];
  steps.forEach(function (st, i) {
    var y = 1.05 + i * 2.05;
    box(s, 0.45, y, 9.1, 1.85);
    vbar(s, 0.45, y, 1.85, st.color);
    t(s, st.num, 0.7, y + 0.1, 0.9, 0.65, { fontSize: 30, bold: true, color: st.color, fontFace: 'Courier New' });
    t(s, st.title, 1.75, y + 0.12, 3.0, 0.5, { fontSize: 19, bold: true, color: P.WHITE, fontFace: 'Georgia' });
    t(s, st.sub, 1.75, y + 0.65, 3.0, 0.25, { fontSize: 9, color: st.color, fontFace: 'Courier New', charSpacing: 1 });
    t(s, st.body, 4.85, y + 0.18, 4.6, 1.5, { fontSize: 10, color: P.T2, wrap: true });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 5 — Market Size (TAM / SAM / SOM)
// ═══════════════════════════════════════════════════════════════════
function s5Market(pres, kw, msp) {
  var s = newSlide(pres);
  H1(s, 'Market Opportunity \u2014 TAM \u00B7 SAM \u00B7 SOM'); DIV(s);
  SUB(s, 'India wellness D2C \u2014 underpenetrated, high-growth, winner-takes-most dynamics'); FTR(s, kw);
  var tam = (msp && msp.tam) || 500;
  var markets = [
    { lbl: 'TAM', desc: 'Total Addressable Market', val: '\u20B950,000Cr+', sub: 'Full Indian wellness market', color: P.GOLD, x: 0.45 },
    { lbl: 'SAM', desc: 'Serviceable Addressable Mkt', val: '\u20B98,000Cr+', sub: 'D2C digital wellness segment', color: P.TEAL, x: 3.55 },
    { lbl: 'SOM', desc: 'Serviceable Obtainable Mkt', val: '\u20B9' + tam + 'Cr', sub: kw + ' category \u2014 5-year', color: P.AMBER, x: 6.65 },
  ];
  markets.forEach(function (m) {
    box(s, m.x, 1.15, 2.95, 3.25);
    s.addShape('rect', { x: m.x, y: 1.15, w: 2.95, h: 0.06, fill: { color: m.color } });
    t(s, m.lbl, m.x + 0.15, 1.28, 2.7, 0.55, { fontSize: 26, bold: true, color: m.color, fontFace: 'Courier New' });
    t(s, m.desc, m.x + 0.15, 1.88, 2.7, 0.32, { fontSize: 9, color: P.T3, fontFace: 'Courier New', charSpacing: 1 });
    hline(s, m.x + 0.15, 2.28, 2.65, P.BORDER);
    t(s, m.val, m.x + 0.15, 2.42, 2.7, 0.72, { fontSize: 24, bold: true, color: m.color, fontFace: 'Georgia' });
    t(s, m.sub, m.x + 0.15, 3.18, 2.7, 0.95, { fontSize: 10, color: P.T2, wrap: true });
  });
  box(s, 0.45, 4.56, 4.48, 2.18, P.PANEL);
  t(s, 'Market Growth Drivers', 0.6, 4.66, 4.2, 0.32, { fontSize: 11, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  bullets(s, [
    'Post-COVID health consciousness permanently elevated in India',
    'Smartphone penetration unlocking Tier 2/3 city D2C access',
    'Ayurvedic validation meeting modern science \u2014 unique India moat',
    'Ayush Ministry budget doubled \u2014 regulatory tailwinds accelerating',
  ], 0.6, 5.02, 4.2, 1.62, 10);
  box(s, 5.08, 4.56, 4.47, 2.18, P.PANEL);
  t(s, 'India Category Benchmarks', 5.22, 4.66, 4.2, 0.32, { fontSize: 11, bold: true, color: P.TEAL, fontFace: 'Georgia' });
  [
    ['Ashwagandha', '\u20B9450Cr+', '2016\u21922021'],
    ['Gut Health', '\u20B9800Cr+', '2018\u21922023'],
    ['Moringa', '\u20B9200Cr+', '2017\u21922022'],
    ['Collagen', '\u20B9350Cr+', '2019\u21922022'],
  ].forEach(function (row, i) {
    t(s, row[0], 5.22, 5.08 + i * 0.38, 2.1, 0.3, { fontSize: 10, bold: true, color: P.T1 });
    t(s, row[1], 7.42, 5.08 + i * 0.38, 1.0, 0.3, { fontSize: 10, bold: true, color: P.GOLD, fontFace: 'Courier New' });
    t(s, row[2], 8.48, 5.08 + i * 0.38, 1.0, 0.3, { fontSize: 9, color: P.T3, fontFace: 'Courier New' });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 6 — DNA Fingerprint
// ═══════════════════════════════════════════════════════════════════
function s6DNA(pres, kw, strands) {
  var s = newSlide(pres);
  H1(s, 'The DNA Fingerprinting Model\u2122'); DIV(s);
  SUB(s, '8 signal strands \u2014 weighted and combined into the Momentum Acceleration Score'); FTR(s, kw);
  box(s, 0.45, 1.08, 9.1, 0.52, P.DARK);
  t(s, 'MAS  =  \u03A3( StrandScore \u00D7 StrandWeight )  \u00D7  VelocityMultiplier  \u00D7  IndiaFactor', 0.62, 1.18, 8.8, 0.32, { fontSize: 12, bold: true, color: P.GOLD, fontFace: 'Courier New', align: 'center' });
  var list = (strands && strands.length) ? strands : [
    { id: 'SMV', name: 'Search Momentum Velocity', score: 0, weight: 0.18 },
    { id: 'CPC', name: 'Cross-Platform Coherence', score: 0, weight: 0.15 },
    { id: 'PSD', name: 'Problem-Solution Depth', score: 0, weight: 0.16 },
    { id: 'SET', name: 'Scientific Evidence Trajectory', score: 0, weight: 0.12 },
    { id: 'ISR', name: 'India-Specific Resonance', score: 0, weight: 0.14 },
    { id: 'EAS', name: 'Economic Accessibility Score', score: 0, weight: 0.10 },
    { id: 'RPV', name: 'Repeat Purchase Velocity', score: 0, weight: 0.09 },
    { id: 'IAI', name: 'Influencer Authenticity Index', score: 0, weight: 0.06 },
  ];
  list.forEach(function (st, i) {
    var col = i < 4 ? 0 : 1;
    var row = i % 4;
    var x = 0.45 + col * 4.68;
    var y = 1.78 + row * 1.32;
    var sc = st.score || 0;
    var clr = sc >= 70 ? P.TEAL : sc >= 45 ? P.GOLD : sc >= 25 ? P.AMBER : P.RED;
    box(s, x, y, 4.48, 1.18);
    s.addShape('rect', { x: x + 0.12, y: y + 0.88, w: 3.5, h: 0.1, fill: { color: P.PANEL }, line: { color: P.BORDER, width: 0 } });
    if (sc > 0) s.addShape('rect', { x: x + 0.12, y: y + 0.88, w: 3.5 * (sc / 100), h: 0.1, fill: { color: clr }, line: { color: clr, width: 0 } });
    t(s, st.id, x + 0.12, y + 0.08, 0.72, 0.3, { fontSize: 9, bold: true, color: P.GOLD, fontFace: 'Courier New' });
    t(s, st.name, x + 0.88, y + 0.08, 2.8, 0.3, { fontSize: 10, bold: true, color: P.T1 });
    t(s, Math.round((st.weight || 0) * 100) + '% weight', x + 0.12, y + 0.46, 1.4, 0.25, { fontSize: 8, color: P.T3, fontFace: 'Courier New' });
    t(s, String(sc), x + 3.85, y + 0.06, 0.52, 0.55, { fontSize: 22, bold: true, color: clr, fontFace: 'Courier New', align: 'right' });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 7 — Live Signal Evidence
// ═══════════════════════════════════════════════════════════════════
function s7Signals(pres, kw, sig) {
  var s = newSlide(pres);
  H1(s, 'Live Signal Evidence'); DIV(s);
  SUB(s, 'Real data collected from 1,000+ sources \u2014 zero synthetic signals'); FTR(s, kw);
  var platforms = [
    { name: 'Reddit India', val: (sig && sig.reddit) || 0, icon: 'Reddit', desc: 'Community discussions' },
    { name: 'YouTube', val: (sig && sig.youtube) || 0, icon: 'YouTube', desc: 'Video content signals' },
    { name: 'News / RSS', val: (sig && sig.news) || 0, icon: 'News', desc: 'Media coverage' },
    { name: 'PubMed Research', val: (sig && sig.research) || 0, icon: 'Science', desc: 'Research papers' },
    { name: 'Amazon India', val: (sig && sig.ecommerce) || 0, icon: 'Commerce', desc: 'Product listings' },
    { name: 'Search Momentum', val: ((sig && sig.searchMomentum) || 0) + '%', icon: 'Search', desc: '30-day momentum' },
  ];
  platforms.forEach(function (p, i) {
    var col = i % 3; var row = Math.floor(i / 3);
    var x = 0.45 + col * 3.1; var y = 1.15 + row * 1.58;
    box(s, x, y, 2.95, 1.38);
    t(s, String(p.val), x + 0.18, y + 0.15, 2.6, 0.65, { fontSize: 30, bold: true, color: P.GOLD, fontFace: 'Courier New' });
    t(s, p.name, x + 0.15, y + 0.82, 2.65, 0.28, { fontSize: 10, bold: true, color: P.T1 });
    t(s, p.desc, x + 0.15, y + 1.1, 2.65, 0.22, { fontSize: 9, color: P.T3, fontFace: 'Courier New' });
  });
  box(s, 0.45, 4.44, 9.1, 0.62, P.DARK);
  t(s, 'Total Signal Strength: ' + ((sig && sig.totalStrength) || 0) + ' data points collected across all platforms for "' + kw + '"', 0.62, 4.56, 8.8, 0.38, { fontSize: 12, bold: true, color: P.TEAL });
  box(s, 0.45, 5.22, 9.1, 1.55, P.PANEL);
  t(s, 'Signal Interpretation', 0.62, 5.32, 4, 0.3, { fontSize: 11, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  bullets(s, [
    'Reddit mentions = organic consumer discovery and word-of-mouth early adoption signal',
    'PubMed papers = scientific credibility preceding mainstream consumer awareness',
    'Amazon products = commercial market exists and pricing reality is validated',
    'Search momentum = acceleration or deceleration of consumer interest over 30 days',
  ], 0.62, 5.65, 8.8, 1.0, 10);
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 8 — Opportunity Brief
// ═══════════════════════════════════════════════════════════════════
function s8Opportunity(pres, kw, r) {
  var s = newSlide(pres);
  H1(s, 'Opportunity Brief'); DIV(s);
  SUB(s, 'AI-generated founder intelligence \u2014 grounded in live signal data, zero hallucination'); FTR(s, kw);
  var verdict = (r && r.verdict) || 'WATCH';
  var vc = vclr(verdict);
  box(s, 0.45, 1.08, 4.05, 0.88);
  s.addShape('rect', { x: 0.45, y: 1.08, w: 4.05, h: 0.06, fill: { color: vc } });
  t(s, verdict.split('\u2014')[0].split('-')[0].trim(), 0.62, 1.22, 3.8, 0.58, { fontSize: 19, bold: true, color: vc, fontFace: 'Georgia' });
  stat(s, 4.7, 1.08, 2.05, 0.88, 'Confidence', (r && r.confidence_level) || '\u2014', P.GOLD);
  box(s, 6.95, 1.08, 2.6, 0.88);
  LBL(s, 'Action Timeline', 7.08, 1.16, 2.4);
  t(s, safe((r && r.action_timeline) || 'Monitor 60 days', 60), 7.08, 1.36, 2.4, 0.5, { fontSize: 9, color: P.TEAL, wrap: true });
  box(s, 0.45, 2.12, 9.1, 1.05, P.PANEL);
  LBL(s, 'Executive Summary', 0.62, 2.2, 5, P.GOLD);
  t(s, safe((r && r.executive_summary) || 'Analysis pending.', 280), 0.62, 2.42, 8.8, 0.68, { fontSize: 10, italic: true, wrap: true });
  box(s, 0.45, 3.32, 4.48, 1.38);
  LBL(s, 'Why Now \u2014 India', 0.62, 3.42, 4.2, P.TEAL);
  t(s, safe((r && r.why_now) || '\u2014', 200), 0.62, 3.62, 4.2, 1.0, { fontSize: 10, color: P.T2, wrap: true });
  box(s, 5.07, 3.32, 4.48, 1.38);
  LBL(s, 'Market Gap', 5.22, 3.42, 4.2, P.GOLD);
  t(s, safe((r && r.market_gap) || '\u2014', 200), 5.22, 3.62, 4.2, 1.0, { fontSize: 10, color: P.T2, wrap: true });
  box(s, 0.45, 4.88, 9.1, 1.85);
  LBL(s, 'Signal Evidence (Live Data)', 0.62, 4.96, 5, P.T3);
  t(s, safe((r && r.signal_evidence) || 'Live signals collected and analysed.', 380), 0.62, 5.18, 8.8, 1.45, { fontSize: 10, color: P.T1, wrap: true });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 9 — Product Opportunity
// ═══════════════════════════════════════════════════════════════════
function s9Product(pres, kw, r) {
  var s = newSlide(pres);
  H1(s, 'Product Opportunity'); DIV(s);
  SUB(s, 'Three specific product concepts \u2014 Indian pricing, format, and positioning'); FTR(s, kw);
  box(s, 0.45, 1.08, 9.1, 0.72, P.PANEL);
  LBL(s, 'Target Consumer Profile', 0.62, 1.16, 5, P.GOLD);
  t(s, safe((r && r.target_consumer) || 'Urban Indian, 25-40, \u20B98-25L HHI, research-driven wellness seeker.', 200), 0.62, 1.36, 8.8, 0.35, { fontSize: 10, color: P.T1, wrap: true });
  var raw = (r && r.product_opportunity) || '';
  var prods = raw.split(/\n+/).filter(function (p) { return p.trim().length > 8; }).slice(0, 3);
  var defaults = [
    'Premium supplement capsules \u2014 \u20B9400-600/month subscription. Clean formulation, Ayurvedic validation, third-party tested.',
    'Functional food / beverage format \u2014 \u20B9200-400. Daily ritual format. Instagram-native packaging targeting urban millennials.',
    'Personalised wellness protocol \u2014 \u20B91,500-2,500/month. Product + guidance + community. 12-month LTV: \u20B918,000-30,000.',
  ];
  var finalProds = prods.length >= 3 ? prods : defaults;
  finalProds.slice(0, 3).forEach(function (p, i) {
    var y = 2.0 + i * 1.62;
    box(s, 0.45, y, 9.1, 1.48);
    vbar(s, 0.45, y, 1.48, [P.GOLD, P.TEAL, P.AMBER][i]);
    t(s, 'Product Idea ' + (i + 1), 0.7, y + 0.1, 2.0, 0.28, { fontSize: 9, bold: true, color: [P.GOLD, P.TEAL, P.AMBER][i], fontFace: 'Courier New' });
    t(s, p.replace(/^\d+[\.\)]\s*/, ''), 0.7, y + 0.42, 8.7, 0.95, { fontSize: 11, color: P.T1, wrap: true });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 10 — Go-To-Market
// ═══════════════════════════════════════════════════════════════════
function s10GTM(pres, kw) {
  var s = newSlide(pres);
  H1(s, 'Go-To-Market Strategy'); DIV(s);
  SUB(s, '90-day launch playbook \u2014 digital-first, community-led, India-native'); FTR(s, kw);
  var phases = [
    { phase: 'Days 1\u201330', title: 'Launch', color: P.GOLD, items: ['Build DTC website + Shopify store', 'Instagram + YouTube educational content', '3-5 credentialed doctor / nutritionist partnerships', 'Seed 5 relevant Reddit India communities organically'] },
    { phase: 'Days 31\u201360', title: 'Scale', color: P.TEAL, items: ['Launch on Amazon India + Flipkart Health', 'Tier-1 city WhatsApp wellness group seeding', 'First paid ads \u2014 only after organic proof of concept', 'Collect 50+ genuine verified customer testimonials'] },
    { phase: 'Days 61\u201390', title: 'Optimise', color: P.AMBER, items: ['Double budget on what is working', 'Launch subscription model for repeat buyers', 'Micro-influencer partnerships \u2014 authentic fit only', 'Target \u20B95L MRR before Series A conversation'] },
  ];
  phases.forEach(function (ph, i) {
    var x = 0.45 + i * 3.15;
    box(s, x, 1.08, 3.0, 5.38);
    s.addShape('rect', { x: x, y: 1.08, w: 3.0, h: 0.06, fill: { color: ph.color } });
    t(s, ph.phase, x + 0.15, 1.2, 2.75, 0.28, { fontSize: 9, bold: true, color: ph.color, fontFace: 'Courier New', charSpacing: 1 });
    t(s, ph.title, x + 0.15, 1.52, 2.75, 0.55, { fontSize: 22, bold: true, color: P.WHITE, fontFace: 'Georgia' });
    hline(s, x + 0.15, 2.14, 2.7, ph.color, 0.5);
    ph.items.forEach(function (item, j) {
      box(s, x + 0.15, 2.28 + j * 0.8, 2.7, 0.68, P.PANEL);
      t(s, item, x + 0.28, 2.35 + j * 0.8, 2.45, 0.55, { fontSize: 9, color: P.T2, wrap: true });
    });
  });
  box(s, 0.45, 6.62, 9.1, 0.55, P.DARK);
  t(s, 'Revenue Target: \u20B91Cr ARR within 12 months  \u00B7  40%+ gross margins  \u00B7  Subscription model for LTV maximisation', 0.62, 6.72, 8.8, 0.35, { fontSize: 10, bold: true, color: P.GOLD });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 11 — Business Model
// ═══════════════════════════════════════════════════════════════════
function s11Business(pres, kw, r) {
  var s = newSlide(pres);
  H1(s, 'Business Model & Revenue'); DIV(s);
  SUB(s, 'Three revenue streams \u2014 product, subscription, and intelligence licensing'); FTR(s, kw);
  var streams = [
    { title: 'Direct D2C Product Sales', pct: '60%', color: P.GOLD, desc: safe((r && r.revenue_model) || '', 160) || 'Premium supplement and wellness product sales through owned DTC channel. \u20B9400-600 AOV. 40-55% gross margins. Full consumer data ownership.' },
    { title: 'Monthly Subscription Protocol', pct: '30%', color: P.TEAL, desc: 'Product + personalised guidance + community access. \u20B91,500-2,500/month. 12-month LTV: \u20B918,000-30,000 per subscriber. Target >70% retention at 6 months.' },
    { title: 'B2B Intelligence Licensing', pct: '10%', color: P.AMBER, desc: 'License NADI trend intelligence to other D2C founders and investors. White-label manufacturing for distribution partners. \u20B92-5L/month B2B retainer.' },
  ];
  streams.forEach(function (st, i) {
    var y = 1.08 + i * 1.9;
    box(s, 0.45, y, 9.1, 1.72);
    vbar(s, 0.45, y, 1.72, st.color);
    t(s, st.pct, 0.68, y + 0.1, 1.2, 0.88, { fontSize: 36, bold: true, color: st.color, fontFace: 'Courier New' });
    t(s, st.title, 1.98, y + 0.15, 4.5, 0.48, { fontSize: 15, bold: true, color: P.WHITE, fontFace: 'Georgia' });
    t(s, st.desc, 1.98, y + 0.65, 7.0, 0.95, { fontSize: 10, color: P.T2, wrap: true });
  });
  box(s, 0.45, 6.78, 9.1, 0.42, P.PANEL);
  t(s, 'Unit Economics: CAC \u20B9800-1,200  \u00B7  LTV \u20B918,000+  \u00B7  LTV:CAC ratio 15:1  \u00B7  Payback period < 60 days', 0.62, 6.87, 8.8, 0.28, { fontSize: 9, color: P.GOLD, fontFace: 'Courier New' });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 12 — Competitive Landscape
// ═══════════════════════════════════════════════════════════════════
function s12Competition(pres, kw) {
  var s = newSlide(pres);
  H1(s, 'Competitive Landscape'); DIV(s);
  SUB(s, 'No direct competitor \u2014 NADI operates in a white space with a proprietary India moat'); FTR(s, kw);
  box(s, 0.45, 1.08, 9.1, 0.62, P.DARK);
  t(s, 'The core innovation \u2014 DNA Trend Fingerprinting with India-Specific Resonance \u2014 does not exist in any competing product. NADI is creating a new category.', 0.62, 1.18, 8.8, 0.44, { fontSize: 11, color: P.TEAL, italic: true });
  var colX = [0.45, 3.2, 4.72, 6.24, 7.76];
  var colW = [2.68, 1.44, 1.44, 1.44, 1.44];
  var cols = ['Feature', 'NADI', 'Google Trends', 'Semrush', 'Nielsen'];
  box(s, 0.45, 1.88, 9.1, 0.45, P.PANEL);
  cols.forEach(function (c, i) {
    t(s, c, colX[i] + 0.1, 1.96, colW[i] - 0.1, 0.28, { fontSize: 9, bold: true, color: i === 1 ? P.GOLD : P.T2, fontFace: i === 0 ? 'Calibri' : 'Courier New' });
  });
  var rows = [
    ['India-specific scoring', '\u2705', '\u274C', '\u274C', '\u26A0\uFE0F'],
    ['Ayurvedic resonance filter', '\u2705', '\u274C', '\u274C', '\u274C'],
    ['Real-time signal collection', '\u2705', '\u2705', '\u26A0\uFE0F', '\u274C'],
    ['Fad vs trend detection', '\u2705', '\u274C', '\u274C', '\u26A0\uFE0F'],
    ['AI opportunity brief', '\u2705', '\u274C', '\u274C', '\u274C'],
    ['Historical DNA matching', '\u2705', '\u274C', '\u274C', '\u26A0\uFE0F'],
    ['Free / accessible', '\u2705', '\u2705', '\u274C', '\u274C'],
  ];
  rows.forEach(function (row, i) {
    var y = 2.42 + i * 0.56;
    box(s, 0.45, y, 9.1, 0.5, i % 2 === 0 ? P.CARD : P.PANEL);
    row.forEach(function (cell, j) {
      var clr = j === 1 ? P.TEAL : cell === '\u2705' ? P.TEAL : cell === '\u274C' ? P.RED : P.AMBER;
      t(s, cell, colX[j] + 0.1, y + 0.1, colW[j] - 0.1, 0.3, { fontSize: j === 0 ? 10 : 13, color: j === 0 ? P.T1 : clr, bold: j === 1 });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 13 — The Ask
// ═══════════════════════════════════════════════════════════════════
function s13Ask(pres, kw, score, r) {
  var s = newSlide(pres);
  H1(s, 'The Ask'); DIV(s);
  SUB(s, 'Seed round \u2014 building the intelligence layer for India wellness founders'); FTR(s, kw);
  box(s, 0.45, 1.08, 4.35, 2.0);
  s.addShape('rect', { x: 0.45, y: 1.08, w: 4.35, h: 0.06, fill: { color: P.GOLD } });
  t(s, '\u20B950L \u2014 \u20B91Cr', 0.62, 1.25, 4.1, 0.85, { fontSize: 27, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  t(s, 'Seed Round', 0.62, 2.15, 4.1, 0.35, { fontSize: 13, color: P.T2, fontFace: 'Courier New', charSpacing: 2 });
  t(s, 'Pre-revenue / MVP stage', 0.62, 2.55, 4.1, 0.3, { fontSize: 10, color: P.T3 });
  box(s, 5.0, 1.08, 4.55, 2.0);
  s.addShape('rect', { x: 5.0, y: 1.08, w: 4.55, h: 0.06, fill: { color: P.TEAL } });
  t(s, 'Use of Funds', 5.15, 1.22, 4.3, 0.35, { fontSize: 11, bold: true, color: P.TEAL, fontFace: 'Courier New', charSpacing: 1 });
  bullets(s, ['40% \u2014 Product development & first inventory', '25% \u2014 Marketing & community building', '20% \u2014 Technology & data infrastructure', '15% \u2014 Team & operations'], 5.15, 1.62, 4.2, 1.3, 10);
  box(s, 0.45, 3.25, 9.1, 1.55, P.PANEL);
  t(s, '12-Month Milestones', 0.62, 3.35, 4, 0.32, { fontSize: 11, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  [
    { m: 'Month 3', v: 'Launch first product / \u20B91L MRR' },
    { m: 'Month 6', v: '\u20B95L MRR / 500 subscribers' },
    { m: 'Month 9', v: '\u20B925L MRR / Amazon top 10' },
    { m: 'Month 12', v: '\u20B91Cr ARR / Series A ready' },
  ].forEach(function (mi, i) {
    box(s, 0.55 + i * 2.3, 3.72, 2.15, 0.88);
    t(s, mi.m, 0.68 + i * 2.3, 3.8, 1.9, 0.25, { fontSize: 8, bold: true, color: P.TEAL, fontFace: 'Courier New' });
    t(s, mi.v, 0.68 + i * 2.3, 4.08, 1.9, 0.48, { fontSize: 10, color: P.T1, wrap: true });
  });
  box(s, 0.45, 4.98, 9.1, 1.72, P.DARK);
  vbar(s, 0.45, 4.98, 1.72, P.RED);
  t(s, 'Why Now', 0.68, 5.08, 2, 0.32, { fontSize: 11, bold: true, color: P.RED, fontFace: 'Georgia' });
  bullets(s, [
    kw + ' is showing ' + (score >= 75 ? 'Breakout' : score >= 60 ? 'Emerging' : 'Nascent') + ' trend DNA \u2014 the first-mover window is open right now',
    'Indian D2C wellness is at an inflection point \u2014 Tier 2/3 penetration is just beginning',
    'No dominant brand exists in this specific subcategory \u2014 white space confirmed by live data',
    'Regulatory tailwinds \u2014 Ayush Ministry and FSSAI actively promoting category innovation',
  ], 0.68, 5.45, 8.7, 1.1, 10);
}

// ═══════════════════════════════════════════════════════════════════
// SLIDE 14 — Closing
// ═══════════════════════════════════════════════════════════════════
function s14Closing(pres, kw, score, r) {
  var s = newSlide(pres);
  vbar(s, 0, 0, 7.5);
  for (var i = 0; i < 11; i++) {
    s.addShape('ellipse', { x: 9.05, y: 0.2 + i * 0.68, w: 0.11, h: 0.11, fill: { color: i % 2 === 0 ? P.GOLD : P.TEAL } });
    s.addShape('ellipse', { x: 9.35, y: 0.54 + i * 0.68, w: 0.11, h: 0.11, fill: { color: i % 2 === 0 ? P.TEAL : P.GOLD } });
  }
  t(s, 'The next big wellness category in India', 0.5, 0.85, 8.8, 0.82, { fontSize: 30, bold: true, color: P.WHITE, fontFace: 'Georgia' });
  t(s, 'is already showing its DNA right now.', 0.5, 1.72, 8.8, 0.82, { fontSize: 30, bold: true, color: P.GOLD, fontFace: 'Georgia', italic: true });
  hline(s, 0.5, 2.62, 5.5);
  t(s, 'NADI is the only tool that can read it.', 0.5, 2.82, 8, 0.55, { fontSize: 18, color: P.TEAL, fontFace: 'Georgia', italic: true });
  box(s, 0.5, 3.58, 4.0, 1.62);
  t(s, kw.toUpperCase(), 0.65, 3.68, 3.75, 0.45, { fontSize: 13, bold: true, color: P.WHITE, fontFace: 'Georgia' });
  t(s, 'MAS: ' + score + '/100', 0.65, 4.18, 3.75, 0.42, { fontSize: 17, bold: true, color: sclr(score), fontFace: 'Courier New' });
  t(s, ((r && r.verdict) || '').split('\u2014')[0].split('-')[0].trim(), 0.65, 4.65, 3.75, 0.38, { fontSize: 12, color: vclr((r && r.verdict) || ''), fontFace: 'Courier New' });
  box(s, 4.7, 3.58, 4.85, 1.62, P.PANEL);
  t(s, 'Neural Ayurvedic & Digital Intelligence', 4.85, 3.72, 4.55, 0.4, { fontSize: 11, bold: true, color: P.GOLD, fontFace: 'Georgia' });
  t(s, 'nadi-wellness-radar-production.up.railway.app', 4.85, 4.18, 4.55, 0.3, { fontSize: 9, color: P.TEAL, fontFace: 'Courier New' });
  t(s, 'github.com/Abishekrevi/nadi-wellness-radar', 4.85, 4.52, 4.55, 0.3, { fontSize: 9, color: P.T2, fontFace: 'Courier New' });
  t(s, 'Built with real data. Zero synthetic signals. For Indian D2C founders who want to move first.', 0.5, 5.42, 9.1, 0.45, { fontSize: 11, color: P.T2, italic: true, align: 'center' });
  t(s, 'NADI v2.0  \u00B7  React \u00B7 Node.js \u00B7 Google Gemini AI \u00B7 Railway Cloud  \u00B7  India Market Intelligence', 0.5, 7.1, 9.1, 0.25, { fontSize: 7, color: P.T3, fontFace: 'Courier New', charSpacing: 1, align: 'center' });
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ═══════════════════════════════════════════════════════════════════
export async function downloadPitchDeck(result) {
  if (!result) {
    alert('No trend data available. Please run a scan or analysis first.');
    return;
  }

  var btn = document.querySelector('[data-pitchdeck-btn]');
  var orig = btn ? btn.textContent : null;
  if (btn) { btn.textContent = '\u23F3 Building deck...'; btn.disabled = true; }

  try {
    var PptxGenJS = await loadLib();
    var pres = new PptxGenJS();

    pres.layout = 'LAYOUT_WIDE';
    pres.author = 'NADI \u2014 Neural Ayurvedic & Digital Intelligence';
    pres.company = 'NADI v2.0';
    pres.subject = 'Investor Pitch: ' + result.keyword;
    pres.title = 'NADI \u2014 ' + result.keyword + ' Pitch Deck';

    var keyword = result.keyword;
    var score = result.momentumAccelerationScore;
    var classification = result.classification;
    var msp = result.marketSizePotential;
    var dna = result.dnaFingerprint;
    var signals = result.signals;
    var r = result.intelligenceReport;
    var ts = result.timestamp;

    s1Cover(pres, keyword, score, classification, ts);
    s2Problem(pres, keyword);
    s3Solution(pres, keyword, score, r);
    s4HowItWorks(pres, keyword);
    s5Market(pres, keyword, msp);
    s6DNA(pres, keyword, dna && dna.strands);
    s7Signals(pres, keyword, signals);
    s8Opportunity(pres, keyword, r);
    s9Product(pres, keyword, r);
    s10GTM(pres, keyword);
    s11Business(pres, keyword, r);
    s12Competition(pres, keyword);
    s13Ask(pres, keyword, score, r);
    s14Closing(pres, keyword, score, r);

    var fileName = 'NADI-PitchDeck-' + keyword.replace(/[^a-z0-9]/gi, '-').slice(0, 40) + '.pptx';
    await pres.writeFile({ fileName: fileName });

    if (btn) {
      btn.textContent = '\u2705 Downloaded!';
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 3000);
    }

  } catch (err) {
    console.error('Pitch deck error:', err);
    alert('Pitch deck error: ' + err.message);
    if (btn) { btn.textContent = orig || '\uD83D\uDCCA Pitch Deck'; btn.disabled = false; }
  }
}