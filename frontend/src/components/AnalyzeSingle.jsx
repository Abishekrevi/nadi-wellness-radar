import { useState } from 'react'
import FadDetector from './FadDetector.jsx'
import EmailReport from './EmailReport.jsx'
import ProductNameGenerator from './ProductNameGenerator.jsx'
import SocialMediaGenerator from './SocialMediaGenerator.jsx'
import { WatchButton } from './Watchlist.jsx'
import ReportChat from './ReportChat.jsx'
import IndiaHeatmap from './IndiaHeatmap.jsx'
import ScoreBadge from './ScoreBadge.jsx'
import KeywordSuggestions from './KeywordSuggestions.jsx'
import axios from 'axios'
import ScoreRing from './ScoreRing.jsx'
import TrendChart from './TrendChart.jsx'
import DNAFingerprint from './DNAFingerprint.jsx'
import IntelligenceReport from './IntelligenceReport.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

const EXAMPLES = [
  'berberine supplement India',
  "lion's mane mushroom India",
  'sea moss India',
  'myo-inositol PCOS India',
  'castor oil hair India',
  'cold plunge therapy India',
  'NMN anti-aging India',
  'postbiotic skincare India',
]

function classBadge(label = '') {
  const l = label.toUpperCase()
  if (l.includes('BREAKOUT')) return 'badge-breakout'
  if (l.includes('EMERGING')) return 'badge-emerging'
  if (l.includes('NASCENT')) return 'badge-nascent'
  if (l.includes('FAD')) return 'badge-fad'
  return 'badge-noise'
}

export default function AnalyzeSingle({ watchlist }) {
  const [kw, setKw] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyze = async (keyword) => {
    const target = (keyword || kw).trim()
    if (!target) return
    if (keyword) setKw(keyword)
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await axios.post(`${API_URL}/api/analyze`, { keyword: target }, { timeout: 90000 })
      setResult(r.data)
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Analysis failed')
    } finally { setLoading(false) }
  }

  return (
    <div>
      {/* Intro */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28, marginBottom: 8, lineHeight: 1.2 }}>
          <span style={{ color: 'var(--gold)' }}>Deep Analyze</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — full DNA fingerprint for any signal</span>
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 600, lineHeight: 1.7 }}>
          Enter any wellness ingredient, practice, or product category. Live data is fetched from all sources and a founder-grade opportunity brief is generated — grounded in real signals only.
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="text" value={kw} onChange={e => setKw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analyze()}
          placeholder="e.g. berberine supplement India"
          style={{ fontSize: 13, flex: 1 }}
        />
        <button className="btn btn-primary" onClick={() => analyze()} disabled={loading || !kw.trim()} style={{ height: 42 }}>
          {loading ? '⟳ Analyzing...' : '🧬 Analyze'}
        </button>
      </div>

      {/* Example chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 32 }}>
        <span className="label" style={{ alignSelf: 'center' }}>Try:</span>
        {EXAMPLES.map(e => (
          <button key={e} className="btn btn-ghost"
            style={{ fontSize: 10, padding: '4px 12px', textTransform: 'none', letterSpacing: 0 }}
            onClick={() => { setKw(e); analyze(e) }} disabled={loading}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Keyword suggestions */}
      <KeywordSuggestions keyword={kw} onSelect={(s) => { setKw(s); analyze(s) }} disabled={loading} />

      {/* Loading */}
      {loading && (
        <div className="card scan-container" style={{ padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: 'var(--gold)', marginBottom: 8 }}>
            🧬 Fingerprinting: <em style={{ color: 'var(--text-1)' }}>{kw}</em>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 24 }}>
            Scanning Reddit · YouTube · Google Trends · PubMed · Amazon India · News
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['Reddit', 'YouTube', 'Trends', 'PubMed', 'Amazon'].map((s, i) => (
              <div key={s} className="source-chip" style={{ animation: `pulse-ring 1.8s infinite`, animationDelay: `${i * 0.3}s` }}>
                <div className="dot" />
                {s}
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

      {/* Result */}
      {result && !loading && (
        <div className="anim-up">
          {/* Score header */}
          <div className="card card-gold" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ScoreRing score={result.momentumAccelerationScore} size={90} />
              <div style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: 6 }}>DNA Fingerprint Complete</div>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 8 }}>
                  {result.keyword}
                </h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`badge ${classBadge(result.classification?.label)}`}>
                    {result.classification?.emoji} {result.classification?.label}
                  </span>
                  <span className="badge badge-gold">{result.timeToMainstream}</span>
                  {result.dataQuality && (
                    <span className="badge" style={{ borderColor: result.dataQuality.color, color: result.dataQuality.color }}>
                      Data Quality: {result.dataQuality.grade}
                    </span>
                  )}
                  <span className="badge" style={{ borderColor: 'var(--border-mid)', color: 'var(--text-2)' }}>
                    {result.category}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label" style={{ marginBottom: 4 }}>Market TAM</div>
                <div className="mono" style={{ fontSize: 30, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
                  ₹{result.marketSizePotential?.tam}Cr
                </div>
                <div className="label" style={{ marginTop: 3 }}>{result.marketSizePotential?.horizon}</div>
              </div>
            </div>

            {/* Signal stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 20 }}>
              {[
                { l: 'Reddit', v: result.signals?.reddit || 0, i: '💬' },
                { l: 'YouTube', v: result.signals?.youtube || 0, i: '▶' },
                { l: 'News', v: result.signals?.news || 0, i: '📰' },
                { l: 'Research', v: result.signals?.research || 0, i: '🔬' },
                { l: 'Amazon IN', v: result.signals?.ecommerce || 0, i: '🛒' },
              ].map(s => (
                <div key={s.l} className="stat-box">
                  <div style={{ fontSize: 14, marginBottom: 3 }}>{s.i}</div>
                  <div className="stat-val">{s.v}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts + DNA grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>Google Trends — India (12 months)</div>
              <TrendChart data={result.signals?.searchTrend} height={140} color="var(--gold)" />
              <div className="mono" style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                Search momentum:{' '}
                <span style={{ color: (result.signals?.searchMomentum || 0) >= 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 500 }}>
                  {(result.signals?.searchMomentum || 0) >= 0 ? '+' : ''}{result.signals?.searchMomentum || 0}%
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>DNA Fingerprint — 8 Strands</div>
              <DNAFingerprint
                strands={result.dnaFingerprint?.strands}
                historicalMatch={result.dnaFingerprint?.historicalMatch}
              />
            </div>
          </div>

          {/* Source attribution */}
          {result.sourceAttribution?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 8 }}>Live data sources confirmed</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.sourceAttribution.map(s => (
                  <div key={s.platform} className="source-chip">
                    <div className="dot" />
                    {s.platform}: <strong style={{ color: 'var(--text-1)', marginLeft: 3 }}>{s.mentions}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fad Detector */}
          <FadDetector
            score={result.momentumAccelerationScore}
            strands={result.dnaFingerprint?.strands}
            keyword={result.keyword}
          />

          {/* Intelligence Report */}
          <div className="card" style={{ padding: 24 }}>
            <div className="label" style={{ marginBottom: 16 }}>🤖 AI Intelligence Report — Founder Opportunity Brief</div>
            <IntelligenceReport
              report={result.intelligenceReport}
              keyword={result.keyword}
              marketSize={result.marketSizePotential}
              fullResult={result}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {watchlist && <WatchButton result={result} watchlist={watchlist} />}
              <EmailReport result={result} />
              <ProductNameGenerator keyword={result.keyword} report={result.intelligenceReport} />
              <SocialMediaGenerator keyword={result.keyword} result={result} />
            </div>
            <ScoreBadge result={result} />
            <IndiaHeatmap keyword={result.keyword} score={result.momentumAccelerationScore} />
            <ReportChat result={result} />
          </div>
        </div>
      )}
    </div>
  )
}