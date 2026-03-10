import { useEffect, useState } from 'react'
import axios from 'axios'
import TrendTicker from './TrendTicker.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Header() {
  var [apiStatus, setApiStatus] = useState(null)

  useEffect(function () {
    axios.get(API_URL + '/api/health').then(function (r) { setApiStatus(r.data) }).catch(function () { })
  }, [])

  return (
    <>
      <header style={{
        borderBottom: '1px solid rgba(245,200,66,0.12)',
        background: 'rgba(5,8,16,0.95)',
        backdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
              <path d="M4 2 C4 2 16 11 28 2" stroke="#F5C842" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4 10 C4 10 16 19 28 10" stroke="#00E5CC" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4 18 C4 18 16 27 28 18" stroke="#F5C842" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4 26 C4 26 16 35 28 26" stroke="#00E5CC" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4 34 C4 34 16 43 28 34" stroke="#F5C842" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="4" y1="2" x2="4" y2="40" stroke="#F5C842" strokeWidth="1.5" opacity="0.3" />
              <line x1="28" y1="2" x2="28" y2="40" stroke="#00E5CC" strokeWidth="1.5" opacity="0.3" />
              <circle cx="4" cy="6" r="2.5" fill="#F5C842" />
              <circle cx="28" cy="14" r="2.5" fill="#00E5CC" />
              <circle cx="4" cy="22" r="2.5" fill="#F5C842" />
              <circle cx="28" cy="30" r="2.5" fill="#00E5CC" />
            </svg>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 800,
                  fontSize: 28,
                  background: 'linear-gradient(135deg, #FFE066 0%, #F5C842 60%, #C49A1E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                }}>
                  NADI
                </span>
                <span style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-3)',
                  letterSpacing: '0.1em',
                  background: 'rgba(245,200,66,0.1)',
                  border: '1px solid rgba(245,200,66,0.2)',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}>
                  v3.0
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--text-3)',
                letterSpacing: '0.18em',
                lineHeight: 1,
                marginTop: 4,
                textTransform: 'uppercase',
              }}>
                Neural Ayurvedic & Digital Intelligence
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="pulse-dot" />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.12em' }}>LIVE</span>
            </div>
            <div style={{ padding: '7px 14px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>1,000+</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.12em', marginTop: 3 }}>SOURCES</span>
            </div>
            {apiStatus && (
              <div className="hide-mobile" style={{ display: 'flex', gap: 6 }}>
                {Object.entries(apiStatus.apis || {}).map(function ([name, ok]) {
                  return (
                    <div key={name} style={{ padding: '4px 10px', background: ok ? 'rgba(0,229,204,0.08)' : 'rgba(255,92,92,0.08)', border: '1px solid ' + (ok ? 'rgba(0,229,204,0.2)' : 'rgba(255,92,92,0.2)'), borderRadius: 6, fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, color: ok ? 'var(--teal)' : 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {ok ? '●' : '○'} {name}
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ padding: '6px 12px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius)', fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--text-2)' }}>
              🇮🇳 IN
            </div>
          </div>
        </div>
      </header>
      <TrendTicker />
    </>
  )
}