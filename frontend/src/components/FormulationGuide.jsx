import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var r = result?.intelligenceReport || {}
    return [
        'You are a product formulation scientist and D2C product developer for Indian wellness brands.',
        'Create a detailed product formulation guide for: "' + keyword + '"',
        '',
        'Target consumer: ' + (r.target_consumer || ''),
        'Product opportunity: ' + (r.product_opportunity || ''),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "recommended_format": "Capsules / Gummies / Powder / Serum / Oil / Tablet / etc",',
        '  "format_reason": "Why this format works best for India (1 sentence)",',
        '  "formulations": [',
        '    {',
        '      "name": "Product variant name",',
        '      "type": "Core / Premium / Budget",',
        '      "key_ingredients": [',
        '        { "ingredient": "name", "percentage": "X%", "role": "what it does" }',
        '      ],',
        '      "shelf_life": "X months",',
        '      "dosage": "dosage instructions",',
        '      "usp": "Unique selling point of this formulation"',
        '    }',
        '  ],',
        '  "regulatory_requirements": ["FSSAI License", "etc"],',
        '  "certifications_to_get": ["Organic India", "AYUSH", "etc"],',
        '  "stability_tips": "How to ensure shelf stability (1-2 sentences)",',
        '  "packaging_recommendation": "Best packaging type and why",',
        '  "clinical_claims_possible": ["claim1", "claim2"],',
        '  "claims_to_avoid": ["claim to avoid and why"],',
        '  "development_timeline": "X-Y months from concept to launch",',
        '  "estimated_development_cost": "₹X - ₹Y lakhs"',
        '}',
    ].join('\n')
}

export default function FormulationGuide({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [tab, setTab] = useState('formula')
    var [error, setError] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            // Step 1: Retrieve real sources (RAG)
            var retrieved = await rag.retrieve(keyword, 'formulation')
            setRagData(retrieved)
            var ragContext = retrieved.context || ''
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
        } catch (e) { console.error('[Could not generate formulation. Try again.]', e); setError(e.message || 'Could not generate formulation. Try again.') }
        finally { setLoading(false) }
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(45,212,191,0.1)' : 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>
                🧪 Product Formulation Guide
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(45,212,191,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>Product Formulation Guide</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>AI-generated formulation for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading}
                            style={{ padding: '6px 14px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--teal)' }}>
                            {loading ? '⟳ Formulating...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {data && (
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-dim)' }}>
                            {['formula', 'regulatory', 'launch'].map(function (t) {
                                var labels = { formula: '🧪 Formula', regulatory: '📋 Regulatory', launch: '🚀 Launch' }
                                return (
                                    <button key={t} onClick={function () { setTab(t) }} style={{ flex: 1, padding: '10px 8px', background: tab === t ? 'rgba(45,212,191,0.06)' : 'none', border: 'none', borderBottom: '2px solid ' + (tab === t ? 'var(--teal)' : 'transparent'), cursor: 'pointer', fontSize: 10, color: tab === t ? 'var(--teal)' : 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                        {labels[t]}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {loading && <div style={{ padding: 32, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 8 }}>🧪</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>Creating your product formulation...</div></div>}
                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 16 }}>

                            {tab === 'formula' && (
                                <div>
                                    {/* Recommended format */}
                                    <div style={{ padding: 14, background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{ fontSize: 32 }}>💊</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>RECOMMENDED FORMAT</div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)' }}>{data.recommended_format}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>{data.format_reason}</div>
                                        </div>
                                    </div>

                                    {/* Formulations */}
                                    {(data.formulations || []).map(function (f, fi) {
                                        var typeColors = { Core: 'var(--teal)', Premium: 'var(--gold)', Budget: 'var(--text-2)' }
                                        return (
                                            <div key={fi} style={{ marginBottom: 14, padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: typeColors[f.type] || 'var(--text-1)' }}>{f.name}</div>
                                                    <span style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)', borderRadius: 20, fontSize: 9, fontWeight: 700, color: typeColors[f.type] || 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{f.type}</span>
                                                </div>

                                                {/* Ingredients */}
                                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>INGREDIENTS</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                                    {(f.key_ingredients || []).map(function (ing, ii) {
                                                        return (
                                                            <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
                                                                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-1)' }}>{ing.ingredient}</div>
                                                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{ing.percentage}</div>
                                                                <div style={{ fontSize: 10, color: 'var(--text-3)', flex: 1, textAlign: 'right' }}>{ing.role}</div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                                                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Shelf life: <span style={{ color: 'var(--text-1)' }}>{f.shelf_life}</span></div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Dosage: <span style={{ color: 'var(--text-1)' }}>{f.dosage}</span></div>
                                                </div>
                                                <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 6, fontSize: 11, color: 'var(--gold)' }}>
                                                    ⭐ {f.usp}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {tab === 'regulatory' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                        <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 10 }}>📋 REQUIRED LICENSES</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {(data.regulatory_requirements || []).map(function (r) {
                                                    return <div key={r} style={{ fontSize: 11, color: 'var(--text-1)', display: 'flex', gap: 8 }}><span style={{ color: 'var(--red)' }}>•</span>{r}</div>
                                                })}
                                            </div>
                                        </div>
                                        <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: 10 }}>✅ CERTIFICATIONS TO GET</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {(data.certifications_to_get || []).map(function (c) {
                                                    return <div key={c} style={{ fontSize: 11, color: 'var(--text-1)', display: 'flex', gap: 8 }}><span style={{ color: 'var(--teal)' }}>✓</span>{c}</div>
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: 14, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, marginBottom: 12 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: 6 }}>✅ CLAIMS YOU CAN MAKE</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            {(data.clinical_claims_possible || []).map(function (c) {
                                                return <div key={c} style={{ fontSize: 11, color: 'var(--text-1)' }}>• {c}</div>
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ padding: 14, background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 6 }}>⚠️ CLAIMS TO AVOID</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            {(data.claims_to_avoid || []).map(function (c) {
                                                return <div key={c} style={{ fontSize: 11, color: 'var(--text-2)' }}>• {c}</div>
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'launch' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                        <div style={{ padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 8 }}>DEVELOPMENT TIMELINE</div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal)' }}>{data.development_timeline}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 8 }}>DEVELOPMENT COST</div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{data.estimated_development_cost}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, marginBottom: 12 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 6 }}>PACKAGING RECOMMENDATION</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.packaging_recommendation}</div>
                                    </div>
                                    <div style={{ padding: 14, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 6 }}>🧊 STABILITY TIPS</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.stability_tips}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}