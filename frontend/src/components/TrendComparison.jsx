import { useState } from 'react'
import axios from 'axios'
import ScoreRing from './ScoreRing.jsx'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

var API_URL = import.meta.env.VITE_API_URL || ''

function scoreColor(s) {
    if (s >= 75) return 'var(--teal)'
    if (s >= 60) return 'var(--gold)'
    if (s >= 45) return 'var(--amber)'
    return 'var(--red)'
}

var STRAND_ORDER = ['SMV', 'CPC', 'PSD', 'SET', 'ISR', 'EAS', 'RPV', 'IAI']
var STRAND_SHORT = { SMV: 'Search', CPC: 'Cross-Plat', PSD: 'Problem', SET: 'Science', ISR: 'India', EAS: 'Access', RPV: 'Repeat', IAI: 'Influencer' }
var STRAND_LABELS = { SMV: 'Search Momentum', CPC: 'Cross-Platform', PSD: 'Problem-Solution', SET: 'Scientific Evidence', ISR: 'India Resonance', EAS: 'Economic Access', RPV: 'Repeat Purchase', IAI: 'Influencer Auth' }
var COLORS = ['#00D4AA', '#F5C842', '#9B6DFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94']

export default function TrendComparison() {
    var [keywords, setKeywords] = useState(['', ''])
    var [results, setResults] = useState([null, null])
    var [loading, setLoading] = useState([false, false])
    var [errors, setErrors] = useState([null, null])
    var [chartTab, setChartTab] = useState('radar')

    function setKeyword(i, val) { setKeywords(function (prev) { var n = prev.slice(); n[i] = val; return n }) }
    function addSlot() {
        if (keywords.length >= 4) return
        setKeywords(k => k.concat([''])); setResults(r => r.concat([null]))
        setLoading(l => l.concat([false])); setErrors(e => e.concat([null]))
    }
    function removeSlot(i) {
        if (keywords.length <= 2) return
        setKeywords(k => k.filter((_, idx) => idx !== i)); setResults(r => r.filter((_, idx) => idx !== i))
        setLoading(l => l.filter((_, idx) => idx !== i)); setErrors(e => e.filter((_, idx) => idx !== i))
    }

    async function analyzeOne(i) {
        var kw = keywords[i].trim(); if (!kw) return
        setLoading(l => { var n = l.slice(); n[i] = true; return n })
        setErrors(e => { var n = e.slice(); n[i] = null; return n })
        setResults(r => { var n = r.slice(); n[i] = null; return n })
        try {
            var res = await axios.post(API_URL + '/api/analyze', { keyword: kw }, { timeout: 90000 })
            setResults(r => { var n = r.slice(); n[i] = res.data; return n })
        } catch (e) {
            setErrors(err => { var n = err.slice(); n[i] = e.message; return n })
        } finally {
            setLoading(l => { var n = l.slice(); n[i] = false; return n })
        }
    }

    async function analyzeAll() { keywords.forEach(function (kw, i) { if (kw.trim()) analyzeOne(i) }) }

    var filledResults = results.filter(Boolean)
    var winner = filledResults.length > 1
        ? filledResults.reduce(function (a, b) { return (a.momentumAccelerationScore || 0) >= (b.momentumAccelerationScore || 0) ? a : b })
        : null

    // Build radar chart data
    var radarData = STRAND_ORDER.map(function (id) {
        var point = { strand: STRAND_SHORT[id] }
        filledResults.forEach(function (r) {
            var strand = (r.dnaFingerprint?.strands || []).find(s => s.id === id)
            point[r.keyword.slice(0, 20)] = strand?.score || 0
        })
        return point
    })

    // Build bar chart data (signal comparison)
    var barData = [
        { name: 'Reddit', ...Object.fromEntries(filledResults.map(r => [r.keyword.slice(0, 15), r.signals?.reddit || 0])) },
        { name: 'YouTube', ...Object.fromEntries(filledResults.map(r => [r.keyword.slice(0, 15), r.signals?.youtube || 0])) },
        { name: 'News', ...Object.fromEntries(filledResults.map(r => [r.keyword.slice(0, 15), r.signals?.news || 0])) },
        { name: 'Research', ...Object.fromEntries(filledResults.map(r => [r.keyword.slice(0, 15), r.signals?.research || 0])) },
        { name: 'Amazon', ...Object.fromEntries(filledResults.map(r => [r.keyword.slice(0, 15), r.signals?.ecommerce || 0])) },
    ]

    return (
        <div style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: 'var(--gold)', marginBottom: 6 }}>🔀 Trend Comparison</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Compare up to 4 wellness trends side by side with DNA radar overlay.</p>
            </div>

            {/* Input row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginBottom: 12 }}>
                {keywords.map(function (kw, i) {
                    return (
                        <div key={i} style={{ position: 'relative' }}>
                            <input
                                value={kw}
                                onChange={e => setKeyword(i, e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') analyzeOne(i) }}
                                placeholder={`Trend ${i + 1}...`}
                                style={{ width: '100%', boxSizing: 'border-box', paddingRight: keywords.length > 2 ? 28 : 12 }}
                            />
                            {keywords.length > 2 && (
                                <button onClick={() => removeSlot(i)} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                <button onClick={analyzeAll} style={{ padding: '9px 20px', background: 'var(--gold)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, color: '#07090D', cursor: 'pointer' }}>
                    {loading.some(Boolean) ? '⟳ Analysing...' : '⚡ Compare All'}
                </button>
                {keywords.length < 4 && (
                    <button onClick={addSlot} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>+ Add Trend</button>
                )}
            </div>

            {/* Loading states */}
            {loading.map(function (l, i) {
                return l ? <div key={i} style={{ padding: '8px 12px', background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--gold)', marginBottom: 8 }}>⟳ Analysing "{keywords[i]}"...</div> : null
            })}
            {errors.map(function (e, i) {
                return e ? <div key={i} style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>⚠ {keywords[i]}: {e}</div> : null
            })}

            {/* Winner banner */}
            {winner && (
                <div style={{ padding: '12px 18px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>🏆</span>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Strongest DNA: {winner.keyword}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>MAS {winner.momentumAccelerationScore}/100 · {winner.classification?.label}</div>
                    </div>
                </div>
            )}

            {/* Score cards */}
            {filledResults.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
                    {filledResults.map(function (r, i) {
                        var isWinner = winner && r.keyword === winner.keyword
                        return (
                            <div key={r.keyword} className="card" style={{ padding: 18, textAlign: 'center', borderColor: isWinner ? 'rgba(0,212,170,0.4)' : undefined }}>
                                {isWinner && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: 6 }}>🏆 WINNER</div>}
                                <ScoreRing score={r.momentumAccelerationScore} size={72} />
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginTop: 10, lineHeight: 1.3 }}>{r.keyword}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{r.classification?.emoji} {r.classification?.label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--f-mono)' }}>₹{r.marketSizePotential?.tam || '?'}Cr TAM</div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Charts */}
            {filledResults.length >= 2 && (
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        {['radar', 'signals', 'dna'].map(t => (
                            <button key={t} onClick={() => setChartTab(t)} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, border: '1px solid', cursor: 'pointer', background: chartTab === t ? 'var(--gold)' : 'transparent', color: chartTab === t ? '#07090D' : 'var(--text-2)', borderColor: chartTab === t ? 'var(--gold)' : 'var(--border-dim)' }}>
                                {t === 'radar' ? '🕸 DNA Radar' : t === 'signals' ? '📊 Signals' : '🧬 DNA Bars'}
                            </button>
                        ))}
                    </div>

                    {chartTab === 'radar' && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>DNA Strand Overlay — All 8 Signal Strands</div>
                            <ResponsiveContainer width="100%" height={340}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="strand" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                                    {filledResults.map(function (r, i) {
                                        return <Radar key={r.keyword} name={r.keyword.slice(0, 20)} dataKey={r.keyword.slice(0, 20)} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                                    })}
                                    <Legend formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{v}</span>} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 6, fontSize: 11 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </>
                    )}

                    {chartTab === 'signals' && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>Live Signal Comparison</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 6, fontSize: 11 }} />
                                    <Legend formatter={v => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{v}</span>} />
                                    {filledResults.map(function (r, i) {
                                        return <Bar key={r.keyword} dataKey={r.keyword.slice(0, 15)} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                                    })}
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    )}

                    {chartTab === 'dna' && (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>DNA Strand Scores</div>
                            {STRAND_ORDER.map(function (id) {
                                return (
                                    <div key={id} style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5 }}>{STRAND_LABELS[id]}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {filledResults.map(function (r, i) {
                                                var strand = (r.dnaFingerprint?.strands || []).find(s => s.id === id)
                                                var score = strand?.score || 0
                                                return (
                                                    <div key={r.keyword} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                                                        <div style={{ fontSize: 10, color: 'var(--text-3)', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.keyword}</div>
                                                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                                                            <div style={{ height: '100%', width: score + '%', background: COLORS[i], borderRadius: 4, transition: 'width 0.6s' }} />
                                                        </div>
                                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: COLORS[i], width: 28, textAlign: 'right' }}>{score}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            )}

            {/* Side-by-side detail table */}
            {filledResults.length >= 2 && (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Side-by-Side Comparison</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-3)', fontSize: 10, fontWeight: 600 }}>Metric</th>
                                    {filledResults.map(function (r, i) {
                                        return <th key={r.keyword} style={{ padding: '8px 12px', textAlign: 'center', color: COLORS[i], fontSize: 10, fontWeight: 700 }}>{r.keyword.slice(0, 20)}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'MAS Score', fn: r => r.momentumAccelerationScore + '/100' },
                                    { label: 'TAM', fn: r => '₹' + (r.marketSizePotential?.tam || '?') + 'Cr' },
                                    { label: 'Time to market', fn: r => r.timeToMainstream || '?' },
                                    { label: 'Reddit', fn: r => r.signals?.reddit || 0 },
                                    { label: 'YouTube', fn: r => r.signals?.youtube || 0 },
                                    { label: 'News', fn: r => r.signals?.news || 0 },
                                    { label: 'Research', fn: r => r.signals?.research || 0 },
                                    { label: 'Amazon', fn: r => r.signals?.ecommerce || 0 },
                                    { label: 'Trend', fn: r => r.signals?.trendDirection || 'stable' },
                                    { label: 'Data Quality', fn: r => r.dataQuality?.label || '?' },
                                ].map(function (row) {
                                    return (
                                        <tr key={row.label} style={{ borderTop: '1px solid var(--border-dim)' }}>
                                            <td style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11 }}>{row.label}</td>
                                            {filledResults.map(function (r, i) {
                                                var val = row.fn(r)
                                                var isBest = filledResults.length > 1 && row.label !== 'Trend' && row.label !== 'Data Quality' && row.label !== 'Time to market'
                                                    && String(val) === String(filledResults.map(x => row.fn(x)).sort((a, b) => parseFloat(String(b).replace(/[^0-9.]/g, '')) - parseFloat(String(a).replace(/[^0-9.]/g, '')))[0])
                                                return <td key={r.keyword} style={{ padding: '8px 12px', textAlign: 'center', color: isBest ? 'var(--teal)' : 'var(--text-1)', fontWeight: isBest ? 700 : 400, fontFamily: 'var(--f-mono)', fontSize: 11 }}>{val}{isBest ? ' ✓' : ''}</td>
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