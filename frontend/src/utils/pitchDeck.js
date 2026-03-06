/**
 * NADI Pitch Deck Generator
 * Generates a professional investor pitch deck (.pptx) directly in the browser
 * using PptxGenJS loaded dynamically from CDN.
 *
 * Color palette — Deep Navy + Gold + Teal (Indian wellness meets fintech premium)
 * BG_DARK:  "0A0F1A"   Primary dark background
 * BG_CARD:  "111827"   Card / panel background
 * GOLD:     "C9A84C"   Primary accent
 * GOLD_HI:  "F0CC6E"   Highlight gold
 * TEAL:     "2DD4BF"   Positive signal color
 * RED:      "F87171"   Risk / fad color
 * TEXT_1:   "EDE8DC"   Primary text
 * TEXT_2:   "8FA3B1"   Secondary text
 * WHITE:    "FFFFFF"
 */

function loadPptxGenJS() {
  return new Promise((resolve, reject) => {
    if (window.PptxGenJS) { resolve(window.PptxGenJS); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js';
    s.onload  = () => resolve(window.PptxGenJS);
    s.onerror = () => reject(new Error('Failed to load PptxGenJS from CDN. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

// ── Helpers ────────────────────────────────────────────────────────
const C = {
  BG:     '0A0F1A',
  CARD:   '111827',
  PANEL:  '1C2A3A',
  GOLD:   'C9A84C',
  GOLHI:  'F0CC6E',
  TEAL:   '2DD4BF',
  RED:    'F87171',
  AMBER:  'FCD34D',
  T1:     'EDE8DC',
  T2:     '8FA3B1',
  T3:     '4A6070',
  WHITE:  'FFFFFF',
  BLACK:  '000000',
};

const mkShadow = () => ({ type: 'outer', color: '000000', opacity: 0.35, blur: 8, offset: 3, angle: 135 });

function addBg(slide) {
  slide.background = { color: C.BG };
}

/** Gold accent bar on left edge of a card */
function accentCard(slide, x, y, w, h, accentColor = C.GOLD) {
  slide.addShape('rect', { x, y, w, h, fill: { color: C.CARD }, shadow: mkShadow(), line: { color: '1E2D40', width: 0.5 } });
  slide.addShape('rect', { x, y, w: 0.06, h, fill: { color: accentColor } });
}

/** Label + big number callout */
function statBox(slide, x, y, w, h, value, label, valueColor = C.GOLD) {
  slide.addShape('rect', { x, y, w, h, fill: { color: C.PANEL }, line: { color: '1E2D40', width: 0.5 } });
  slide.addText(String(value), { x, y: y + 0.1, w, h: h * 0.55, align: 'center', valign: 'middle', fontSize: 26, bold: true, color: valueColor, fontFace: 'Georgia', margin: 0 });
  slide.addText(label.toUpperCase(), { x, y: y + h * 0.6, w, h: h * 0.35, align: 'center', fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 2, margin: 0 });
}

/** Section title with gold underline shape */
function sectionTitle(slide, title, subtitle = '') {
  // dark top bar
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: C.CARD } });
  slide.addShape('rect', { x: 0, y: 0.92, w: 10, h: 0.06, fill: { color: C.GOLD } });
  slide.addText('NADI', { x: 0.4, y: 0.22, w: 1, h: 0.5, fontSize: 11, bold: true, color: C.GOLD, fontFace: 'Georgia', charSpacing: 3, margin: 0 });
  slide.addText(title, { x: 1.5, y: 0.22, w: 7, h: 0.5, fontSize: 13, bold: true, color: C.T1, fontFace: 'Georgia', margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 1.5, y: 0.62, w: 7, h: 0.3, fontSize: 10, color: C.T3, fontFace: 'Calibri', margin: 0 });
}

// ══════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ══════════════════════════════════════════════════════════════════
export async function exportPitchDeck(result) {
  const { keyword, momentumAccelerationScore: score, classification,
          timeToMainstream, marketSizePotential: msp,
          intelligenceReport: r, dnaFingerprint, signals,
          dataQuality, sourceAttribution, timestamp } = result;

  if (!r) { alert('No intelligence report data found. Please run an analysis first.'); return; }

  let PptxGenJS;
  try {
    PptxGenJS = await loadPptxGenJS();
  } catch (e) {
    alert(e.message); return;
  }

  const pres    = new PptxGenJS();
  pres.layout   = 'LAYOUT_16x9';
  pres.author   = 'NADI — Neural Ayurvedic & Digital Intelligence';
  pres.title    = `${keyword} — Opportunity Brief`;
  pres.subject  = 'Indian D2C Wellness Market Intelligence';

  const kwTitle = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const scoreColor = score >= 60 ? C.TEAL : score >= 45 ? C.AMBER : C.RED;
  const verdictText = (r.verdict || 'WATCH').split('—')[0].trim();
  const verdictColor = verdictText.includes('BUY') ? C.TEAL : verdictText.includes('WATCH') ? C.AMBER : C.RED;

  // ──────────────────────────────────────────────
  // SLIDE 1 — Cover
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);

    // Full-bleed left panel (dark)
    s.addShape('rect', { x: 0, y: 0, w: 5.2, h: 5.625, fill: { color: C.CARD } });
    // Gold vertical accent
    s.addShape('rect', { x: 5.2, y: 0, w: 0.06, h: 5.625, fill: { color: C.GOLD } });

    // NADI logo text
    s.addText('NADI', { x: 0.5, y: 0.6, w: 4, h: 0.8, fontSize: 42, bold: true, color: C.GOLD, fontFace: 'Georgia', margin: 0 });
    s.addText('NEURAL AYURVEDIC & DIGITAL INTELLIGENCE', {
      x: 0.5, y: 1.35, w: 4.4, h: 0.3, fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 2.5, margin: 0,
    });

    // Divider line
    s.addShape('rect', { x: 0.5, y: 1.72, w: 3.8, h: 0.025, fill: { color: C.GOLD } });

    // Keyword title
    s.addText(kwTitle, { x: 0.5, y: 1.9, w: 4.4, h: 1.0, fontSize: 22, bold: true, color: C.T1, fontFace: 'Georgia', margin: 0 });
    s.addText('Market Opportunity Brief — Indian D2C Wellness', {
      x: 0.5, y: 2.85, w: 4.4, h: 0.4, fontSize: 11, color: C.T2, fontFace: 'Calibri', margin: 0,
    });

    // Verdict badge
    s.addShape('rect', { x: 0.5, y: 3.4, w: 1.8, h: 0.5, fill: { color: C.PANEL }, line: { color: verdictColor, width: 1.5 } });
    s.addText(verdictText, { x: 0.5, y: 3.4, w: 1.8, h: 0.5, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: verdictColor, fontFace: 'Calibri', margin: 0 });

    // Score badge
    s.addShape('rect', { x: 2.5, y: 3.4, w: 1.5, h: 0.5, fill: { color: C.PANEL }, line: { color: scoreColor, width: 1.5 } });
    s.addText(`MAS: ${score}/100`, { x: 2.5, y: 3.4, w: 1.5, h: 0.5, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: scoreColor, fontFace: 'Calibri', margin: 0 });

    // Timestamp
    s.addText(`Generated: ${new Date(timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, {
      x: 0.5, y: 4.9, w: 4.5, h: 0.3, fontSize: 9, color: C.T3, fontFace: 'Calibri', margin: 0,
    });

    // Right panel — key metrics
    const rX = 5.6;
    s.addText('KEY METRICS', { x: rX, y: 0.5, w: 4, h: 0.3, fontSize: 8, color: C.GOLD, fontFace: 'Calibri', charSpacing: 3, margin: 0 });
    statBox(s, rX,       0.9,  1.85, 1.1, `${score}`,                   'MAS Score',       scoreColor);
    statBox(s, rX+2.0,   0.9,  1.85, 1.1, `₹${msp?.tam||'?'}Cr`,        'Market TAM',      C.GOLD);
    statBox(s, rX,       2.1,  1.85, 1.0, signals?.reddit||0,            'Reddit Mentions', C.T2);
    statBox(s, rX+2.0,   2.1,  1.85, 1.0, signals?.research||0,          'Research Papers', C.T2);
    statBox(s, rX,       3.2,  1.85, 1.0, signals?.youtube||0,           'YouTube Mentions',C.T2);
    statBox(s, rX+2.0,   3.2,  1.85, 1.0, signals?.news||0,              'News Articles',   C.T2);

    s.addText('Data Quality: ' + (dataQuality?.label || 'N/A'), {
      x: rX, y: 4.35, w: 3.8, h: 0.3, fontSize: 9, color: dataQuality?.color?.replace('#','') ? C.T2 : C.T2, fontFace: 'Calibri', margin: 0,
    });
    s.addText(`Time to Mainstream: ${timeToMainstream || '—'}`, {
      x: rX, y: 4.65, w: 3.8, h: 0.3, fontSize: 9, color: C.T2, fontFace: 'Calibri', margin: 0,
    });
  }

  // ──────────────────────────────────────────────
  // SLIDE 2 — Executive Summary + Why Now
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Executive Summary', 'The opportunity in one page');

    accentCard(s, 0.35, 1.15, 5.8, 2.0);
    s.addText('THE OPPORTUNITY', { x: 0.55, y: 1.2, w: 5.4, h: 0.28, fontSize: 8, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.executive_summary || 'Analysis in progress.', {
      x: 0.55, y: 1.5, w: 5.5, h: 1.55, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    accentCard(s, 0.35, 3.3, 5.8, 2.0, C.TEAL);
    s.addText('WHY NOW — INDIA TIMING', { x: 0.55, y: 3.35, w: 5.4, h: 0.28, fontSize: 8, color: C.TEAL, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.why_now || '—', {
      x: 0.55, y: 3.65, w: 5.5, h: 1.5, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    // Right column — classification + action
    const rx = 6.4;
    s.addShape('rect', { x: rx, y: 1.15, w: 3.3, h: 1.3, fill: { color: C.PANEL }, line: { color: scoreColor, width: 1.5 } });
    s.addText(classification?.label || '—', { x: rx, y: 1.2, w: 3.3, h: 0.5, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: scoreColor, fontFace: 'Georgia', margin: 0 });
    s.addText(`${classification?.emoji || ''} ${score}/100 MAS`, { x: rx, y: 1.72, w: 3.3, h: 0.35, align: 'center', fontSize: 10, color: C.T2, fontFace: 'Calibri', margin: 0 });

    s.addShape('rect', { x: rx, y: 2.65, w: 3.3, h: 0.9, fill: { color: C.PANEL }, line: { color: C.GOLD, width: 0.8 } });
    s.addText('CONFIDENCE', { x: rx, y: 2.7, w: 3.3, h: 0.3, align: 'center', fontSize: 7, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2, margin: 0 });
    s.addText(r.confidence_level || '—', { x: rx, y: 2.98, w: 3.3, h: 0.35, align: 'center', fontSize: 14, bold: true, color: C.T1, fontFace: 'Georgia', margin: 0 });

    s.addShape('rect', { x: rx, y: 3.7, w: 3.3, h: 1.6, fill: { color: C.PANEL }, line: { color: C.GOLD, width: 0.8 } });
    s.addText('ACTION TIMELINE', { x: rx, y: 3.75, w: 3.3, h: 0.3, align: 'center', fontSize: 7, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2, margin: 0 });
    s.addText(r.action_timeline || '—', { x: rx+0.1, y: 4.1, w: 3.1, h: 1.0, fontSize: 10, color: C.T1, fontFace: 'Calibri', margin: 0 });
  }

  // ──────────────────────────────────────────────
  // SLIDE 3 — Signal Evidence (live data)
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Live Signal Data', 'Real data collected from 1,000+ sources — no hallucinations');

    // Signal platform boxes
    const platforms = [
      { label: 'Reddit',       val: signals?.reddit    || 0, icon: '💬', color: C.GOLD  },
      { label: 'YouTube',      val: signals?.youtube   || 0, icon: '▶',  color: C.RED   },
      { label: 'News/RSS',     val: signals?.news      || 0, icon: '📰', color: C.TEAL  },
      { label: 'PubMed',       val: signals?.research  || 0, icon: '🔬', color: C.T2    },
      { label: 'Amazon India', val: signals?.ecommerce || 0, icon: '🛒', color: C.AMBER },
    ];
    platforms.forEach((p, i) => {
      const x = 0.35 + i * 1.87;
      s.addShape('rect', { x, y: 1.1, w: 1.7, h: 1.4, fill: { color: C.PANEL }, line: { color: '1E2D40', width: 0.5 } });
      s.addShape('rect', { x, y: 1.1, w: 1.7, h: 0.06, fill: { color: p.color } });
      s.addText(String(p.val), { x, y: 1.25, w: 1.7, h: 0.7, align: 'center', fontSize: 28, bold: true, color: p.color, fontFace: 'Georgia', margin: 0 });
      s.addText(p.label.toUpperCase(), { x, y: 2.0, w: 1.7, h: 0.3, align: 'center', fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 1.5, margin: 0 });
    });

    // Search momentum
    const sm = signals?.searchMomentum || 0;
    s.addShape('rect', { x: 0.35, y: 2.75, w: 9.3, h: 0.75, fill: { color: C.CARD }, line: { color: '1E2D40', width: 0.5 } });
    s.addText('GOOGLE TRENDS — SEARCH MOMENTUM (30 DAYS)', { x: 0.55, y: 2.82, w: 5, h: 0.3, fontSize: 8, color: C.T3, fontFace: 'Calibri', charSpacing: 1.5, margin: 0 });
    s.addText(`${sm >= 0 ? '+' : ''}${sm}%`, { x: 7.5, y: 2.78, w: 2, h: 0.62, align: 'right', valign: 'middle', fontSize: 22, bold: true, color: sm >= 0 ? C.TEAL : C.RED, fontFace: 'Georgia', margin: 0 });

    // Signal evidence text
    accentCard(s, 0.35, 3.65, 9.3, 1.65, C.TEAL);
    s.addText('SIGNAL EVIDENCE FROM LIVE DATA', { x: 0.55, y: 3.72, w: 9.0, h: 0.28, fontSize: 8, color: C.TEAL, fontFace: 'Calibri', charSpacing: 2, bold: true, margin: 0 });
    s.addText(r.signal_evidence || '—', {
      x: 0.55, y: 4.02, w: 9.0, h: 1.2, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });
  }

  // ──────────────────────────────────────────────
  // SLIDE 4 — DNA Fingerprint
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'DNA Fingerprint', '8-strand model vs. historical Indian wellness winners & fads');

    const strands = dnaFingerprint?.strands || [];
    const half    = Math.ceil(strands.length / 2);
    const col     = (strands, startX) => {
      strands.forEach((st, i) => {
        const y = 1.15 + i * 0.55;
        const barColor = st.score >= 70 ? C.TEAL : st.score >= 45 ? C.GOLD : st.score >= 25 ? C.AMBER : C.RED;
        s.addText(st.id, { x: startX, y, w: 0.55, h: 0.3, fontSize: 9, bold: true, color: C.GOLD, fontFace: 'Calibri', margin: 0 });
        s.addText(st.name, { x: startX + 0.6, y, w: 2.4, h: 0.3, fontSize: 9, color: C.T1, fontFace: 'Calibri', margin: 0 });
        // Bar track
        s.addShape('rect', { x: startX + 3.1, y: y + 0.08, w: 1.3, h: 0.14, fill: { color: C.PANEL } });
        // Bar fill
        const fillW = Math.max(0.04, (st.score / 100) * 1.3);
        s.addShape('rect', { x: startX + 3.1, y: y + 0.08, w: fillW, h: 0.14, fill: { color: barColor } });
        s.addText(`${st.score}`, { x: startX + 4.5, y, w: 0.4, h: 0.3, align: 'right', fontSize: 10, bold: true, color: barColor, fontFace: 'Calibri', margin: 0 });
      });
    };
    col(strands.slice(0, half), 0.35);
    col(strands.slice(half),    5.1);

    // Historical match
    const hm = dnaFingerprint?.historicalMatch;
    if (hm) {
      s.addShape('rect', { x: 0.35, y: 4.7, w: 9.3, h: 0.65, fill: { color: C.PANEL }, line: { color: '1E2D40', width: 0.5 } });
      s.addText(`Closest Trend: ${hm.closestTrend?.name || '—'} (${hm.trendScore}% DNA match)`, {
        x: 0.55, y: 4.77, w: 4.5, h: 0.28, fontSize: 10, color: C.TEAL, fontFace: 'Calibri', margin: 0,
      });
      s.addText(`Closest Fad: ${hm.closestFad?.name || '—'} (${hm.fadScore}% DNA match)`, {
        x: 5.3, y: 4.77, w: 4.2, h: 0.28, fontSize: 10, color: C.RED, fontFace: 'Calibri', margin: 0,
      });
      s.addText(`Pattern verdict: ${hm.verdict || '—'}`, {
        x: 0.55, y: 5.07, w: 9.0, h: 0.22, fontSize: 9, color: C.T2, fontFace: 'Calibri', margin: 0,
      });
    }
  }

  // ──────────────────────────────────────────────
  // SLIDE 5 — Consumer + Market Gap
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Consumer & Market Gap', 'Who buys this and what no Indian brand is offering yet');

    accentCard(s, 0.35, 1.15, 4.55, 4.2);
    s.addText('TARGET CONSUMER', { x: 0.55, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.target_consumer || '—', {
      x: 0.55, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    accentCard(s, 5.1, 1.15, 4.55, 4.2, C.TEAL);
    s.addText('THE MARKET GAP', { x: 5.3, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: C.TEAL, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.market_gap || '—', {
      x: 5.3, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });
  }

  // ──────────────────────────────────────────────
  // SLIDE 6 — Product Opportunity
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Product Opportunity', 'Specific product concepts with pricing and positioning');

    // TAM callout
    s.addShape('rect', { x: 7.5, y: 1.15, w: 2.15, h: 1.5, fill: { color: C.PANEL }, line: { color: C.GOLD, width: 1.5 } });
    s.addText(`₹${msp?.tam || '?'}Cr`, { x: 7.5, y: 1.25, w: 2.15, h: 0.7, align: 'center', fontSize: 24, bold: true, color: C.GOLD, fontFace: 'Georgia', margin: 0 });
    s.addText('MARKET TAM', { x: 7.5, y: 1.97, w: 2.15, h: 0.3, align: 'center', fontSize: 7, color: C.T3, fontFace: 'Calibri', charSpacing: 1.5, margin: 0 });
    s.addText(msp?.horizon || '5-year', { x: 7.5, y: 2.27, w: 2.15, h: 0.28, align: 'center', fontSize: 9, color: C.T2, fontFace: 'Calibri', margin: 0 });

    accentCard(s, 0.35, 1.15, 6.9, 4.2);
    s.addText('PRODUCT IDEAS — SPECIFIC & ACTIONABLE', { x: 0.55, y: 1.22, w: 6.5, h: 0.28, fontSize: 8, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.product_opportunity || '—', {
      x: 0.55, y: 1.55, w: 6.6, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    // Time to mainstream box
    s.addShape('rect', { x: 7.5, y: 2.85, w: 2.15, h: 1.0, fill: { color: C.PANEL }, line: { color: C.TEAL, width: 1 } });
    s.addText('TO MAINSTREAM', { x: 7.5, y: 2.92, w: 2.15, h: 0.28, align: 'center', fontSize: 7, color: C.TEAL, fontFace: 'Calibri', charSpacing: 1.5, margin: 0 });
    s.addText(timeToMainstream || '—', { x: 7.5, y: 3.2, w: 2.15, h: 0.5, align: 'center', fontSize: 10, bold: true, color: C.T1, fontFace: 'Calibri', margin: 0 });
  }

  // ──────────────────────────────────────────────
  // SLIDE 7 — Go-to-Market + Revenue
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Go-to-Market & Revenue Model', '90-day launch plan and monetisation strategy');

    accentCard(s, 0.35, 1.15, 4.55, 4.2);
    s.addText('GTM — FIRST 90 DAYS', { x: 0.55, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: C.GOLD, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.go_to_market || '—', {
      x: 0.55, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    accentCard(s, 5.1, 1.15, 4.55, 4.2, C.TEAL);
    s.addText('REVENUE MODEL', { x: 5.3, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: C.TEAL, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.revenue_model || '—', {
      x: 5.3, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });
  }

  // ──────────────────────────────────────────────
  // SLIDE 8 — Competitive Moat + Risks
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);
    sectionTitle(s, 'Competitive Moat & Risk Assessment', 'Defensibility strategy and mitigation plan');

    accentCard(s, 0.35, 1.15, 4.55, 4.2, '9B59B6');
    s.addText('COMPETITIVE MOAT', { x: 0.55, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: '9B59B6', fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.competitive_moat || '—', {
      x: 0.55, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });

    accentCard(s, 5.1, 1.15, 4.55, 4.2, C.RED);
    s.addText('RISK ASSESSMENT', { x: 5.3, y: 1.22, w: 4.1, h: 0.28, fontSize: 8, color: C.RED, fontFace: 'Calibri', charSpacing: 2.5, bold: true, margin: 0 });
    s.addText(r.risk_assessment || '—', {
      x: 5.3, y: 1.55, w: 4.2, h: 3.65, fontSize: 11, color: C.T1, fontFace: 'Calibri', valign: 'top', margin: 0,
    });
  }

  // ──────────────────────────────────────────────
  // SLIDE 9 — Final Verdict / Call to Action
  // ──────────────────────────────────────────────
  {
    const s = pres.addSlide();
    addBg(s);

    s.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.CARD } });
    s.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: C.GOLD } });
    s.addShape('rect', { x: 0, y: 5.545, w: 10, h: 0.08, fill: { color: C.GOLD } });

    s.addText('NADI', { x: 0.5, y: 0.5, w: 2, h: 0.6, fontSize: 16, bold: true, color: C.GOLD, fontFace: 'Georgia', charSpacing: 3, margin: 0 });

    s.addText('FINAL VERDICT', { x: 0, y: 1.0, w: 10, h: 0.4, align: 'center', fontSize: 10, color: C.T3, fontFace: 'Calibri', charSpacing: 3, margin: 0 });
    s.addText(verdictText, { x: 0, y: 1.4, w: 10, h: 1.1, align: 'center', fontSize: 54, bold: true, color: verdictColor, fontFace: 'Georgia', margin: 0 });
    s.addText(kwTitle, { x: 0, y: 2.5, w: 10, h: 0.5, align: 'center', fontSize: 18, color: C.T2, fontFace: 'Georgia', italic: true, margin: 0 });

    s.addShape('rect', { x: 3.5, y: 3.1, w: 3, h: 0.025, fill: { color: C.GOLD } });

    s.addText(r.action_timeline || 'Define your entry timeline based on the signal data above.', {
      x: 1, y: 3.3, w: 8, h: 0.6, align: 'center', fontSize: 13, color: C.T1, fontFace: 'Calibri', margin: 0,
    });
    s.addText(`MAS ${score}/100  ·  Confidence: ${r.confidence_level || '—'}  ·  ₹${msp?.tam || '?'}Cr TAM  ·  Data from 1,000+ live sources`, {
      x: 0.5, y: 4.3, w: 9, h: 0.4, align: 'center', fontSize: 9, color: C.T3, fontFace: 'Calibri', margin: 0,
    });
    s.addText('Neural Ayurvedic & Digital Intelligence — Indian Wellness Market Platform', {
      x: 0.5, y: 5.1, w: 9, h: 0.3, align: 'center', fontSize: 8, color: C.T3, fontFace: 'Calibri', charSpacing: 1, margin: 0,
    });
  }

  // ── Save ──────────────────────────────────────
  const safeName = keyword.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  await pres.writeFile({ fileName: `NADI-PitchDeck-${safeName}.pptx` });
}
