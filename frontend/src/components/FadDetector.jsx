const FAD_EXAMPLES = [
    { name: 'Charcoal Toothpaste', peak: '2018', crash: '8 months', loss: '₹2-5Cr' },
    { name: 'Celery Juice Cleanse', peak: '2019', crash: '6 months', loss: '₹1-3Cr' },
    { name: 'Activated Charcoal Lemonade', peak: '2017', crash: '5 months', loss: '₹50L-2Cr' },
    { name: 'Keto Supplements (India)', peak: '2020', crash: '12 months', loss: '₹5-15Cr' },
]

function getWarningLevel(score, strands) {
    if (score >= 60) return null

    var fadSignals = []

    if (strands) {
        var smv = strands.find(function (s) { return s.id === 'SMV' })
        var set_ = strands.find(function (s) { return s.id === 'SET' })
        var isr = strands.find(function (s) { return s.id === 'ISR' })
        var rpv = strands.find(function (s) { return s.id === 'RPV' })

        if (smv && smv.score > 70) fadSignals.push('Search spike detected — rapid rise without sustained momentum')
        if (set_ && set_.score < 25) fadSignals.push('Low scientific evidence — no research backing this trend')
        if (isr && isr.score < 30) fadSignals.push('Weak India resonance — may be Western trend that won\'t translate')
        if (rpv && rpv.score < 25) fadSignals.push('Low repeat purchase signal — one-time curiosity, not habit')
    }

    if (score < 35) {
        return { level: 'DANGER', color: '#F87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.25)', signals: fadSignals }
    }
    if (score < 50) {
        return { level: 'CAUTION', color: '#FCD34D', bg: 'rgba(252,211,77,0.06)', border: 'rgba(252,211,77,0.25)', signals: fadSignals }
    }
    return null
}

export default function FadDetector({ score, strands, keyword }) {
    var warning = getWarningLevel(score, strands)
    if (!warning) return null

    var isDanger = warning.level === 'DANGER'

    return (
        <div style={{
            padding: 20,
            background: warning.bg,
            border: '1px solid ' + warning.border,
            borderRadius: 'var(--radius)',
            marginBottom: 16,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>{isDanger ? '⚠️' : '👀'}</div>
                <div>
                    <div style={{
                        fontFamily: 'var(--f-mono)', fontWeight: 700,
                        fontSize: 13, color: warning.color,
                        letterSpacing: '0.1em',
                    }}>
                        {isDanger ? 'FAD ALERT — HIGH RISK' : 'CAUTION — WATCH CLOSELY'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
                        {isDanger
                            ? '"' + keyword + '" shows multiple fad DNA patterns. Capital at risk.'
                            : '"' + keyword + '" has some fad signals. Needs more validation before investing.'}
                    </div>
                </div>
            </div>

            {/* Fad signals detected */}
            {warning.signals.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>
                        FAD DNA SIGNALS DETECTED
                    </div>
                    {warning.signals.map(function (sig, i) {
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8,
                                padding: '6px 0',
                                borderBottom: i < warning.signals.length - 1 ? '1px solid ' + warning.border : 'none',
                            }}>
                                <span style={{ color: warning.color, fontSize: 12, flexShrink: 0 }}>→</span>
                                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{sig}</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Historical fad examples */}
            <div style={{
                background: 'rgba(7,9,13,0.5)',
                border: '1px solid ' + warning.border,
                borderRadius: 6,
                padding: 14,
                marginBottom: 14,
            }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 10 }}>
                    INDIA FAD GRAVEYARD — SIMILAR PATTERNS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {FAD_EXAMPLES.map(function (ex) {
                        return (
                            <div key={ex.name} style={{
                                padding: '8px 10px',
                                background: 'rgba(248,113,113,0.04)',
                                border: '1px solid rgba(248,113,113,0.15)',
                                borderRadius: 4,
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#F87171', marginBottom: 4 }}>{ex.name}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                    Peak: {ex.peak} &nbsp;|&nbsp; Crashed: {ex.crash} later
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                                    Avg founder loss: {ex.loss}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recommendation */}
            <div style={{
                padding: '10px 14px',
                background: 'rgba(7,9,13,0.4)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--text-2)',
                lineHeight: 1.7,
            }}>
                <strong style={{ color: warning.color }}>NADI Recommendation: </strong>
                {isDanger
                    ? 'Do not invest in product development yet. Monitor for 60-90 days. Wait for MAS score to cross 60 before committing capital. Consider pivoting to a related trend with stronger DNA.'
                    : 'Proceed with caution. Run small-scale experiments before full launch. Validate repeat purchase intent with a pre-order or waiting list before building inventory.'}
            </div>
        </div>
    )
}