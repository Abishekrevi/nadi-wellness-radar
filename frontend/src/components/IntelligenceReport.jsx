import { useState } from 'react'
import { exportReportToPDF } from '../utils/pdfExport.js'
import { exportPitchDeck }   from '../utils/pitchDeck.js'

const Block = ({ label, content, accent = 'var(--gold)', className = '' }) => {
  if (!content) return null
  return (
    <div className={`report-block ${className}`} style={{ borderLeftColor: accent }}>
      <div className="label" style={{ color: accent, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
        {content}
      </div>
    </div>
  )
}

const VerdictChip = ({ verdict }) => {
  const v = (verdict || '').toUpperCase()
  const isStrongBuy = v.includes('STRONG BUY')
  const isBuy       = v.includes('BUY') && !v.includes('STRONG')
  const isWatch     = v.includes('WATCH')

  const cfg = isStrongBuy
    ? { color: 'var(--teal)',  bg: 'rgba(45,212,191,0.1)',  border: 'rgba(45,212,191,0.3)',  icon: '🚀', label: 'STRONG BUY' }
    : isBuy
    ? { color: 'var(--teal)',  bg: 'rgba(45,212,191,0.07)', border: 'rgba(45,212,191,0.2)',  icon: '📈', label: 'BUY'        }
    : isWatch
    ? { color: 'var(--amber)', bg: 'var(--amber-lo)',        border: 'rgba(252,211,77,0.3)',  icon: '👀', label: 'WATCH'      }
    :   { color: 'var(--red)', bg: 'var(--red-lo)',          border: 'rgba(248,113,113,0.3)', icon: '⏭', label: 'PASS'       }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 18px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius)',
      fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 14,
      color: cfg.color, letterSpacing: '0.08em',
    }}>
      {cfg.icon} {cfg.label}
    </div>
  )
}

export default function IntelligenceReport({ report: r, keyword, marketSize, fullResult }) {
  const [expanded,    setExpanded]    = useState(false)
  const [deckLoading, setDeckLoading] = useState(false)

  if (!r) return null

  const handleDeckExport = async () => {
    if (!fullResult || deckLoading) return
    setDeckLoading(true)
    try {
      await exportPitchDeck(fullResult)
    } catch (e) {
      alert('Pitch deck export failed: ' + e.message)
    } finally {
      setDeckLoading(false)
    }
  }

  return (
    <div>
      {/* ── Verdict + meta row ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
        padding: 18,
        background: 'var(--bg-float)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius)',
        marginBottom: 16,
      }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Opportunity Verdict — {keyword}</div>
          <VerdictChip verdict={r.verdict}/>
          {r.confidence_level && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 7 }}>
              Confidence: <span style={{ color: 'var(--text-1)' }}>{r.confidence_level}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {marketSize && (
            <div style={{ textAlign: 'right' }}>
              <div className="label" style={{ marginBottom: 3 }}>Market TAM</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
                ₹{marketSize.tam}Cr
              </div>
              <div className="label" style={{ marginTop: 2 }}>{marketSize.horizon}</div>
            </div>
          )}

          {/* Export buttons — PDF + Pitch Deck */}
          {fullResult && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="pdf-btn" onClick={() => exportReportToPDF(fullResult)}>
                📄 Export PDF
              </button>
              <button
                className="pdf-btn"
                style={{
                  background: 'rgba(45,212,191,0.08)',
                  borderColor: 'rgba(45,212,191,0.3)',
                  color: 'var(--teal)',
                  opacity: deckLoading ? 0.6 : 1,
                  cursor: deckLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleDeckExport}
                disabled={deckLoading}
              >
                {deckLoading ? '⟳ Building...' : '📊 Pitch Deck (.pptx)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Action timeline banner ── */}
      {r.action_timeline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 16px',
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: 'var(--radius)',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⏱</span>
          <div>
            <div className="label" style={{ color: 'var(--gold)', marginBottom: 2 }}>Action Timeline</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{r.action_timeline}</div>
          </div>
        </div>
      )}

      {/* ── Always-visible sections ── */}
      <Block label="Executive Summary"      content={r.executive_summary} accent="var(--gold)"/>
      <Block label="Why Now — India Timing" content={r.why_now}           accent="var(--teal)"  className="teal"/>
      <Block label="Signal Evidence"        content={r.signal_evidence}   accent="#4A90D9"       className="teal"/>

      {/* ── Expanded sections ── */}
      {expanded && (
        <div className="anim-up">
          <Block label="Target Consumer Profile" content={r.target_consumer}     accent="var(--gold)"/>
          <Block label="Market Gap"              content={r.market_gap}          accent="var(--teal)" className="teal"/>
          <Block label="Product Opportunity"     content={r.product_opportunity} accent="var(--gold)"/>
          <Block label="Go-to-Market (90 Days)"  content={r.go_to_market}        accent="var(--teal)" className="teal"/>
          <Block label="Revenue Model"           content={r.revenue_model}       accent="var(--gold)"/>
          <Block label="Competitive Moat"        content={r.competitive_moat}    accent="#9B59B6"/>
          <Block label="Risk Assessment"         content={r.risk_assessment}     accent="var(--red)"  className="red"/>
        </div>
      )}

      {/* ── Expand/Collapse ── */}
      <button
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? '▲ Collapse Report' : '▼ Expand Full Brief'}
      </button>
    </div>
  )
}
