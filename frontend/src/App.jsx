import { useState } from 'react'
import Header from './components/Header.jsx'
import RadarScan from './components/RadarScan.jsx'
import AnalyzeSingle from './components/AnalyzeSingle.jsx'
import ModelExplainer from './components/ModelExplainer.jsx'
import Onboarding from './components/Onboarding.jsx'

const TABS = [
  { id: 'radar', label: 'Radar Scan' },
  { id: 'analyze', label: 'Deep Analyze' },
  { id: 'model', label: 'DNA Model' },
]

export default function App() {
  const [tab, setTab] = useState('radar')

  return (
    <>
      <Onboarding />
      <div className="grid-bg" />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '32px 0 80px' }}>
          <div className="container">
            <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border-dim)' }}>
              <div className="label" style={{ marginBottom: 8 }}>India Wellness Intelligence Platform</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                  Identify ₹30Cr+ D2C opportunities <strong style={{ color: 'var(--text-1)' }}>6 months</strong> before they go mainstream —
                  powered by DNA Trend Fingerprinting™ across 1,000+ live data sources.
                </p>
              </div>
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
            NADI v2.0 — Neural Ayurvedic &amp; Digital Intelligence
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
            Reddit · YouTube · Google Trends · PubMed · Amazon India · News RSS
          </span>
        </footer>
      </div>
    </>
  )
}