import { useState } from 'react'
import axios from 'axios'
import ScoreRing from './ScoreRing.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

function scoreColor(score) {
    if (score >= 75) return 'var(--teal)'
    if (score >= 60) return 'var(--gold)'
    if (score >= 45) return 'var(--amber)'
    return 'var(--red)'
}

const STRAND_LABELS = {
    SMV: 'Search Momentum',
    CPC: 'Cross-Platform',
    PSD: 'Problem-Solution',
    SET: 'Scientific Evidence',
    ISR: 'India Resonance',
    EAS: 'Economic Access',
    RPV: 'Repeat Purchase',
    IAI: 'Influencer Auth',
}

export default function TrendComparison() {
    var [keywords, setKeywords] = useState(['', ''])
    var [results, setResults] = useState([null, null])
    var [loading, setLoading] = useState([false, false])
    var [errors, setErrors] = useState([null, null])

    function setKeyword(i, val) {
        setKeywords(function (prev) {
            var next = prev.slice()
            next[i] = val
            return next
        })
    }

    function addSlot() {
        if (keywords.length >= 4) return
        setKeywords(function (k) { return k.concat(['']) })
        setResults(function (r) { return r.concat([null]) })
        setLoading(function (l) { return l.concat([false]) })
        setErrors(function (e) { return e.concat([null]) })
    }

    function removeSlot(i) {
        if (keywords.length <= 2) return
        setKeywords(function (k) { return k.filter(function (_, idx) { return idx !== i }) })
        setResults(function (r) { return r.filter(function (_, idx) { return idx !== i }) })
        setLoading(function (l) { return l.filter(function (_, idx) { return idx !== i }) })
        setErrors(function (e) { return e.filter(function (_, idx) { return idx !== i }) })
    }

    async function analyzeOne(i) {
        var kw = keywords[i].trim()
        if (!kw) return
        setLoading(function (l) { var n = l.slice(); n[i] = true; return n })
        setErrors(function (e) { var n = e.slice(); n[i] = null; return n })
        setResults(function (r) { var n = r.slice(); n[i] = null; return n })
        try {
            var res = await axios.post(API_URL + '/api/analyze', { keyword: kw }, { timeout: 90000 })
            setResults(function (r) { var n = r.slice(); n[i] = res.data; return n })
        } catch (e) {
            setErrors(function (err) { var n = err.slice(); n[i] = e.message; return n })
        } finally {
            setLoading(function (l) { var n = l.slice(); n[i] = false; return n })
        }
    }

    async function analyzeAll() {
        keywords.forEach(function (kw, i) { if (kw.trim()) analyzeOne(i) })
    }

    var filledResults = results.filter(Boolean)
    var winner = filledResults.length > 1
        ? filledResults.reduce(function (a, b) {
            return (a.momentumAccelerationScore || 0) >= (b.momentumAccelerationScore || 0) ? a : b
        })
        : null

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 8, color: 'var(--gold)' }}>
                    Trend Comparison
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    Compare up to 4 wellness trends side by side. See which has the strongest DNA before you invest.
                </p>
            </div>

            {/* Input row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                {keywords.map(function (kw, i) {
                    return (
                        <div key={i} style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={kw}
                                onChange={function (e) { setKeyword(i, e.target.value) }}
                                onKeyDown={function (e) { if (e.key === 'Enter') analyzeOne(i) }}
                                placeholder={'Trend ' + (i + 1) + ' e.g. berberine India'}
                                style={{ fontSize: 12, width: '100%', paddingRight: keywords.length > 2 ? 28 : 12 }}
                            />
                            {keywords.length > 2 && (
                                <button
                                    onClick={function () { removeSlot(i) }}
                                    style={{
                                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-3)',
                                        cursor: 'pointer', fontSize: 14, padding: 0,
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                <button
                    className="btn btn-primary"
                    onClick={analyzeAll}
                    disabled={loading.some(Boolean) || !keywords.some(function (k) { return k.trim() })}
                >
                    {loading.some(Boolean) ? '⟳ Analyzing...' : '🧬 Compare All'}
                </button>
                {keywords.length < 4 && (
                    <button className="btn btn-ghost" onClick={addSlot}>
                        + Add Trend
                    </button>
                )}
            </div>

            {/* Individual loading/error states */}
            {keywords.map(function (kw, i) {
                if (!loading[i] && !errors[i]) return null
                return (
                    <div key={i} style={{ marginBottom: 8, fontSize: 12, color: loading[i] ? 'var(--gold)' : 'var(--red)', fontFamily: 'var(--f-mono)' }}>
                        {loading[i] ? '⟳ Scanning "' + kw + '"...' : '⚠ ' + errors[i]}
                    </div>
                )
            })}

            {/* Winner banner */}
            {winner && filledResults.length > 1 && (
                <div style={{
                    padding: '14px 20px',
                    background: 'rgba(45,212,191,0.08)',
                    border: '1px solid rgba(45,212,191,0.3)',
                    borderRadius: 'var(--radius)',
                    marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{ fontSize: 28 }}>🏆</div>
                    <div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 4 }}>
                            NADI RECOMMENDS
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal)', fontFamily: 'Georgia, serif' }}>
                            {winner.keyword}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
                            Strongest DNA score — MAS {winner.momentumAccelerationScore}/100 · {winner.classification?.label}
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison grid */}
            {filledResults.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {results.map(function (r, i) {
                        if (!r) return null
                        var score = r.momentumAccelerationScore || 0
                        var isWinner = winner && r.keyword === winner.keyword && filledResults.length > 1
                        return (
                            <div key={i} className={'card ' + (isWinner ? 'card-gold' : '')} style={{ padding: 20, position: 'relative' }}>
                                {isWinner && (
                                    <div style={{
                                        position: 'absolute', top: -10, right: 16,
                                        background: 'var(--teal)', color: '#07090D',
                                        fontSize: 9, fontWeight: 700, fontFamily: 'var(--f-mono)',
                                        padding: '3px 10px', borderRadius: 10, letterSpacing: '0.1em',
                                    }}>
                                        WINNER
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                    <ScoreRing score={score} size={64} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                                            {r.keyword}
                                        </div>
                                        <div style={{ fontSize: 10, color: scoreColor(score), fontFamily: 'var(--f-mono)', fontWeight: 600 }}>
                                            {r.classification?.emoji} {r.classification?.label}
                                        </div>
                                    </div>
                                </div>

                                {/* DNA strand bars */}
                                {r.dnaFingerprint?.strands?.map(function (st) {
                                    var sc = st.score || 0
                                    var clr = sc >= 70 ? 'var(--teal)' : sc >= 45 ? 'var(--gold)' : sc >= 25 ? 'var(--amber)' : 'var(--red)'
                                    return (
                                        <div key={st.id} style={{ marginBottom: 6 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                                    {STRAND_LABELS[st.id] || st.id}
                                                </span>
                                                <span style={{ fontSize: 9, color: clr, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{sc}</span>
                                            </div>
                                            <div style={{ height: 4, background: 'var(--bg-float)', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: sc + '%', background: clr, borderRadius: 2, transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Key stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                                    {[
                                        { l: 'Market TAM', v: '\u20B9' + (r.marketSizePotential?.tam || 0) + 'Cr' },
                                        { l: 'Time to Peak', v: r.timeToMainstream || '-' },
                                        { l: 'Research', v: (r.signals?.research || 0) + ' papers' },
                                        { l: 'Amazon IN', v: (r.signals?.ecommerce || 0) + ' products' },
                                    ].map(function (st) {
                                        return (
                                            <div key={st.l} style={{ padding: '8px 10px', background: 'var(--bg-float)', borderRadius: 6 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--f-mono)' }}>{st.v}</div>
                                                <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{st.l}</div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Verdict */}
                                {r.intelligenceReport?.verdict && (
                                    <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-float)', borderRadius: 6, fontSize: 11, color: 'var(--text-2)' }}>
                                        <strong style={{ color: 'var(--gold)' }}>Verdict: </strong>
                                        {r.intelligenceReport.verdict}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Head to head table */}
            {filledResults.length > 1 && (
                <div className="card" style={{ padding: 20 }}>
                    <div className="label" style={{ marginBottom: 14, color: 'var(--gold)' }}>Head-to-Head Comparison</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', borderBottom: '1px solid var(--border-dim)' }}>METRIC</th>
                                    {filledResults.map(function (r) {
                                        return (
                                            <th key={r.keyword} style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--gold)', fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, borderBottom: '1px solid var(--border-dim)' }}>
                                                {r.keyword.length > 20 ? r.keyword.slice(0, 20) + '...' : r.keyword}
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'MAS Score', key: function (r) { return r.momentumAccelerationScore || 0 }, fmt: function (v) { return v + '/100' }, higher: true },
                                    { label: 'Market TAM', key: function (r) { return r.marketSizePotential?.tam || 0 }, fmt: function (v) { return '\u20B9' + v + 'Cr' }, higher: true },
                                    { label: 'Reddit Posts', key: function (r) { return r.signals?.reddit || 0 }, fmt: function (v) { return String(v) }, higher: true },
                                    { label: 'Research Papers', key: function (r) { return r.signals?.research || 0 }, fmt: function (v) { return String(v) }, higher: true },
                                    { label: 'Amazon Products', key: function (r) { return r.signals?.ecommerce || 0 }, fmt: function (v) { return String(v) }, higher: true },
                                    { label: 'Classification', key: function (r) { return r.classification?.label || '-' }, fmt: function (v) { return v }, higher: false },
                                ].map(function (row, ri) {
                                    var vals = filledResults.map(row.key)
                                    var maxVal = row.higher ? Math.max.apply(null, vals.filter(function (v) { return typeof v === 'number' })) : null
                                    return (
                                        <tr key={row.label} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--bg-float)' }}>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>{row.label}</td>
                                            {filledResults.map(function (r) {
                                                var val = row.key(r)
                                                var isBest = row.higher && typeof val === 'number' && val === maxVal && filledResults.length > 1
                                                return (
                                                    <td key={r.keyword} style={{ padding: '10px 12px', textAlign: 'center', color: isBest ? 'var(--teal)' : 'var(--text-1)', fontWeight: isBest ? 700 : 400, fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                                                        {row.fmt(val)}
                                                        {isBest && ' ✓'}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}