import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var tam = result?.marketSizePotential?.tam || 0
    return [
        'You are a D2C competitive intelligence expert for the Indian wellness market.',
        'Find and analyze existing brands competing in: "' + keyword + '"',
        '',
        'Market TAM: ₹' + tam + 'Cr',
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "competitors": [',
        '    {',
        '      "name": "Brand Name",',
        '      "type": "D2C / Amazon / Offline / International",',
        '      "price_range": "₹X - ₹Y",',
        '      "strength": "Their main competitive advantage (1 sentence)",',
        '      "weakness": "Their key weakness (1 sentence)",',
        '      "market_share": "Leader / Major / Minor / Niche",',
        '      "channels": ["Amazon", "D2C Website", "Instagram"],',
        '      "founded": "Year or Unknown",',
        '      "threat_level": "High / Medium / Low"',
        '    }',
        '  ],',
        '  "market_gap": "The biggest gap none of these brands are filling (2 sentences)",',
        '  "differentiation_strategy": "How a new entrant can win against these brands (2-3 sentences)",',
        '  "total_competitors_found": 6,',
        '  "market_saturation": "Low / Medium / High",',
        '  "saturation_explanation": "1 sentence explanation"',
        '}',
    ].join('\n')
}

function ThreatBadge({ level }) {
    var styles = {
        High: { bg: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: 'rgba(248,113,113,0.3)' },
        Medium: { bg: 'rgba(252,211,77,0.1)', color: 'var(--amber)', border: 'rgba(252,211,77,0.3)' },
        Low: { bg: 'rgba(45,212,191,0.1)', color: 'var(--teal)', border: 'rgba(45,212,191,0.3)' },
    }
    var s = styles[level] || styles['Low']
    return (
        <span style={{ padding: '2px 8px', background: s.bg, border: '1px solid ' + s.border, borderRadius: 20, fontSize: 8, fontWeight: 700, color: s.color, fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
            {level} threat
        </span>
    )
}

function ShareBadge({ share }) {
    var colors = { Leader: 'var(--gold)', Major: 'var(--teal)', Minor: 'var(--amber)', Niche: 'var(--text-3)' }
    return (
        <span style={{ fontSize: 10, fontWeight: 700, color: colors[share] || 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
            {share}
        </span>
    )
}

export default function CompetitorTracker({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [error, setError] = useState(null)
    var [view, setView] = useState('cards')

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            // Step 1: Retrieve real sources (RAG)
            var retrieved = await rag.retrieve(keyword, 'competitor')
            setRagData(retrieved)
            var ragContext = (retrieved.context || '').slice(0, 3000)
            var basePrompt = buildPrompt(keyword, result || {})
            var prompt = basePrompt + '\n\nREAL RETRIEVED SOURCES (ground your answer in these, do not hallucinate):\n' + ragContext
            // Step 2: AI answers from real data
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
        } catch (e) { console.error('[Could not load competitor data. Try again.]', e); setError('❌ ' + (e.message || 'Could not load competitor data. Try again.')) }
        finally { setLoading(false) }
    }

    var satColor = data
        ? data.market_saturation === 'High' ? 'var(--red)'
            : data.market_saturation === 'Medium' ? 'var(--amber)' : 'var(--teal)'
        : 'var(--text-3)'

    return (
        <div style={{ marginTop: 12 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#A78BFA' }}>
                🎯 Competitor Tracker
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(167,139,250,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>Competitor Brand Tracker</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Brands already competing in "{keyword}"</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={function () { setView(view === 'cards' ? 'table' : 'cards') }}
                                style={{ padding: '5px 12px', background: 'none', border: '1px solid var(--border-dim)', borderRadius: 4, cursor: 'pointer', fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                {view === 'cards' ? '⊞ Table' : '⊟ Cards'}
                            </button>
                            <button onClick={generate} disabled={loading}
                                style={{ padding: '6px 14px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#A78BFA' }}>
                                {loading ? '⟳ Scanning...' : '🔄 Refresh'}
                            </button>
                        </div>
                    </div>

                    {loading && <div style={{ padding: 32, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>Scanning Indian wellness market for competitors...</div></div>}
                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 18 }}>
                            {/* Saturation banner */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>MARKET SATURATION</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: satColor, fontFamily: 'var(--f-mono)' }}>{data.market_saturation}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{data.saturation_explanation}</div>
                                </div>
                                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>COMPETITORS FOUND</div>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>{data.total_competitors_found}</div>
                                </div>
                            </div>

                            {/* Cards view */}
                            {view === 'cards' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
                                    {(data.competitors || []).map(function (c, i) {
                                        return (
                                            <div key={i} style={{ padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 10, transition: 'border-color 0.2s' }}
                                                onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)' }}
                                                onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#A78BFA', fontFamily: 'Georgia, serif', marginBottom: 3 }}>{c.name}</div>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{c.type}</span>
                                                            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>·</span>
                                                            <ShareBadge share={c.market_share} />
                                                        </div>
                                                    </div>
                                                    <ThreatBadge level={c.threat_level} />
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>{c.price_range}</div>
                                                <div style={{ fontSize: 11, color: 'var(--teal)', marginBottom: 6 }}>✓ {c.strength}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>✗ {c.weakness}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {(c.channels || []).map(function (ch) {
                                                        return <span key={ch} style={{ padding: '2px 8px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 20, fontSize: 9, color: '#A78BFA', fontFamily: 'var(--f-mono)' }}>{ch}</span>
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Table view */}
                            {view === 'table' && (
                                <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                        <thead>
                                            <tr>
                                                {['Brand', 'Type', 'Price', 'Share', 'Threat', 'Channels'].map(function (h) {
                                                    return <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', borderBottom: '1px solid var(--border-dim)' }}>{h}</th>
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data.competitors || []).map(function (c, i) {
                                                return (
                                                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-float)' }}>
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#A78BFA' }}>{c.name}</td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontSize: 11 }}>{c.type}</td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--gold)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>{c.price_range}</td>
                                                        <td style={{ padding: '10px 12px' }}><ShareBadge share={c.market_share} /></td>
                                                        <td style={{ padding: '10px 12px' }}><ThreatBadge level={c.threat_level} /></td>
                                                        <td style={{ padding: '10px 12px', color: 'var(--text-3)', fontSize: 10 }}>{(c.channels || []).join(', ')}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Market gap */}
                            <div style={{ padding: 14, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, marginBottom: 10 }}>
                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: 6 }}>🎯 MARKET GAP — YOUR ENTRY POINT</div>
                                <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.market_gap}</div>
                            </div>
                            <div style={{ padding: 14, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 6 }}>⚔️ HOW TO WIN</div>
                                <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.differentiation_strategy}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}