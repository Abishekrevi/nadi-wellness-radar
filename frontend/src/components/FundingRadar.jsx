import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var score = result?.momentumAccelerationScore || 0
    var tam = result?.marketSizePotential?.tam || 0
    var r = result?.intelligenceReport || {}
    return [
        'You are a startup fundraising advisor specializing in Indian D2C wellness and consumer health.',
        'Identify relevant investors for a startup building in: "' + keyword + '"',
        '',
        'MAS Score: ' + score + '/100',
        'Market TAM: ₹' + tam + 'Cr',
        'Stage: Early D2C brand (pre-Series A)',
        'Revenue model: ' + (r.revenue_model || ''),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "investors": [',
        '    {',
        '      "name": "Investor/Fund name",',
        '      "type": "VC / Angel / Family Office / Accelerator / CVC",',
        '      "focus": "Their investment thesis in 1 sentence",',
        '      "typical_cheque": "₹X Cr - ₹Y Cr",',
        '      "stage": "Pre-seed / Seed / Series A",',
        '      "portfolio_brands": ["Brand1", "Brand2"],',
        '      "india_active": true,',
        '      "contact_approach": "How to approach them (cold email / warm intro / application)",',
        '      "fit_score": 85',
        '    }',
        '  ],',
        '  "pitch_angle": "How to pitch this trend opportunity to investors (2-3 sentences)",',
        '  "fundraising_stage_recommendation": "What stage to raise at and why",',
        '  "ideal_raise_amount": "₹X Cr - ₹Y Cr",',
        '  "use_of_funds": ["Marketing 40%", "Inventory 30%", "Team 20%", "Tech 10%"],',
        '  "accelerators_to_apply": ["Name1", "Name2"],',
        '  "grants_available": ["Grant1", "Grant2"],',
        '  "investor_red_flags": "What will turn investors off in this category"',
        '}',
    ].join('\n')
}

function FitBar({ score }) {
    var color = score >= 80 ? 'var(--teal)' : score >= 60 ? 'var(--gold)' : 'var(--amber)'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--bg-float)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: score + '%', background: color, borderRadius: 2 }} />
            </div>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{score}%</span>
        </div>
    )
}

export default function FundingRadar({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [tab, setTab] = useState('investors')
    var [error, setError] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            // Step 1: Retrieve real sources (RAG)
            var retrieved = await rag.retrieve(keyword, 'funding')
            setRagData(retrieved)
            var ragContext = retrieved.context || ''
            var basePrompt = buildPrompt(keyword, result || {})
            var prompt = basePrompt + '\n\nREAL RETRIEVED SOURCES (ground your answer in these, do not hallucinate):\n' + ragContext
            // Step 2: AI answers from real data
            var res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514', max_tokens: 1500,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            var d = await res.json()
            var text = d.content?.[0]?.text || ''
            setData(JSON.parse(text.replace(/```json|```/g, '').trim()))
        } catch (e) { setError('Could not load funding data. Try again.') }
        finally { setLoading(false) }
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#34D399' }}>
                💰 Funding Radar
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(52,211,153,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>Funding Radar</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>VCs, angels & accelerators for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading}
                            style={{ padding: '6px 14px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#34D399' }}>
                            {loading ? '⟳ Scanning...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {data && (
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-dim)' }}>
                            {['investors', 'strategy', 'funds'].map(function (t) {
                                var labels = { investors: '👤 Investors', strategy: '🎯 Pitch Strategy', funds: '🏦 Use of Funds' }
                                return (
                                    <button key={t} onClick={function () { setTab(t) }} style={{ flex: 1, padding: '10px 8px', background: tab === t ? 'rgba(52,211,153,0.06)' : 'none', border: 'none', borderBottom: '2px solid ' + (tab === t ? '#34D399' : 'transparent'), cursor: 'pointer', fontSize: 10, color: tab === t ? '#34D399' : 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                        {labels[t]}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {loading && <div style={{ padding: 32, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 8 }}>💰</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>Scanning Indian VC & angel ecosystem...</div></div>}
                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 16 }}>
                            {tab === 'investors' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(data.investors || []).sort(function (a, b) { return b.fit_score - a.fit_score }).map(function (inv, i) {
                                        return (
                                            <div key={i} style={{ padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 10, transition: 'border-color 0.2s' }}
                                                onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)' }}
                                                onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#34D399', marginBottom: 3 }}>{inv.name}</div>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)', borderRadius: 20 }}>{inv.type}</span>
                                                            <span style={{ fontSize: 9, color: 'var(--gold)', fontFamily: 'var(--f-mono)', padding: '2px 8px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20 }}>{inv.stage}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--f-mono)', marginBottom: 3 }}>{inv.typical_cheque}</div>
                                                        <div style={{ fontSize: 9, color: 'var(--text-3)' }}>typical cheque</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>{inv.focus}</div>
                                                <div style={{ marginBottom: 10 }}>
                                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 4 }}>FIT SCORE</div>
                                                    <FitBar score={inv.fit_score} />
                                                </div>
                                                {inv.portfolio_brands?.length > 0 && (
                                                    <div style={{ marginBottom: 10 }}>
                                                        <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 4 }}>Portfolio brands:</div>
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                            {inv.portfolio_brands.map(function (b) {
                                                                return <span key={b} style={{ fontSize: 9, color: 'var(--text-2)', padding: '2px 8px', background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 20 }}>{b}</span>
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 10, color: 'var(--teal)', padding: '6px 10px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 6 }}>
                                                    📬 {inv.contact_approach}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {tab === 'strategy' && (
                                <div>
                                    <div style={{ padding: 14, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 8, marginBottom: 14 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#34D399', letterSpacing: '0.1em', marginBottom: 6 }}>🎯 YOUR PITCH ANGLE</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.pitch_angle}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                        <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 6 }}>STAGE RECOMMENDATION</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.6 }}>{data.fundraising_stage_recommendation}</div>
                                        </div>
                                        <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 8 }}>IDEAL RAISE</div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#34D399', fontFamily: 'var(--f-mono)' }}>{data.ideal_raise_amount}</div>
                                        </div>
                                    </div>
                                    {data.accelerators_to_apply?.length > 0 && (
                                        <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, marginBottom: 12 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>🚀 ACCELERATORS TO APPLY</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {data.accelerators_to_apply.map(function (a) {
                                                    return <span key={a} style={{ padding: '4px 12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, fontSize: 11, color: '#34D399' }}>{a}</span>
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ padding: 14, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 6 }}>⚠️ INVESTOR RED FLAGS TO AVOID</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>{data.investor_red_flags}</div>
                                    </div>
                                </div>
                            )}

                            {tab === 'funds' && (
                                <div>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 14 }}>SUGGESTED USE OF FUNDS AT {data.ideal_raise_amount}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {(data.use_of_funds || []).map(function (item, i) {
                                            var colors = ['var(--teal)', 'var(--gold)', '#A78BFA', '#FB923C', '#60A5FA']
                                            var pctMatch = item.match(/(\d+)%/)
                                            var pct = pctMatch ? parseInt(pctMatch[1]) : 25
                                            var label = item.replace(/\d+%/, '').trim()
                                            return (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                        <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{label}</span>
                                                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700, color: colors[i % colors.length] }}>{pct}%</span>
                                                    </div>
                                                    <div style={{ height: 8, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: pct + '%', background: colors[i % colors.length], borderRadius: 4, transition: 'width 1s ease' }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {data.grants_available?.length > 0 && (
                                        <div style={{ marginTop: 16, padding: 14, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 8 }}>🎁 GRANTS AVAILABLE</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {data.grants_available.map(function (g) {
                                                    return <div key={g} style={{ fontSize: 11, color: 'var(--text-1)' }}>• {g}</div>
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}