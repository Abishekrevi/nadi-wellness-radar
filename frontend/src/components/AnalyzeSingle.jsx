import { useState, useEffect } from 'react'
import { AlertButton, useAlerts } from './ScoreAlert.jsx'
import { WatchButton } from './Watchlist.jsx'
import ScoreRing from './ScoreRing.jsx'
import TrendChart from './TrendChart.jsx'
import DNAFingerprint from './DNAFingerprint.jsx'
import IntelligenceReport from './IntelligenceReport.jsx'
import ScoreBadge from './ScoreBadge.jsx'
import KeywordSuggestions from './KeywordSuggestions.jsx'
import FadDetector from './FadDetector.jsx'
import ShareBar from './ShareBar.jsx'
import InvestorOnePager from './InvestorOnePager.jsx'

// Lazy-load the heavy components to prevent import-chain crashes
var LazyComponents = null

function loadLazyComponents() {
  if (LazyComponents) return Promise.resolve()
  return Promise.all([
    import('./EmailReport.jsx'),
    import('./ProductNameGenerator.jsx'),
    import('./SocialMediaGenerator.jsx'),
    import('./PricingIntelligence.jsx'),
    import('./GlobalComparison.jsx'),
    import('./TrendNewsFeed.jsx'),
    import('./CompetitorTracker.jsx'),
    import('./SupplierFinder.jsx'),
    import('./FormulationGuide.jsx'),
    import('./FundingRadar.jsx'),
    import('./ResearchReport.jsx'),
    import('./ReportChat.jsx'),
    import('./IndiaHeatmap.jsx'),
    import('./TrajectoryForecast.jsx'),
  ]).then(function (mods) {
    LazyComponents = {
      EmailReport: mods[0].default,
      ProductNameGenerator: mods[1].default,
      SocialMediaGenerator: mods[2].default,
      PricingIntelligence: mods[3].default,
      GlobalComparison: mods[4].default,
      TrendNewsFeed: mods[5].default,
      CompetitorTracker: mods[6].default,
      SupplierFinder: mods[7].default,
      FormulationGuide: mods[8].default,
      FundingRadar: mods[9].default,
      ResearchReport: mods[10].default,
      ReportChat: mods[11].default,
      IndiaHeatmap: mods[12].default,
      TrajectoryForecast: mods[13].default,
    }
  }).catch(function (e) {
    console.error('Failed to load lazy components:', e)
  })
}

var API_URL = import.meta.env.VITE_API_URL || ''

var EXAMPLES = [
  'berberine supplement India',
  "lion's mane mushroom India",
  'sea moss India',
  'myo-inositol PCOS India',
  'castor oil hair India',
  'NMN anti-aging India',
  'postbiotic skincare India',
]

function classBadge(label) {
  var l = (label || '').toUpperCase()
  if (l.includes('BREAKOUT')) return 'badge-breakout'
  if (l.includes('EMERGING')) return 'badge-emerging'
  if (l.includes('NASCENT')) return 'badge-nascent'
  if (l.includes('FAD')) return 'badge-fad'
  return 'badge-noise'
}

export default function AnalyzeSingle({ watchlist }) {
  var [kw, setKw] = useState('')
  var [loading, setLoading] = useState(false)
  var [result, setResult] = useState(null)
  var [error, setError] = useState(null)
  var [lazyReady, setLazyReady] = useState(false)
  var alertSystem = useAlerts()
  var savedReports = useSavedReports()

  // Pre-load lazy components on mount
  useEffect(function () {
    loadLazyComponents().then(function () { setLazyReady(true) })
  }, [])

  // Handle auto-analyze from other tabs
  useEffect(function () {
    if (window.__nadiAnalyzeKw) {
      var kword = window.__nadiAnalyzeKw
      window.__nadiAnalyzeKw = null
      setKw(kword)
      analyze(kword)
    }
  }, [])

  function analyze(keyword) {
    var target = (keyword || kw || '').trim()
    if (!target) return
    if (keyword) setKw(keyword)
    setLoading(true)
    setError(null)
    setResult(null)

    fetch(API_URL + '/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: target }),
    })
      .then(function (r) { return r.json() })
      .then(function (data) {
        if (data.error) throw new Error(data.message || data.error)
        setResult(data)
      })
      .catch(function (e) {
        setError(e.message || 'Analysis failed. Please try again.')
      })
      .finally(function () {
        setLoading(false)
      })
  }

  var L = LazyComponents

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28, marginBottom: 8, lineHeight: 1.2 }}>
          <span style={{ color: 'var(--gold)' }}>Deep Analyze</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — full DNA fingerprint</span>
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 600, lineHeight: 1.7, fontSize: 14 }}>
          Enter any wellness ingredient, practice, or product. NADI scans all live sources and generates a founder-grade opportunity brief grounded in real signals only.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input
          type="text"
          value={kw}
          onChange={function (e) { setKw(e.target.value) }}
          onKeyDown={function (e) { if (e.key === 'Enter') analyze() }}
          placeholder="e.g. berberine supplement India"
          style={{ fontSize: 14, flex: 1 }}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={function () { analyze() }}
          disabled={loading || !kw.trim()}
          style={{ height: 46, minWidth: 120 }}
        >
          {loading ? '⟳ Scanning...' : '🧬 Analyze'}
        </button>
      </div>

      {/* Example chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28 }}>
        <span className="label" style={{ alignSelf: 'center' }}>Try:</span>
        {EXAMPLES.map(function (ex) {
          return (
            <button
              key={ex}
              className="btn btn-ghost"
              style={{ fontSize: 10, padding: '4px 12px', textTransform: 'none', letterSpacing: 0 }}
              onClick={function () { setKw(ex); analyze(ex) }}
              disabled={loading}
            >
              {ex}
            </button>
          )
        })}
      </div>

      {/* Keyword suggestions */}
      <KeywordSuggestions
        keyword={kw}
        onSelect={function (s) { setKw(s); analyze(s) }}
        disabled={loading}
      />

      {/* Loading state */}
      {loading && (
        <div className="card scan-container" style={{ padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--gold)', marginBottom: 10 }}>
            🧬 Fingerprinting: <em style={{ color: 'var(--text-1)' }}>{kw}</em>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 20 }}>
            Scanning Reddit · YouTube · Google Trends · PubMed · Amazon India · News
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['Reddit', 'YouTube', 'Trends', 'PubMed', 'Amazon', 'News'].map(function (src, i) {
              return (
                <div key={src} className="source-chip" style={{ animationDelay: (i * 0.25) + 's' }}>
                  <div className="dot" style={{ animationDelay: (i * 0.25) + 's' }} />
                  {src}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="card" style={{ borderColor: 'rgba(255,71,87,0.3)', background: 'var(--red-lo)', padding: 16, marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>⚠ {error}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10, fontSize: 11 }} onClick={function () { analyze() }}>
            Try Again
          </button>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="anim-up">

          {/* Score card */}
          <div className="card card-gold" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ScoreRing score={result.momentumAccelerationScore || 0} size={88} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="label" style={{ marginBottom: 6 }}>DNA Fingerprint Complete</div>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 22, marginBottom: 10 }}>
                  {result.keyword}
                </h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {result.classification && (
                    <span className={'badge ' + classBadge(result.classification.label)}>
                      {result.classification.emoji} {result.classification.label}
                    </span>
                  )}
                  {result.timeToMainstream && (
                    <span className="badge badge-gold">{result.timeToMainstream}</span>
                  )}
                  {result.dataQuality && (
                    <span className="badge" style={{ borderColor: result.dataQuality.color, color: result.dataQuality.color }}>
                      Data: {result.dataQuality.grade}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label" style={{ marginBottom: 4 }}>Market TAM</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                  ₹{(result.marketSizePotential && result.marketSizePotential.tam) || '—'}Cr
                </div>
                <div className="label" style={{ marginTop: 3 }}>
                  {(result.marketSizePotential && result.marketSizePotential.horizon) || ''}
                </div>
              </div>
            </div>

            {/* Signal stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginTop: 20 }}>
              {[
                { l: 'Reddit', v: (result.signals && result.signals.reddit) || 0, i: '💬' },
                { l: 'YouTube', v: (result.signals && result.signals.youtube) || 0, i: '▶' },
                { l: 'News', v: (result.signals && result.signals.news) || 0, i: '📰' },
                { l: 'Research', v: (result.signals && result.signals.research) || 0, i: '🔬' },
                { l: 'Amazon IN', v: (result.signals && result.signals.ecommerce) || 0, i: '🛒' },
              ].map(function (s) {
                return (
                  <div key={s.l} className="stat-box">
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{s.i}</div>
                    <div className="stat-val">{s.v}</div>
                    <div className="stat-label">{s.l}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>Google Trends — India (12mo)</div>
              <TrendChart
                data={result.signals && result.signals.searchTrend}
                height={130}
                color="var(--gold)"
              />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                Momentum:{' '}
                <span style={{ color: ((result.signals && result.signals.searchMomentum) || 0) >= 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 600 }}>
                  {((result.signals && result.signals.searchMomentum) || 0) >= 0 ? '+' : ''}
                  {(result.signals && result.signals.searchMomentum) || 0}%
                </span>
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>DNA Fingerprint — 8 Strands</div>
              <DNAFingerprint
                strands={result.dnaFingerprint && result.dnaFingerprint.strands}
                historicalMatch={result.dnaFingerprint && result.dnaFingerprint.historicalMatch}
              />
            </div>
          </div>

          {/* Source attribution */}
          {result.sourceAttribution && result.sourceAttribution.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="label" style={{ marginBottom: 8 }}>Live data sources</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.sourceAttribution.map(function (s) {
                  return (
                    <div key={s.platform} className="source-chip">
                      <div className="dot" />
                      {s.platform}: <strong style={{ color: 'var(--text-1)', marginLeft: 3 }}>{s.mentions}</strong>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fad Detector */}
          <FadDetector
            score={result.momentumAccelerationScore || 0}
            strands={result.dnaFingerprint && result.dnaFingerprint.strands}
            keyword={result.keyword}
          />

          {/* Intelligence Report */}
          <div className="card" style={{ padding: 24, marginTop: 14 }}>
            <div className="label" style={{ marginBottom: 16 }}>🤖 AI Intelligence Report — Founder Opportunity Brief</div>
            <IntelligenceReport
              report={result.intelligenceReport}
              keyword={result.keyword}
              marketSize={result.marketSizePotential}
              fullResult={result}
            />

            {/* Action buttons — only rendered once lazy components are loaded */}
            {lazyReady && L && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {watchlist && <WatchButton result={result} watchlist={watchlist} />}

                <AlertButton keyword={result.keyword} currentScore={result.momentumAccelerationScore || 0} alerts={alertSystem} />
                <L.EmailReport result={result} />
                <L.PricingIntelligence keyword={result.keyword} result={result} />
                <L.GlobalComparison keyword={result.keyword} result={result} />
                <L.TrendNewsFeed keyword={result.keyword} />
                <L.CompetitorTracker keyword={result.keyword} result={result} />
                <L.SupplierFinder keyword={result.keyword} result={result} />
                <L.FormulationGuide keyword={result.keyword} result={result} />
                <L.FundingRadar keyword={result.keyword} result={result} />
                <L.ResearchReport keyword={result.keyword} result={result} />
                <L.ProductNameGenerator keyword={result.keyword} report={result.intelligenceReport} />
                <L.SocialMediaGenerator keyword={result.keyword} result={result} />
              </div>
            )}

            <ScoreBadge result={result} />

            {lazyReady && L && (
              <>
                <L.IndiaHeatmap keyword={result.keyword} score={result.momentumAccelerationScore || 0} />
                <L.TrajectoryForecast keyword={result.keyword} result={result} />
                <L.ReportChat result={result} />
              </>
            )}
            <InvestorOnePager result={result} />
            <ShareBar result={result} />
          </div>

        </div>
      )}
    </div>
  )
}