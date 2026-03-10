import { useEffect, useState } from 'react'
import axios from 'axios'
import TrendTicker from './TrendTicker.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Header() {
  const [apiStatus, setApiStatus] = useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/api/health`).then(r => setApiStatus(r.data)).catch(() => { })
  }, [])

  return (
    <> style={{
      borderBottom: '1px solid var(--border-dim)',
      background: 'rgba(7,11,15,0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        gap: 20,
      }}>
        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* DNA icon */}
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
            <path d="M4 2 C4 2 14 9 24 2" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M4 9 C4 9 14 16 24 9" stroke="#2DD4BF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M4 16 C4 16 14 23 24 16" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M4 23 C4 23 14 30 24 23" stroke="#2DD4BF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M4 30 C4 30 14 37 24 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="4" y1="2" x2="4" y2="34" stroke="#C9A84C" strokeWidth="1" opacity="0.35" />
            <line x1="24" y1="2" x2="24" y2="34" stroke="#2DD4BF" strokeWidth="1" opacity="0.35" />
            <circle cx="4" cy="5.5" r="2" fill="#C9A84C" />
            <circle cx="24" cy="12.5" r="2" fill="#2DD4BF" />
            <circle cx="4" cy="19.5" r="2" fill="#C9A84C" />
            <circle cx="24" cy="26.5" r="2" fill="#2DD4BF" />
          </svg>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--f-display)',
                fontWeight: 900,
                fontSize: 22,
                color: 'var(--gold)',
                letterSpacing: '0.06em',
                lineHeight: 1,
              }}>
                NADI
              </span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
                v2.0
              </span>
            </div>
            <div className="mono" style={{
              fontSize: 9,
              color: 'var(--text-3)',
              letterSpacing: '0.14em',
              lineHeight: 1,
              marginTop: 3,
            }}>
              NEURAL AYURVEDIC &amp; DIGITAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div className="pulse-dot" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em' }}>
              LIVE
            </span>
          </div>

          {/* Source count */}
          <div style={{
            padding: '5px 12px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
              1,000+
            </span>
            <span className="mono" style={{ fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: 2 }}>
              SOURCES
            </span>
          </div>

          {/* API status pills */}
          {apiStatus && (
            <div className="hide-mobile" style={{ display: 'flex', gap: 6 }}>
              {Object.entries(apiStatus.apis || {}).map(([name, ok]) => (
                <div key={name} style={{
                  padding: '3px 8px',
                  background: ok ? 'rgba(45,212,191,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${ok ? 'rgba(45,212,191,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  color: ok ? 'var(--teal)' : 'var(--red)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {ok ? '●' : '○'} {name}
                </div>
              ))}
            </div>
          )}

          {/* India badge */}
          <div style={{
            padding: '5px 10px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: 'var(--text-2)',
          }}>
            🇮🇳 IN
          </div>
        </div>
      </div>
    </header >
      <TrendTicker />
  </>
  )
}