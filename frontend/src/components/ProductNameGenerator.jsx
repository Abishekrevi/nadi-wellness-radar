import { useState } from 'react'

function buildPrompt(keyword, report) {
    var opp = report?.product_opportunity || ''
    var consumer = report?.target_consumer || ''
    return [
        'You are a premium D2C brand naming expert specializing in the Indian wellness market.',
        'Generate 6 creative brand names for a product based on this trend: "' + keyword + '".',
        '',
        'Product opportunity context: ' + opp,
        'Target consumer: ' + consumer,
        '',
        'Requirements:',
        '- Mix of English and Sanskrit/Hindi inspired names',
        '- Easy to pronounce for Indian consumers',
        '- Suitable for premium D2C positioning',
        '- Short (1-3 words max)',
        '- Suggest a product format for each (e.g. gummies, capsules, oil, powder, serum)',
        '',
        'Respond ONLY with valid JSON in this exact format, no markdown:',
        '{',
        '  "names": [',
        '    {',
        '      "name": "BrandName",',
        '      "meaning": "brief meaning or inspiration (1 sentence)",',
        '      "format": "product format",',
        '      "tagline": "short punchy tagline under 8 words",',
        '      "vibe": "Premium / Ayurvedic / Modern / Scientific / Earthy"',
        '    }',
        '  ]',
        '}',
    ].join('\n')
}

function VibeTag({ vibe }) {
    var colors = {
        'Premium': { bg: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: 'rgba(201,168,76,0.3)' },
        'Ayurvedic': { bg: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: 'rgba(45,212,191,0.25)' },
        'Modern': { bg: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: 'rgba(139,92,246,0.25)' },
        'Scientific': { bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
        'Earthy': { bg: 'rgba(251,146,60,0.1)', color: '#FB923C', border: 'rgba(251,146,60,0.25)' },
    }
    var c = colors[vibe] || colors['Modern']
    return (
        <span style={{
            padding: '2px 8px', borderRadius: 20,
            background: c.bg, border: '1px solid ' + c.border,
            fontSize: 9, fontFamily: 'var(--f-mono)', color: c.color,
            fontWeight: 700, letterSpacing: '0.08em',
        }}>
            {vibe}
        </span>
    )
}

export default function ProductNameGenerator({ keyword, report }) {
    var [loading, setLoading] = useState(false)
    var [names, setNames] = useState(null)
    var [error, setError] = useState(null)
    var [open, setOpen] = useState(false)
    var [copied, setCopied] = useState(null)

    if (!keyword) return null

    async function generate() {
        setLoading(true)
        setError(null)
        setNames(null)
        try {
            var response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: buildPrompt(keyword, report) }],
                }),
            })
            var data = await response.json()
            var text = data.content && data.content[0] ? data.content[0].text : ''
            var clean = text.replace(/```json|```/g, '').trim()
            var parsed = JSON.parse(clean)
            setNames(parsed.names || [])
        } catch (e) {
            setError('Could not generate names. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function copyName(name) {
        navigator.clipboard.writeText(name.name + ' — ' + name.tagline)
        setCopied(name.name)
        setTimeout(function () { setCopied(null) }, 2000)
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }); if (!open && !names) generate() }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: open ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#A78BFA',
                }}
            >
                🧠 Brand Name Generator
            </button>

            {open && (
                <div style={{
                    marginTop: 8,
                    background: 'var(--bg-float)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(139,92,246,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>AI Brand Name Generator</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                                6 premium D2C brand names for "{keyword}"
                            </div>
                        </div>
                        <button
                            onClick={generate}
                            disabled={loading}
                            style={{
                                padding: '6px 14px',
                                background: 'rgba(139,92,246,0.12)',
                                border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: 6, cursor: 'pointer',
                                fontSize: 11, color: '#A78BFA',
                                fontFamily: 'var(--f-mono)',
                            }}
                        >
                            {loading ? '⟳ Generating...' : '🔄 Regenerate'}
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>🧠</div>
                            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Crafting premium brand names...</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 4 }}>
                                Drawing from Sanskrit, Hindi & modern D2C naming conventions
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ padding: 16, color: 'var(--red)', fontSize: 12 }}>{error}</div>
                    )}

                    {/* Names grid */}
                    {names && (
                        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                            {names.map(function (n, i) {
                                return (
                                    <div key={i} style={{
                                        padding: 16,
                                        background: 'var(--bg-raised)',
                                        border: '1px solid rgba(139,92,246,0.15)',
                                        borderRadius: 8,
                                        position: 'relative',
                                        transition: 'border-color 0.2s',
                                    }}
                                        onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)' }}
                                        onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)' }}
                                    >
                                        {/* Brand name */}
                                        <div style={{
                                            fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700,
                                            color: '#A78BFA', marginBottom: 4, letterSpacing: '0.02em',
                                        }}>
                                            {n.name}
                                        </div>

                                        {/* Tagline */}
                                        <div style={{ fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 10 }}>
                                            "{n.tagline}"
                                        </div>

                                        {/* Tags */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                            <VibeTag vibe={n.vibe} />
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 20,
                                                background: 'rgba(201,168,76,0.08)',
                                                border: '1px solid rgba(201,168,76,0.2)',
                                                fontSize: 9, fontFamily: 'var(--f-mono)', color: 'var(--gold)',
                                            }}>
                                                {n.format}
                                            </span>
                                        </div>

                                        {/* Meaning */}
                                        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 10 }}>
                                            {n.meaning}
                                        </div>

                                        {/* Copy button */}
                                        <button
                                            onClick={function () { copyName(n) }}
                                            style={{
                                                width: '100%', padding: '6px 0',
                                                background: copied === n.name ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: '1px solid ' + (copied === n.name ? 'rgba(45,212,191,0.3)' : 'var(--border-dim)'),
                                                borderRadius: 4, cursor: 'pointer',
                                                fontSize: 10, color: copied === n.name ? 'var(--teal)' : 'var(--text-3)',
                                                fontFamily: 'var(--f-mono)',
                                            }}
                                        >
                                            {copied === n.name ? '✓ Copied!' : 'Copy name + tagline'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}