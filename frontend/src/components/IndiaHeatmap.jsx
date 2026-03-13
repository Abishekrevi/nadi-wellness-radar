import { useState, useEffect } from 'react'

const STATES = [
    { id: 'MH', name: 'Maharashtra', x: 195, y: 310, r: 28, weight: 0.95 },
    { id: 'DL', name: 'Delhi', x: 218, y: 178, r: 18, weight: 0.90 },
    { id: 'KA', name: 'Karnataka', x: 200, y: 390, r: 24, weight: 0.85 },
    { id: 'TN', name: 'Tamil Nadu', x: 220, y: 445, r: 22, weight: 0.80 },
    { id: 'GJ', name: 'Gujarat', x: 145, y: 272, r: 22, weight: 0.75 },
    { id: 'RJ', name: 'Rajasthan', x: 175, y: 218, r: 26, weight: 0.65 },
    { id: 'WB', name: 'West Bengal', x: 338, y: 272, r: 20, weight: 0.70 },
    { id: 'TS', name: 'Telangana', x: 238, y: 362, r: 20, weight: 0.72 },
    { id: 'KL', name: 'Kerala', x: 198, y: 458, r: 18, weight: 0.68 },
    { id: 'UP', name: 'Uttar Pradesh', x: 255, y: 215, r: 26, weight: 0.60 },
    { id: 'MP', name: 'Madhya Pradesh', x: 228, y: 270, r: 24, weight: 0.55 },
    { id: 'HR', name: 'Haryana', x: 202, y: 185, r: 16, weight: 0.58 },
    { id: 'PB', name: 'Punjab', x: 188, y: 158, r: 16, weight: 0.52 },
    { id: 'AP', name: 'Andhra Pradesh', x: 252, y: 400, r: 20, weight: 0.62 },
    { id: 'OR', name: 'Odisha', x: 308, y: 318, r: 18, weight: 0.48 },
    { id: 'BR', name: 'Bihar', x: 305, y: 238, r: 18, weight: 0.42 },
    { id: 'JH', name: 'Jharkhand', x: 318, y: 280, r: 16, weight: 0.40 },
    { id: 'CG', name: 'Chhattisgarh', x: 272, y: 312, r: 18, weight: 0.38 },
    { id: 'AS', name: 'Assam', x: 390, y: 218, r: 16, weight: 0.35 },
    { id: 'HP', name: 'Himachal Pradesh', x: 208, y: 145, r: 14, weight: 0.32 },
]

function getColor(weight, score) {
    var intensity = weight * Math.min(1, score / 100)
    if (intensity > 0.75) return { fill: 'rgba(45,212,191,0.85)', stroke: '#2DD4BF', text: '#07090D', label: 'Very High' }
    if (intensity > 0.55) return { fill: 'rgba(45,212,191,0.55)', stroke: '#2DD4BF', text: '#EDE8DC', label: 'High' }
    if (intensity > 0.40) return { fill: 'rgba(201,168,76,0.65)', stroke: '#C9A84C', text: '#07090D', label: 'Medium' }
    if (intensity > 0.25) return { fill: 'rgba(201,168,76,0.35)', stroke: '#C9A84C', text: '#EDE8DC', label: 'Low' }
    return { fill: 'rgba(61,80,96,0.4)', stroke: '#3D5060', text: '#8FA3B1', label: 'Minimal' }
}

export default function IndiaHeatmap({ keyword, score }) {
    var displayScore = score || 50
    var [tooltip, setTooltip] = useState(null)
    var [liveData, setLiveData] = useState(null)

    // Try to fetch real Google Trends regional data if SerpAPI is available
    useEffect(function () {
        if (!keyword) return
        fetch('/api/india-heatmap?keyword=' + encodeURIComponent(keyword))
            .then(r => r.json())
            .then(d => { if (d.states) setLiveData(d.states) })
            .catch(() => { }) // silently fall back to weighted data
    }, [keyword])

    // Ranked list for sidebar
    var ranked = STATES.slice().sort(function (a, b) {
        var ai = (liveData?.[a.id] || a.weight) * Math.min(1, displayScore / 100)
        var bi = (liveData?.[b.id] || b.weight) * Math.min(1, displayScore / 100)
        return bi - ai
    })

    return (
        <div style={{ padding: 20, background: 'var(--bg-float)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius)', marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div className="label" style={{ color: 'var(--gold)' }}>🇮🇳 India State Interest Heatmap</div>
                {liveData
                    ? <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 10, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>📡 Live</span>
                    : <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>Modelled</span>
                }
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginBottom: 16 }}>
                Consumer interest for "{keyword}" across Indian states
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                {/* SVG Map */}
                <div style={{ position: 'relative' }}>
                    <svg viewBox="100 100 340 420" style={{ width: '100%', maxWidth: 420, display: 'block' }}>
                        <rect x="100" y="100" width="340" height="420" fill="transparent" />
                        {STATES.map(function (state) {
                            var w = liveData?.[state.id] || state.weight
                            var c = getColor(w, displayScore)
                            var isHovered = tooltip?.id === state.id
                            return (
                                <g key={state.id}
                                    onMouseEnter={() => setTooltip({ id: state.id, name: state.name, label: c.label, intensity: Math.round(w * Math.min(1, displayScore / 100) * 100) })}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{ cursor: 'pointer' }}>
                                    <circle cx={state.x} cy={state.y} r={isHovered ? state.r + 3 : state.r}
                                        fill={c.fill} stroke={c.stroke} strokeWidth={isHovered ? 2 : 1}
                                        style={{ transition: 'all 0.2s' }} />
                                    <text x={state.x} y={state.y + 1} textAnchor="middle" dominantBaseline="middle"
                                        fill={c.text} fontSize={state.r > 20 ? 7 : 6} fontFamily="var(--f-mono)" fontWeight="700"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                        {state.id}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>
                    {tooltip && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '8px 12px', fontSize: 11, pointerEvents: 'none', zIndex: 10 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{tooltip.name}</div>
                            <div style={{ color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>{tooltip.label} — {tooltip.intensity}%</div>
                        </div>
                    )}
                </div>

                {/* Ranked sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 160 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.1em' }}>TOP MARKETS</div>
                    {ranked.slice(0, 10).map(function (state, i) {
                        var w = liveData?.[state.id] || state.weight
                        var intensity = w * Math.min(1, displayScore / 100)
                        var c = getColor(w, displayScore)
                        var pct = Math.round(intensity * 100)
                        return (
                            <div key={state.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', width: 14, textAlign: 'right' }}>{i + 1}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-1)', width: 100 }}>{state.name}</div>
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, minWidth: 40 }}>
                                    <div style={{ height: '100%', width: pct + '%', background: c.stroke, borderRadius: 3, transition: 'width 0.8s ease' }} />
                                </div>
                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: c.stroke, width: 28, textAlign: 'right' }}>{pct}%</div>
                            </div>
                        )
                    })}
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 6 }}>
                        {[{ label: 'Very High', color: 'var(--teal)' }, { label: 'High', color: 'rgba(45,212,191,0.6)' }, { label: 'Medium', color: 'var(--gold)' }, { label: 'Low', color: 'rgba(201,168,76,0.5)' }, { label: 'Minimal', color: 'var(--text-3)' }].map(function (item) {
                            return (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 9, color: 'var(--text-2)' }}>{item.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                * Based on MAS score ({displayScore}/100) × state digital wellness adoption rates
            </div>
        </div>
    )
}