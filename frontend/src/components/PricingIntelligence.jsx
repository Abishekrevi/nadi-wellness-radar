import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

function buildPrompt(keyword, result) {
    var score = result.momentumAccelerationScore || 0
    var r = result.intelligenceReport || {}
    var tam = result.marketSizePotential?.tam || 0
    var ecommerce = result.signals?.ecommerce || 0
    var avgPrice = result.signals?.amazonAvgPrice || 0
    var brands = (result.signals?.amazonBrands || []).slice(0, 5).join(', ')
    var pricePoints = (result.signals?.amazonPricePoints || []).map(p => p.range + ': ' + p.count + ' products').join(', ')

    return [
        'You are a D2C pricing expert for the Indian wellness market.',
        'Provide detailed pricing intelligence for this trend: "' + keyword + '"',
        '',
        'LIVE AMAZON INDIA DATA:',
        '- Products found: ' + ecommerce,
        '- Average price: ₹' + avgPrice,
        '- Price distribution: ' + (pricePoints || 'data not available'),
        '- Competing brands: ' + (brands || 'various'),
        '',
        'TREND DATA:',
        '- MAS Score: ' + score + '/100',
        '- Market TAM: ₹' + tam + 'Cr',
        '- Target consumer: ' + (r.target_consumer || ''),
        '- Product opportunity: ' + (r.product_opportunity || ''),
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "price_tiers": [',
        '    { "tier": "Economy", "mrp_range": "₹X - ₹Y", "target": "who buys this", "margin_pct": 45 },',
        '    { "tier": "Premium", "mrp_range": "₹X - ₹Y", "target": "who buys this", "margin_pct": 60 },',
        '    { "tier": "Ultra Premium", "mrp_range": "₹X - ₹Y", "target": "who buys this", "margin_pct": 70 }',
        '  ],',
        '  "recommended_mrp": "₹X",',
        '  "recommended_tier": "Premium",',
        '  "cogs_estimate": "₹X - ₹Y per unit",',
        '  "gross_margin": "X%",',
        '  "amazon_avg_price": "₹' + (avgPrice || 'X') + '",',
        '  "d2c_vs_amazon_advantage": "why D2C pricing works here",',
        '  "pricing_strategy": "2-3 sentence strategy",',
        '  "launch_offer": "suggested launch discount",',
        '  "subscription_price": "₹X/month",',
        '  "break_even_units": "X units/month"',
        '}',
    ].join('\n')
}

export default function PricingIntelligence({ keyword, result }) {
    var [open, setOpen] = useState(false)
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [error, setError] = useState(null)
    var rag = useRAG()

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            var ragContext = ''
            try {
                var ragResult = await rag.retrieve(keyword, 'pricing')
                ragContext = ragResult?.context?.slice(0, 2000) || ''
            } catch (e) { }

            var prompt = buildPrompt(keyword, result || {})
            if (ragContext) prompt += '\n\nADDITIONAL MARKET DATA:\n' + ragContext

            var res = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, max_tokens: 1500 }),
            })
            if (!res.ok) { var e = await res.json().catch(() => ({})); throw new Error(e.message || 'Server error ' + res.status) }
            var body = await res.json()
            var text = body.content?.[0]?.text || body.content || ''
            var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
            var jsonMatch = cleaned.match(/\{[\s\S]*\}/)
            if (!jsonMatch) throw new Error('Could not parse pricing data')
            setData(JSON.parse(jsonMatch[0]))
            setOpen(true)
        } catch (e) {
            setError('Could not generate pricing data. Try again.')
            console.error(e)
        } finally { setLoading(false) }
    }

    // Real Amazon price points for chart
    var amazonPricePoints = result?.signals?.amazonPricePoints || []
    var hasRealData = result?.signals?.amazonAvgPrice > 0

    return (
        <div style={{ marginTop: 10 }}>
            <button onClick={open ? () => setOpen(false) : (data ? () => setOpen(true) : generate)}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: open ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, cursor: loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                {loading ? '⟳ Generating...' : open ? '▲ Pricing Intelligence' : '💰 Pricing Intelligence'}
            </button>
            {error && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--red)' }}>⚠ {error}</div>}

            {open && data && (
                <div style={{ marginTop: 12, background: 'var(--bg-float)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>💰 Pricing Intelligence</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>{keyword}</div>

                    {/* Live Amazon data banner */}
                    {hasRealData && (
                        <div style={{ padding: '10px 14px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 6, marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div><div style={{ fontSize: 10, color: 'var(--text-3)' }}>Amazon IN Avg Price</div><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>₹{result.signals.amazonAvgPrice}</div></div>
                            <div><div style={{ fontSize: 10, color: 'var(--text-3)' }}>Products Found</div><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>{result.signals.ecommerce}</div></div>
                            {result.signals?.amazonAvgRating > 0 && <div><div style={{ fontSize: 10, color: 'var(--text-3)' }}>Avg Rating</div><div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>⭐ {result.signals.amazonAvgRating}</div></div>}
                            <div style={{ fontSize: 10, color: 'var(--teal)', display: 'flex', alignItems: 'center' }}>📡 Live Amazon data</div>
                        </div>
                    )}

                    {/* Amazon price distribution chart */}
                    {amazonPricePoints.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>Amazon India Price Distribution</div>
                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={amazonPricePoints} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                    <XAxis dataKey="range" tick={{ fill: 'var(--text-3)', fontSize: 9 }} />
                                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 9 }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-float)', border: '1px solid var(--border-dim)', fontSize: 11 }} />
                                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                        {amazonPricePoints.map(function (_, i) {
                                            return <Cell key={i} fill={['#00D4AA', '#F5C842', '#9B6DFF', '#FF6B6B'][i % 4]} />
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Recommended price highlight */}
                    <div style={{ padding: '14px 18px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>RECOMMENDED LAUNCH PRICE</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>{data.recommended_mrp}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{data.recommended_tier} tier · {data.gross_margin} gross margin</div>
                    </div>

                    {/* Price tiers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
                        {(data.price_tiers || []).map(function (tier, i) {
                            var isRec = tier.tier === data.recommended_tier
                            return (
                                <div key={i} style={{ padding: '14px', background: isRec ? 'rgba(201,168,76,0.1)' : 'var(--bg-raised)', border: '1px solid ' + (isRec ? 'rgba(201,168,76,0.4)' : 'var(--border-dim)'), borderRadius: 8 }}>
                                    {isRec && <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 4 }}>★ RECOMMENDED</div>}
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{tier.tier}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>{tier.mrp_range}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{tier.margin_pct}% margin</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.4 }}>{tier.target}</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[
                            { label: 'COGS Estimate', val: data.cogs_estimate },
                            { label: 'Break-even', val: data.break_even_units },
                            { label: 'Launch Offer', val: data.launch_offer },
                            { label: 'Subscription', val: data.subscription_price },
                        ].map(function (item) {
                            return item.val ? (
                                <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 6 }}>
                                    <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>{item.val}</div>
                                </div>
                            ) : null
                        })}
                    </div>

                    {data.pricing_strategy && (
                        <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 6, marginBottom: 10 }}>
                            <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 5 }}>PRICING STRATEGY</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>{data.pricing_strategy}</div>
                        </div>
                    )}

                    {data.d2c_vs_amazon_advantage && (
                        <div style={{ padding: '12px 14px', background: 'rgba(0,212,170,0.06)', borderRadius: 6, border: '1px solid rgba(0,212,170,0.15)' }}>
                            <div style={{ fontSize: 9, color: 'var(--teal)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 5 }}>D2C vs AMAZON ADVANTAGE</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>{data.d2c_vs_amazon_advantage}</div>
                        </div>
                    )}

                    {rag.sources.length > 0 && <SourcePanel sources={rag.sources} />}
                </div>
            )}
        </div>
    )
}