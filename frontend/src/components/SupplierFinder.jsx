import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var r = result?.intelligenceReport || {}
    return [
        'You are a supply chain expert for Indian wellness D2C brands.',
        'Find raw material suppliers and manufacturers for: "' + keyword + '"',
        '',
        'Product opportunity: ' + (r.product_opportunity || ''),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "raw_materials": [',
        '    {',
        '      "material": "Raw material name",',
        '      "source_regions": ["Uttarakhand", "Rajasthan"],',
        '      "availability": "Abundant / Moderate / Scarce",',
        '      "price_per_kg": "₹X - ₹Y",',
        '      "quality_grade": "Pharmaceutical / Food / Cosmetic"',
        '    }',
        '  ],',
        '  "suppliers": [',
        '    {',
        '      "name": "Supplier/Manufacturer Name",',
        '      "location": "City, State",',
        '      "type": "Raw Material / Contract Manufacturer / Both",',
        '      "speciality": "What they are known for",',
        '      "moq": "Minimum order quantity",',
        '      "certifications": ["GMP", "ISO", "FSSAI"],',
        '      "contact_hint": "How to find them (e.g. IndiaMART, Trade India, direct)",',
        '      "reliability": "High / Medium",',
        '      "price_tier": "Budget / Mid / Premium"',
        '    }',
        '  ],',
        '  "sourcing_tip": "Key tip for sourcing this ingredient in India (2 sentences)",',
        '  "lead_time": "Typical lead time from order to delivery",',
        '  "import_option": "Is importing better? From where? (1-2 sentences)",',
        '  "cost_breakdown": {',
        '    "raw_material_pct": 30,',
        '    "manufacturing_pct": 25,',
        '    "packaging_pct": 20,',
        '    "other_pct": 25',
        '  }',
        '}',
    ].join('\n')
}

function AvailabilityDot({ level }) {
    var colors = { Abundant: 'var(--teal)', Moderate: 'var(--amber)', Scarce: 'var(--red)' }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors[level] || 'var(--text-3)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: colors[level] || 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{level}</span>
        </span>
    )
}

export default function SupplierFinder({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [tab, setTab] = useState('suppliers')
    var [error, setError] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            // Step 1: Retrieve real sources (RAG)
            var retrieved = await rag.retrieve(keyword, 'supplier')
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
        } catch (e) { setError('Could not load supplier data. Try again.') }
        finally { setLoading(false) }
    }

    var cb = data?.cost_breakdown || {}
    var costBars = [
        { label: 'Raw Material', pct: cb.raw_material_pct, color: 'var(--teal)' },
        { label: 'Manufacturing', pct: cb.manufacturing_pct, color: 'var(--gold)' },
        { label: 'Packaging', pct: cb.packaging_pct, color: '#A78BFA' },
        { label: 'Other', pct: cb.other_pct, color: 'var(--text-3)' },
    ]

    return (
        <div style={{ marginTop: 12 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#FB923C' }}>
                📦 Supplier Finder
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(251,146,60,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#FB923C' }}>Supplier Finder</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Raw materials & manufacturers for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading}
                            style={{ padding: '6px 14px', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#FB923C' }}>
                            {loading ? '⟳ Searching...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {/* Tabs */}
                    {data && (
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-dim)' }}>
                            {['suppliers', 'materials', 'costs'].map(function (t) {
                                var labels = { suppliers: '🏭 Suppliers', materials: '🌿 Raw Materials', costs: '📊 Cost Breakdown' }
                                return (
                                    <button key={t} onClick={function () { setTab(t) }} style={{ flex: 1, padding: '10px 8px', background: tab === t ? 'rgba(251,146,60,0.06)' : 'none', border: 'none', borderBottom: '2px solid ' + (tab === t ? '#FB923C' : 'transparent'), cursor: 'pointer', fontSize: 10, color: tab === t ? '#FB923C' : 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                        {labels[t]}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {loading && <div style={{ padding: 32, textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 8 }}>📦</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>Finding suppliers across India...</div></div>}
                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 16 }}>

                            {/* Suppliers tab */}
                            {tab === 'suppliers' && (
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                                        {(data.suppliers || []).map(function (s, i) {
                                            return (
                                                <div key={i} style={{ padding: 16, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, transition: 'border-color 0.2s' }}
                                                    onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)' }}
                                                    onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#FB923C', marginBottom: 3 }}>{s.name}</div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>📍 {s.location} · {s.type}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                            <span style={{ padding: '2px 8px', background: s.price_tier === 'Budget' ? 'rgba(45,212,191,0.08)' : s.price_tier === 'Premium' ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)', borderRadius: 20, fontSize: 9, color: 'var(--text-2)', fontFamily: 'var(--f-mono)' }}>{s.price_tier}</span>
                                                            <span style={{ padding: '2px 8px', background: s.reliability === 'High' ? 'rgba(45,212,191,0.08)' : 'rgba(252,211,77,0.08)', border: '1px solid ' + (s.reliability === 'High' ? 'rgba(45,212,191,0.2)' : 'rgba(252,211,77,0.2)'), borderRadius: 20, fontSize: 9, color: s.reliability === 'High' ? 'var(--teal)' : 'var(--amber)', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{s.reliability} reliability</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>{s.speciality}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                                        {(s.certifications || []).map(function (cert) {
                                                            return <span key={cert} style={{ padding: '2px 8px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 20, fontSize: 9, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>{cert}</span>
                                                        })}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>MOQ: <span style={{ color: 'var(--text-1)' }}>{s.moq}</span></div>
                                                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Find via: <span style={{ color: 'var(--gold)' }}>{s.contact_hint}</span></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div style={{ padding: 14, background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: 8, marginBottom: 10 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#FB923C', letterSpacing: '0.1em', marginBottom: 6 }}>💡 SOURCING TIP</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.sourcing_tip}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, padding: 12, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 4 }}>LEAD TIME</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{data.lead_time}</div>
                                        </div>
                                        <div style={{ flex: 2, padding: 12, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 4 }}>IMPORT OPTION</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>{data.import_option}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Raw materials tab */}
                            {tab === 'materials' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(data.raw_materials || []).map(function (m, i) {
                                        return (
                                            <div key={i} style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{m.material}</div>
                                                    <AvailabilityDot level={m.availability} />
                                                </div>
                                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Price: <span style={{ color: 'var(--gold)', fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{m.price_per_kg}/kg</span></div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Grade: <span style={{ color: 'var(--teal)' }}>{m.quality_grade}</span></div>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {(m.source_regions || []).map(function (r) {
                                                        return <span key={r} style={{ padding: '2px 8px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: 20, fontSize: 9, color: '#FB923C', fontFamily: 'var(--f-mono)' }}>📍 {r}</span>
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Cost breakdown tab */}
                            {tab === 'costs' && (
                                <div>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 14 }}>TYPICAL COST BREAKDOWN PER UNIT</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {costBars.map(function (b) {
                                            return (
                                                <div key={b.label}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{b.label}</span>
                                                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: b.color }}>{b.pct}%</span>
                                                    </div>
                                                    <div style={{ height: 8, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: (b.pct || 0) + '%', background: b.color, borderRadius: 4, transition: 'width 1s ease' }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
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