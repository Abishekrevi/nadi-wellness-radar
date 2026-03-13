import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

var MONTHS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']

function buildPrompt(keyword, result) {
    var score = result?.momentumAccelerationScore || 0
    var tam = result?.marketSizePotential?.tam || 0
    var classification = result?.classification?.label || 'Unknown'
    var searchMomentum = result?.signals?.searchMomentum || 0
    var r = result?.intelligenceReport || {}
    return [
        'You are an expert Indian wellness market analyst and trend forecaster.',
        'Generate a 12-month trajectory forecast for: "' + keyword + '"',
        '',
        'Current signals:',
        '- MAS Score: ' + score + '/100',
        '- Classification: ' + classification,
        '- Market TAM: ₹' + tam + 'Cr',
        '- Search Momentum: ' + searchMomentum + '%',
        '- Revenue model: ' + (r.revenue_model || 'N/A'),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "trajectory": [',
        '    { "month": 1, "projected_score": 55, "event": "Initial awareness phase" },',
        '    { "month": 2, "projected_score": 58, "event": "Early adopter traction" }',
        '  ],',
        '  "scenario_bull": { "probability": 35, "score_m12": 85, "trigger": "What would cause the best case" },',
        '  "scenario_base": { "probability": 45, "score_m12": 65, "trigger": "Most likely path" },',
        '  "scenario_bear": { "probability": 20, "score_m12": 35, "trigger": "What would cause decline" },',
        '  "inflection_points": [',
        '    { "month": 4, "event": "Key regulatory approval expected", "impact": "positive" },',
        '    { "month": 8, "event": "Festival season demand spike", "impact": "positive" }',
        '  ],',
        '  "recommendation": "1-2 sentence action plan for founders",',
        '  "confidence": 72',
        '}',
        '',
        'Generate exactly 12 months of trajectory data. Be realistic about India market dynamics.',
        'projected_score values should be 0-100 and reflect the MAS methodology.',
    ].join('\n')
}

function MiniChart({ data, width, height }) {
    if (!data || data.length === 0) return null
    var maxVal = Math.max.apply(null, data.map(function (d) { return d.projected_score }))
    var minVal = Math.min.apply(null, data.map(function (d) { return d.projected_score }))
    var range = Math.max(maxVal - minVal, 10)
    var padding = 24
    var chartW = width - padding * 2
    var chartH = height - padding * 2

    var points = data.map(function (d, i) {
        var x = padding + (i / (data.length - 1)) * chartW
        var y = padding + chartH - ((d.projected_score - minVal) / range) * chartH
        return { x: x, y: y, score: d.projected_score, event: d.event, month: d.month }
    })

    var linePath = points.map(function (p, i) {
        return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y
    }).join(' ')

    var areaPath = linePath + ' L' + points[points.length - 1].x + ',' + (padding + chartH) + ' L' + points[0].x + ',' + (padding + chartH) + ' Z'

    var trend = data[data.length - 1].projected_score - data[0].projected_score
    var lineColor = trend >= 0 ? '#2DD4BF' : '#F87171'
    var areaFill = trend >= 0 ? 'rgba(45,212,191,0.12)' : 'rgba(248,113,113,0.12)'

    return (
        <svg width="100%" viewBox={'0 0 ' + width + ' ' + height} style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(function (pct) {
                var y = padding + chartH * (1 - pct)
                var val = Math.round(minVal + range * pct)
                return (
                    <g key={pct}>
                        <line x1={padding} y1={y} x2={padding + chartW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <text x={padding - 6} y={y + 3} textAnchor="end" fill="var(--text-3)" fontSize="8" fontFamily="var(--f-mono)">{val}</text>
                    </g>
                )
            })}
            {/* Month labels */}
            {points.map(function (p, i) {
                if (i % 2 !== 0) return null
                return (
                    <text key={i} x={p.x} y={padding + chartH + 14} textAnchor="middle" fill="var(--text-3)" fontSize="7" fontFamily="var(--f-mono)">
                        {MONTHS[i]}
                    </text>
                )
            })}
            {/* Area fill */}
            <path d={areaPath} fill={areaFill} />
            {/* Line */}
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {points.map(function (p, i) {
                return (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--bg-base)" stroke={lineColor} strokeWidth="1.5" />
                )
            })}
        </svg>
    )
}

function ScenarioBar({ label, probability, scoreM12, trigger, color }) {
    return (
        <div style={{
            padding: 12,
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-dim)',
            borderRadius: 8,
            transition: 'border-color 0.2s',
        }}
            onMouseEnter={function (e) { e.currentTarget.style.borderColor = color }}
            onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: color }}>{label}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>{probability}% likely</div>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: probability + '%', background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-2)' }}>M12 Score</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, color: color }}>{scoreM12}/100</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>{trigger}</div>
        </div>
    )
}

export default function TrajectoryForecast({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [error, setError] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            var retrieved = await rag.retrieve(keyword, 'trajectory')
            setRagData(retrieved)
            var ragContext = (retrieved.context || '').slice(0, 3000)
            var basePrompt = buildPrompt(keyword, result || {})
            var prompt = basePrompt + '\n\nREAL RETRIEVED SOURCES (ground your answer in these, do not hallucinate):\n' + ragContext
            var res = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, max_tokens: 1500 }),
            })
            if (!res.ok) { var errBody = await res.json().catch(function () { return {} }); throw new Error('Server: ' + (errBody.message || errBody.error || res.status)) }
            var d = await res.json()
            var text = d.content?.[0]?.text || ''
            if (!text) throw new Error('Empty response from AI')
            setData(JSON.parse(text.replace(/```json|```/g, '').replace(/^[^{\[]*/, '').replace(/[^}\]]*$/, '').trim()))
        } catch (e) { console.error('[TrajectoryForecast]', e); setError('❌ ' + (e.message || 'Could not generate forecast. Try again.')) }
        finally { setLoading(false) }
    }

    return (
        <div style={{ marginTop: 16 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#A78BFA' }}>
                📈 Trajectory Forecast
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(139,92,246,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>12-Month Trajectory Forecast</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Projected MAS path for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading}
                            style={{ padding: '6px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#A78BFA' }}>
                            {loading ? '⟳ Forecasting...' : '🔄 Refresh'}
                        </button>
                    </div>

                    <RAGStatus retrieving={rag.retrieving} sourceCount={ragData?.sourceCount} />

                    {loading && (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Modeling trajectory from real signals...</div>
                        </div>
                    )}
                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 16 }}>
                            {/* Trajectory chart */}
                            {data.trajectory && data.trajectory.length > 0 && (
                                <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>PROJECTED MAS SCORE — 12 MONTHS</div>
                                        {data.confidence && (
                                            <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, color: '#A78BFA', fontFamily: 'var(--f-mono)' }}>
                                                Confidence: {data.confidence}%
                                            </span>
                                        )}
                                    </div>
                                    <MiniChart data={data.trajectory} width={480} height={180} />
                                    {/* Key events under chart */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                        {data.trajectory.filter(function (d) { return d.event }).slice(0, 4).map(function (d, i) {
                                            return (
                                                <div key={i} style={{ fontSize: 9, color: 'var(--text-3)', padding: '3px 8px', background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 4 }}>
                                                    <span style={{ color: '#A78BFA', fontWeight: 700 }}>M{d.month}</span> {d.event}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Scenarios */}
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 10 }}>SCENARIO ANALYSIS</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                                {data.scenario_bull && <ScenarioBar label="🐂 Bull Case" probability={data.scenario_bull.probability} scoreM12={data.scenario_bull.score_m12} trigger={data.scenario_bull.trigger} color="#2DD4BF" />}
                                {data.scenario_base && <ScenarioBar label="📊 Base Case" probability={data.scenario_base.probability} scoreM12={data.scenario_base.score_m12} trigger={data.scenario_base.trigger} color="#A78BFA" />}
                                {data.scenario_bear && <ScenarioBar label="🐻 Bear Case" probability={data.scenario_bear.probability} scoreM12={data.scenario_bear.score_m12} trigger={data.scenario_bear.trigger} color="#F87171" />}
                            </div>

                            {/* Inflection points */}
                            {data.inflection_points && data.inflection_points.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>KEY INFLECTION POINTS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {data.inflection_points.map(function (ip, i) {
                                            var isPositive = ip.impact === 'positive'
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '8px 12px',
                                                    background: isPositive ? 'rgba(45,212,191,0.04)' : 'rgba(248,113,113,0.04)',
                                                    border: '1px solid ' + (isPositive ? 'rgba(45,212,191,0.15)' : 'rgba(248,113,113,0.15)'),
                                                    borderRadius: 6,
                                                }}>
                                                    <span style={{
                                                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                                                        color: isPositive ? '#2DD4BF' : '#F87171',
                                                        minWidth: 28,
                                                    }}>M{ip.month}</span>
                                                    <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{ip.event}</span>
                                                    <span style={{
                                                        marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--f-mono)',
                                                        color: isPositive ? '#2DD4BF' : '#F87171',
                                                    }}>{isPositive ? '↑' : '↓'} {ip.impact}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recommendation */}
                            {data.recommendation && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(139,92,246,0.05)',
                                    border: '1px solid rgba(139,92,246,0.15)',
                                    borderRadius: 8,
                                    marginBottom: 12,
                                }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A78BFA', letterSpacing: '0.1em', marginBottom: 6 }}>🎯 FOUNDER ACTION PLAN</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.recommendation}</div>
                                </div>
                            )}

                            <SourcePanel sources={ragData?.sources} compact />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
