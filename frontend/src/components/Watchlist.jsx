import { useState, useEffect } from 'react'

var STORAGE_KEY = 'nadi_watchlist'

function loadWatchlist() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch (e) { return [] }
}

function saveWatchlist(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch (e) { }
}

function scoreColor(score) {
    if (score >= 75) return 'var(--teal)'
    if (score >= 60) return 'var(--gold)'
    if (score >= 45) return 'var(--amber)'
    return 'var(--red)'
}

// Hook to use watchlist anywhere in the app
export function useWatchlist() {
    var [list, setList] = useState(loadWatchlist)

    function add(result) {
        setList(function (prev) {
            var exists = prev.find(function (item) {
                return item.keyword.toLowerCase() === result.keyword.toLowerCase()
            })
            if (exists) {
                // Update existing entry with latest score
                var updated = prev.map(function (item) {
                    if (item.keyword.toLowerCase() === result.keyword.toLowerCase()) {
                        return {
                            keyword: result.keyword,
                            score: result.momentumAccelerationScore,
                            label: result.classification?.label || '',
                            emoji: result.classification?.emoji || '',
                            tam: result.marketSizePotential?.tam || 0,
                            verdict: result.intelligenceReport?.verdict || '',
                            savedAt: new Date().toISOString(),
                            history: (item.history || []).concat([{
                                score: result.momentumAccelerationScore,
                                date: new Date().toISOString(),
                            }]).slice(-10),
                        }
                    }
                    return item
                })
                saveWatchlist(updated)
                return updated
            }
            var entry = {
                keyword: result.keyword,
                score: result.momentumAccelerationScore,
                label: result.classification?.label || '',
                emoji: result.classification?.emoji || '',
                tam: result.marketSizePotential?.tam || 0,
                verdict: result.intelligenceReport?.verdict || '',
                savedAt: new Date().toISOString(),
                history: [{ score: result.momentumAccelerationScore, date: new Date().toISOString() }],
            }
            var next = [entry].concat(prev).slice(0, 50)
            saveWatchlist(next)
            return next
        })
    }

    function remove(keyword) {
        setList(function (prev) {
            var next = prev.filter(function (item) {
                return item.keyword.toLowerCase() !== keyword.toLowerCase()
            })
            saveWatchlist(next)
            return next
        })
    }

    function isWatching(keyword) {
        return list.some(function (item) {
            return item.keyword.toLowerCase() === (keyword || '').toLowerCase()
        })
    }

    return { list, add, remove, isWatching }
}

// Watchlist button — add/remove from watchlist
export function WatchButton({ result, watchlist }) {
    if (!result) return null
    var watching = watchlist.isWatching(result.keyword)

    return (
        <button
            onClick={function () {
                if (watching) watchlist.remove(result.keyword)
                else watchlist.add(result)
            }}
            title={watching ? 'Remove from watchlist' : 'Add to watchlist'}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: watching ? 'rgba(252,211,77,0.1)' : 'rgba(201,168,76,0.06)',
                border: '1px solid ' + (watching ? 'rgba(252,211,77,0.4)' : 'rgba(201,168,76,0.2)'),
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                color: watching ? 'var(--amber)' : 'var(--gold)',
            }}
        >
            {watching ? '★ Watching' : '☆ Watch'}
        </button>
    )
}

// Full watchlist panel component
export default function WatchlistPanel({ watchlist, onAnalyze }) {
    var { list, remove } = watchlist
    var [sortBy, setSortBy] = useState('date')

    var sorted = list.slice().sort(function (a, b) {
        if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
        if (sortBy === 'name') return a.keyword.localeCompare(b.keyword)
        return new Date(b.savedAt) - new Date(a.savedAt)
    })

    if (list.length === 0) {
        return (
            <div style={{
                padding: 40, textAlign: 'center',
                background: 'var(--bg-float)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius)',
            }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>☆</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Your watchlist is empty
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Analyze a trend and click "☆ Watch" to save it here for monitoring
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                        {list.length} trend{list.length !== 1 ? 's' : ''} on your watchlist
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 3 }}>
                        Re-analyze any trend to track score changes over time
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['date', 'score', 'name'].map(function (s) {
                        return (
                            <button
                                key={s}
                                onClick={function () { setSortBy(s) }}
                                style={{
                                    padding: '5px 12px',
                                    background: sortBy === s ? 'rgba(201,168,76,0.12)' : 'none',
                                    border: '1px solid ' + (sortBy === s ? 'rgba(201,168,76,0.3)' : 'var(--border-dim)'),
                                    borderRadius: 4, cursor: 'pointer',
                                    fontSize: 10, color: sortBy === s ? 'var(--gold)' : 'var(--text-3)',
                                    fontFamily: 'var(--f-mono)',
                                }}
                            >
                                {s === 'date' ? 'Recent' : s === 'score' ? 'Score' : 'A-Z'}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sorted.map(function (item) {
                    var color = scoreColor(item.score)
                    var history = item.history || []
                    var prevScore = history.length > 1 ? history[history.length - 2].score : null
                    var delta = prevScore !== null ? item.score - prevScore : null
                    var savedDate = new Date(item.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

                    return (
                        <div key={item.keyword} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            {/* Score */}
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                                border: '2px solid ' + color,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-float)',
                            }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--f-mono)', lineHeight: 1 }}>{item.score}</div>
                                <div style={{ fontSize: 7, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>MAS</div>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
                                    {item.keyword}
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: 10, color, fontFamily: 'var(--f-mono)', fontWeight: 600 }}>
                                        {item.emoji} {item.label}
                                    </span>
                                    {item.tam > 0 && (
                                        <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                            ₹{item.tam}Cr TAM
                                        </span>
                                    )}
                                    {delta !== null && (
                                        <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', fontWeight: 700, color: delta >= 0 ? 'var(--teal)' : 'var(--red)' }}>
                                            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} pts
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 4 }}>
                                    Saved {savedDate} · {history.length} scan{history.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Mini history sparkline */}
                            {history.length > 1 && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
                                    {history.slice(-8).map(function (h, i) {
                                        var ht = Math.max(4, Math.round((h.score / 100) * 28))
                                        var clr = scoreColor(h.score)
                                        return <div key={i} style={{ width: 4, height: ht + 'px', background: clr, borderRadius: 2, opacity: 0.7 }} />
                                    })}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                {onAnalyze && (
                                    <button
                                        onClick={function () { onAnalyze(item.keyword) }}
                                        style={{
                                            padding: '6px 12px',
                                            background: 'rgba(45,212,191,0.08)',
                                            border: '1px solid rgba(45,212,191,0.25)',
                                            borderRadius: 6, cursor: 'pointer',
                                            fontSize: 11, color: 'var(--teal)',
                                            fontFamily: 'var(--f-mono)',
                                        }}
                                    >
                                        Re-analyze
                                    </button>
                                )}
                                <button
                                    onClick={function () { remove(item.keyword) }}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'none',
                                        border: '1px solid var(--border-dim)',
                                        borderRadius: 6, cursor: 'pointer',
                                        fontSize: 11, color: 'var(--text-3)',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}