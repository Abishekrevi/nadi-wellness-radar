import { useState } from 'react'
import Header from './components/Header.jsx'
import RadarScan from './components/RadarScan.jsx'
import AnalyzeSingle from './components/AnalyzeSingle.jsx'
import ModelExplainer from './components/ModelExplainer.jsx'
import TrendComparison from './components/TrendComparison.jsx'
import Onboarding from './components/Onboarding.jsx'
import { LangProvider, LangToggle, useLang, TRANSLATIONS } from './components/LangToggle.jsx'

function AppInner() {
  const [tab, setTab] = useState('radar')
  const { lang } = useLang()
  const T = TRANSLATIONS[lang]

  const TABS = [
    { id: 'radar', label: T.tabRadar },
    { id: 'analyze', label: T.tabAnalyze },
    { id: 'model', label: T.tabModel },
    { id: 'compare', label: T.tabCompare },
  ]

  return (
    <>
      <Onboarding />
      <div className="grid-bg" />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '32px 0 80px' }}>
          <div className="container">
            <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="label" style={{ marginBottom: 8 }}>{T.heroTitle}</div>
                <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 640 }}>
                  {T.heroBody}
                </p>
              </div>
              <LangToggle />
            </div>

            <div className="tab-bar" style={{ marginBottom: 32 }}>
              {TABS.map(t => (
                <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'radar' && <RadarScan />}
            {tab === 'analyze' && <AnalyzeSingle />}
            {tab === 'model' && <ModelExplainer />}
            {tab === 'compare' && <TrendComparison />}
          </div>
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-dim)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          background: 'var(--bg-raised)',
        }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
            NADI v2.0 — {T.appTagline}
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {T.footerSources}
          </span>
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