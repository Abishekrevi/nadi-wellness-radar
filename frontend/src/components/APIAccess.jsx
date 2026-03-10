import { useState } from 'react'

var ENDPOINTS = [
    {
        method: 'POST',
        path: '/api/analyze',
        desc: 'Full DNA fingerprint analysis for any wellness keyword',
        body: '{\n  "keyword": "berberine supplement India"\n}',
        response: '{\n  "keyword": "berberine supplement India",\n  "momentumAccelerationScore": 78,\n  "classification": {\n    "label": "BREAKOUT TREND",\n    "emoji": "🚀",\n    "confidence": "HIGH"\n  },\n  "marketSizePotential": {\n    "tam": 420,\n    "horizon": "3 years"\n  },\n  "dnaFingerprint": { "strands": [...] },\n  "signals": {\n    "reddit": 23,\n    "youtube": 47,\n    "research": 156,\n    "ecommerce": 89\n  },\n  "intelligenceReport": {\n    "verdict": "STRONG BUY",\n    "executive_summary": "...",\n    "why_now": "...",\n    "product_opportunity": "...",\n    ...\n  }\n}',
        color: 'var(--teal)',
    },
    {
        method: 'POST',
        path: '/api/radar',
        desc: 'Scan multiple keywords simultaneously and rank by MAS score',
        body: '{\n  "keywords": [\n    "ashwagandha India",\n    "moringa powder India",\n    "sea moss India"\n  ]\n}',
        response: '{\n  "results": [\n    {\n      "keyword": "ashwagandha India",\n      "momentumAccelerationScore": 82,\n      "classification": { "label": "BREAKOUT TREND" },\n      ...\n    },\n    ...\n  ],\n  "rankedBy": "momentumAccelerationScore"\n}',
        color: 'var(--gold)',
    },
]

var CODE_EXAMPLES = {
    curl: function (ep) {
        return 'curl -X ' + ep.method + ' \\\n  https://nadi-wellness-radar-production.up.railway.app' + ep.path + ' \\\n  -H "Content-Type: application/json" \\\n  -d \'' + ep.body + '\''
    },
    python: function (ep) {
        return 'import requests\n\nresponse = requests.post(\n    "https://nadi-wellness-radar-production.up.railway.app' + ep.path + '",\n    json=' + ep.body.replace(/true/g, 'True').replace(/false/g, 'False') + '\n)\n\ndata = response.json()\nprint(data["momentumAccelerationScore"])'
    },
    javascript: function (ep) {
        return 'const response = await fetch(\n  "https://nadi-wellness-radar-production.up.railway.app' + ep.path + '",\n  {\n    method: "' + ep.method + '",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(' + ep.body + ')\n  }\n);\n\nconst data = await response.json();\nconsole.log(data.momentumAccelerationScore);'
    },
}

function EndpointCard({ ep }) {
    var [lang, setLang] = useState('curl')
    var [copied, setCopied] = useState(false)
    var [showResponse, setShowResponse] = useState(false)
    var code = CODE_EXAMPLES[lang](ep)

    function copy() {
        navigator.clipboard.writeText(code).then(function () {
            setCopied(true)
            setTimeout(function () { setCopied(false) }, 2000)
        })
    }

    return (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                    padding: '4px 10px',
                    background: ep.method === 'POST' ? 'rgba(45,212,191,0.12)' : 'rgba(201,168,76,0.12)',
                    border: '1px solid ' + ep.color,
                    borderRadius: 4,
                    fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
                    color: ep.color,
                }}>
                    {ep.method}
                </span>
                <code style={{ fontSize: 14, color: 'var(--text-1)', fontFamily: 'var(--f-mono)', fontWeight: 600 }}>
                    {ep.path}
                </code>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>{ep.desc}</p>

            {/* Language tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {['curl', 'python', 'javascript'].map(function (l) {
                    return (
                        <button
                            key={l}
                            onClick={function () { setLang(l) }}
                            style={{
                                padding: '4px 12px',
                                background: lang === l ? 'rgba(201,168,76,0.12)' : 'none',
                                border: '1px solid ' + (lang === l ? 'rgba(201,168,76,0.3)' : 'var(--border-dim)'),
                                borderRadius: 4, cursor: 'pointer',
                                fontSize: 10, color: lang === l ? 'var(--gold)' : 'var(--text-3)',
                                fontFamily: 'var(--f-mono)',
                            }}
                        >
                            {l}
                        </button>
                    )
                })}
            </div>

            {/* Code block */}
            <div style={{ position: 'relative' }}>
                <pre style={{
                    background: '#07090D',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 8,
                    padding: '16px 20px',
                    fontSize: 11,
                    color: 'var(--teal)',
                    fontFamily: 'var(--f-mono)',
                    lineHeight: 1.7,
                    overflowX: 'auto',
                    margin: 0,
                }}>
                    {code}
                </pre>
                <button
                    onClick={copy}
                    style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '4px 10px',
                        background: copied ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid ' + (copied ? 'rgba(45,212,191,0.3)' : 'var(--border-dim)'),
                        borderRadius: 4, cursor: 'pointer',
                        fontSize: 10, color: copied ? 'var(--teal)' : 'var(--text-3)',
                        fontFamily: 'var(--f-mono)',
                    }}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>

            {/* Response toggle */}
            <button
                onClick={function () { setShowResponse(function (s) { return !s }) }}
                style={{
                    marginTop: 10, background: 'none', border: 'none',
                    color: 'var(--text-3)', cursor: 'pointer',
                    fontSize: 11, fontFamily: 'var(--f-mono)',
                    padding: 0,
                }}
            >
                {showResponse ? '▲ Hide response' : '▼ View sample response'}
            </button>

            {showResponse && (
                <pre style={{
                    marginTop: 10,
                    background: '#07090D',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 8,
                    padding: '16px 20px',
                    fontSize: 11,
                    color: 'var(--gold)',
                    fontFamily: 'var(--f-mono)',
                    lineHeight: 1.7,
                    overflowX: 'auto',
                }}>
                    {ep.response}
                </pre>
            )}
        </div>
    )
}

export default function APIAccess() {
    var [copied, setCopied] = useState(false)
    var baseUrl = 'https://nadi-wellness-radar-production.up.railway.app'

    function copyBase() {
        navigator.clipboard.writeText(baseUrl).then(function () {
            setCopied(true)
            setTimeout(function () { setCopied(false) }, 2000)
        })
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 8, color: 'var(--gold)' }}>
                    API Access
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 640, lineHeight: 1.7 }}>
                    NADI's DNA Trend Fingerprinting engine is available as a free REST API. Integrate wellness intelligence directly into your own apps, dashboards, or automated workflows.
                </p>
            </div>

            {/* Base URL */}
            <div style={{
                padding: '14px 18px', marginBottom: 24,
                background: 'rgba(45,212,191,0.04)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 6 }}>BASE URL</div>
                    <code style={{ fontSize: 13, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>{baseUrl}</code>
                </div>
                <button
                    onClick={copyBase}
                    style={{
                        padding: '7px 14px',
                        background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(45,212,191,0.06)',
                        border: '1px solid rgba(45,212,191,0.25)',
                        borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--f-mono)',
                    }}
                >
                    {copied ? '✓ Copied' : 'Copy URL'}
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
                {[
                    { label: 'Authentication', value: 'None Required', color: 'var(--teal)' },
                    { label: 'Rate Limit', value: 'Free Tier', color: 'var(--gold)' },
                    { label: 'Response Time', value: '30–90s', color: 'var(--gold)' },
                    { label: 'Data Sources', value: '1,000+', color: 'var(--teal)' },
                ].map(function (s) {
                    return (
                        <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: s.color, fontFamily: 'var(--f-mono)', marginBottom: 6 }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Endpoints */}
            <div style={{ marginBottom: 28 }}>
                <div className="label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Endpoints</div>
                {ENDPOINTS.map(function (ep) { return <EndpointCard key={ep.path} ep={ep} /> })}
            </div>

            {/* Use cases */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div className="label" style={{ marginBottom: 16, color: 'var(--gold)' }}>What Can You Build With This?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {[
                        { icon: '🤖', title: 'Product Research Bot', desc: 'Auto-scan trending wellness ingredients and alert your team when a breakout is detected' },
                        { icon: '📊', title: 'Investor Dashboard', desc: 'Build a custom portfolio tracker that monitors MAS scores for your invested D2C brands' },
                        { icon: '🛒', title: 'Amazon Listing Tool', desc: 'Integrate trend scores into your product research workflow before listing on Amazon India' },
                        { icon: '📱', title: 'Founder App', desc: 'Build a mobile app that notifies founders when a trend in their category crosses a threshold' },
                    ].map(function (uc) {
                        return (
                            <div key={uc.title} style={{
                                padding: '16px',
                                background: 'var(--bg-float)',
                                border: '1px solid var(--border-dim)',
                                borderRadius: 8,
                            }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>{uc.icon}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{uc.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>{uc.desc}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Note */}
            <div style={{
                padding: '12px 16px',
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 8,
                fontSize: 11, color: 'var(--text-3)', lineHeight: 1.7,
            }}>
                <strong style={{ color: 'var(--gold)' }}>Note: </strong>
                The NADI API is currently free and open — no API key required. Response times are 30-90 seconds as live data is fetched in real time. For bulk usage or commercial integration, contact the NADI team.
            </div>
        </div>
    )
}