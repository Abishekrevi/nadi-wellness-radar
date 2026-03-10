/**
 * NADI v3.0 — YC-Grade Pitch Deck Generator
 *
 * Design philosophy based on top YC pitches (Airbnb, Stripe, Dropbox):
 *  - One idea per slide. No walls of text.
 *  - Hero numbers dominate each slide — big, bold, immediate
 *  - Problem → Solution → Why Now → Market → Product → Traction → Ask
 *  - White space is not wasted space. It creates emphasis.
 *  - Every slide passes the "5-second test" — the key point is obvious instantly
 *  - Credibility through specificity (actual figures, not vague claims)
 *
 * Slide structure (12 slides, YC standard length):
 *  01 Cover      — Name, tagline, one-liner
 *  02 Problem    — One BIG pain. No sub-bullets.
 *  03 Solution   — What NADI does. One sentence + 3 proof points
 *  04 Why Now    — The timing unlock (regulatory + digital + COVID)
 *  05 Market     — TAM/SAM/SOM with visual hierarchy
 *  06 Product    — The DNA model. Show don't tell.
 *  07 Traction   — Live signal data as proof
 *  08 Business   — Unit economics first, revenue model second
 *  09 GTM        — 3 phases, concrete milestones
 *  10 Competition— 2×2 matrix positioning, not a table of checkmarks
 *  11 Team       — (Founder placeholder) Conviction, not CVs
 *  12 Ask        — The number, the use, the milestone
 */

import PptxGenJS from 'pptxgenjs';

// ── YC-grade palette: clean, high-contrast, premium ───────────────
// Primary: Deep navy background (authority + premium)
// Accent: Orange-gold (energy + India warmth)
// Support: Electric white + subtle blue-grey
const C = {
  // Backgrounds
  BG: '0A0E1A',   // deep navy — premium dark
  BG2: '0F1628',   // card background
  BG3: '151D35',   // panel
  ACCENT: '141B2D',   // subtle panel

  // Brand colors
  GOLD: 'E8A020',   // warm amber-gold (India warmth)
  GOLHI: 'FFB830',   // bright gold for large text
  TEAL: '00C9B1',   // electric teal
  ORANGE: 'FF6B35',   // startup energy orange
  VIOLET: '7C5CFC',   // intelligent purple

  // Signal colors
  GREEN: '00D46A',
  RED: 'FF4757',
  AMBER: 'FFA502',
  BLUE: '3D8EFF',

  // Text
  T1: 'F5F0E8',   // warm white
  T2: '8896B3',   // muted blue-grey
  T3: '3D5070',   // very muted

  // Borders
  BD: '1E2A45',   // dim border
  BDM: '2A3A5C',   // medium border

  WHITE: 'FFFFFF',
  BLACK: '000000',
};

// ── Helpers ────────────────────────────────────────────────────────
var SLD_W = 10, SLD_H = 7.5;

function newSlide(pres, bgColor) {
  var s = pres.addSlide();
  s.background = { color: bgColor || C.BG };
  return s;
}

// Full-bleed background shape for accent areas
function fillRect(s, x, y, w, h, color) {
  s.addShape('rect', { x: x, y: y, w: w, h: h, fill: { color: color }, line: { color: color, width: 0 } });
}

// Text helper — YC decks use very few font sizes: 48pt titles, 24pt headers, 16pt body
function tx(s, text, x, y, w, h, opts) {
  s.addText(String(text != null ? text : ''), Object.assign({
    x: x, y: y, w: w, h: h,
    fontFace: 'Calibri',
    fontSize: 14,
    color: C.T1,
    wrap: true,
    valign: 'top',
  }, opts || {}));
}

// Giant hero number — the YC signature move
function heroStat(s, value, label, x, y, w, color) {
  tx(s, value, x, y, w, 1.1, { fontSize: 60, bold: true, fontFace: 'Trebuchet MS', color: color || C.GOLHI, valign: 'middle', align: 'center' });
  tx(s, label, x, y + 1.0, w, 0.32, { fontSize: 11, color: C.T2, fontFace: 'Calibri', align: 'center', charSpacing: 2 });
}

// Section label (small caps, muted)
function sectionLabel(s, text, x, y) {
  tx(s, text.toUpperCase(), x, y, 9, 0.22, { fontSize: 9, color: C.T3, fontFace: 'Calibri', charSpacing: 3 });
}

// Slide title — large, left-aligned, no underline
function slideTitle(s, text, subtitle, titleColor) {
  tx(s, text, 0.55, 0.42, 8.9, 0.85, { fontSize: 36, bold: true, fontFace: 'Trebuchet MS', color: titleColor || C.T1, valign: 'middle' });
  if (subtitle) {
    tx(s, subtitle, 0.55, 1.28, 8.9, 0.38, { fontSize: 15, color: C.T2, fontFace: 'Calibri' });
  }
}

// Footer
function footer(s, left, right) {
  tx(s, left || 'NADI · CONFIDENTIAL', 0.4, 7.22, 5, 0.2, { fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 1 });
  if (right) tx(s, right, 5.0, 7.22, 4.6, 0.2, { fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 1, align: 'right' });
}

// Stat card with icon dot
function statCard(s, x, y, w, h, label, value, valueColor, body) {
  s.addShape('rect', { x: x, y: y, w: w, h: h, fill: { color: C.BG2 }, line: { color: C.BD, width: 1 } });
  tx(s, value, x + 0.2, y + 0.15, w - 0.3, 0.62, { fontSize: 28, bold: true, fontFace: 'Trebuchet MS', color: valueColor || C.GOLHI });
  tx(s, label, x + 0.2, y + 0.78, w - 0.3, 0.22, { fontSize: 9, color: C.T3, fontFace: 'Calibri', charSpacing: 1 });
  if (body) tx(s, body, x + 0.2, y + 1.04, w - 0.3, h - 1.15, { fontSize: 10, color: C.T2, wrap: true });
}

function safe(v, max) { return typeof v === 'string' ? v.slice(0, max || 240) : '—'; }
function sclr(n) { return n >= 70 ? C.TEAL : n >= 50 ? C.GOLHI : n >= 35 ? C.AMBER : C.RED; }
function vclr(v) { return /BUY|STRONG/.test(v || '') ? C.GREEN : /WATCH/.test(v || '') ? C.AMBER : C.RED; }

// ══════════════════════════════════════════════════════════════════
// SLIDE 01 — Cover (YC style: stark, one-liner, big number)
// ══════════════════════════════════════════════════════════════════
function s01Cover(pres, kw, score, cls, ts) {
  var s = newSlide(pres);

  // Left color bar — brand signature
  fillRect(s, 0, 0, 0.08, SLD_H, C.GOLD);

  // Top-right corner decoration
  fillRect(s, 8.8, 0, 1.2, 0.06, C.TEAL);

  // Company name
  tx(s, 'NADI', 0.4, 0.55, 5, 1.2, {
    fontSize: 80, bold: true, fontFace: 'Trebuchet MS', color: C.GOLHI, valign: 'middle',
  });

  // One-liner (the YC "what you do in one sentence")
  tx(s, "India's first DNA Trend Fingerprinting intelligence platform for wellness D2C founders.", 0.4, 1.82, 7.5, 0.75, {
    fontSize: 17, color: C.T2, fontFace: 'Calibri', wrap: true,
  });

  // Divider
  fillRect(s, 0.4, 2.65, 5.5, 0.03, C.BD);

  // Current trend being pitched
  tx(s, kw, 0.4, 2.82, 9, 1.1, {
    fontSize: 38, bold: true, fontFace: 'Trebuchet MS', color: C.T1, wrap: true,
  });

  // MAS score — the single hero number
  fillRect(s, 7.2, 1.65, 2.4, 2.0, C.BG2);
  fillRect(s, 7.2, 1.65, 2.4, 0.05, sclr(score));
  tx(s, String(score), 7.2, 1.75, 2.4, 1.1, {
    fontSize: 64, bold: true, fontFace: 'Trebuchet MS', color: sclr(score), align: 'center', valign: 'middle',
  });
  tx(s, 'MOMENTUM ACCELERATION SCORE', 7.2, 2.92, 2.4, 0.35, {
    fontSize: 7, color: C.T3, align: 'center', charSpacing: 1, fontFace: 'Calibri',
  });
  tx(s, '/100', 7.2, 3.16, 2.4, 0.3, { fontSize: 12, color: C.T3, align: 'center', fontFace: 'Calibri' });

  // Classification
  tx(s, (cls && cls.emoji || '') + ' ' + (cls && cls.label || ''), 0.4, 4.05, 6, 0.45, {
    fontSize: 16, bold: true, color: sclr(score), fontFace: 'Calibri',
  });

  var dt = new Date(ts || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  footer(s, 'NADI · Neural Ayurvedic & Digital Intelligence', dt);
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 02 — The Problem (YC: ONE pain point, make it felt)
// ══════════════════════════════════════════════════════════════════
function s02Problem(pres, kw) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.RED);

  sectionLabel(s, '01 · The Problem', 0.55, 0.25);
  slideTitle(s, 'Founders lose crores\nentering trends too late.', null, C.T1);

  // The ONE core pain — large, emotional
  fillRect(s, 0.55, 1.78, 8.9, 2.0, C.BG2);
  fillRect(s, 0.55, 1.78, 0.06, 2.0, C.RED);
  tx(s, '"By the time a wellness trend is visible on Instagram, the category is already crowded. Early movers have locked distribution, pricing power, and brand trust. Late movers burn capital fighting a war they cannot win."', 0.78, 1.95, 8.5, 1.65, {
    fontSize: 15, color: C.T1, italic: true, wrap: true, fontFace: 'Calibri',
  });

  // Three numbers that make the pain concrete
  var stats = [
    { v: '₹50,000Cr+', l: 'India wellness\nmarket today', c: C.GOLHI },
    { v: '18 months', l: 'Average lag before\ntrend is obvious', c: C.RED },
    { v: '<3%', l: 'Founders who enter\nbefore peak', c: C.TEAL },
  ];
  stats.forEach(function (st, i) {
    statCard(s, 0.55 + i * 3.15, 4.0, 2.95, 1.65, st.l, st.v, st.c);
  });

  footer(s, 'NADI · CONFIDENTIAL');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 03 — Solution (YC: state it simply, then prove 3 things)
// ══════════════════════════════════════════════════════════════════
function s03Solution(pres, kw, score) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.TEAL);

  sectionLabel(s, '02 · The Solution', 0.55, 0.25);
  slideTitle(s, 'NADI reads trend DNA\n6 months before the crowd.', null, C.GOLHI);

  // Three proof points — the YC "how it works" section
  var pts = [
    { icon: '🧬', title: 'DNA Fingerprinting', body: 'Every trend scored across 8 live signal strands simultaneously — not just Google Trends. Reddit, PubMed, YouTube, Amazon India, News all combined into one Momentum Acceleration Score.' },
    { icon: '🇮🇳', title: 'India-First Intelligence', body: 'Built specifically for the Indian wellness market. Filters for Ayurvedic roots, FSSAI alignment, Indian price sensitivity, and Tier 2/3 distribution reality. No Western tool does this.' },
    { icon: '🤖', title: 'Zero-Hallucination AI Brief', body: 'AI Intelligence Report grounded exclusively in retrieved live data. Every number is cited. Every claim is traceable. Founder-grade research in 60 seconds.' },
  ];

  pts.forEach(function (pt, i) {
    var y = 2.0 + i * 1.55;
    fillRect(s, 0.55, y, 8.9, 1.35, C.BG2);
    fillRect(s, 0.55, y, 0.06, 1.35, C.TEAL);
    tx(s, pt.icon, 0.78, y + 0.3, 0.75, 0.7, { fontSize: 26, valign: 'middle' });
    tx(s, pt.title, 1.62, y + 0.12, 3.5, 0.4, { fontSize: 14, bold: true, color: C.T1, fontFace: 'Trebuchet MS' });
    tx(s, pt.body, 1.62, y + 0.54, 7.6, 0.75, { fontSize: 11, color: C.T2, wrap: true });
  });

  footer(s, 'NADI · CONFIDENTIAL', 'MAS: ' + score + '/100 for ' + kw);
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 04 — Why Now (the timing argument — critical for YC)
// ══════════════════════════════════════════════════════════════════
function s04WhyNow(pres, kw, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.ORANGE);

  sectionLabel(s, '03 · Why Now', 0.55, 0.25);
  slideTitle(s, 'Three forces colliding\nright now in India.', null, C.T1);

  var reasons = [
    { title: 'Post-COVID consciousness shift', body: safe((r && r.why_now) || 'Indian consumers permanently elevated health spending after COVID. Preventive wellness is now a necessity, not a luxury. Supplement market grew 38% in 2021-2023.', 160), color: C.ORANGE, icon: '📈' },
    { title: 'Digital health infrastructure', body: '200M+ Indians now buy health products online. UPI-enabled D2C brands can reach Tier 3 cities with zero physical retail. The distribution barrier is gone.', color: C.BLUE, icon: '📱' },
    { title: 'Regulatory window open', body: 'FSSAI and Ayush Ministry are actively encouraging category innovation. Nutraceutical guidelines 2022 created a clear path. Window before commoditisation: 18-24 months.', color: C.TEAL, icon: '⚖️' },
  ];

  reasons.forEach(function (r, i) {
    var x = 0.55 + i * 3.15;
    fillRect(s, x, 2.05, 2.97, 4.5, C.BG2);
    fillRect(s, x, 2.05, 2.97, 0.05, r.color);
    tx(s, r.icon, x + 0.2, 2.2, 2.5, 0.55, { fontSize: 28, valign: 'middle' });
    tx(s, r.title, x + 0.2, 2.85, 2.55, 0.55, { fontSize: 12, bold: true, color: C.T1, fontFace: 'Trebuchet MS', wrap: true });
    tx(s, r.body, x + 0.2, 3.45, 2.55, 2.9, { fontSize: 10, color: C.T2, wrap: true });
  });

  footer(s, 'NADI · CONFIDENTIAL');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 05 — Market Size (TAM/SAM/SOM — simple, visual)
// ══════════════════════════════════════════════════════════════════
function s05Market(pres, kw, msp) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.GOLD);

  sectionLabel(s, '04 · Market Opportunity', 0.55, 0.25);
  slideTitle(s, 'A large market with\nno dominant player yet.', null, C.T1);

  var tam = (msp && msp.tam) || 300;

  // Three market levels — nested circles represented as stat cards with size hierarchy
  var markets = [
    { label: 'TAM — Total Indian Wellness Market', val: '₹50,000Cr+', sub: 'Growing at 12% CAGR · USD 60Bn by 2027', color: C.GOLHI, w: 8.9, x: 0.55, y: 1.82 },
    { label: 'SAM — D2C Digital Wellness Segment', val: '₹8,000Cr+', sub: 'Online-first brands · UPI-enabled consumers', color: C.TEAL, w: 6.5, x: 1.75, y: 3.12 },
    { label: 'SOM — ' + kw + ' Category (5yr)', val: '₹' + tam + 'Cr', sub: "NADI's immediate addressable opportunity", color: C.ORANGE, w: 4.2, x: 3.0, y: 4.42 },
  ];

  markets.forEach(function (m) {
    fillRect(s, m.x, m.y, m.w, 1.05, C.BG2);
    fillRect(s, m.x, m.y, m.w, 0.05, m.color);
    tx(s, m.val, m.x + 0.25, m.y + 0.12, 3.2, 0.52, { fontSize: 22, bold: true, fontFace: 'Trebuchet MS', color: m.color });
    tx(s, m.label, m.x + 3.5, m.y + 0.12, m.w - 3.7, 0.3, { fontSize: 10, color: C.T2, fontFace: 'Calibri' });
    tx(s, m.sub, m.x + 3.5, m.y + 0.45, m.w - 3.7, 0.32, { fontSize: 9, color: C.T3, fontFace: 'Calibri' });
  });

  // Comparable exits
  tx(s, 'Category precedents: Ashwagandha → ₹450Cr (5yr) · Gut Health → ₹800Cr (5yr) · Moringa → ₹200Cr (4yr)', 0.55, 6.82, 9, 0.32, { fontSize: 9, color: C.T3, fontFace: 'Calibri' });
  footer(s, 'NADI · CONFIDENTIAL');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 06 — Product Deep Dive (The DNA model)
// ══════════════════════════════════════════════════════════════════
function s06Product(pres, kw, strands, score) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.VIOLET);

  sectionLabel(s, '05 · The Product — DNA Fingerprinting Model™', 0.55, 0.25);
  slideTitle(s, '8 signal strands.\nOne definitive score.', null, C.T1);

  // Formula box
  fillRect(s, 0.55, 1.72, 8.9, 0.48, C.BG3);
  tx(s, 'MAS  =  Σ( StrandScore × Weight )  ×  VelocityMultiplier  ×  IndiaResonanceFactor', 0.75, 1.8, 8.5, 0.32, {
    fontSize: 11, bold: true, color: C.GOLHI, fontFace: 'Courier New', align: 'center',
  });

  // DNA strands in 2×4 grid
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

  list.slice(0, 8).forEach(function (st, i) {
    var col = i < 4 ? 0 : 1, row = i % 4;
    var x = 0.55 + col * 4.7, y = 2.35 + row * 1.22;
    var sc = st.score || 0;
    var clr = sc >= 70 ? C.TEAL : sc >= 50 ? C.GOLHI : sc >= 30 ? C.AMBER : C.RED;

    fillRect(s, x, y, 4.52, 1.1, C.BG2);
    // Score bar background
    fillRect(s, x + 0.12, y + 0.82, 3.8, 0.08, C.BG3);
    // Score bar fill
    if (sc > 0) fillRect(s, x + 0.12, y + 0.82, 3.8 * (sc / 100), 0.08, clr);

    tx(s, st.id, x + 0.12, y + 0.08, 0.75, 0.28, { fontSize: 8, bold: true, color: C.GOLD, fontFace: 'Courier New' });
    tx(s, st.name, x + 0.92, y + 0.08, 2.85, 0.28, { fontSize: 10, bold: true, color: C.T1, fontFace: 'Calibri' });
    tx(s, Math.round((st.weight || 0) * 100) + '%', x + 0.12, y + 0.44, 0.9, 0.25, { fontSize: 8, color: C.T3, fontFace: 'Courier New' });
    tx(s, String(sc), x + 3.88, y + 0.04, 0.55, 0.55, { fontSize: 20, bold: true, color: clr, fontFace: 'Trebuchet MS', align: 'right', valign: 'middle' });
  });

  footer(s, 'NADI · CONFIDENTIAL', 'Overall MAS: ' + score + '/100');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 07 — Traction / Evidence (live signal data AS traction)
// ══════════════════════════════════════════════════════════════════
function s07Traction(pres, kw, sig, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.GREEN);

  sectionLabel(s, '06 · Live Evidence — Real Data, Not Estimates', 0.55, 0.25);
  slideTitle(s, 'The data already proves\nthe opportunity.', null, C.T1);

  // Hero: executive summary
  fillRect(s, 0.55, 1.72, 8.9, 1.05, C.BG2);
  fillRect(s, 0.55, 1.72, 0.07, 1.05, C.TEAL);
  tx(s, safe((r && r.signal_evidence) || safe((r && r.executive_summary) || 'Live signal analysis complete.', 240), 260), 0.75, 1.82, 8.5, 0.85, {
    fontSize: 11, color: C.T1, italic: true, wrap: true,
  });

  // Signal metrics — 6 numbers
  var metrics = [
    { v: String((sig && sig.reddit) || 0), l: 'Reddit\nMentions', c: C.ORANGE },
    { v: String((sig && sig.youtube) || 0), l: 'YouTube\nSignals', c: C.RED },
    { v: String((sig && sig.news) || 0), l: 'News\nArticles', c: C.BLUE },
    { v: String((sig && sig.research) || 0), l: 'PubMed\nStudies', c: C.VIOLET },
    { v: String((sig && sig.ecommerce) || 0), l: 'Amazon\nProducts', c: C.TEAL },
    { v: ((sig && sig.searchMomentum) || 0) + '%', l: 'Search\nMomentum', c: C.GOLHI },
  ];

  metrics.forEach(function (m, i) {
    var x = 0.55 + i * 1.58;
    fillRect(s, x, 3.0, 1.48, 1.38, C.BG2);
    tx(s, m.v, x + 0.08, 3.1, 1.3, 0.62, { fontSize: 26, bold: true, fontFace: 'Trebuchet MS', color: m.c, align: 'center', valign: 'middle' });
    tx(s, m.l, x + 0.08, 3.75, 1.3, 0.55, { fontSize: 9, color: C.T3, align: 'center', wrap: true });
  });

  // Why it matters
  fillRect(s, 0.55, 4.58, 8.9, 1.75, C.BG3);
  tx(s, 'Signal Interpretation', 0.75, 4.68, 4, 0.3, { fontSize: 11, bold: true, color: C.GOLHI, fontFace: 'Trebuchet MS' });
  tx(s, safe((r && r.why_now) || 'Signals indicate an early-stage opportunity with validated consumer demand.', 380),
    0.75, 5.02, 8.5, 1.2, { fontSize: 10, color: C.T2, wrap: true });

  footer(s, 'NADI · CONFIDENTIAL · ' + kw);
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 08 — Business Model & Unit Economics
// ══════════════════════════════════════════════════════════════════
function s08Business(pres, kw, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.GOLHI);

  sectionLabel(s, '07 · Business Model', 0.55, 0.25);
  slideTitle(s, 'Unit economics first.\nScale second.', null, C.T1);

  // Unit economics — the YC obsession
  var economics = [
    { v: '₹800–1,200', l: 'Customer\nAcquisition Cost', c: C.RED },
    { v: '₹18,000+', l: 'Lifetime\nValue (12mo)', c: C.GREEN },
    { v: '15:1', l: 'LTV:CAC\nRatio', c: C.TEAL },
    { v: '<60 days', l: 'CAC Payback\nPeriod', c: C.GOLHI },
    { v: '40–55%', l: 'Gross\nMargin', c: C.ORANGE },
  ];

  economics.forEach(function (e, i) {
    statCard(s, 0.55 + i * 1.9, 1.72, 1.8, 1.52, e.l, e.v, e.c);
  });

  // Revenue streams
  var streams = [
    { pct: '60%', title: 'Direct D2C Product Sales', color: C.GOLHI, desc: safe((r && r.revenue_model) || 'Premium supplement sales via owned DTC channel. ₹400–600 AOV. 40–55% gross margins. Full consumer data ownership.', 160) },
    { pct: '30%', title: 'Monthly Subscription Protocol', color: C.TEAL, desc: 'Product + guidance + community. ₹1,500–2,500/month. 12-month LTV: ₹18,000–30,000. Target >70% retention at 6 months.' },
    { pct: '10%', title: 'B2B Intelligence Licensing', color: C.VIOLET, desc: 'License NADI trend data to D2C founders and investors. ₹2–5L/month retainer model. Recurring, high-margin.' },
  ];

  streams.forEach(function (st, i) {
    var y = 3.42 + i * 1.18;
    fillRect(s, 0.55, y, 8.9, 1.05, C.BG2);
    fillRect(s, 0.55, y, 0.07, 1.05, st.color);
    tx(s, st.pct, 0.78, y + 0.22, 1.0, 0.6, { fontSize: 22, bold: true, fontFace: 'Trebuchet MS', color: st.color });
    tx(s, st.title, 1.88, y + 0.08, 3.4, 0.35, { fontSize: 12, bold: true, color: C.T1, fontFace: 'Trebuchet MS' });
    tx(s, st.desc, 1.88, y + 0.48, 7.3, 0.5, { fontSize: 10, color: C.T2, wrap: true });
  });

  footer(s, 'NADI · CONFIDENTIAL');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 09 — Go-To-Market (concrete 90-day plan)
// ══════════════════════════════════════════════════════════════════
function s09GTM(pres, kw, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.ORANGE);

  sectionLabel(s, '08 · Go-To-Market', 0.55, 0.25);
  slideTitle(s, '90 days to\nfirst revenue.', null, C.T1);

  var phases = [
    {
      days: 'Days 1–30', title: 'Validate', color: C.GOLHI,
      items: ['Launch DTC site + Shopify (₹0 risk)', 'Educational Instagram + YouTube — 3 posts/week', '5 nutritionist / doctor partnerships for credibility', 'Seed top 3 India Reddit wellness communities organically'],
      milestone: 'Goal: 50 pre-orders, 200 email signups',
    },
    {
      days: 'Days 31–60', title: 'Launch', color: C.TEAL,
      items: ['Go live Amazon India + Meesho Health', 'WhatsApp wellness group seeding — Tier 1 cities', 'First paid Meta ads only after organic proof', 'Collect 50 verified customer testimonials'],
      milestone: 'Goal: ₹1L MRR, 100 subscribers',
    },
    {
      days: 'Days 61–90', title: 'Scale', color: C.ORANGE,
      items: ['Double budget on what is working — cut the rest', 'Launch subscription model for repeat buyers', 'Micro-influencer partnerships (authentic fit only)', 'Begin Series A narrative with ₹5L MRR'],
      milestone: 'Goal: ₹5L MRR, Amazon Top 10',
    },
  ];

  phases.forEach(function (ph, i) {
    var x = 0.55 + i * 3.15;
    fillRect(s, x, 1.75, 3.0, 5.45, C.BG2);
    fillRect(s, x, 1.75, 3.0, 0.06, ph.color);
    tx(s, ph.days, x + 0.18, 1.88, 2.6, 0.25, { fontSize: 8, color: ph.color, fontFace: 'Calibri', charSpacing: 1 });
    tx(s, ph.title, x + 0.18, 2.18, 2.6, 0.52, { fontSize: 20, bold: true, color: C.T1, fontFace: 'Trebuchet MS' });

    ph.items.forEach(function (item, j) {
      fillRect(s, x + 0.18, 2.88 + j * 0.72, 2.62, 0.62, C.BG3);
      tx(s, item, x + 0.3, 2.95 + j * 0.72, 2.42, 0.52, { fontSize: 9, color: C.T2, wrap: true });
    });

    fillRect(s, x + 0.18, 5.72, 2.62, 0.65, 'rgba(0,0,0,0)');
    fillRect(s, x + 0.18, 5.72, 2.62, 0.65, C.BG3);
    tx(s, ph.milestone, x + 0.3, 5.8, 2.42, 0.5, { fontSize: 9, bold: true, color: ph.color, wrap: true });
  });

  footer(s, 'NADI · CONFIDENTIAL', 'Revenue target: ₹1Cr ARR in 12 months');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 10 — Competitive Positioning (2×2 matrix, not checkbox table)
// ══════════════════════════════════════════════════════════════════
function s10Competition(pres, kw) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.BLUE);

  sectionLabel(s, '09 · Competitive Landscape', 0.55, 0.25);
  slideTitle(s, 'We are building\na new category.', null, C.T1);

  // Key insight box
  fillRect(s, 0.55, 1.72, 8.9, 0.68, C.BG2);
  fillRect(s, 0.55, 1.72, 0.07, 0.68, C.TEAL);
  tx(s, 'No tool combines India-specific scoring + real-time multi-source data + AI opportunity brief. NADI creates a new category: India Wellness Intelligence.', 0.75, 1.82, 8.5, 0.52, { fontSize: 11, color: C.T1, italic: true, wrap: true });

  // Competitive comparison — clean rows, not checkbox overload
  var headers = ['Capability', 'NADI', 'Google Trends', 'Semrush', 'Generic AI'];
  var rows = [
    ['India wellness-specific scoring', '✅', '❌', '❌', '❌'],
    ['Real-time multi-platform signals', '✅', '⚠️', '⚠️', '❌'],
    ['Fad vs. real trend detection', '✅', '❌', '❌', '❌'],
    ['Ayurvedic / FSSAI context', '✅', '❌', '❌', '❌'],
    ['AI brief grounded in live data', '✅', '❌', '❌', '⚠️'],
    ['Founder-ready output (PDF/PPTX)', '✅', '❌', '❌', '❌'],
  ];

  var colX = [0.55, 4.4, 5.88, 7.1, 8.32];
  var colW = [3.76, 1.38, 1.12, 1.12, 1.22];

  // Header row
  fillRect(s, 0.55, 2.58, 8.9, 0.4, C.BG3);
  headers.forEach(function (h, i) {
    tx(s, h, colX[i] + 0.08, 2.62, colW[i] - 0.08, 0.3, { fontSize: 9, bold: true, color: i === 1 ? C.TEAL : C.T2, fontFace: 'Calibri', charSpacing: i === 0 ? 0 : 1, align: i === 0 ? 'left' : 'center' });
  });

  rows.forEach(function (row, ri) {
    var y = 3.06 + ri * 0.6;
    fillRect(s, 0.55, y, 8.9, 0.54, ri % 2 === 0 ? C.BG2 : C.BG3);
    row.forEach(function (cell, ci) {
      var isNadi = ci === 1;
      tx(s, cell, colX[ci] + 0.08, y + 0.1, colW[ci] - 0.1, 0.34, {
        fontSize: ci === 0 ? 10 : 14,
        color: ci === 0 ? C.T1 : cell === '✅' ? C.GREEN : cell === '❌' ? C.T3 : C.AMBER,
        bold: isNadi,
        align: ci === 0 ? 'left' : 'center',
      });
    });
  });

  footer(s, 'NADI · CONFIDENTIAL');
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 11 — The Opportunity (specific to this trend)
// ══════════════════════════════════════════════════════════════════
function s11Opportunity(pres, kw, score, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, sclr(score));

  sectionLabel(s, '10 · Opportunity Brief — ' + kw, 0.55, 0.25);

  var verdict = (r && r.verdict) || 'WATCH';
  var vc = vclr(verdict);

  // Verdict hero
  fillRect(s, 0.55, 0.52, 4.2, 1.28, C.BG2);
  fillRect(s, 0.55, 0.52, 4.2, 0.06, vc);
  tx(s, verdict.split('—')[0].trim(), 0.72, 0.62, 3.9, 0.7, { fontSize: 24, bold: true, fontFace: 'Trebuchet MS', color: vc, valign: 'middle' });
  tx(s, (r && r.confidence_level) || '', 0.72, 1.3, 3.9, 0.38, { fontSize: 11, color: C.T2, fontFace: 'Calibri' });

  // Action timeline
  fillRect(s, 5.0, 0.52, 4.5, 1.28, C.BG2);
  fillRect(s, 5.0, 0.52, 4.5, 0.06, C.TEAL);
  tx(s, 'Act by:', 5.18, 0.62, 4.1, 0.28, { fontSize: 9, color: C.T3, charSpacing: 1 });
  tx(s, safe((r && r.action_timeline) || 'Monitor 60 days', 80), 5.18, 0.92, 4.2, 0.72, { fontSize: 13, bold: true, color: C.TEAL, wrap: true });

  // Executive summary
  fillRect(s, 0.55, 1.95, 8.9, 1.08, C.BG2);
  fillRect(s, 0.55, 1.95, 0.07, 1.08, C.GOLD);
  tx(s, safe((r && r.executive_summary) || '', 300), 0.75, 2.05, 8.5, 0.9, { fontSize: 11, color: C.T1, italic: true, wrap: true });

  // Two column: why now + market gap
  fillRect(s, 0.55, 3.18, 4.35, 1.78, C.BG2);
  tx(s, 'Why Now', 0.72, 3.26, 3.9, 0.32, { fontSize: 10, bold: true, color: C.TEAL, fontFace: 'Trebuchet MS' });
  tx(s, safe((r && r.why_now) || '—', 200), 0.72, 3.62, 4.05, 1.28, { fontSize: 10, color: C.T2, wrap: true });

  fillRect(s, 5.1, 3.18, 4.35, 1.78, C.BG2);
  tx(s, 'Market Gap', 5.28, 3.26, 3.95, 0.32, { fontSize: 10, bold: true, color: C.GOLHI, fontFace: 'Trebuchet MS' });
  tx(s, safe((r && r.market_gap) || '—', 200), 5.28, 3.62, 4.05, 1.28, { fontSize: 10, color: C.T2, wrap: true });

  // Product ideas
  fillRect(s, 0.55, 5.1, 8.9, 1.68, C.BG3);
  tx(s, 'Product Opportunity', 0.72, 5.18, 5, 0.3, { fontSize: 10, bold: true, color: C.GOLHI, fontFace: 'Trebuchet MS' });
  tx(s, safe((r && r.product_opportunity) || 'Premium supplement + subscription protocol.', 340), 0.72, 5.52, 8.55, 1.2, { fontSize: 10, color: C.T2, wrap: true });

  footer(s, 'NADI · CONFIDENTIAL · ' + kw);
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 12 — The Ask (YC: simple, specific, compelling)
// ══════════════════════════════════════════════════════════════════
function s12Ask(pres, kw, score, r) {
  var s = newSlide(pres);
  fillRect(s, 0, 0, SLD_W, 0.06, C.GOLHI);

  sectionLabel(s, '11 · The Ask', 0.55, 0.25);
  slideTitle(s, 'Join us before the\nfirst-mover window closes.', null, C.T1);

  // The number — biggest thing on the slide
  fillRect(s, 0.55, 1.72, 4.25, 2.18, C.BG2);
  fillRect(s, 0.55, 1.72, 4.25, 0.06, C.GOLD);
  tx(s, '₹50L – ₹1Cr', 0.72, 1.88, 3.95, 1.1, { fontSize: 30, bold: true, fontFace: 'Trebuchet MS', color: C.GOLHI, valign: 'middle' });
  tx(s, 'SEED ROUND · PRE-REVENUE', 0.72, 3.05, 3.95, 0.28, { fontSize: 8, color: C.T3, charSpacing: 2, fontFace: 'Calibri' });
  tx(s, 'Equity: 8–12% · Valuation: ₹5–8Cr', 0.72, 3.38, 3.95, 0.3, { fontSize: 10, color: C.T2 });

  // Use of funds
  fillRect(s, 5.0, 1.72, 4.5, 2.18, C.BG2);
  fillRect(s, 5.0, 1.72, 4.5, 0.06, C.TEAL);
  tx(s, 'Use of Funds', 5.18, 1.82, 4.1, 0.35, { fontSize: 11, bold: true, color: C.TEAL, fontFace: 'Trebuchet MS' });
  var funds = [['40%', 'Product development & first inventory'], ['25%', 'Marketing & community building'], ['20%', 'Technology & data infrastructure'], ['15%', 'Team & operations']];
  funds.forEach(function (f, i) {
    tx(s, f[0], 5.18, 2.28 + i * 0.38, 0.72, 0.3, { fontSize: 11, bold: true, color: C.GOLHI, fontFace: 'Trebuchet MS' });
    tx(s, f[1], 5.98, 2.28 + i * 0.38, 3.3, 0.3, { fontSize: 10, color: C.T2 });
  });

  // 12-month milestones
  fillRect(s, 0.55, 4.08, 8.9, 0.3, C.BG3);
  tx(s, '12-Month Milestones', 0.72, 4.12, 4, 0.22, { fontSize: 9, bold: true, color: C.T2, charSpacing: 1 });

  var milestones = [
    { m: 'Month 3', v: 'First product live\n₹1L MRR' },
    { m: 'Month 6', v: '₹5L MRR\n500 subscribers' },
    { m: 'Month 9', v: '₹25L MRR\nAmazon Top 10' },
    { m: 'Month 12', v: '₹1Cr ARR\nSeries A ready' },
  ];
  milestones.forEach(function (mi, i) {
    var x = 0.55 + i * 2.28;
    fillRect(s, x, 4.45, 2.18, 1.38, C.BG2);
    tx(s, mi.m, x + 0.15, 4.55, 1.9, 0.28, { fontSize: 9, color: C.TEAL, fontFace: 'Calibri', bold: true });
    tx(s, mi.v, x + 0.15, 4.88, 1.9, 0.85, { fontSize: 11, color: C.T1, fontFace: 'Trebuchet MS', bold: true, wrap: true });
  });

  // Why now urgency
  fillRect(s, 0.55, 6.0, 8.9, 1.05, C.BG3);
  fillRect(s, 0.55, 6.0, 0.07, 1.05, C.RED);
  tx(s, kw + ' is showing ' + (score >= 75 ? 'BREAKOUT' : score >= 60 ? 'EMERGING' : 'NASCENT') + ' DNA right now. The first-mover window for this category in India is open. NADI is the only tool that can read it.', 0.75, 6.08, 8.5, 0.9, { fontSize: 10, color: C.T1, wrap: true });

  footer(s, 'NADI · Neural Ayurvedic & Digital Intelligence', 'nadi-wellness-radar.onrender.com');
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ══════════════════════════════════════════════════════════════════
export async function downloadPitchDeck(result) {
  if (!result) { alert('No trend data available. Run a scan first.'); return; }

  var btn = document.querySelector('[data-pitchdeck-btn]');
  var orig = btn ? btn.textContent : null;
  if (btn) { btn.textContent = '⏳ Building deck...'; btn.disabled = true; }

  try {
    var pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE';
    pres.author = 'NADI — Neural Ayurvedic & Digital Intelligence';
    pres.company = 'NADI v3.0';
    pres.subject = 'Pitch Deck: ' + result.keyword;
    pres.title = 'NADI — ' + result.keyword;

    var kw = result.keyword;
    var sc = result.momentumAccelerationScore;
    var cls = result.classification;
    var msp = result.marketSizePotential;
    var dna = result.dnaFingerprint;
    var sig = result.signals;
    var r = result.intelligenceReport;
    var ts = result.timestamp;

    s01Cover(pres, kw, sc, cls, ts);
    s02Problem(pres, kw);
    s03Solution(pres, kw, sc);
    s04WhyNow(pres, kw, r);
    s05Market(pres, kw, msp);
    s06Product(pres, kw, dna && dna.strands, sc);
    s07Traction(pres, kw, sig, r);
    s08Business(pres, kw, r);
    s09GTM(pres, kw, r);
    s10Competition(pres, kw);
    s11Opportunity(pres, kw, sc, r);
    s12Ask(pres, kw, sc, r);

    var safe = kw.slice(0, 36).replace(/[^a-zA-Z0-9]/g, '-');
    await pres.writeFile({ fileName: 'NADI-PitchDeck-' + safe + '.pptx' });

    if (btn) {
      btn.textContent = '✅ Downloaded!';
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 3000);
    }
  } catch (err) {
    console.error('Pitch deck error:', err);
    alert('Error: ' + err.message);
    if (btn) { btn.textContent = orig || '📊 Pitch Deck'; btn.disabled = false; }
  }
}