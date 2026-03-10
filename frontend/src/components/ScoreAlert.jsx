import { useState, useEffect } from 'react'

var STORAGE_KEY = 'nadi_score_alerts'

function loadAlerts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch (e) { return [] }
}
function saveAlerts(alerts) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts)) } catch (e) { }
}

export function useAlerts() {
    var [alerts, setAlerts] = useState(loadAlerts)

    function addAlert(keyword, threshold, currentScore) {
        var alert = {
            id: Date.now(),
            keyword,
            threshold: Number(threshold),
            currentScore,
            createdAt: new Date().toISOString(),
            triggered: false,
        }
        setAlerts(function (prev) {
            var next = prev.concat([alert])
            saveAlerts(next)
            return next
        })
    }

    function removeAlert(id) {
        setAlerts(function (prev) {
            var next = prev.filter(function (a) { return a.id !== id })
            saveAlerts(next)
            return next
        })
    }

    return { alerts, addAlert, removeAlert }
}

// Inline button shown in Deep Analyze results
export function AlertButton({ keyword, currentScore, alerts }) {
    var [threshold, setThreshold] = useState(75)
    var [open, setOpen] = useState(false)
    var [saved, setSaved] = useState(false)

    var alreadySet = alerts.alerts.some(function (a) {
        return a.keyword.toLowerCase() === (keyword || '').toLowerCase()
    })

    function save() {
        if (!window.Notification) {
            alert('Browser notifications not supported. Alert saved locally.')
        } else if (Notification.permission === 'denied') {
            alert('Notifications blocked. Please enable in browser settings.')
        } else if (Notification.permission === 'default') {
            Notification.requestPermission()
        }
        alerts.addAlert(keyword, threshold, currentScore)
        setSaved(true)
        setTimeout(function () { setSaved(false); setOpen(false) }, 2000)
    }

    return (
        <div style={{ marginTop: 12 }}>
            <button
                onClick={function () { setOpen(function (o) { return !o }) }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    background: alreadySet ? 'rgba(252,211,77,0.1)' : 'rgba(252,211,77,0.05)',
                    border: '1px solid rgba(252,211,77,0.3)',
                    borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: 'var(--amber)',
                }}
            >
                {alreadySet ? '🔔 Alert Set' : '🔔 Set Score Alert'}
            </button>

            {open && (
                <div style={{
                    marginTop: 8, padding: 16,
                    background: 'var(--bg-float)',
                    border: '1px solid rgba(252,211,77,0.2)',
                    borderRadius: 8,
                }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>
                        Set Score Alert for "{keyword}"
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
                        Get a browser notification when the MAS score crosses your threshold. Current score: <strong style={{ color: 'var(--gold)' }}>{currentScore}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 6, letterSpacing: '0.1em' }}>ALERT WHEN SCORE REACHES</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input
                                    type="range" min="40" max="95" step="5"
                                    value={threshold}
                                    onChange={function (e) { setThreshold(Number(e.target.value)) }}
                                    style={{ flex: 1, accentColor: 'var(--amber)' }}
                                />
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    border: '2px solid var(--amber)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--f-mono)', fontSize: 16, fontWeight: 700, color: 'var(--amber)',
                                    flexShrink: 0,
                                }}>
                                    {threshold}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={save}
                            style={{
                                flex: 1, padding: '9px 0',
                                background: saved ? 'rgba(45,212,191,0.12)' : 'rgba(252,211,77,0.12)',
                                border: '1px solid ' + (saved ? 'rgba(45,212,191,0.3)' : 'rgba(252,211,77,0.3)'),
                                borderRadius: 6, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                color: saved ? 'var(--teal)' : 'var(--amber)',
                            }}
                        >
                            {saved ? '✅ Alert Saved!' : '🔔 Save Alert'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Full alerts management panel used in Dashboard
export default function AlertsPanel({ alerts }) {
    var { alerts: list, removeAlert } = alerts

    // Check alerts on mount and notify if any threshold met
    useEffect(function () {
        if (!list.length) return
        list.forEach(function (alert) {
            if (!alert.triggered && alert.currentScore >= alert.threshold) {
                if (window.Notification && Notification.permission === 'granted') {
                    new Notification('NADI Alert — ' + alert.keyword, {
                        body: 'MAS Score has reached ' + alert.currentScore + '/' + alert.threshold + ' threshold!',
                        icon: '/favicon.ico',
                    })
                }
            }
        })
    }, [])

    if (!list.length) {
        return (
            <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-float)', border: '1px solid var(--border-dim)', borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>No alerts set</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    Analyze a trend and click "🔔 Set Score Alert" to get notified when a trend heats up
                </div>
            </div>
        )
    }

    return (
        <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 12 }}>
                {list.length} ACTIVE ALERT{list.length !== 1 ? 'S' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map(function (alert) {
                    var met = alert.currentScore >= alert.threshold
                    var pct = Math.min(100, Math.round((alert.currentScore / alert.threshold) * 100))
                    return (
                        <div key={alert.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{alert.keyword}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>
                                        Alert at: <span style={{ color: 'var(--amber)' }}>{alert.threshold}</span> &nbsp;·&nbsp;
                                        Current: <span style={{ color: met ? 'var(--teal)' : 'var(--gold)' }}>{alert.currentScore}</span>
                                    </div>
                                    <div style={{ height: 5, background: 'var(--bg-float)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: pct + '%', background: met ? 'var(--teal)' : 'var(--amber)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 4 }}>
                                        {pct}% of threshold reached
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                    {met && (
                                        <span style={{ padding: '4px 10px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 20, fontSize: 9, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--f-mono)' }}>
                                            ✓ THRESHOLD MET
                                        </span>
                                    )}
                                    <button
                                        onClick={function () { removeAlert(alert.id) }}
                                        style={{ padding: '5px 10px', background: 'none', border: '1px solid var(--border-dim)', borderRadius: 4, cursor: 'pointer', fontSize: 10, color: 'var(--text-3)' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}