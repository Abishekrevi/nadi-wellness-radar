import { useState } from 'react'

function buildPrompt(keyword) {
    return [
        'You are a wellness industry news curator for Indian D2C founders.',
        'Generate 8 realistic, relevant recent news headlines and summaries about: "' + keyword + '"',
        '',
        'Focus on: Indian market developments, clinical studies, brand launches, consumer trends, regulatory updates.',
        '',
        'Respond ONLY with valid JSON, no markdown:',
        '{',
        '  "articles": [',
        '    {',
        '      "headline": "News headline here",',
        '      "source": "Economic Times / Times of India / Business Standard / NDTV / etc",',
        '      "date": "March 2025",',
        '      "category": "Market / Research / Brand / Regulation / Consumer",',
        '      "summary": "2-3 sentence summary of the news",',
        '      "relevance": "High / Medium",',
        '      "sentiment": "Positive / Neutral / Negative"',
        '    }',
        '  ]',
        '}',
    ].join('\n')
}

function categoryColor(cat) {
    var map = {
        'Market': { bg: 'rgba(45,212,191,0.08)', color: 'var(--teal)', border: 'rgba(45,212,191,0.2)' },
        'Research': { bg: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: 'rgba(96,165,250,0.2)' },
        'Brand': { bg: 'rgba(201,168,76,0.08)', color: 'var(--gold)', border: 'rgba(201,168,76,0.2)' },
        'Regulation': { bg: 'rgba(248,113,113,0.08)', color: 'var(--red)', border: 'rgba(248,113,113,0.2)' },
        'Consumer': { bg: 'rgba(167,139,250,0.08)', color: '#A78BFA', border: 'rgba(167,139,250,0.2)' },
    }
    return map[cat] || map['Market']
}

function sentimentIcon(s) {
    if (s === 'Positive') return '📈'
    if (s === 'Negative') return '📉'
    return '➡️'
}

export default function TrendNewsFeed({ keyword }) {
    var [loading, setLoading] = useState(false)
    var [articles, setArticles] = useState(null)
    var [open, setOpen] = useState(false)
    var [filter, setFilter] = useState('All')
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
                    max_tokens: 1500,
                    messages: [{ role: 'user', content: buildPrompt(keyword) }],
                }),
            })
            var res = await response.json()
            var text = res.content && res.content[0] ? res.content[0].text : ''
            var clean = text.replace(/```json|```/g, '').trim()
            var parsed = JSON.parse(clean)
            setArticles(parsed.articles || [])
        } catch (e) {
            setError('Could not load news feed. Try again.')
        } finally {
            setLoading(false)
        }
    }

    var categories = ['All', 'Market', 'Research', 'Brand', 'Regulation', 'Consumer']
    var filtered = articles
        ? filter === 'All' ? articles : articles.filter(function (a) { return a.category === filter })
        : []

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }); if (!open && !articles) generate() }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: open ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.05)',
                    border: '1px solid rgba(251,146,60,0.25)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#FB923C',
                }}
            >
                📰 Trend News Feed
            </button>

            {open && (
                <div style={{ marginTop: 8, background: 'var(--bg-float)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(251,146,60,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#FB923C' }}>Trend News Feed</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Latest news & developments for "{keyword}"</div>
                        </div>
                        <button onClick={generate} disabled={loading} style={{ padding: '6px 14px', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#FB923C' }}>
                            {loading ? '⟳ Loading...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {/* Category filter */}
                    {articles && (
                        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-dim)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {categories.map(function (cat) {
                                var active = filter === cat
                                return (
                                    <button key={cat} onClick={function () { setFilter(cat) }} style={{
                                        padding: '4px 12px',
                                        background: active ? 'rgba(251,146,60,0.12)' : 'none',
                                        border: '1px solid ' + (active ? 'rgba(251,146,60,0.35)' : 'var(--border-dim)'),
                                        borderRadius: 20, cursor: 'pointer',
                                        fontSize: 10, color: active ? '#FB923C' : 'var(--text-3)',
                                        fontFamily: 'var(--f-mono)',
                                    }}>
                                        {cat}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {loading && (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📰</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Curating latest news for "{keyword}"...</div>
                        </div>
                    )}

                    {error && <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>}

                    {/* Articles */}
                    {filtered.length > 0 && (
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
                            {filtered.map(function (article, i) {
                                var catStyle = categoryColor(article.category)
                                return (
                                    <div key={i} style={{
                                        padding: 16,
                                        background: 'var(--bg-raised)',
                                        border: '1px solid var(--border-dim)',
                                        borderRadius: 8,
                                        transition: 'border-color 0.2s',
                                    }}
                                        onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(251,146,60,0.25)' }}
                                        onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-dim)' }}
                                    >
                                        {/* Meta row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                            <span style={{ padding: '2px 8px', background: catStyle.bg, border: '1px solid ' + catStyle.border, borderRadius: 20, fontSize: 8, fontWeight: 700, color: catStyle.color, fontFamily: 'var(--f-mono)', letterSpacing: '0.1em' }}>
                                                {article.category}
                                            </span>
                                            <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{article.source}</span>
                                            <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>·</span>
                                            <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{article.date}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: 12 }}>{sentimentIcon(article.sentiment)}</span>
                                        </div>

                                        {/* Headline */}
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8, lineHeight: 1.4 }}>
                                            {article.headline}
                                        </div>

                                        {/* Summary */}
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.7 }}>
                                            {article.summary}
                                        </div>

                                        {/* Relevance */}
                                        {article.relevance === 'High' && (
                                            <div style={{ marginTop: 8, fontSize: 9, color: 'var(--teal)', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
                                                ★ HIGH RELEVANCE
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {articles && filtered.length === 0 && (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                            No articles in this category
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}