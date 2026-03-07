import { useState, useRef, useEffect } from 'react'

function buildSystemPrompt(result) {
    var r = result.intelligenceReport || {}
    var signals = result.signals || {}
    return [
        'You are NADI — Neural Ayurvedic & Digital Intelligence, an expert Indian wellness D2C market analyst.',
        'A founder has just analyzed the trend: "' + result.keyword + '"',
        '',
        'NADI DNA Analysis Results:',
        '- Momentum Acceleration Score (MAS): ' + result.momentumAccelerationScore + '/100',
        '- Classification: ' + (result.classification?.label || 'Unknown'),
        '- Market TAM: INR ' + (result.marketSizePotential?.tam || 0) + ' Crore',
        '- Time to Mainstream: ' + (result.timeToMainstream || 'Unknown'),
        '- Reddit mentions: ' + (signals.reddit || 0),
        '- YouTube mentions: ' + (signals.youtube || 0),
        '- Research papers: ' + (signals.research || 0),
        '- Amazon India products: ' + (signals.ecommerce || 0),
        '- Verdict: ' + (r.verdict || 'Unknown'),
        '',
        'Intelligence Brief Summary:',
        '- Executive Summary: ' + (r.executive_summary || 'N/A'),
        '- Why Now: ' + (r.why_now || 'N/A'),
        '- Market Gap: ' + (r.market_gap || 'N/A'),
        '- Target Consumer: ' + (r.target_consumer || 'N/A'),
        '- Product Opportunity: ' + (r.product_opportunity || 'N/A'),
        '- Go-to-Market: ' + (r.go_to_market || 'N/A'),
        '- Revenue Model: ' + (r.revenue_model || 'N/A'),
        '- Risk Assessment: ' + (r.risk_assessment || 'N/A'),
        '',
        'Answer the founder\'s questions based ONLY on this data. Be specific, practical, and India-focused.',
        'Keep responses concise — 2-4 sentences max unless the question requires more detail.',
        'Always ground your answers in the actual signal data provided above.',
    ].join('\n')
}

var SUGGESTED_QUESTIONS = [
    'What is the best pricing for this product in India?',
    'Which Indian states should I launch in first?',
    'Who are the top competitors in this category?',
    'What is the ideal product format for this trend?',
    'How should I position this on Amazon India?',
    'What is the risk of this being a fad?',
]

export default function ReportChat({ result }) {
    var [messages, setMessages] = useState([])
    var [input, setInput] = useState('')
    var [loading, setLoading] = useState(false)
    var [open, setOpen] = useState(false)
    var bottomRef = useRef(null)

    useEffect(function () {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (!result) return null

    async function sendMessage(text) {
        var question = (text || input).trim()
        if (!question || loading) return
        setInput('')

        var userMsg = { role: 'user', content: question }
        var newMessages = messages.concat([userMsg])
        setMessages(newMessages)
        setLoading(true)

        try {
            var response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: buildSystemPrompt(result),
                    messages: newMessages.map(function (m) {
                        return { role: m.role, content: m.content }
                    }),
                }),
            })

            var data = await response.json()
            var reply = data.content && data.content[0] ? data.content[0].text : 'Sorry, I could not generate a response.'

            setMessages(function (prev) {
                return prev.concat([{ role: 'assistant', content: reply }])
            })
        } catch (e) {
            setMessages(function (prev) {
                return prev.concat([{ role: 'assistant', content: 'Error: ' + e.message }])
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: 16 }}>
            {/* Toggle button */}
            <button
                onClick={function () { setOpen(function (o) { return !o }) }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 18px',
                    background: open ? 'rgba(201,168,76,0.08)' : 'var(--bg-float)',
                    border: '1px solid ' + (open ? 'rgba(201,168,76,0.3)' : 'var(--border-mid)'),
                    borderRadius: open ? '8px 8px 0 0' : 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <span style={{ fontSize: 18 }}>🤖</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>
                        CHAT WITH YOUR REPORT
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                        Ask NADI anything about this trend — pricing, GTM, competition, risks
                    </div>
                </div>
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    background: '#07090D',
                    overflow: 'hidden',
                }}>
                    {/* Suggested questions */}
                    {messages.length === 0 && (
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-dim)' }}>
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 10 }}>
                                SUGGESTED QUESTIONS
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                {SUGGESTED_QUESTIONS.map(function (q) {
                                    return (
                                        <button
                                            key={q}
                                            onClick={function () { sendMessage(q) }}
                                            disabled={loading}
                                            style={{
                                                padding: '5px 12px',
                                                background: 'rgba(201,168,76,0.06)',
                                                border: '1px solid rgba(201,168,76,0.2)',
                                                borderRadius: 20, cursor: 'pointer',
                                                fontSize: 10, color: 'var(--gold)',
                                                fontFamily: 'var(--f-mono)',
                                            }}
                                        >
                                            {q}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{ height: 320, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, marginTop: 40 }}>
                                Ask me anything about "{result.keyword}"
                            </div>
                        )}
                        {messages.map(function (msg, i) {
                            var isUser = msg.role === 'user'
                            return (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                                }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '10px 14px',
                                        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                                        background: isUser ? 'rgba(201,168,76,0.12)' : 'var(--bg-float)',
                                        border: '1px solid ' + (isUser ? 'rgba(201,168,76,0.25)' : 'var(--border-dim)'),
                                        fontSize: 12, color: 'var(--text-1)',
                                        lineHeight: 1.7,
                                    }}>
                                        {!isUser && (
                                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 6 }}>
                                                NADI ANALYST
                                            </div>
                                        )}
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        })}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px 12px 12px 4px',
                                    background: 'var(--bg-float)',
                                    border: '1px solid var(--border-dim)',
                                    fontSize: 12, color: 'var(--text-3)',
                                    fontFamily: 'var(--f-mono)',
                                }}>
                                    NADI is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        display: 'flex', gap: 10, padding: '12px 16px',
                        borderTop: '1px solid var(--border-dim)',
                        background: 'var(--bg-raised)',
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={function (e) { setInput(e.target.value) }}
                            onKeyDown={function (e) { if (e.key === 'Enter') sendMessage() }}
                            placeholder={'Ask about ' + result.keyword + '...'}
                            disabled={loading}
                            style={{ flex: 1, fontSize: 12 }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={function () { sendMessage() }}
                            disabled={loading || !input.trim()}
                            style={{ height: 42, padding: '0 18px' }}
                        >
                            {loading ? '⟳' : 'Ask →'}
                        </button>
                    </div>

                    {messages.length > 0 && (
                        <div style={{ padding: '8px 16px', textAlign: 'right' }}>
                            <button
                                onClick={function () { setMessages([]) }}
                                style={{
                                    background: 'none', border: 'none',
                                    color: 'var(--text-3)', cursor: 'pointer',
                                    fontSize: 10, fontFamily: 'var(--f-mono)',
                                }}
                            >
                                Clear chat
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}