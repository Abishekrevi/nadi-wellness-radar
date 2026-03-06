import { useState, useRef } from 'react'
import ScoreRing from './ScoreRing.jsx'
import TrendChart from './TrendChart.jsx'
import DNAFingerprint from './DNAFingerprint.jsx'
import IntelligenceReport from './IntelligenceReport.jsx'
import { exportReportToPDF } from '../utils/pdfExport.js'

const API_URL = import.meta.env.VITE_API_URL || ''

const PRESETS = [
  "berberine supplement India",
  "lion's mane mushroom India",
  "myo-inositol PCOS India",
  "sea moss benefits India",
  "castor oil hair growth India",
  "NMN supplement India",
]

function classBadge(label = '') {
  const l = label.toUpperCase()
  if (l.includes('BREAKOUT')) return 'badge-breakout'
  if (l.includes('EMERGING')) return 'badge-emerging'
  if (l.includes('NASCENT')) return 'badge-nascent'
  if (l.includes('FAD')) return 'badge-fad'
  return 'badge-noise'
}

function TrendCard({ result, rank, selected, onSelect }) {
  const { keyword, momentumAccelerationScore: score, classification,
    signals, timeToMainstream, marketSizePotential,
    intelligenceReport: r, dataQuality } = result

  const verdictClass =
    (r?.verdict || '').includes('BUY') ? 'badge-buy' :
      (r?.verdict || '').includes('WATCH') ? 'badge-watch' : 'badge-pass'

  return (
    <div
      className={`card ${selected ? 'card-gold' : ''}`}
      style={{
        cursor: 'pointer',
        padding: 20,
        transition: 'all 0.2s',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}
      onClick={onSelect}
    >
      {/* Top row */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ScoreRing score={score} size={60} />
          <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>#{rank}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--text-1)',
            lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {keyword}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span className={`badge ${classBadge(classification?.label)}`}>
              {classification?.emoji} {classification?.label}
            </span>
            {r?.verdict && <span className={`badge ${verdictClass}`}>{r.verdict.split('—')[0].trim()}</span>}
            {dataQuality && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)', borderColor: 'var(--border-dim)' }}>
                Data: {dataQuality.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Signal counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
        {[
          { l: 'Reddit', v: signals?.reddit || 0, i: '💬' },
          { l: 'YouTube', v: signals?.youtube || 0, i: '▶' },
          { l: 'News', v: signals?.news || 0, i: '📰' },
          { l: 'Research', v: signals?.research || 0, i: '🔬' },
        ].map(s => (
          <div key={s.l} className="stat-box" style={{ padding: '8px 6px' }}>
            <div style={{ fontSize: 13, marginBottom: 2 }}>{s.i}</div>
            <div className="stat-val" style={{ fontSize: 15 }}>{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Metrics row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '8px 10px',
        background: 'var(--bg-float)',
        border: '1px solid var(--border-dim)',
        borderRadius: 'var(--radius)',
        marginBottom: 10,
      }}>
        <div>
          <div className="label">To Mainstream</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--teal)', marginTop: 2 }}>{timeToMainstream}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label">TAM</div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500, marginTop: 2 }}>
            ₹{marketSizePotential?.tam || '?'}Cr
          </div>
        </div>
      </div>

      {/* Insight teaser */}
      {r?.executive_summary && (
        <div style={{
          fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {r.executive_summary}
        </div>
      )}

      <div className="label" style={{ textAlign: 'center', marginTop: 10, color: selected ? 'var(--gold)' : 'var(--text-3)' }}>
        {selected ? '▲ close' : '▼ full analysis'}
      </div>
    </div>
  )
}

export default function RadarScan() {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState([]) // [{keyword, status}]
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedKw, setSelectedKw] = useState(null)
  const [customKws, setCustomKws] = useState('')
  const esRef = useRef(null)

  const runScan = (keywords = null) => {
    if (esRef.current) { esRef.current.abort?.(); esRef.current = null }
    setScanning(true); setError(null); setResults(null); setSelectedKw(null); setProgress([])

    const targetKws = keywords || PRESETS

    // Use fetch + ReadableStream for SSE (more reliable than EventSource for POST)
    const ctrl = new AbortController()
    esRef.current = ctrl

    fetch(`${API_URL}/api/radar-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: targetKws, limit: targetKws.length }),
      signal: ctrl.signal,
    })
      .then(async res => {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const parts = buffer.split('\n\n')
          buffer = parts.pop()

          for (const chunk of parts) {
            const eventLine = chunk.match(/^event: (.+)$/m)
            const dataLine = chunk.match(/^data: (.+)$/m)
            if (!eventLine || !dataLine) continue

            const event = eventLine[1].trim()
            let data
            try { data = JSON.parse(dataLine[1]) } catch { continue }

            if (event === 'start') {
              setProgress(data.keywords.map(k => ({ keyword: k, status: 'pending' })))
            } else if (event === 'progress') {
              setProgress(prev => prev.map((p, i) => i === data.index ? { ...p, status: data.status } : p))
            } else if (event === 'result') {
              setProgress(prev => prev.map((p, i) => i === data.index ? { ...p, status: 'done', score: data.score } : p))
            } else if (event === 'error') {
              setProgress(prev => prev.map((p, i) => i === data.index ? { ...p, status: 'error' } : p))
            } else if (event === 'complete') {
              setResults(data)
              setScanning(false)
            }
          }
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Scan failed')
          setScanning(false)
        }
      })
  }

  const handleCustomScan = () => {
    const kws = customKws.split('\n').map(k => k.trim()).filter(Boolean)
    if (kws.length) runScan(kws)
  }

  const selectedResult = results?.results?.find(r => r.keyword === selectedKw)

  return (
    <div>
      {/* Intro */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28, marginBottom: 8, lineHeight: 1.2 }}>
          <span style={{ color: 'var(--gold)' }}>Wellness Radar</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — identify breakout trends 6 months early</span>
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 680, lineHeight: 1.7 }}>
          NADI scans <strong style={{ color: 'var(--text-1)' }}>1,000+ live sources</strong> — Reddit, YouTube, Google Trends, PubMed, Amazon India.
          Each trend is DNA-fingerprinted across 8 signal strands to distinguish real market shifts from fads.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="label" style={{ marginBottom: 10 }}>Custom keywords — one per line</div>
          <textarea
            value={customKws}
            onChange={e => setCustomKws(e.target.value)}
            rows={4}
            placeholder={"berberine supplement India\nlion's mane mushroom India\nmyo-inositol PCOS India"}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleCustomScan} disabled={scanning || !customKws.trim()}>
              {scanning ? '⟳ Scanning...' : '⚡ Scan Custom'}
            </button>
            <button className="btn btn-ghost" onClick={() => runScan()} disabled={scanning}>
              {scanning ? '⟳ Running...' : '🎯 Default Scan'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="label" style={{ marginBottom: 10 }}>Quick-add keywords</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {PRESETS.slice(0, 5).map(kw => (
              <button key={kw} className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', fontSize: 10, padding: '5px 10px', textTransform: 'none', letterSpacing: 0 }}
                onClick={() => setCustomKws(p => p ? p + '\n' + kw : kw)}
              >
                + {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live progress */}
      {scanning && progress.length > 0 && (
        <div className="card scan-container" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, color: 'var(--gold)', marginBottom: 4 }}>
            🧬 DNA Fingerprinting in progress
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 20 }}>
            Scanning Reddit · YouTube · Google Trends · PubMed · Amazon India
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {progress.map((p, i) => (
              <div key={p.keyword} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, flexShrink: 0, textAlign: 'center', fontSize: 13 }}>
                  {p.status === 'done' ? '✅' :
                    p.status === 'error' ? '❌' :
                      p.status === 'scanning' || p.status === 'cached' ? '⟳' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, color: p.status === 'done' ? 'var(--text-1)' : 'var(--text-3)' }}>
                    {p.keyword}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: p.status === 'done' ? '100%' : p.status === 'scanning' ? '60%' : p.status === 'cached' ? '80%' : '0%'
                      }} />
                    </div>
                  </div>
                </div>
                {p.score !== undefined && (
                  <div className="mono" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500, flexShrink: 0 }}>
                    {p.score}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'var(--red-lo)', padding: 16, marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>⚠ {error}</div>
        </div>
      )}

      {/* Results */}
      {results && !scanning && (
        <div className="anim-up">
          {/* Summary bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24,
            padding: '14px 20px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius)',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Keywords scanned', val: results.keywords_analyzed, color: 'var(--text-1)' },
              { label: 'Emerging trends', val: results.trends_identified, color: 'var(--teal)' },
              { label: 'Top keyword', val: results.topTrend?.keyword || '—', color: 'var(--gold)' },
              { label: 'Top MAS score', val: results.topTrend?.momentumAccelerationScore || '—', color: 'var(--gold)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="label">{m.label}</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 500, color: m.color }}>{m.val}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {results.topTrend && (
                <button className="pdf-btn" onClick={() => exportReportToPDF(results.topTrend)}>
                  📄 Export Top Pick
                </button>
              )}
              {results.topTrend && (
                <button
                  className="pdf-btn"
                  style={{ background: 'rgba(45,212,191,0.1)', borderColor: 'rgba(45,212,191,0.3)', color: 'var(--teal)' }}
                  onClick={() => downloadPitchDeck(results.topTrend)}
                >
                  📊 Pitch Deck
                </button>
              )}
              <button className="btn btn-ghost" style={{ fontSize: 10 }} onClick={() => runScan()}>
                ↺ Refresh
              </button>
            </div>
          </div>

          {/* Trend grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {results.results.map((r, i) => (
              <TrendCard
                key={r.keyword}
                result={r} rank={i + 1}
                selected={selectedKw === r.keyword}
                onSelect={() => setSelectedKw(selectedKw === r.keyword ? null : r.keyword)}
              />
            ))}
          </div>

          {/* Expanded detail panel */}
          {selectedResult && (
            <div className="card card-gold anim-up" style={{ marginTop: 20, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <ScoreRing score={selectedResult.momentumAccelerationScore} size={80} />
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Deep Analysis</div>
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 22, marginBottom: 8 }}>
                    {selectedResult.keyword}
                  </h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${classBadge(selectedResult.classification?.label)}`}>
                      {selectedResult.classification?.emoji} {selectedResult.classification?.label}
                    </span>
                    <span className="badge badge-gold">{selectedResult.timeToMainstream}</span>
                    {selectedResult.dataQuality && (
                      <span className="badge" style={{ borderColor: selectedResult.dataQuality.color, color: selectedResult.dataQuality.color }}>
                        Data {selectedResult.dataQuality.grade} ({selectedResult.dataQuality.label})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Google Trends — India (12 months)</div>
                  <TrendChart data={selectedResult.signals?.searchTrend} height={130}
                    color={selectedResult.momentumAccelerationScore >= 60 ? 'var(--teal)' : 'var(--gold)'} />
                  <div className="mono" style={{ fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                    Search momentum:{' '}
                    <span style={{ color: (selectedResult.signals?.searchMomentum || 0) >= 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 500 }}>
                      {(selectedResult.signals?.searchMomentum || 0) >= 0 ? '+' : ''}{selectedResult.signals?.searchMomentum || 0}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="label" style={{ marginBottom: 10 }}>DNA Fingerprint — 8 Strands</div>
                  <DNAFingerprint
                    strands={selectedResult.dnaFingerprint?.strands}
                    historicalMatch={selectedResult.dnaFingerprint?.historicalMatch}
                  />
                </div>
              </div>

              {/* Source attribution */}
              {selectedResult.sourceAttribution?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="label" style={{ marginBottom: 8 }}>Live data sources used</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {selectedResult.sourceAttribution.map(s => (
                      <div key={s.platform} className="source-chip">
                        <div className="dot" />
                        {s.platform}: <strong style={{ color: 'var(--text-1)' }}>{s.mentions}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intelligence Report */}
              <div className="divider-gold divider" />
              <div className="label" style={{ marginBottom: 14 }}>🤖 AI Intelligence Report</div>
              <IntelligenceReport
                report={selectedResult.intelligenceReport}
                keyword={selectedResult.keyword}
                marketSize={selectedResult.marketSizePotential}
                fullResult={selectedResult}
              />

              {/* Reddit posts */}
              {selectedResult.sourceData?.reddit?.topPosts?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div className="label" style={{ marginBottom: 10 }}>Reddit — top organic discussions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {selectedResult.sourceData.reddit.topPosts.slice(0, 4).map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'block', padding: '10px 12px',
                          background: 'var(--bg-float)', border: '1px solid var(--border-dim)',
                          borderRadius: 'var(--radius)', textDecoration: 'none',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-dim)'}
                      >
                        <div className="mono" style={{ fontSize: 9, color: 'var(--gold)', marginBottom: 4 }}>
                          r/{p.subreddit} · ↑{p.score}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45 }}>
                          {p.title?.substring(0, 90)}{p.title?.length > 90 ? '…' : ''}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!scanning && !results && !error && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>🧬</div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, marginBottom: 8, color: 'var(--text-2)' }}>
            Ready to scan the Indian wellness market
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 28 }}>
            Live data fetched from Reddit, YouTube, Google Trends, PubMed, Amazon India
          </div>
          <button className="btn btn-primary" onClick={() => runScan()}>
            🎯 Launch Radar Scan
          </button>
        </div>
      )}
    </div>
  )
}
