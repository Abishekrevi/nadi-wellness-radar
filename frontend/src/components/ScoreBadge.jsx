import { useRef, useState } from 'react'

function scoreColor(score) {
    if (score >= 75) return '#2DD4BF'
    if (score >= 60) return '#C9A84C'
    if (score >= 45) return '#FCD34D'
    return '#F87171'
}

function scoreLabel(score) {
    if (score >= 75) return 'BREAKOUT TREND'
    if (score >= 60) return 'EMERGING TREND'
    if (score >= 45) return 'NASCENT SIGNAL'
    return 'BACKGROUND NOISE'
}

export default function ScoreBadge({ result }) {
    const [copied, setCopied] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const canvasRef = useRef(null)

    if (!result) return null

    const score = result.momentumAccelerationScore || 0
    const color = scoreColor(score)
    const label = scoreLabel(score)
    const kw = result.keyword || ''
    const tam = result.marketSizePotential?.tam || 0

    function drawBadge(canvas) {
        const W = 600, H = 320
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = '#07090D'
        ctx.fillRect(0, 0, W, H)

        // Gold border
        ctx.strokeStyle = '#C9A84C'
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, W - 2, H - 2)

        // Left accent bar
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 5, H)

        // NADI logo text
        ctx.fillStyle = '#C9A84C'
        ctx.font = 'bold 28px Georgia, serif'
        ctx.fillText('NADI', 24, 48)

        ctx.fillStyle = '#3D5060'
        ctx.font = '10px Courier New, monospace'
        ctx.fillText('NEURAL AYURVEDIC & DIGITAL INTELLIGENCE', 24, 66)

        // Divider
        ctx.strokeStyle = '#1A2B38'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(24, 80)
        ctx.lineTo(W - 24, 80)
        ctx.stroke()

        // Keyword
        ctx.fillStyle = '#EDE8DC'
        ctx.font = 'bold 22px Georgia, serif'
        const kwDisplay = kw.length > 35 ? kw.slice(0, 35) + '...' : kw
        ctx.fillText(kwDisplay.toUpperCase(), 24, 115)

        // Score circle
        const cx = W - 90, cy = 170, r = 58
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#0D1520'
        ctx.fill()

        ctx.fillStyle = color
        ctx.font = 'bold 40px Courier New, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(String(score), cx, cy + 14)

        ctx.fillStyle = '#3D5060'
        ctx.font = '9px Courier New, monospace'
        ctx.fillText('MAS SCORE', cx, cy + 32)
        ctx.textAlign = 'left'

        // Classification label
        ctx.fillStyle = color
        ctx.font = 'bold 15px Georgia, serif'
        ctx.fillText(label, 24, 155)

        // Stats row
        const stats = [
            { l: 'Market TAM', v: '\u20B9' + tam + 'Cr' },
            { l: 'Reddit', v: String(result.signals?.reddit || 0) },
            { l: 'Research', v: String(result.signals?.research || 0) },
            { l: 'Amazon IN', v: String(result.signals?.ecommerce || 0) },
        ]

        stats.forEach(function (st, i) {
            const x = 24 + i * 138
            ctx.fillStyle = '#111E2C'
            ctx.fillRect(x, 172, 128, 58)

            ctx.fillStyle = '#C9A84C'
            ctx.font = 'bold 18px Courier New, monospace'
            ctx.fillText(st.v, x + 10, 198)

            ctx.fillStyle = '#3D5060'
            ctx.font = '9px Courier New, monospace'
            ctx.fillText(st.l.toUpperCase(), x + 10, 218)
        })

        // Footer
        ctx.fillStyle = '#111E2C'
        ctx.fillRect(0, 270, W, 50)

        ctx.fillStyle = '#3D5060'
        ctx.font = '9px Courier New, monospace'
        ctx.fillText('nadi-wellness-radar-production.up.railway.app  \u00B7  India Wellness Intelligence  \u00B7  1,000+ Live Sources', 24, 300)

        ctx.fillStyle = '#2DD4BF'
        ctx.font = 'bold 9px Courier New, monospace'
        ctx.fillText('POWERED BY NADI v2.0', W - 150, 300)
    }

    function handleDownload() {
        setDownloading(true)
        const canvas = document.createElement('canvas')
        drawBadge(canvas)
        canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'NADI-Score-' + kw.replace(/[^a-z0-9]/gi, '-').slice(0, 30) + '.png'
            a.click()
            URL.revokeObjectURL(url)
            setDownloading(false)
        })
    }

    function handleCopyText() {
        const text = [
            'Just scanned "' + kw + '" on NADI \uD83E\uDDEC',
            '',
            '\uD83D\uDCCA Momentum Acceleration Score: ' + score + '/100',
            '\uD83C\uDFF7\uFE0F Classification: ' + label,
            '\uD83C\uDDEE\uD83C\uDDF3 Market TAM: \u20B9' + tam + 'Cr',
            '\uD83D\uDD2C Research Papers: ' + (result.signals?.research || 0),
            '\uD83D\uDED2 Amazon Products: ' + (result.signals?.ecommerce || 0),
            '',
            'India\u2019s first AI-powered wellness trend intelligence platform.',
            'Try it free \u2192 nadi-wellness-radar-production.up.railway.app',
            '',
            '#NADIIntelligence #IndiaWellness #D2CIndia #WellnessTrends #StartupIndia',
        ].join('\n')

        navigator.clipboard.writeText(text).then(function () {
            setCopied(true)
            setTimeout(function () { setCopied(false) }, 2500)
        })
    }

    return (
        <div style={{
            padding: 20,
            background: 'var(--bg-float)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius)',
            marginTop: 16,
        }}>
            <div className="label" style={{ marginBottom: 14, color: 'var(--gold)' }}>
                🏅 Share Your NADI Score
            </div>

            {/* Badge preview */}
            <div style={{
                background: '#07090D',
                border: '2px solid #C9A84C',
                borderRadius: 8,
                padding: 20,
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Left accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: color }} />

                <div style={{ paddingLeft: 12 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#C9A84C' }}>NADI</div>
                            <div style={{ fontFamily: 'Courier New', fontSize: 8, color: '#3D5060', letterSpacing: '0.15em' }}>
                                NEURAL AYURVEDIC & DIGITAL INTELLIGENCE
                            </div>
                        </div>
                        {/* Score ring */}
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            border: '3px solid ' + color,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: '#0D1520',
                        }}>
                            <div style={{ fontFamily: 'Courier New', fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
                            <div style={{ fontFamily: 'Courier New', fontSize: 7, color: '#3D5060', marginTop: 2 }}>MAS SCORE</div>
                        </div>
                    </div>

                    {/* Keyword */}
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#EDE8DC', marginBottom: 4 }}>
                        {kw.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'Courier New', fontSize: 11, fontWeight: 700, color, marginBottom: 14 }}>
                        {label}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                            { l: 'Market TAM', v: '\u20B9' + tam + 'Cr' },
                            { l: 'Research', v: (result.signals?.research || 0) + ' papers' },
                            { l: 'Amazon IN', v: (result.signals?.ecommerce || 0) + ' products' },
                            { l: 'Reddit', v: (result.signals?.reddit || 0) + ' posts' },
                        ].map(function (st) {
                            return (
                                <div key={st.l} style={{
                                    padding: '6px 12px',
                                    background: '#111E2C',
                                    border: '1px solid #1A2B38',
                                    borderRadius: 4,
                                }}>
                                    <div style={{ fontFamily: 'Courier New', fontSize: 13, fontWeight: 700, color: '#C9A84C' }}>{st.v}</div>
                                    <div style={{ fontFamily: 'Courier New', fontSize: 8, color: '#3D5060', marginTop: 2 }}>{st.l.toUpperCase()}</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 12, fontFamily: 'Courier New', fontSize: 8, color: '#3D5060' }}>
                        nadi-wellness-radar-production.up.railway.app &nbsp;&middot;&nbsp; India Wellness Intelligence &nbsp;&middot;&nbsp; 1,000+ Live Sources
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px',
                        background: 'rgba(201,168,76,0.12)',
                        border: '1px solid rgba(201,168,76,0.35)',
                        borderRadius: 6, cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, color: 'var(--gold)',
                    }}
                >
                    {downloading ? '\u29F3 Generating...' : '\uD83D\uDCF8 Download Badge PNG'}
                </button>

                <button
                    onClick={handleCopyText}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px',
                        background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(45,212,191,0.06)',
                        border: '1px solid ' + (copied ? 'rgba(45,212,191,0.4)' : 'rgba(45,212,191,0.2)'),
                        borderRadius: 6, cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, color: 'var(--teal)',
                    }}
                >
                    {copied ? '\u2705 Copied!' : '\uD83D\uDCCB Copy LinkedIn Post'}
                </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>
                Share your score on LinkedIn, Twitter, or WhatsApp to attract co-founders and investors.
            </div>
        </div>
    )
}