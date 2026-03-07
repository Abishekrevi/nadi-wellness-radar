import { useState, useEffect } from 'react'

const STEPS = [
    {
        icon: '🧬',
        title: 'Welcome to NADI v2.0',
        subtitle: 'Neural Ayurvedic & Digital Intelligence',
        body: 'NADI is India\'s first AI-powered wellness trend intelligence platform. We scan 1,000+ live data sources to tell you which wellness trends are real — and which are fads — before you invest a single rupee.',
        color: 'var(--gold)',
    },
    {
        icon: '📡',
        title: 'Radar Scan',
        subtitle: 'Scan 20+ trends simultaneously',
        body: 'The Radar Scan tab scans up to 20 wellness keywords at once and ranks them by their Momentum Acceleration Score (MAS). Perfect for discovering what is breaking out right now in India.',
        color: 'var(--teal)',
    },
    {
        icon: '🔬',
        title: 'Deep Analyze',
        subtitle: 'Full DNA fingerprint for any trend',
        body: 'Enter any wellness ingredient or practice. NADI fetches live data from Reddit, YouTube, PubMed, Amazon India, Google Trends, and News — then generates a founder-grade AI opportunity brief.',
        color: 'var(--gold)',
    },
    {
        icon: '📊',
        title: 'The DNA Model',
        subtitle: '8 signal strands → 1 MAS score',
        body: 'Every trend is scored across 8 DNA strands: Search Momentum, Cross-Platform Coherence, Scientific Evidence, India Resonance, and 4 more. Combined into a single 0-100 score that tells you exactly where the trend is in its lifecycle.',
        color: 'var(--teal)',
    },
    {
        icon: '🚀',
        title: 'You\'re Ready!',
        subtitle: 'Move first. Build smart.',
        body: 'Start with a Radar Scan to see what\'s trending in Indian wellness right now. Then Deep Analyze your top pick to get a full investor-grade brief with product ideas, GTM strategy, and revenue model.',
        color: 'var(--gold)',
    },
]

export default function Onboarding() {
    const [visible, setVisible] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(function () {
        try {
            var seen = localStorage.getItem('nadi_onboarded')
            if (!seen) setVisible(true)
        } catch (e) {
            setVisible(true)
        }
    }, [])

    function finish() {
        try { localStorage.setItem('nadi_onboarded', '1') } catch (e) { }
        setVisible(false)
    }

    function next() {
        if (step < STEPS.length - 1) setStep(step + 1)
        else finish()
    }

    function prev() {
        if (step > 0) setStep(step - 1)
    }

    if (!visible) return null

    var s = STEPS[step]

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(4,6,10,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: '#0D1520',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 16,
                padding: 40,
                maxWidth: 520,
                width: '100%',
                position: 'relative',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}>
                {/* Skip button */}
                <button
                    onClick={finish}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'none', border: 'none',
                        color: 'var(--text-3)', cursor: 'pointer',
                        fontSize: 11, fontFamily: 'var(--f-mono)',
                    }}
                >
                    Skip tour
                </button>

                {/* Step dots */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 32, justifyContent: 'center' }}>
                    {STEPS.map(function (_, i) {
                        return (
                            <div key={i} style={{
                                width: i === step ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: i === step ? s.color : '#1A2B38',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                            }} onClick={function () { setStep(i) }} />
                        )
                    })}
                </div>

                {/* Icon */}
                <div style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.08)',
                    border: '2px solid ' + s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                    margin: '0 auto 24px',
                }}>
                    {s.icon}
                </div>

                {/* Content */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: 24, fontWeight: 700,
                        color: s.color,
                        marginBottom: 6,
                    }}>
                        {s.title}
                    </div>
                    <div style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 10, color: 'var(--text-3)',
                        letterSpacing: '0.12em',
                        marginBottom: 20,
                        textTransform: 'uppercase',
                    }}>
                        {s.subtitle}
                    </div>
                    <div style={{
                        fontSize: 14, color: 'var(--text-2)',
                        lineHeight: 1.8,
                    }}>
                        {s.body}
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    {step > 0 && (
                        <button
                            onClick={prev}
                            style={{
                                padding: '10px 24px',
                                background: 'none',
                                border: '1px solid var(--border-mid)',
                                borderRadius: 8, cursor: 'pointer',
                                fontSize: 13, fontWeight: 600,
                                color: 'var(--text-2)',
                                fontFamily: 'var(--f-mono)',
                            }}
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={next}
                        style={{
                            padding: '10px 32px',
                            background: s.color,
                            border: '1px solid ' + s.color,
                            borderRadius: 8, cursor: 'pointer',
                            fontSize: 13, fontWeight: 700,
                            color: '#07090D',
                            fontFamily: 'var(--f-mono)',
                        }}
                    >
                        {step === STEPS.length - 1 ? 'Start Scanning →' : 'Next →'}
                    </button>
                </div>

                {/* Step counter */}
                <div style={{
                    textAlign: 'center', marginTop: 16,
                    fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)',
                }}>
                    {step + 1} / {STEPS.length}
                </div>
            </div>
        </div>
    )
}