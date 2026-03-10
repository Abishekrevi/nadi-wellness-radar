import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const SEED_TICKERS = [
    { keyword: 'Berberine India', score: 78, delta: +5, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Lion\'s Mane India', score: 72, delta: +3, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Ashwagandha Gummies', score: 81, delta: +8, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Sea Moss India', score: 65, delta: +2, label: 'EMERGING', color: '#C9A84C' },
    { keyword: 'Shilajit Supplement', score: 69, delta: +4, label: 'EMERGING', color: '#C9A84C' },
    { keyword: 'Moringa Powder India', score: 58, delta: -1, label: 'NASCENT', color: '#FCD34D' },
    { keyword: 'NMN Anti-Aging India', score: 74, delta: +6, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Collagen Peptides IN', score: 61, delta: +1, label: 'EMERGING', color: '#C9A84C' },
    { keyword: 'Myo-Inositol PCOS', score: 77, delta: +9, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Postbiotic Skincare IN', score: 55, delta: 0, label: 'NASCENT', color: '#FCD34D' },
    { keyword: 'Castor Oil Hair India', score: 83, delta: +12, label: 'BREAKOUT', color: '#2DD4BF' },
    { keyword: 'Kefir India', score: 48, delta: -2, label: 'NASCENT', color: '#FCD34D' },
]

function TickerItem({ item }) {
    var isUp = item.delta > 0
    var isDown = item.delta < 0

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '0 28px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
        }}>
            {/* Keyword */}
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.05em' }}>
                {item.keyword.toUpperCase()}
            </span>

            {/* Score */}
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, color: item.color }}>
                {item.score}
            </span>

            {/* Delta */}
            <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                color: isUp ? '#2DD4BF' : isDown ? '#F87171' : 'var(--text-3)',
            }}>
                {isUp ? '▲' : isDown ? '▼' : '—'}
                {item.delta !== 0 ? Math.abs(item.delta) : ''}
            </span>

            {/* Label */}
            <span style={{
                fontSize: 8, fontFamily: 'var(--f-mono)', fontWeight: 700,
                letterSpacing: '0.1em', color: item.color, opacity: 0.7,
            }}>
                {item.label}
            </span>
        </div>
    )
}

export default function TrendTicker() {
    var [tickers, setTickers] = useState(SEED_TICKERS)
    var [paused, setPaused] = useState(false)
    var trackRef = useRef(null)

    // Randomly nudge scores every 8 seconds to simulate live data
    useEffect(function () {
        var interval = setInterval(function () {
            setTickers(function (prev) {
                return prev.map(function (item) {
                    var nudge = Math.floor(Math.random() * 5) - 2
                    var newScore = Math.min(100, Math.max(20, item.score + nudge))
                    var newDelta = nudge
                    var newColor = newScore >= 75 ? '#2DD4BF' : newScore >= 60 ? '#C9A84C' : '#FCD34D'
                    var newLabel = newScore >= 75 ? 'BREAKOUT' : newScore >= 60 ? 'EMERGING' : 'NASCENT'
                    return Object.assign({}, item, { score: newScore, delta: newDelta, color: newColor, label: newLabel })
                })
            })
        }, 8000)
        return function () { clearInterval(interval) }
    }, [])

    var doubled = tickers.concat(tickers)

    return (
        <div
            style={{
                background: 'rgba(7,11,15,0.95)',
                borderBottom: '1px solid rgba(201,168,76,0.15)',
                borderTop: '1px solid rgba(201,168,76,0.15)',
                overflow: 'hidden',
                position: 'relative',
                height: 36,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
            }}
            onMouseEnter={function () { setPaused(true) }}
            onMouseLeave={function () { setPaused(false) }}
            title="Hover to pause"
        >
            {/* LIVE label */}
            <div style={{
                flexShrink: 0,
                padding: '0 14px',
                height: '100%',
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(201,168,76,0.1)',
                borderRight: '1px solid rgba(201,168,76,0.2)',
                zIndex: 2,
            }}>
                <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#2DD4BF',
                    boxShadow: '0 0 6px #2DD4BF',
                    animation: 'pulse-ring 2s infinite',
                }} />
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em' }}>
                    LIVE
                </span>
            </div>

            {/* Scrolling track */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div
                    ref={trackRef}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: 36,
                        animation: paused ? 'none' : 'tickerScroll 60s linear infinite',
                        willChange: 'transform',
                    }}
                >
                    {doubled.map(function (item, i) {
                        return <TickerItem key={i} item={item} />
                    })}
                </div>
            </div>

            {/* Right fade */}
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 48,
                background: 'linear-gradient(to left, rgba(7,11,15,0.95), transparent)',
                pointerEvents: 'none',
            }} />

            <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    )
}