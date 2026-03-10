import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var score = result.momentumAccelerationScore || 0
    var r = result.intelligenceReport || {}
    var tam = result.marketSizePotential?.tam || 0
    var ecommerce = result.signals?.ecommerce || 0

    return [
        'You are a D2C pricing expert for the Indian wellness market.',
        'Provide detailed pricing intelligence for this trend: "' + keyword + '"',
        '',
        'Context:',
        '- MAS Score: ' + score + '/100',
        '- Market TAM: ₹' + tam + 'Cr',
        '- Amazon India products found: ' + ecommerce,
        '- Target consumer: ' + (r.target_consumer || ''),
        '- Product opportunity: ' + (r.product_opportunity || ''),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "price_tiers": [',
        '    { "tier": "Economy", "mrp_range": "₹X - ₹Y", "target": "who this targets", "margin_pct": 45 },',
        '    { "tier": "Premium", "mrp_range": "₹X - ₹Y", "target": "who this targets", "margin_pct": 60 },',
        '    { "tier": "Ultra Premium", "mrp_range": "₹X - ₹Y", "target": "who this targets", "margin_pct": 70 }',
        '  ],',
        '  "recommended_mrp": "₹X",',
        '  "recommended_tier": "Premium",',
        '  "cogs_estimate": "₹X - ₹Y per unit",',
        '  "gross_margin": "X%",',
        '  "amazon_avg_price": "₹X",',
        '  "amazon_top_price": "₹X",',
        '  "amazon_bottom_price": "₹X",',
        '  "d2c_vs_amazon_advantage": "explanation of why D2C pricing works here",',
        '  "pricing_strategy": "2-3 sentence pricing strategy recommendation",',
        '  "launch_offer": "suggested launch discount or offer",',
        '  "subscription_price": "₹X/month if applicable",',
        '  "break_even_units": "X units/month at recommended price"',
        '}',
    ].join('\n')
}

function TierCard({ tier, recommended }) {
    var isRec = recommended === tier.tier
    return (
        <div style={{
            padding: 16,
            background: isRec ? 'rgba(201,168,76,0.08)' : 'var(--bg-float)',
            border: '1px solid ' + (isRec ? 'rgba(201,168,76,0.35)' : 'var(--border-dim)'),
            borderRadius: 10,
            position: 'relative',
            flex: 1,
            minWidth: 160,
        }}>
            {isRec && (
                <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--gold)', color: '#07090D',
                    fontSize: 8, fontWeight: 700, fontFamily: 'var(--f-mono)',
                    padding: '3px 10px', borderRadius: 10, letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                }}>
                    RECOMMENDED
                </div>
            )}
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginBottom: 6, letterSpacing: '0.1em' }}>
                {tier.tier.toUpperCase()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isRec ? 'var(--gold)' : 'var(--text-1)', fontFamily: 'var(--f-mono)', marginBottom: 4 }}>
                {tier.mrp_range}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10 }}>{tier.target}</div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px 0',
                background: 'rgba(45,212,191,0.08)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderRadius: 6,
                fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: 'var(--teal)',
            }}>
                {tier.margin_pct}% margin
            </div>
        </div>
    )
}

export default function PricingIntelligence({ keyword, result }) {
    var rag = useRAG()
    var [ragData, setRagData] = useState(null)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [error, setError] = useState(null)

    if (!result) return null

    async function generate() {
        setLoading(true)
        setError(null)
        try {
            // Build prompt (with optional RAG context)
            var prompt = buildPrompt(keyword, result || {})
            var response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            var res = await response.json()
            var text = res.content && res.content[0] ? res.content[0].text : ''
            var clean = text.replace(/```json|```/g, '').trim()
            setData(JSON.parse(clean))
        } catch (e) {
            setError('Could not generate pricing data. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: open ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.05)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: 'var(--gold)',
                }}
            >
                🏷️ Pricing Intelligence
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Pricing Intelligence</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>MRP tiers · margins · Amazon benchmarks for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading} style={{ padding: '6px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--gold)' }}>
                            {loading ? '⟳ Analyzing...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {loading && (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>🏷️</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Analyzing Amazon prices, margins & D2C positioning...</div>
                        </div>
                    )}

                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ padding: 18 }}>
                            {/* Price tiers */}
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 14 }}>PRICE TIERS</div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                                {(data.price_tiers || []).map(function (tier) {
                                    return <TierCard key={tier.tier} tier={tier} recommended={data.recommended_tier} />
                                })}
                            </div>

                            {/* Key metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                                {[
                                    { label: 'Recommended MRP', value: data.recommended_mrp, color: 'var(--gold)' },
                                    { label: 'COGS Estimate', value: data.cogs_estimate, color: 'var(--text-1)' },
                                    { label: 'Gross Margin', value: data.gross_margin, color: 'var(--teal)' },
                                    { label: 'Amazon Avg Price', value: data.amazon_avg_price, color: 'var(--text-1)' },
                                    { label: 'Break-even Units', value: data.break_even_units, color: 'var(--amber)' },
                                    { label: 'Subscription Price', value: data.subscription_price, color: 'var(--teal)' },
                                ].map(function (m) {
                                    return (
                                        <div key={m.label} style={{ padding: '10px 14px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: 'var(--f-mono)', marginBottom: 4 }}>{m.value || '—'}</div>
                                            <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{m.label}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Amazon benchmark */}
                            <div style={{ padding: 14, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, marginBottom: 12 }}>
                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.12em', marginBottom: 8 }}>AMAZON INDIA PRICE RANGE</div>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{data.amazon_bottom_price}</div><div style={{ fontSize: 9, color: 'var(--text-3)' }}>Lowest</div></div>
                                    <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{data.amazon_avg_price}</div><div style={{ fontSize: 9, color: 'var(--text-3)' }}>Average</div></div>
                                    <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{data.amazon_top_price}</div><div style={{ fontSize: 9, color: 'var(--text-3)' }}>Premium</div></div>
                                </div>
                            </div>

                            {/* Strategy */}
                            {data.pricing_strategy && (
                                <div style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8, marginBottom: 10 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>PRICING STRATEGY</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{data.pricing_strategy}</div>
                                </div>
                            )}

                            {/* Launch offer */}
                            {data.launch_offer && (
                                <div style={{ padding: 12, background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.2)', borderRadius: 8 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.12em', marginBottom: 4 }}>🎁 LAUNCH OFFER SUGGESTION</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)' }}>{data.launch_offer}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}