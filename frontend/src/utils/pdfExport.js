/**
 * NADI PDF Export Utility
 * Generates a professional branded PDF report using the browser's print API
 * with a custom styled print window — no external library needed.
 */

export function exportReportToPDF(result) {
  const { keyword, momentumAccelerationScore, classification, timeToMainstream,
          marketSizePotential, intelligenceReport: r, dnaFingerprint,
          signals, dataQuality, timestamp } = result

  if (!r) { alert('No report data to export.'); return; }

  const score = momentumAccelerationScore
  const scoreColor =
    score >= 75 ? '#2DD4BF' :
    score >= 60 ? '#2DD4BF' :
    score >= 45 ? '#FCD34D' : '#F87171'

  const verdictColor =
    (r.verdict || '').includes('BUY')   ? '#2DD4BF' :
    (r.verdict || '').includes('WATCH') ? '#FCD34D' : '#F87171'

  const strands = dnaFingerprint?.strands || []

  const strandRows = strands.map(s => {
    const c = s.score >= 70 ? '#2DD4BF' : s.score >= 45 ? '#C9A84C' : s.score >= 25 ? '#FCD34D' : '#F87171'
    return `
      <tr>
        <td style="padding:6px 10px;font-size:11px;color:#888;font-family:monospace;width:50px">${s.id}</td>
        <td style="padding:6px 10px;font-size:12px;color:#ddd">${s.name}</td>
        <td style="padding:6px 10px">
          <div style="background:#1a1a1a;height:6px;border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${s.score}%;background:${c};border-radius:3px"></div>
          </div>
        </td>
        <td style="padding:6px 10px;text-align:right;font-family:monospace;font-size:12px;color:${c};width:40px">${s.score}</td>
      </tr>`
  }).join('')

  const section = (label, content, accent = '#C9A84C') => content ? `
    <div style="border-left:3px solid ${accent};padding:12px 16px;margin-bottom:14px;background:rgba(255,255,255,0.02)">
      <div style="font-family:monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${accent};margin-bottom:6px">${label}</div>
      <div style="font-size:13px;color:#c8c8c8;line-height:1.7;white-space:pre-line">${content}</div>
    </div>` : ''

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>NADI Report — ${keyword}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #07090c;
    color: #e8e4d8;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.6;
  }
  @page { size: A4; margin: 12mm 14mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
  .page { max-width: 820px; margin: 0 auto; padding: 32px; }
  h1 { font-family: Georgia, serif; font-size: 28px; color: #C9A84C; letter-spacing: 0.04em; }
  h2 { font-family: Georgia, serif; font-size: 16px; color: #e8e4d8; margin-bottom: 16px; margin-top: 28px; border-bottom: 1px solid #1e2830; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  .label { font-family: monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #4a6070; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e2830">
    <div>
      <div style="font-family:monospace;font-size:10px;color:#4a6070;letter-spacing:0.2em;margin-bottom:6px">NADI v2.0 — NEURAL AYURVEDIC &amp; DIGITAL INTELLIGENCE</div>
      <h1>${keyword.toUpperCase()}</h1>
      <div style="font-family:monospace;font-size:10px;color:#4a6070;margin-top:6px">
        Generated: ${new Date(timestamp).toLocaleString('en-IN')} &nbsp;|&nbsp; Data Quality: ${dataQuality?.label || 'N/A'} &nbsp;|&nbsp; 🇮🇳 India Market
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-family:monospace;font-size:40px;font-weight:700;color:${scoreColor};line-height:1">${score}</div>
      <div style="font-family:monospace;font-size:9px;color:#4a6070;letter-spacing:0.12em">MOMENTUM SCORE</div>
      <div style="margin-top:8px;padding:5px 12px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:3px;font-family:monospace;font-size:10px;color:${scoreColor}">
        ${classification?.emoji || ''} ${classification?.label || ''}
      </div>
    </div>
  </div>

  <!-- Verdict + Key Metrics -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:24px">
    <div style="padding:14px;background:#0c1219;border:1px solid #1e2830;border-radius:3px;text-align:center">
      <div style="font-family:monospace;font-size:18px;font-weight:700;color:${verdictColor}">${(r.verdict || 'WATCH').split('—')[0].trim()}</div>
      <div class="label" style="margin-top:4px">Verdict</div>
    </div>
    <div style="padding:14px;background:#0c1219;border:1px solid #1e2830;border-radius:3px;text-align:center">
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#C9A84C">₹${marketSizePotential?.tam || '?'}Cr</div>
      <div class="label" style="margin-top:4px">Market TAM</div>
    </div>
    <div style="padding:14px;background:#0c1219;border:1px solid #1e2830;border-radius:3px;text-align:center">
      <div style="font-family:monospace;font-size:13px;font-weight:500;color:#2DD4BF">${timeToMainstream || '—'}</div>
      <div class="label" style="margin-top:4px">Time to Mainstream</div>
    </div>
    <div style="padding:14px;background:#0c1219;border:1px solid #1e2830;border-radius:3px;text-align:center">
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#e8e4d8">${signals?.totalStrength || 0}</div>
      <div class="label" style="margin-top:4px">Total Signals</div>
    </div>
  </div>

  <!-- Live Signal Data -->
  <h2>Live Signal Data</h2>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:24px">
    ${[['Reddit', signals?.reddit||0,'💬'],['YouTube',signals?.youtube||0,'▶'],['News',signals?.news||0,'📰'],['Research',signals?.research||0,'🔬'],['Amazon IN',signals?.ecommerce||0,'🛒']].map(([l,v,i])=>`
    <div style="padding:10px;background:#0c1219;border:1px solid #1e2830;border-radius:3px;text-align:center">
      <div style="font-size:16px;margin-bottom:4px">${i}</div>
      <div style="font-family:monospace;font-size:16px;font-weight:700;color:#e8e4d8">${v}</div>
      <div class="label">${l}</div>
    </div>`).join('')}
  </div>

  <!-- DNA Fingerprint -->
  <h2>DNA Fingerprint — 8 Strands</h2>
  <table style="margin-bottom:24px">
    <tbody>${strandRows}</tbody>
  </table>

  <!-- Intelligence Report Sections -->
  <h2>Intelligence Report</h2>
  ${section('Executive Summary',    r.executive_summary,  '#C9A84C')}
  ${section('Why Now — India',       r.why_now,            '#2DD4BF')}
  ${section('Signal Evidence',       r.signal_evidence,    '#4A90D9')}
  ${section('Target Consumer',       r.target_consumer,    '#C9A84C')}
  ${section('Market Gap',            r.market_gap,         '#2DD4BF')}
  ${section('Product Opportunity',   r.product_opportunity,'#C9A84C')}
  ${section('Go-to-Market (90 days)',r.go_to_market,       '#2DD4BF')}
  ${section('Revenue Model',         r.revenue_model,      '#C9A84C')}
  ${section('Competitive Moat',      r.competitive_moat,   '#9B59B6')}
  ${section('Risk Assessment',       r.risk_assessment,    '#F87171')}

  <!-- Action Timeline -->
  ${r.action_timeline ? `
  <div style="margin-top:20px;padding:14px 18px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.25);border-radius:3px">
    <div class="label" style="color:#C9A84C;margin-bottom:6px">⏱ Action Timeline</div>
    <div style="font-size:14px;font-weight:600;color:#e8e4d8">${r.action_timeline}</div>
  </div>` : ''}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #1e2830;display:flex;justify-content:space-between;font-family:monospace;font-size:9px;color:#4a6070">
    <span>NADI v2.0 — Neural Ayurvedic &amp; Digital Intelligence</span>
    <span>Signals sourced from 1,000+ live data sources | India Market Intelligence</span>
  </div>

</div>

<div class="no-print" style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px">
  <button onclick="window.print()" style="padding:10px 20px;background:#C9A84C;color:#000;border:none;border-radius:3px;cursor:pointer;font-weight:700;font-family:monospace;font-size:12px">
    🖨 Print / Save PDF
  </button>
  <button onclick="window.close()" style="padding:10px 20px;background:#1a1a1a;color:#888;border:1px solid #333;border-radius:3px;cursor:pointer;font-family:monospace;font-size:12px">
    Close
  </button>
</div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Please allow popups for this site to export PDF.'); return; }
  win.document.write(html)
  win.document.close()
}
