import { useRAG, SourcePanel, RAGStatus } from '../utils/useRAG.jsx'
import { useState } from 'react'

function buildPrompt(keyword, result) {
    var score = result?.momentumAccelerationScore || 0
    var tam = result?.marketSizePotential?.tam || 0
    var r = result?.intelligenceReport || {}

    return [
        'You are a senior research analyst at a top-tier D2C market intelligence firm.',
        'Write a comprehensive, in-depth research report on: "' + keyword + '" for the Indian wellness market.',
        '',
        'Available data:',
        '- MAS Score: ' + score + '/100',
        '- Market TAM: ₹' + tam + 'Cr',
        '- Classification: ' + (result?.classification?.label || ''),
        '- Executive Summary: ' + (r.executive_summary || ''),
        '- Target Consumer: ' + (r.target_consumer || ''),
        '- Market Gap: ' + (r.market_gap || ''),
        '',
        'Write a COMPREHENSIVE research report with these exact sections.',
        'Each section must be detailed, data-rich, and actionable. Be specific to India.',
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "title": "Full research report title",',
        '  "published": "' + new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + '",',
        '  "executive_summary": "3-4 paragraph comprehensive overview",',
        '  "market_overview": {',
        '    "current_state": "Detailed current state of this market in India (2-3 paragraphs)",',
        '    "historical_context": "How this trend evolved globally and in India (1-2 paragraphs)",',
        '    "key_statistics": ["Stat 1 with number", "Stat 2 with number", "Stat 3 with number", "Stat 4"]',
        '  },',
        '  "consumer_analysis": {',
        '    "primary_demographics": "Detailed primary consumer profile",',
        '    "psychographics": "Values, motivations, lifestyle (1 paragraph)",',
        '    "purchase_triggers": ["Trigger 1", "Trigger 2", "Trigger 3"],',
        '    "barriers_to_adoption": ["Barrier 1", "Barrier 2", "Barrier 3"],',
        '    "regional_variations": "How demand varies across Indian states/cities"',
        '  },',
        '  "scientific_evidence": {',
        '    "clinical_backing": "Summary of scientific research supporting this trend",',
        '    "key_studies": ["Study finding 1", "Study finding 2", "Study finding 3"],',
        '    "efficacy_rating": "Strong / Moderate / Emerging / Anecdotal",',
        '    "safety_profile": "Known safety considerations"',
        '  },',
        '  "market_dynamics": {',
        '    "growth_drivers": ["Driver 1", "Driver 2", "Driver 3", "Driver 4"],',
        '    "market_challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],',
        '    "regulatory_landscape": "Current and upcoming regulations in India",',
        '    "supply_chain": "Key supply chain considerations"',
        '  },',
        '  "competitive_landscape": {',
        '    "market_structure": "How competitive the space is",',
        '    "key_players": ["Player 1 — what they do", "Player 2 — what they do"],',
        '    "white_space": "Biggest unmet need in the market"',
        '  },',
        '  "opportunity_assessment": {',
        '    "short_term": "6-18 month opportunity",',
        '    "medium_term": "18-36 month opportunity",',
        '    "long_term": "3-5 year vision",',
        '    "tam_breakdown": "How to size the total addressable market",',
        '    "revenue_potential": "Realistic revenue for a D2C brand in year 1-3"',
        '  },',
        '  "strategic_recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4", "Recommendation 5"],',
        '  "risk_analysis": {',
        '    "high_risks": ["Risk 1", "Risk 2"],',
        '    "medium_risks": ["Risk 1", "Risk 2"],',
        '    "mitigation_strategies": ["Strategy 1", "Strategy 2", "Strategy 3"]',
        '  },',
        '  "verdict": "Final 2-3 sentence verdict — should a founder build in this space now?",',
        '  "confidence_level": 85,',
        '  "sources_referenced": ["Source type 1", "Source type 2", "Source type 3", "Source type 4"]',
        '}',
    ].join('\n')
}

var SECTIONS = [
    { key: 'overview', label: '📊 Market Overview' },
    { key: 'consumer', label: '👤 Consumer Analysis' },
    { key: 'science', label: '🔬 Scientific Evidence' },
    { key: 'dynamics', label: '⚡ Market Dynamics' },
    { key: 'competitive', label: '🎯 Competitive Landscape' },
    { key: 'opportunity', label: '💡 Opportunity Assessment' },
    { key: 'strategy', label: '🚀 Strategic Recommendations' },
    { key: 'risk', label: '⚠️ Risk Analysis' },
]

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                {title}
            </div>
            {children}
        </div>
    )
}

function Prose({ text }) {
    return <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.85 }}>{text}</div>
}

function BulletList({ items, color }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(items || []).map(function (item, i) {
                return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: color || 'var(--teal)', marginTop: 2, flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7 }}>{item}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default function ResearchReport({ keyword, result }) {
    var [loading, setLoading] = useState(false)
    var [data, setData] = useState(null)
    var [open, setOpen] = useState(false)
    var [section, setSection] = useState('overview')
    var [error, setError] = useState(null)
    var [copied, setCopied] = useState(false)
    var [ragData, setRagData] = useState(null)
    var rag = useRAG()

    if (!keyword) return null

    async function generate() {
        setLoading(true); setError(null)
        try {
            // Step 1: Retrieve real sources (RAG)
            var retrieved = await rag.retrieve(keyword, 'research')
            setRagData(retrieved)
            // Step 2: Build prompt grounded in real sources
            var ragContext = retrieved.context || ''
            var prompt = buildPrompt(keyword, result) + '\n\nREAL RETRIEVED SOURCES (use these to ground your answer, cite them, do not hallucinate):\n' + ragContext
            // Step 3: Generate AI response from real data
            var res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514', max_tokens: 4000,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            var d = await res.json()
            var text = d.content?.[0]?.text || ''
            setData(JSON.parse(text.replace(/```json|```/g, '').trim()))
        } catch (e) { setError('Could not generate report. Try again.') }
        finally { setLoading(false) }
    }

    function copyReport() {
        if (!data) return
        var text = [
            data.title,
            'Published: ' + data.published,
            '',
            'EXECUTIVE SUMMARY',
            data.executive_summary,
            '',
            'VERDICT',
            data.verdict,
            '',
            'STRATEGIC RECOMMENDATIONS',
            (data.strategic_recommendations || []).map(function (r, i) { return (i + 1) + '. ' + r }).join('\n'),
        ].join('\n')
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(function () { setCopied(false) }, 2000)
    }

    var m = data?.market_overview || {}
    var ca = data?.consumer_analysis || {}
    var se = data?.scientific_evidence || {}
    var md = data?.market_dynamics || {}
    var cl = data?.competitive_landscape || {}
    var oa = data?.opportunity_assessment || {}
    var ra = data?.risk_analysis || {}

    return (
        <div style={{ marginTop: 12 }}>
            <button onClick={function () { setOpen(function (o) { return !o }); if (!open && !data) generate() }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: open ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                📊 Deep Research Report
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, overflow: 'hidden' }}>

                    {/* Header */}
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(201,168,76,0.15)', background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 900, color: 'var(--gold)', marginBottom: 4 }}>
                                    {data?.title || 'Deep Research Report'}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                    {data?.published || ''} · Confidence: {data?.confidence_level || '—'}%
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={copyReport} disabled={!data}
                                    style={{ padding: '6px 14px', background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(201,168,76,0.08)', border: '1px solid ' + (copied ? 'rgba(45,212,191,0.3)' : 'rgba(201,168,76,0.25)'), borderRadius: 6, cursor: 'pointer', fontSize: 11, color: copied ? 'var(--teal)' : 'var(--gold)' }}>
                                    {copied ? '✅ Copied' : '📋 Copy'}
                                </button>
                                <button onClick={generate} disabled={loading}
                                    style={{ padding: '6px 14px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--gold)' }}>
                                    {loading ? '⟳ Generating...' : '🔄 Refresh'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <RAGStatus retrieving={rag.retrieving} sourceCount={ragData && ragData.sourceCount} />
                    {loading && (
                        <div style={{ padding: 48, textAlign: 'center' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                            <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 8, fontWeight: 600 }}>Generating Deep Research Report...</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.8, maxWidth: 400, margin: '0 auto' }}>
                                Analysing market data, scientific literature, consumer trends, competitive landscape and strategic opportunities for "{keyword}"
                            </div>
                        </div>
                    )}

                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {data && !loading && (
                        <div style={{ display: 'flex', minHeight: 500 }}>
                            {/* Sidebar nav */}
                            <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border-dim)', padding: '12px 0', background: 'rgba(0,0,0,0.2)' }}>
                                {SECTIONS.map(function (s) {
                                    return (
                                        <button key={s.key} onClick={function () { setSection(s.key) }} style={{
                                            width: '100%', padding: '10px 16px', background: section === s.key ? 'rgba(201,168,76,0.08)' : 'none',
                                            border: 'none', borderLeft: '2px solid ' + (section === s.key ? 'var(--gold)' : 'transparent'),
                                            cursor: 'pointer', textAlign: 'left',
                                            fontSize: 11, color: section === s.key ? 'var(--gold)' : 'var(--text-3)',
                                            transition: 'all 0.15s',
                                        }}>
                                            {s.label}
                                        </button>
                                    )
                                })}

                                {/* Verdict card at bottom */}
                                <div style={{ margin: '16px 12px 0', padding: 12, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 6 }}>VERDICT</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.6 }}>{data.verdict}</div>
                                </div>
                            </div>

                            {/* Content area */}
                            <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', maxHeight: 600 }}>

                                {/* Executive summary always shown at top */}
                                {data.executive_summary && (
                                    <div style={{ padding: 16, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 8, marginBottom: 24 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: 8 }}>EXECUTIVE SUMMARY</div>
                                        <Prose text={data.executive_summary} />
                                    </div>
                                )}

                                {/* Market Overview */}
                                {section === 'overview' && (
                                    <div>
                                        <Section title="Current Market State">
                                            <Prose text={m.current_state} />
                                        </Section>
                                        <Section title="Historical Context">
                                            <Prose text={m.historical_context} />
                                        </Section>
                                        <Section title="Key Statistics">
                                            <BulletList items={m.key_statistics} color="var(--teal)" />
                                        </Section>
                                    </div>
                                )}

                                {/* Consumer Analysis */}
                                {section === 'consumer' && (
                                    <div>
                                        <Section title="Primary Demographics">
                                            <Prose text={ca.primary_demographics} />
                                        </Section>
                                        <Section title="Psychographics & Motivations">
                                            <Prose text={ca.psychographics} />
                                        </Section>
                                        <Section title="Purchase Triggers">
                                            <BulletList items={ca.purchase_triggers} color="var(--teal)" />
                                        </Section>
                                        <Section title="Barriers to Adoption">
                                            <BulletList items={ca.barriers_to_adoption} color="var(--red)" />
                                        </Section>
                                        <Section title="Regional Variations in India">
                                            <Prose text={ca.regional_variations} />
                                        </Section>
                                    </div>
                                )}

                                {/* Scientific Evidence */}
                                {section === 'science' && (
                                    <div>
                                        <Section title="Clinical Backing">
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, padding: 12, background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8 }}>
                                                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)' }}>EFFICACY RATING</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{se.efficacy_rating}</div>
                                            </div>
                                            <Prose text={se.clinical_backing} />
                                        </Section>
                                        <Section title="Key Research Findings">
                                            <BulletList items={se.key_studies} color="var(--teal)" />
                                        </Section>
                                        <Section title="Safety Profile">
                                            <Prose text={se.safety_profile} />
                                        </Section>
                                    </div>
                                )}

                                {/* Market Dynamics */}
                                {section === 'dynamics' && (
                                    <div>
                                        <Section title="Growth Drivers">
                                            <BulletList items={md.growth_drivers} color="var(--teal)" />
                                        </Section>
                                        <Section title="Market Challenges">
                                            <BulletList items={md.market_challenges} color="var(--amber)" />
                                        </Section>
                                        <Section title="Regulatory Landscape">
                                            <Prose text={md.regulatory_landscape} />
                                        </Section>
                                        <Section title="Supply Chain">
                                            <Prose text={md.supply_chain} />
                                        </Section>
                                    </div>
                                )}

                                {/* Competitive Landscape */}
                                {section === 'competitive' && (
                                    <div>
                                        <Section title="Market Structure">
                                            <Prose text={cl.market_structure} />
                                        </Section>
                                        <Section title="Key Players">
                                            <BulletList items={cl.key_players} color="#A78BFA" />
                                        </Section>
                                        <Section title="White Space — Your Entry Point">
                                            <div style={{ padding: 14, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
                                                <Prose text={cl.white_space} />
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* Opportunity Assessment */}
                                {section === 'opportunity' && (
                                    <div>
                                        <Section title="Revenue Potential">
                                            <Prose text={oa.revenue_potential} />
                                        </Section>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
                                            {[
                                                { label: 'Short Term (6-18 months)', text: oa.short_term, color: 'var(--teal)' },
                                                { label: 'Medium Term (18-36 months)', text: oa.medium_term, color: 'var(--gold)' },
                                                { label: 'Long Term (3-5 years)', text: oa.long_term, color: '#A78BFA' },
                                            ].map(function (t) {
                                                return (
                                                    <div key={t.label} style={{ padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: t.color, marginBottom: 8 }}>{t.label.toUpperCase()}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.7 }}>{t.text}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <Section title="TAM Breakdown">
                                            <Prose text={oa.tam_breakdown} />
                                        </Section>
                                    </div>
                                )}

                                {/* Strategy */}
                                {section === 'strategy' && (
                                    <div>
                                        <Section title="Strategic Recommendations">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {(data.strategic_recommendations || []).map(function (rec, i) {
                                                    return (
                                                        <div key={i} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                                                                {i + 1}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.7, paddingTop: 4 }}>{rec}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Section>
                                        {data.sources_referenced?.length > 0 && (
                                            <Section title="Sources Referenced">
                                                <BulletList items={data.sources_referenced} color="var(--text-3)" />
                                            </Section>
                                        )}
                                    </div>
                                )}

                                {/* Risk */}
                                {section === 'risk' && (
                                    <div>
                                        <Section title="High Priority Risks">
                                            <BulletList items={ra.high_risks} color="var(--red)" />
                                        </Section>
                                        <Section title="Medium Priority Risks">
                                            <BulletList items={ra.medium_risks} color="var(--amber)" />
                                        </Section>
                                        <Section title="Mitigation Strategies">
                                            <BulletList items={ra.mitigation_strategies} color="var(--teal)" />
                                        </Section>
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