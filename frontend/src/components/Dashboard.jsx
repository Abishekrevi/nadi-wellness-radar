import { useState } from 'react'
import ScoreRing from './ScoreRing.jsx'
import WatchlistPanel from './Watchlist.jsx'

function scoreColor(score) {
    if (score >= 75) return 'var(--teal)'
    if (score >= 60) return 'var(--gold)'
    if (score >= 45) return 'var(--amber)'
    return 'var(--red)'
}

function StatCard({ label, value, sub, color }) {
    return (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--gold)', fontFamily: 'var(--f-mono)', lineHeight: 1, marginBottom: 6 }}>
                {value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{sub}</div>}
        </div>
    )
}

export default function Dashboard({ watchlist, onAnalyze }) {
    var [activeTab, setActiveTab] = useState('overview')
    var list = watchlist.list

    // Compute stats
    var totalScans = list.reduce(function (sum, item) { return sum + (item.history?.length || 1) }, 0)
    var avgScore = list.length ? Math.round(list.reduce(function (s, i) { return s + i.score }, 0) / list.length) : 0
    var strongBuys = list.filter(function (i) { return i.score >= 75 }).length
    var totalTAM = list.reduce(function (s, i) { return s + (i.tam || 0) }, 0)
    var topTrend = list.slice().sort(function (a, b) { return b.score - a.score })[0]
    var recentTrends = list.slice(0, 5)

    // Score distribution
    var dist = [
        { label: 'Breakout (75+)', count: list.filter(function (i) { return i.score >= 75 }).length, color: 'var(--teal)' },
        { label: 'Emerging (60-74)', count: list.filter(function (i) { return i.score >= 60 && i.score < 75 }).length, color: 'var(--gold)' },
        { label: 'Nascent (45-59)', count: list.filter(function (i) { return i.score >= 45 && i.score < 60 }).length, color: 'var(--amber)' },
        { label: 'Low Signal (<45)', count: list.filter(function (i) { return i.score < 45 }).length, color: 'var(--red)' },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 8, color: 'var(--gold)' }}>
                    Founder Dashboard
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    Your personal NADI intelligence hub — track trends, monitor scores, and make data-driven decisions.
                </p>
            </div>

            {list.length === 0 ? (
                <div style={{
                    padding: 48, textAlign: 'center',
                    background: 'var(--bg-float)', border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--radius)',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                        Your dashboard is empty
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 400, margin: '0 auto' }}>
                        Go to Deep Analyze, scan some trends, and click "☆ Watch" to start building your personal intelligence dashboard.
                    </div>
                </div>
            ) : (
                <>
                    {/* Sub tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {[
                            { id: 'overview', label: '📊 Overview' },
                            { id: 'watchlist', label: '★ Watchlist' },
                            { id: 'insights', label: '💡 Insights' },
                        ].map(function (t) {
                            return (
                                <button
                                    key={t.id}
                                    onClick={function () { setActiveTab(t.id) }}
                                    style={{
                                        padding: '8px 18px',
                                        background: activeTab === t.id ? 'rgba(201,168,76,0.12)' : 'none',
                                        border: '1px solid ' + (activeTab === t.id ? 'rgba(201,168,76,0.35)' : 'var(--border-dim)'),
                                        borderRadius: 6, cursor: 'pointer',
                                        fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400,
                                        color: activeTab === t.id ? 'var(--gold)' : 'var(--text-2)',
                                        fontFamily: 'var(--f-mono)',
                                    }}
                                >
                                    {t.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                                <StatCard label="Trends Tracked" value={list.length} sub="on watchlist" color="var(--gold)" />
                                <StatCard label="Total Scans" value={totalScans} sub="analyses run" color="var(--teal)" />
                                <StatCard label="Avg MAS Score" value={avgScore} sub="across all trends" color={scoreColor(avgScore)} />
                                <StatCard label="Strong Buys" value={strongBuys} sub="score 75+" color="var(--teal)" />
                                <StatCard label="Total Market TAM" value={'₹' + totalTAM + 'Cr'} sub="combined opportunity" color="var(--gold)" />
                            </div>

                            {/* Top trend spotlight */}
                            {topTrend && (
                                <div style={{
                                    padding: 20, marginBottom: 20,
                                    background: 'rgba(45,212,191,0.04)',
                                    border: '1px solid rgba(45,212,191,0.2)',
                                    borderRadius: 'var(--radius)',
                                    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                                }}>
                                    <div style={{ fontSize: 28 }}>🏆</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 6 }}>
                                            YOUR TOP TREND
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', fontFamily: 'Georgia, serif', marginBottom: 4 }}>
                                            {topTrend.keyword}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                                            MAS {topTrend.score}/100 &nbsp;·&nbsp; {topTrend.emoji} {topTrend.label} &nbsp;·&nbsp; ₹{topTrend.tam}Cr TAM
                                        </div>
                                    </div>
                                    <ScoreRing score={topTrend.score} size={72} />
                                    {onAnalyze && (
                                        <button
                                            onClick={function () { onAnalyze(topTrend.keyword) }}
                                            className="btn btn-primary"
                                            style={{ height: 38 }}
                                        >
                                            Re-analyze
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Score distribution */}
                            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                                <div className="label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Score Distribution</div>
                                {dist.map(function (d) {
                                    var pct = list.length ? Math.round((d.count / list.length) * 100) : 0
                                    return (
                                        <div key={d.label} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{d.label}</span>
                                                <span style={{ fontSize: 11, color: d.color, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
                                                    {d.count} trends ({pct}%)
                                                </span>
                                            </div>
                                            <div style={{ height: 6, background: 'var(--bg-float)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: pct + '%', background: d.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Recent activity */}
                            <div className="card" style={{ padding: 20 }}>
                                <div className="label" style={{ marginBottom: 14, color: 'var(--gold)' }}>Recent Activity</div>
                                {recentTrends.map(function (item) {
                                    var color = scoreColor(item.score)
                                    var date = new Date(item.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                    return (
                                        <div key={item.keyword} style={{
                                            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
                                            borderBottom: '1px solid var(--border-dim)',
                                        }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                                border: '2px solid ' + color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--f-mono)',
                                                background: 'var(--bg-float)',
                                            }}>
                                                {item.score}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{item.keyword}</div>
                                                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>
                                                    {item.emoji} {item.label} &nbsp;·&nbsp; {date}
                                                </div>
                                            </div>
                                            {onAnalyze && (
                                                <button
                                                    onClick={function () { onAnalyze(item.keyword) }}
                                                    style={{
                                                        padding: '5px 10px', background: 'none',
                                                        border: '1px solid var(--border-dim)',
                                                        borderRadius: 4, cursor: 'pointer',
                                                        fontSize: 10, color: 'var(--text-3)',
                                                        fontFamily: 'var(--f-mono)',
                                                    }}
                                                >
                                                    Re-scan
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Watchlist tab */}
                    {activeTab === 'watchlist' && (
                        <WatchlistPanel watchlist={watchlist} onAnalyze={onAnalyze} />
                    )}

                    {/* Insights tab */}
                    {activeTab === 'insights' && (
                        <div>
                            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                                <div className="label" style={{ marginBottom: 14, color: 'var(--gold)' }}>💡 NADI Insights for Your Portfolio</div>

                                {strongBuys > 0 && (
                                    <div style={{ padding: '12px 16px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8, marginBottom: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', marginBottom: 4 }}>
                                            🚀 {strongBuys} Breakout Trend{strongBuys > 1 ? 's' : ''} Ready for Launch
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                                            You have {strongBuys} trend{strongBuys > 1 ? 's' : ''} scoring 75+ — these are in the optimal first-mover window. Consider prioritising product development now before the window closes.
                                        </div>
                                    </div>
                                )}

                                {totalTAM > 0 && (
                                    <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, marginBottom: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
                                            📊 ₹{totalTAM}Cr Combined Market Opportunity
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                                            Your watchlist covers ₹{totalTAM}Cr in combined TAM. Even capturing 1% of your top trend represents ₹{Math.round(totalTAM * 0.01 / list.length)}Cr+ revenue potential.
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '12px 16px', background: 'rgba(61,80,96,0.3)', border: '1px solid var(--border-dim)', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
                                        📅 Recommended Next Actions
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.8 }}>
                                        1. Re-analyze your top trends monthly to track score momentum<br />
                                        2. Set a ₹10L minimum viable product budget for your top breakout trend<br />
                                        3. Run a Reddit validation post before committing to inventory<br />
                                        4. Check Amazon India listing count monthly — rising products = market validation
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}