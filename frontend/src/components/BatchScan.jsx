import { useState } from 'react'
import axios from 'axios'
import ScoreRing from './ScoreRing.jsx'

var API_URL = import.meta.env.VITE_API_URL || ''

function scoreColor(s) {
    if (s >= 75) return 'var(--teal)'
    if (s >= 60) return 'var(--gold)'
    if (s >= 45) return 'var(--amber)'
    return 'var(--red)'
}

export default function BatchScan({ onAnalyze }) {
    var [input, setInput] = useState('')
    var [loading, setLoading] = useState(false)
    var [results, setResults] = useState([])
    var [error, setError] = useState(null)
    var [copied, setCopied] = useState(false)

    var EXAMPLES = [
        'berberine supplement India',
        "lion's mane mushroom India",
        'myo-inositol PCOS India',
        'sea moss India',
        'NMN anti-aging India',
        'sulforaphane broccoli India',
        'cold plunge therapy India',
        'postbiotic skincare India',
        'castor oil hair India',
        'shilajit supplement India',
    ]

    function loadExamples() {
        setInput(EXAMPLES.join('\n'))
    }

    async function runBatch() {
        var lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 1)
        if (!lines.length) return
        if (lines.length > 15) { setError('Maximum 15 keywords per batch'); return }
        setLoading(true)
        setError(null)
        setResults([])
        try {
            var res = await axios.post(API_URL + '/api/batch-scan', { keywords: lines }, { timeout: 180000 })
            setResults(res.data.results || [])
        } catch (e) {
            setError(e.response?.data?.message || e.message)
        } finally {
            setLoading(false)
        }
    }

    function shareWhatsApp() {
        if (!results.length) return
        var top5 = results.slice(0, 5)
        var text = '🧬 *NADI Batch Scan Results*\n\n' + top5.map((r, i) =>
            `${i + 1}. *${r.keyword}* — MAS ${r.momentumAccelerationScore}/100 ${r.classification?.emoji || ''}\n   ${r.classification?.label || ''} | ₹${r.marketSizePotential?.tam || '?'}Cr TAM`
        ).join('\n\n') + '\n\n_Powered by NADI Wellness Radar_'
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
    }

    function downloadCSV() {
        var csv = 'Keyword,MAS Score,Classification,TAM (Cr),Time to Mainstream,Verdict\n' +
            results.map(r => [
                `"${r.keyword}"`,
                r.momentumAccelerationScore,
                `"${r.classification?.label || ''}"`,
                r.marketSizePotential?.tam || '',
                `"${r.timeToMainstream || ''}"`,
                `"${(r.intelligenceReport?.verdict || '').slice(0, 80)}"`,
            ].join(',')).join('\n')
        var blob = new Blob([csv], { type: 'text/csv' })
        var url = URL.createObjectURL(blob)
        var a = document.createElement('a')
        a.href = url; a.download = 'NADI-batch-scan.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    var keywordCount = input.split('\n').filter(l => l.trim().length > 1).length

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: 'var(--gold)', marginBottom: 6 }}>⚡ Batch Scan</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Scan up to 15 keywords at once. Get ranked results in one click.</p>
            </div>

            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>One keyword per line ({keywordCount}/15)</span>
                    <button onClick={loadExamples} style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 4, color: 'var(--gold)', cursor: 'pointer' }}>Load examples</button>
                </div>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={'berberine supplement India\nlion\'s mane mushroom India\nsea moss India\n...'}
                    rows={8}
                    style={{ width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', borderRadius: 6, padding: '10px 12px', color: 'var(--text-1)', fontSize: 13, fontFamily: 'var(--f-mono)', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <button onClick={runBatch} disabled={loading || keywordCount === 0} style={{ padding: '10px 24px', background: keywordCount > 0 ? 'var(--gold)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, color: '#07090D', cursor: keywordCount > 0 ? 'pointer' : 'default' }}>
                        {loading ? '⟳ Scanning...' : `⚡ Scan ${keywordCount} Keywords`}
                    </button>
                </div>
                {error && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>⚠ {error}</div>}
            </div>

            {loading && (
                <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>⟳</div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: 6 }}>Running batch scan...</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Collecting signals from Reddit, YouTube, News, PubMed, Amazon and Google Trends for {keywordCount} keywords. This takes 30-90 seconds.</div>
                </div>
            )}

            {results.length > 0 && !loading && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Results — Ranked by MAS Score</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={downloadCSV} style={{ padding: '6px 12px', fontSize: 11, background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--text-2)', cursor: 'pointer' }}>📥 CSV</button>
                            <button onClick={shareWhatsApp} style={{ padding: '6px 12px', fontSize: 11, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 6, color: '#25D366', cursor: 'pointer' }}>💬 Share Top 5</button>
                        </div>
                    </div>

                    {/* Top 3 spotlight */}
                    {results.slice(0, 3).length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
                            {results.slice(0, 3).map((r, i) => (
                                <div key={r.keyword} className="card" style={{ padding: 18, borderLeft: i === 0 ? '3px solid var(--teal)' : '3px solid var(--border-dim)' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--teal)' : 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>#{i + 1} {i === 0 ? '🏆 TOP PICK' : ''}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, lineHeight: 1.3 }}>{r.keyword}</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(r.momentumAccelerationScore), fontFamily: 'var(--f-mono)', lineHeight: 1 }}>{r.momentumAccelerationScore}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10 }}>MAS Score</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>{r.classification?.emoji} {r.classification?.label}</div>
                                    <button onClick={() => onAnalyze(r.keyword)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, background: 'var(--gold)', border: 'none', borderRadius: 4, color: '#07090D', cursor: 'pointer', width: '100%' }}>Deep Analyse →</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Full table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {['#', 'Keyword', 'MAS', 'Class', 'TAM', 'Direction', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: h === '#' || h === 'MAS' ? 'center' : 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 10, letterSpacing: '0.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={r.keyword} style={{ borderTop: '1px solid var(--border-dim)' }}>
                                        <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{i + 1}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-1)', fontWeight: 600 }}>{r.keyword}</td>
                                        <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontWeight: 800, color: scoreColor(r.momentumAccelerationScore), fontSize: 14 }}>{r.momentumAccelerationScore}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{r.classification?.emoji} {r.classification?.label}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontFamily: 'var(--f-mono)' }}>₹{r.marketSizePotential?.tam || '?'}Cr</td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: r.signals?.trendDirection === 'rising' ? 'rgba(0,212,170,0.12)' : r.signals?.trendDirection === 'declining' ? 'rgba(255,85,85,0.12)' : 'rgba(255,255,255,0.06)', color: r.signals?.trendDirection === 'rising' ? 'var(--teal)' : r.signals?.trendDirection === 'declining' ? 'var(--red)' : 'var(--text-3)' }}>{r.signals?.trendDirection || 'stable'}</span>
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <button onClick={() => onAnalyze(r.keyword)} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 600, background: 'transparent', border: '1px solid var(--border-dim)', borderRadius: 4, color: 'var(--gold)', cursor: 'pointer' }}>Analyse</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}