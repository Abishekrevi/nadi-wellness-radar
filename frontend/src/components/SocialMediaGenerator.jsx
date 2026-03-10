import { useState } from 'react'

var PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077B5' },
    { id: 'twitter', label: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
]

function buildPrompt(keyword, result, platform) {
    var score = result.momentumAccelerationScore || 0
    var r = result.intelligenceReport || {}
    var tam = result.marketSizePotential?.tam || 0

    var platformInstructions = {
        instagram: 'Write an engaging Instagram caption (150-200 words). Use line breaks for readability. Add 15-20 relevant hashtags at the end. Emoji-heavy, energetic, aspirational tone targeting Indian wellness founders and entrepreneurs.',
        linkedin: 'Write a professional LinkedIn post (200-250 words). Thought leadership tone. Include specific data points. 3-5 relevant hashtags. Address Indian D2C founders and investors. Tell a story about the opportunity.',
        twitter: 'Write a punchy Twitter/X thread with 5 tweets. Each tweet under 280 characters. Start with a hook tweet. Number them 1/5, 2/5 etc. Include key stats. End with a call to action.',
        whatsapp: 'Write a crisp WhatsApp message for a founder group (100-150 words). Conversational, urgent tone. Use bullet points. Include the key stats. End with "Sharing for awareness" style. No hashtags.',
    }

    return [
        'You are a social media expert for Indian D2C wellness startups.',
        'Create a social media post about this NADI trend intelligence finding:',
        '',
        'Trend: ' + keyword,
        'MAS Score: ' + score + '/100',
        'Classification: ' + (result.classification?.label || ''),
        'Market TAM: ₹' + tam + 'Cr',
        'Verdict: ' + (r.verdict || ''),
        'Key insight: ' + (r.executive_summary || '').slice(0, 200),
        'Why now: ' + (r.why_now || '').slice(0, 150),
        '',
        platformInstructions[platform],
        '',
        'Make it exciting, data-driven, and motivating for Indian founders.',
        'Do NOT use any markdown formatting. Just plain text ready to copy-paste.',
    ].join('\n')
}

export default function SocialMediaGenerator({ keyword, result }) {
    var [platform, setPlatform] = useState('instagram')
    var [loading, setLoading] = useState(false)
    var [posts, setPosts] = useState({})
    var [open, setOpen] = useState(false)
    var [copied, setCopied] = useState(false)

    if (!result) return null

    var currentPost = posts[platform]

    async function generate() {
        setLoading(true)
        try {
            var response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, max_tokens: 1000 }),
            })
            var data = await response.json()
            var text = data.content && data.content[0] ? data.content[0].text : ''
            setPosts(function (prev) {
                var next = Object.assign({}, prev)
                next[platform] = text
                return next
            })
        } catch (e) {
            setPosts(function (prev) {
                var next = Object.assign({}, prev)
                next[platform] = 'Error generating post. Please try again.'
                return next
            })
        } finally {
            setLoading(false)
        }
    }

    function copy() {
        if (!currentPost) return
        navigator.clipboard.writeText(currentPost)
        setCopied(true)
        setTimeout(function () { setCopied(false) }, 2000)
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }) }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: open ? 'rgba(225,48,108,0.1)' : 'rgba(225,48,108,0.05)',
                    border: '1px solid rgba(225,48,108,0.25)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#E1306C',
                }}
            >
                📸 Social Media Generator
            </button>

            {open && (
                <div style={{
                    marginTop: 8,
                    background: 'var(--bg-float)',
                    border: '1px solid rgba(225,48,108,0.2)',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}>
                    {/* Platform selector */}
                    <div style={{
                        display: 'flex', gap: 0,
                        borderBottom: '1px solid rgba(225,48,108,0.15)',
                    }}>
                        {PLATFORMS.map(function (p) {
                            var active = platform === p.id
                            return (
                                <button
                                    key={p.id}
                                    onClick={function () { setPlatform(p.id) }}
                                    style={{
                                        flex: 1, padding: '12px 8px',
                                        background: active ? 'rgba(255,255,255,0.04)' : 'none',
                                        border: 'none',
                                        borderBottom: '2px solid ' + (active ? p.color : 'transparent'),
                                        cursor: 'pointer',
                                        fontSize: 10, fontFamily: 'var(--f-mono)',
                                        color: active ? p.color : 'var(--text-3)',
                                        fontWeight: active ? 700 : 400,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ fontSize: 16, marginBottom: 3 }}>{p.icon}</div>
                                    {p.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Content area */}
                    <div style={{ padding: 16 }}>
                        {!currentPost && !loading && (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>
                                    {PLATFORMS.find(function (p) { return p.id === platform })?.icon}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
                                    Generate a ready-to-post {platform} caption for "{keyword}"
                                </div>
                                <button
                                    onClick={generate}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'rgba(225,48,108,0.12)',
                                        border: '1px solid rgba(225,48,108,0.3)',
                                        borderRadius: 6, cursor: 'pointer',
                                        fontSize: 12, fontWeight: 600, color: '#E1306C',
                                    }}
                                >
                                    ✨ Generate Post
                                </button>
                            </div>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>✍️</div>
                                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Writing your {platform} post...</div>
                            </div>
                        )}

                        {currentPost && !loading && (
                            <div>
                                {/* Post preview */}
                                <div style={{
                                    padding: 16,
                                    background: 'var(--bg-raised)',
                                    border: '1px solid var(--border-dim)',
                                    borderRadius: 8,
                                    fontSize: 12, color: 'var(--text-1)',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                    marginBottom: 12,
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                }}>
                                    {currentPost}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={copy}
                                        style={{
                                            flex: 1, padding: '9px 0',
                                            background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)',
                                            border: '1px solid ' + (copied ? 'rgba(45,212,191,0.3)' : 'var(--border-dim)'),
                                            borderRadius: 6, cursor: 'pointer',
                                            fontSize: 12, fontWeight: 600,
                                            color: copied ? 'var(--teal)' : 'var(--text-2)',
                                        }}
                                    >
                                        {copied ? '✅ Copied!' : '📋 Copy Post'}
                                    </button>
                                    <button
                                        onClick={generate}
                                        style={{
                                            padding: '9px 16px',
                                            background: 'none',
                                            border: '1px solid var(--border-dim)',
                                            borderRadius: 6, cursor: 'pointer',
                                            fontSize: 12, color: 'var(--text-3)',
                                        }}
                                    >
                                        🔄 Regenerate
                                    </button>
                                </div>

                                {/* Character count */}
                                <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', textAlign: 'right' }}>
                                    {currentPost.length} characters
                                    {platform === 'twitter' && currentPost.length > 280 ? ' (thread format)' : ''}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}