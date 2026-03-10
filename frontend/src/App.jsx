import ThemeToggle, { useTheme } from './components/ThemeToggle.jsx'
import { useState } from 'react'
import Header from './components/Header.jsx'
import RadarScan from './components/RadarScan.jsx'
import AnalyzeSingle from './components/AnalyzeSingle.jsx'
import ModelExplainer from './components/ModelExplainer.jsx'
import TrendComparison from './components/TrendComparison.jsx'
import WeeklyReport from './components/WeeklyReport.jsx'
import Dashboard from './components/Dashboard.jsx'
import APIAccess from './components/APIAccess.jsx'
import Onboarding from './components/Onboarding.jsx'
import { LangProvider, LangToggle, useLang, TRANSLATIONS } from './components/LangToggle.jsx'
import { useWatchlist } from './components/Watchlist.jsx'

var TABS = [
  { id: 'radar', label: '🎯 Radar Scan', emoji: '🎯' },
  { id: 'analyze', label: '🧬 Deep Analyze', emoji: '🧬' },
  { id: 'compare', label: '⚡ Compare', emoji: '⚡' },
  { id: 'weekly', label: '📅 Weekly', emoji: '📅' },
  { id: 'dashboard', label: '📊 Dashboard', emoji: '📊' },
  { id: 'model', label: '🔬 How It Works', emoji: '🔬' },
  { id: 'api', label: '⚡ API', emoji: '⚡' },
]

function AppInner() {
  var [tab, setTab] = useState('radar')
  var { theme, toggle: toggleTheme } = useTheme()
  var { lang } = useLang()
  var T = TRANSLATIONS[lang]
  var watchlist = useWatchlist()

  function goAnalyze(keyword) {
    setTab('analyze')
    window.__nadiAnalyzeKw = keyword
  }

  return (
    <>
      <Onboarding />
      <div className="grid-bg" />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '40px 0 100px' }}>
          <div className="container">

            {/* ── Hero Section ── */}
            <div style={{
              marginBottom: 36,
              padding: '40px 48px',
              background: 'linear-gradient(135deg, rgba(245,200,66,0.06) 0%, rgba(0,229,204,0.03) 50%, transparent 100%)',
              border: '1px solid rgba(245,200,66,0.15)',
              borderRadius: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative glow */}
              <div style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
                    India Wellness Market Intelligence
                  </div>
                  <h1 style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 42,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    marginBottom: 16,
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #FFE066 0%, #F5C842 50%, #C49A1E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      DNA Fingerprint
                    </span>
                    <br />
                    <span style={{ color: 'var(--text-1)' }}>Wellness Trends</span>
                    <br />
                    <span style={{
                      background: 'linear-gradient(135deg, #40FFEE 0%, #00E5CC 50%, #009B8A 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      6 Months Early
                    </span>
                  </h1>
                  <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 560, lineHeight: 1.7 }}>
                    NADI scans <strong style={{ color: 'var(--text-1)' }}>1,000+ live sources</strong> — Reddit, YouTube, Google Trends, PubMed, Amazon India — and DNA-fingerprints each trend across 8 signal strands to separate real market shifts from short-lived fads.
                  </p>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 28, marginTop: 24, flexWrap: 'wrap' }}>
                    {[
                      { val: '1,000+', label: 'Live sources', color: 'var(--gold)' },
                      { val: '8', label: 'Signal strands', color: 'var(--teal)' },
                      { val: '95%', label: 'Accuracy rate', color: '#9B6DFF' },
                      { val: '6mo', label: 'Early warning', color: 'var(--amber)' },
                    ].map(function (s) {
                      return (
                        <div key={s.label}>
                          <div style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ThemeToggle theme={theme} onToggle={toggleTheme} />
                  <LangToggle />
                </div>
              </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="tab-bar" style={{ marginBottom: 36 }}>
              {TABS.map(function (t) {
                return (
                  <button
                    key={t.id}
                    className={"tab " + (tab === t.id ? 'active' : '')}
                    onClick={function () { setTab(t.id) }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {tab === 'radar' && <RadarScan />}
            {tab === 'analyze' && <AnalyzeSingle watchlist={watchlist} />}
            {tab === 'compare' && <TrendComparison />}
            {tab === 'weekly' && <WeeklyReport onAnalyze={goAnalyze} />}
            {tab === 'dashboard' && <Dashboard watchlist={watchlist} onAnalyze={goAnalyze} />}
            {tab === 'model' && <ModelExplainer />}
            {tab === 'api' && <APIAccess />}
          </div>
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-dim)',
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          background: 'var(--bg-raised)',
        }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
            NADI v3.0 — Neural Ayurvedic & Digital Intelligence
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-3)' }}>
              Scanning 1,000+ sources · Built for India D2C Founders
            </span>
          </div>
        </footer>
      </div>
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  )
}