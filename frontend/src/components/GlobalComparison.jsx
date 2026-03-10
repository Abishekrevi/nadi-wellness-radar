import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.js'
import { useState } from 'react'

function buildPrompt(keyword) {
    return [
        'You are a global wellness market analyst with deep expertise in India vs global trends.',
        'Compare the trend "' + keyword + '" between India and global markets.',
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "global_score": 75,',
        '  "india_score": 82,',
        '  "global_stage": "Mainstream / Early Adopter / Emerging / Nascent",',
        '  "india_stage": "Mainstream / Early Adopter / Emerging / Nascent",',
        '  "india_advantage": "Why India is ahead or behind globally (2 sentences)",',
        '  "global_tam_usd": "$ X Billion",',
        '  "india_tam_inr": "₹ X Cr",',
        '  "leading_countries": ["USA", "UK", "Australia"],',
        '  "india_unique_angle": "What makes India unique for this trend (1-2 sentences)",',
        '  "time_lag_months": 12,',
        '  "time_lag_direction": "India is ahead / India is behind / Simultaneous",',
        '  "global_brands": ["Brand1", "Brand2", "Brand3"],',
        '  "india_opportunity": "Specific India opportunity based on global learnings (2-3 sentences)",',
        '  "risk_of_global_entry": "Low / Medium / High",',
        '  "risk_explanation": "Why global brands may or may not enter India soon"',
        '}',
    ].join('\n')
}

function ScoreBar({ label, score, color, stage }) {
    return (
        <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700, color }}>{score}/100</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-float)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: score + '%', background: color, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 9, color, fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>{stage}</div>
        </div>
    )
}

export default function GlobalComparison({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [error, setError] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true)
        setError(null)
        try {
            var response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: buildPrompt(keyword) }],
                }),
            })
            var res = await response.json()
            var text = res.content && res.content[0] ? res.content[0].text : ''
            var clean = text.replace(/```json|```/g, '').trim()
            setData(JSON.parse(clean))
        } catch (e) {
            setError('Could not load comparison. Try again.')
        } finally {
            setLoading(false)
        }
    }

    var riskColor = data
        ? data.risk_of_global_entry === 'High' ? 'var(--red)'
            : data.risk_of_global_entry === 'Medium' ? 'var(--amber)'
                : 'var(--teal)'
        : 'var(--text-3)'

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: open ? 'rgba(96,165,250,0.1)' : 'rgba(96,165,250,0.05)',
                    border: '1px solid rgba(96,165,250,0.25)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#60A5FA',
                }}
            >
                🌍 Global vs India
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(96,165,250,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA' }}>Global vs India Comparison</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Is "{keyword}" bigger globally or India-specific?</div>
                        </div>
                        <button onClick={generate} disabled={loading} style={{ padding: '6px 14px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#60A5FA' }}>
                            {loading ? '⟳ Loading...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {loading && (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Comparing India vs global trend data...</div>
                        </div>
                    )}

                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 18 }}>

                            {/* Score comparison */}
                            <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
                                <ScoreBar label="🌍 Global Score" score={data.global_score} color="#60A5FA" stage={data.global_stage} />
                                <div style={{ width: 1, background: 'var(--border-dim)', flexShrink: 0 }} />
                                <ScoreBar label="🇮🇳 India Score" score={data.india_score} color="var(--teal)" stage={data.india_stage} />
                            </div>

                            {/* Time lag banner */}
                            <div style={{
                                padding: '12px 16px', marginBottom: 14,
                                background: 'rgba(96,165,250,0.06)',
                                border: '1px solid rgba(96,165,250,0.2)',
                                borderRadius: 8,
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <span style={{ fontSize: 22 }}>⏱</span>
                                <div>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 3 }}>TIMING ANALYSIS</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#60A5FA' }}>{data.time_lag_direction}</div>
                                    {data.time_lag_months > 0 && (
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>by ~{data.time_lag_months} months</div>
                                    )}
                                </div>
                            </div>

                            {/* TAM comparison */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>GLOBAL TAM</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#60A5FA', fontFamily: 'var(--f-mono)' }}>{data.global_tam_usd}</div>
                                </div>
                                <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>INDIA TAM</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>{data.india_tam_inr}</div>
                                </div>
                            </div>

                            {/* Leading countries */}
                            {data.leading_countries?.length > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>LEADING GLOBAL MARKETS</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {data.leading_countries.map(function (c) {
                                            return (
                                                <span key={c} style={{ padding: '4px 12px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 20, fontSize: 11, color: '#60A5FA', fontFamily: 'var(--f-mono)' }}>
                                                    {c}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* India unique angle */}
                            {data.india_unique_angle && (
                                <div style={{ padding: 14, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, marginBottom: 12 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: 6 }}>🇮🇳 INDIA'S UNIQUE ANGLE</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.india_unique_angle}</div>
                                </div>
                            )}

                            {/* India opportunity */}
                            {data.india_opportunity && (
                                <div style={{ padding: 14, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, marginBottom: 12 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 6 }}>💡 INDIA OPPORTUNITY FROM GLOBAL LEARNINGS</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.india_opportunity}</div>
                                </div>
                            )}

                            {/* Global brand risk */}
                            <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>RISK OF GLOBAL BRAND ENTRY INTO INDIA</div>
                                    <span style={{ padding: '3px 10px', background: 'transparent', border: '1px solid ' + riskColor, borderRadius: 20, fontSize: 9, fontWeight: 700, color: riskColor, fontFamily: 'var(--f-mono)' }}>
                                        {data.risk_of_global_entry}
                                    </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>{data.risk_explanation}</div>
                                {data.global_brands?.length > 0 && (
                                    <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-3)' }}>
                                        Key global players: <span style={{ color: 'var(--text-2)' }}>{data.global_brands.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}