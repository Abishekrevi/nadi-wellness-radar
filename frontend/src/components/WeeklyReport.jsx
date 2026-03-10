import { useState, useEffect } from 'react'
import axios from 'axios'
import ScoreRing from './ScoreRing.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

const WEEKLY_TRENDS = [
    'ashwagandha gummies India',
    'sea moss India',
    'berberine weight loss India',
    'lion\'s mane mushroom India',
    'shilajit supplement India',
    'moringa powder India',
    'collagen peptides India',
    'NMN anti-aging India',
]

function getWeekLabel() {
    var now = new Date()
    var start = new Date(now)
    start.setDate(now.getDate() - now.getDay() + 1)
    var end = new Date(start)
    end.setDate(start.getDate() + 6)
    var opts = { day: 'numeric', month: 'short' }
    return start.toLocaleDateString('en-IN', opts) + ' – ' + end.toLocaleDateString('en-IN', opts) + ', ' + now.getFullYear()
}

function scoreColor(score) {
    if (score >= 75) return 'var(--teal)'
    if (score >= 60) return 'var(--gold)'
    if (score >= 45) return 'var(--amber)'
    return 'var(--red)'
}

function classBadge(label) {
    var l = (label || '').toUpperCase()
    if (l.includes('BREAKOUT')) return 'badge-breakout'
    if (l.includes('EMERGING')) return 'badge-emerging'
    if (l.includes('NASCENT')) return 'badge-nascent'
    return 'badge-noise'
}

export default function WeeklyReport({ onAnalyze }) {
    var [results, setResults] = useState([])
    var [loading, setLoading] = useState(false)
    var [progress, setProgress] = useState(0)
    var [generated, setGenerated] = useState(false)
    var [copied, setCopied] = useState(false)
    var [email, setEmail] = useState('')
    var [subscribed, setSubscribed] = useState(false)

    useEffect(function () {
        try {
            var cached = localStorage.getItem('nadi_weekly_report')
            if (cached) {
                var parsed = JSON.parse(cached)
                var age = Date.now() - parsed.ts
                if (age < 6 * 60 * 60 * 1000) {
                    setResults(parsed.results)
                    setGenerated(true)
                }
            }
        } catch (e) { }
    }, [])

    async function generateReport() {
        setLoading(true)
        setResults([])
        setProgress(0)

        var collected = []
        for (var i = 0; i < WEEKLY_TRENDS.length; i++) {
            try {
                var res = await axios.post(API_URL + '/api/analyze', { keyword: WEEKLY_TRENDS[i] }, { timeout: 90000 })
                collected.push(res.data)
                setResults(collected.slice().sort(function (a, b) {
                    return (b.momentumAccelerationScore || 0) - (a.momentumAccelerationScore || 0)
                }))
            } catch (e) {
                // skip failed ones
            }
            setProgress(Math.round(((i + 1) / WEEKLY_TRENDS.length) * 100))
        }

        var sorted = collected.slice().sort(function (a, b) {
            return (b.momentumAccelerationScore || 0) - (a.momentumAccelerationScore || 0)
        })
        setResults(sorted)
        setGenerated(true)
        setLoading(false)

        try {
            localStorage.setItem('nadi_weekly_report', JSON.stringify({ results: sorted, ts: Date.now() }))
        } catch (e) { }
    }

    function copyDigest() {
        if (!results.length) return
        var week = getWeekLabel()
        var lines = [
            '🧬 NADI WEEKLY WELLNESS INTELLIGENCE',
            'Week of ' + week,
            'India D2C Trend Digest — Top ' + results.length + ' Signals',
            '',
            '─────────────────────────────',
        ]
        results.slice(0, 8).forEach(function (r, i) {
            lines.push('')
            lines.push((i + 1) + '. ' + r.keyword.toUpperCase())
            lines.push('   MAS Score: ' + r.momentumAccelerationScore + '/100 — ' + (r.classification?.label || ''))
            lines.push('   Market TAM: ₹' + (r.marketSizePotential?.tam || 0) + 'Cr')
            lines.push('   Verdict: ' + (r.intelligenceReport?.verdict || 'N/A'))
        })
        lines.push('')
        lines.push('─────────────────────────────')
        lines.push('Powered by NADI v2.0 — nadi-wellness-radar-production.up.railway.app')
        lines.push('#NADIIntelligence #IndiaWellness #D2CIndia')

        navigator.clipboard.writeText(lines.join('\n')).then(function () {
            setCopied(true)
            setTimeout(function () { setCopied(false) }, 2500)
        })
    }

    function handleSubscribe() {
        if (!email.trim() || !email.includes('@')) return
        setSubscribed(true)
        try { localStorage.setItem('nadi_email_sub', email) } catch (e) { }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 8, color: 'var(--gold)' }}>
                    Weekly Trend Report
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    Every week, NADI scans the top emerging wellness trends in India and ranks them by momentum. Your shortcut to staying ahead of the market.
                </p>
            </div>

            {/* Week label */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
                padding: '12px 18px',
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 'var(--radius)',
                marginBottom: 20,
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4 }}>
                        CURRENT WEEK
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>
                        📅 {getWeekLabel()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {generated && (
                        <button
                            onClick={copyDigest}
                            style={{
                                padding: '8px 16px',
                                background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(45,212,191,0.06)',
                                border: '1px solid rgba(45,212,191,0.25)',
                                borderRadius: 6, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, color: 'var(--teal)',
                            }}
                        >
                            {copied ? '✅ Copied!' : '📋 Copy Digest'}
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={generateReport}
                        disabled={loading}
                        style={{ height: 38 }}
                    >
                        {loading ? '⟳ Scanning...' : generated ? '🔄 Refresh' : '🧬 Generate Report'}
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            {loading && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--f-mono)' }}>
                            Scanning {WEEKLY_TRENDS.length} trends...
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>
                            {progress}%
                        </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-float)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: progress + '%', background: 'var(--gold)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 6 }}>
                        {results.length} of {WEEKLY_TRENDS.length} trends scanned so far
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div className="label" style={{ marginBottom: 14, color: 'var(--gold)' }}>
                        🏆 This Week's Top Wellness Trends — India
                    </div>

                    {/* Top 3 podium */}
                    {results.length >= 3 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                            {[results[1], results[0], results[2]].map(function (r, i) {
                                var rank = i === 1 ? 1 : i === 0 ? 2 : 3
                                var podiumH = rank === 1 ? 90 : rank === 2 ? 70 : 60
                                var medals = ['🥈', '🥇', '🥉']
                                return (
                                    <div key={r.keyword} className={'card ' + (rank === 1 ? 'card-gold' : '')} style={{ padding: 16, textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, marginBottom: 8 }}>{medals[i]}</div>
                                        <ScoreRing score={r.momentumAccelerationScore} size={56} />
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', marginTop: 8, marginBottom: 4 }}>
                                            {r.keyword.length > 22 ? r.keyword.slice(0, 22) + '...' : r.keyword}
                                        </div>
                                        <div style={{ fontSize: 9, color: scoreColor(r.momentumAccelerationScore), fontFamily: 'var(--f-mono)' }}>
                                            {r.classification?.label || ''}
                                        </div>
                                        {onAnalyze && (
                                            <button
                                                onClick={function () { onAnalyze(r.keyword) }}
                                                style={{
                                                    marginTop: 10, padding: '5px 10px',
                                                    background: 'rgba(201,168,76,0.08)',
                                                    border: '1px solid rgba(201,168,76,0.2)',
                                                    borderRadius: 4, cursor: 'pointer',
                                                    fontSize: 10, color: 'var(--gold)',
                                                }}
                                            >
                                                Deep Analyze →
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Full ranked list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {results.map(function (r, i) {
                            var score = r.momentumAccelerationScore || 0
                            var color = scoreColor(score)
                            return (
                                <div key={r.keyword} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text-3)', width: 28, textAlign: 'center' }}>
                                        {i + 1}
                                    </div>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                        border: '2px solid ' + color,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--bg-float)',
                                    }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--f-mono)', lineHeight: 1 }}>{score}</div>
                                        <div style={{ fontSize: 6, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>MAS</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 140 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{r.keyword}</div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span className={'badge ' + classBadge(r.classification?.label)} style={{ fontSize: 9, padding: '2px 8px' }}>
                                                {r.classification?.emoji} {r.classification?.label}
                                            </span>
                                            <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                                ₹{r.marketSizePotential?.tam || 0}Cr TAM
                                            </span>
                                            <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                                {r.signals?.research || 0} papers
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-2)', maxWidth: 200, lineHeight: 1.5, display: 'none' }}>
                                        {r.intelligenceReport?.verdict || ''}
                                    </div>
                                    {onAnalyze && (
                                        <button
                                            onClick={function () { onAnalyze(r.keyword) }}
                                            style={{
                                                padding: '6px 14px',
                                                background: 'rgba(45,212,191,0.06)',
                                                border: '1px solid rgba(45,212,191,0.2)',
                                                borderRadius: 6, cursor: 'pointer',
                                                fontSize: 11, color: 'var(--teal)',
                                                fontFamily: 'var(--f-mono)',
                                            }}
                                        >
                                            Analyze →
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Email subscribe */}
            <div style={{
                padding: 24,
                background: 'rgba(45,212,191,0.04)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderRadius: 'var(--radius)',
            }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginBottom: 6 }}>
                    📬 Get This Digest Every Monday
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
                    Every Monday morning, NADI will email you the top 8 emerging wellness trends in India — ranked by momentum score. Free forever.
                </div>
                {subscribed ? (
                    <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
                        ✅ You're subscribed! Watch your inbox every Monday.
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            value={email}
                            onChange={function (e) { setEmail(e.target.value) }}
                            onKeyDown={function (e) { if (e.key === 'Enter') handleSubscribe() }}
                            placeholder="your@email.com"
                            style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSubscribe}
                            disabled={!email.trim() || !email.includes('@')}
                            style={{ height: 42 }}
                        >
                            Subscribe Free →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}