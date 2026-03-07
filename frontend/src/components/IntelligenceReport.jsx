import { useState, useRef, useEffect } from 'react'
import { exportReportToPDF } from '../utils/pdfExport.js'
import { downloadPitchDeck } from '../utils/pitchDeckExport.js'

// ── Content block ──────────────────────────────────────────────────
const Block = ({ label, content, accent, className }) => {
  if (!content) return null
  return (
    <div className={'report-block ' + (className || '')} style={{ borderLeftColor: accent || 'var(--gold)' }}>
      <div className="label" style={{ color: accent || 'var(--gold)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
        {content}
      </div>
    </div>
  )
}

// ── Verdict chip ───────────────────────────────────────────────────
const VerdictChip = ({ verdict }) => {
  const v = (verdict || '').toUpperCase()
  const isStrongBuy = v.includes('STRONG BUY')
  const isBuy = v.includes('BUY') && !v.includes('STRONG')
  const isWatch = v.includes('WATCH')

  const cfg = isStrongBuy
    ? { color: 'var(--teal)', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.3)', icon: '🚀', label: 'STRONG BUY' }
    : isBuy
      ? { color: 'var(--teal)', bg: 'rgba(45,212,191,0.07)', border: 'rgba(45,212,191,0.2)', icon: '📈', label: 'BUY' }
      : isWatch
        ? { color: 'var(--amber)', bg: 'var(--amber-lo)', border: 'rgba(252,211,77,0.3)', icon: '👀', label: 'WATCH' }
        : { color: 'var(--red)', bg: 'var(--red-lo)', border: 'rgba(248,113,113,0.3)', icon: '⏭', label: 'PASS' }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 18px',
      background: cfg.bg, border: '1px solid ' + cfg.border,
      borderRadius: 'var(--radius)',
      fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 14,
      color: cfg.color, letterSpacing: '0.08em',
    }}>
      {cfg.icon} {cfg.label}
    </div>
  )
}

// ── Build narrator script ──────────────────────────────────────────
function buildScript(keyword, r, marketSize) {
  var tam = marketSize ? marketSize.tam : null
  var parts = [
    'Welcome to NADI. Neural Ayurvedic and Digital Intelligence.',
    'Here is your full market intelligence brief for: ' + keyword + '.',
    r.executive_summary ? 'Executive Summary. ' + r.executive_summary : '',
    r.verdict ? 'Our verdict: ' + r.verdict + '.' : '',
    r.confidence_level ? 'Confidence level: ' + r.confidence_level + '.' : '',
    r.why_now ? 'Why now, India timing. ' + r.why_now : '',
    tam ? 'The total addressable market for this category is estimated at ' + tam + ' crore rupees.' : '',
    r.market_gap ? 'Market gap. ' + r.market_gap : '',
    r.target_consumer ? 'Target consumer. ' + r.target_consumer : '',
    r.product_opportunity ? 'Product opportunities. ' + r.product_opportunity : '',
    r.go_to_market ? 'Go to market strategy. ' + r.go_to_market : '',
    r.revenue_model ? 'Revenue model. ' + r.revenue_model : '',
    r.competitive_moat ? 'Competitive moat. ' + r.competitive_moat : '',
    r.risk_assessment ? 'Risk assessment. ' + r.risk_assessment : '',
    r.action_timeline ? 'Recommended action timeline: ' + r.action_timeline + '.' : '',
    'This has been your NADI intelligence brief for ' + keyword + '. Move first. Build smart.',
  ]
  return parts.filter(Boolean).join(' ')
}

// ── Audio narrator component ───────────────────────────────────────
function AudioNarrator({ keyword, r, marketSize }) {
  var [playing, setPlaying] = useState(false)
  var [paused, setPaused] = useState(false)
  var [progress, setProgress] = useState(0)
  var totalRef = useRef(1)

  useEffect(function () {
    return function () { if (window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  function speak() {
    if (!window.speechSynthesis) {
      alert('Voice narration requires Chrome or Edge browser.')
      return
    }
    window.speechSynthesis.cancel()

    var script = buildScript(keyword, r, marketSize)
    var utt = new SpeechSynthesisUtterance(script)
    utt.rate = 0.95
    utt.pitch = 1.0
    utt.volume = 1.0
    utt.lang = 'en-IN'

    var voices = window.speechSynthesis.getVoices()
    var preferred = voices.find(function (v) {
      return v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')
    })
    if (preferred) utt.voice = preferred

    totalRef.current = script.length

    utt.onboundary = function (e) {
      setProgress(Math.min(100, Math.round((e.charIndex / totalRef.current) * 100)))
    }
    utt.onend = function () { setPlaying(false); setPaused(false); setProgress(100) }
    utt.onerror = function () { setPlaying(false); setPaused(false) }

    window.speechSynthesis.speak(utt)
    setPlaying(true)
    setPaused(false)
    setProgress(0)
  }

  function pause() { window.speechSynthesis.pause(); setPaused(true) }
  function resume() { window.speechSynthesis.resume(); setPaused(false) }
  function stop() { window.speechSynthesis.cancel(); setPlaying(false); setPaused(false); setProgress(0) }


  var barHeights = [8, 14, 20, 14, 8]

  return (
    <div style={{
      padding: '14px 18px',
      background: 'rgba(45,212,191,0.04)',
      border: '1px solid rgba(45,212,191,0.2)',
      borderRadius: 'var(--radius)',
      marginBottom: 14,
    }}>
      <style>{'\n        @keyframes wave {\n          0%   { transform: scaleY(0.5); }\n          100% { transform: scaleY(1.5); }\n        }\n      '}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {/* Left — waveform + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
            {barHeights.map(function (h, i) {
              return (
                <div key={i} style={{
                  width: 4,
                  height: (playing && !paused) ? h + 'px' : '5px',
                  background: (playing && !paused) ? 'var(--teal)' : 'var(--text-2)',
                  borderRadius: 2,
                  transition: 'height 0.3s ease',
                  transformOrigin: 'center',
                  animation: (playing && !paused) ? ('wave ' + (0.4 + i * 0.12) + 's ease-in-out infinite alternate') : 'none',
                }} />
              )
            })}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>
              NADI VOICE NARRATOR
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
              {playing && !paused ? 'Speaking intelligence brief...' : paused ? 'Paused' : 'Click to hear full AI narration of this report'}
            </div>
          </div>
        </div>

        {/* Right — controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!playing && (
            <button onClick={speak} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              background: 'rgba(45,212,191,0.12)',
              border: '1px solid rgba(45,212,191,0.35)',
              borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--teal)',
            }}>
              🔊 Listen to Brief
            </button>
          )}
          {playing && !paused && (
            <button onClick={pause} style={{
              padding: '7px 16px',
              background: 'rgba(252,211,77,0.1)',
              border: '1px solid rgba(252,211,77,0.3)',
              borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--amber)',
            }}>
              ⏸ Pause
            </button>
          )}
          {playing && paused && (
            <button onClick={resume} style={{
              padding: '7px 16px',
              background: 'rgba(45,212,191,0.12)',
              border: '1px solid rgba(45,212,191,0.35)',
              borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--teal)',
            }}>
              ▶ Resume
            </button>
          )}
          {playing && (
            <button onClick={stop} style={{
              padding: '7px 16px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--red)',
            }}>
              ⏹ Stop
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {playing && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 3, background: 'var(--bg-float)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: progress + '%',
              background: 'var(--teal)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-2)', marginTop: 4, fontFamily: 'var(--f-mono)' }}>
            {progress}% complete
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────
export default function IntelligenceReport({ report: r, keyword, marketSize, fullResult }) {
  var [expanded, setExpanded] = useState(false)
  var [deckLoading, setDeckLoading] = useState(false)

  if (!r) return null

  async function handleDeckExport() {
    if (!fullResult || deckLoading) return
    setDeckLoading(true)
    try {
      await downloadPitchDeck(fullResult)
    } catch (e) {
      alert('Pitch deck export failed: ' + e.message)
    } finally {
      setDeckLoading(false)
    }
  }

  return (
    <div>

      {/* ── 1. Verdict + export buttons ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
        padding: 18,
        background: 'var(--bg-float)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius)',
        marginBottom: 16,
      }}>
        {/* Left — verdict */}
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Opportunity Verdict — {keyword}</div>
          <VerdictChip verdict={r.verdict} />
          {r.confidence_level && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 7 }}>
              Confidence: <span style={{ color: 'var(--text-1)' }}>{r.confidence_level}</span>
            </div>
          )}
        </div>

        {/* Right — market TAM + buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {marketSize && (
            <div style={{ textAlign: 'right' }}>
              <div className="label" style={{ marginBottom: 3 }}>Market TAM</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
                {'\u20B9'}{marketSize.tam}Cr
              </div>
              <div className="label" style={{ marginTop: 2 }}>{marketSize.horizon}</div>
            </div>
          )}

          {fullResult && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>

              {/* PDF export */}
              <button
                className="pdf-btn"
                onClick={function () { exportReportToPDF(fullResult) }}
                title="Export full intelligence report as PDF"
              >
                {'\uD83D\uDCC4'} Export PDF
              </button>

              {/* Pitch deck */}
              <button
                className="pdf-btn"
                data-pitchdeck-btn="true"
                style={{
                  background: 'rgba(45,212,191,0.08)',
                  borderColor: 'rgba(45,212,191,0.3)',
                  color: 'var(--teal)',
                  opacity: deckLoading ? 0.6 : 1,
                  cursor: deckLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleDeckExport}
                disabled={deckLoading}
                title="Download 14-slide investor pitch deck as PowerPoint"
              >
                {deckLoading ? '\u29F3 Building...' : '\uD83D\uDCCA Pitch Deck (.pptx)'}
              </button>

            </div>
          )}
        </div>
      </div>

      {/* ── 2. Audio narrator ── */}
      <AudioNarrator keyword={keyword} r={r} marketSize={marketSize} />

      {/* ── 3. Action timeline ── */}
      {r.action_timeline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 16px',
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: 'var(--radius)',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{'\u23F1'}</span>
          <div>
            <div className="label" style={{ color: 'var(--gold)', marginBottom: 2 }}>Action Timeline</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{r.action_timeline}</div>
          </div>
        </div>
      )}

      {/* ── 4. Always-visible report sections ── */}
      <Block label="Executive Summary" content={r.executive_summary} accent="var(--gold)" />
      <Block label="Why Now — India Timing" content={r.why_now} accent="var(--teal)" className="teal" />
      <Block label="Signal Evidence" content={r.signal_evidence} accent="#4A90D9" className="teal" />

      {/* ── 5. Expanded sections ── */}
      {expanded && (
        <div className="anim-up">
          <Block label="Target Consumer Profile" content={r.target_consumer} accent="var(--gold)" />
          <Block label="Market Gap" content={r.market_gap} accent="var(--teal)" className="teal" />
          <Block label="Product Opportunity" content={r.product_opportunity} accent="var(--gold)" />
          <Block label="Go-to-Market (90 Days)" content={r.go_to_market} accent="var(--teal)" className="teal" />
          <Block label="Revenue Model" content={r.revenue_model} accent="var(--gold)" />
          <Block label="Competitive Moat" content={r.competitive_moat} accent="#9B59B6" />
          <Block label="Risk Assessment" content={r.risk_assessment} accent="var(--red)" className="red" />
        </div>
      )}

      {/* ── 6. Expand/collapse ── */}
      <button
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
        onClick={function () { setExpanded(function (e) { return !e }) }}
      >
        {expanded ? '\u25B2 Collapse Report' : '\u25BC Expand Full Brief'}
      </button>

    </div>
  )
}