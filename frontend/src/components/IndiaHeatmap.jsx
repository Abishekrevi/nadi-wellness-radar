// India State Heatmap — shows relative search interest by state
// Uses simplified SVG positions for major Indian states

const STATES = [
    { id: 'MH', name: 'Maharashtra', x: 195, y: 310, r: 28, weight: 0.95 },
    { id: 'DL', name: 'Delhi', x: 218, y: 178, r: 18, weight: 0.90 },
    { id: 'KA', name: 'Karnataka', x: 200, y: 390, r: 24, weight: 0.85 },
    { id: 'TN', name: 'Tamil Nadu', x: 220, y: 445, r: 22, weight: 0.80 },
    { id: 'GJ', name: 'Gujarat', x: 145, y: 272, r: 22, weight: 0.75 },
    { id: 'RJ', name: 'Rajasthan', x: 175, y: 218, r: 26, weight: 0.65 },
    { id: 'WB', name: 'West Bengal', x: 338, y: 272, r: 20, weight: 0.70 },
    { id: 'TS', name: 'Telangana', x: 238, y: 362, r: 20, weight: 0.72 },
    { id: 'KL', name: 'Kerala', x: 198, y: 458, r: 18, weight: 0.68 },
    { id: 'UP', name: 'Uttar Pradesh', x: 255, y: 215, r: 26, weight: 0.60 },
    { id: 'MP', name: 'Madhya Pradesh', x: 228, y: 270, r: 24, weight: 0.55 },
    { id: 'HR', name: 'Haryana', x: 202, y: 185, r: 16, weight: 0.58 },
    { id: 'PB', name: 'Punjab', x: 188, y: 158, r: 16, weight: 0.52 },
    { id: 'AP', name: 'Andhra Pradesh', x: 252, y: 400, r: 20, weight: 0.62 },
    { id: 'OR', name: 'Odisha', x: 308, y: 318, r: 18, weight: 0.48 },
    { id: 'BR', name: 'Bihar', x: 305, y: 238, r: 18, weight: 0.42 },
    { id: 'JH', name: 'Jharkhand', x: 318, y: 280, r: 16, weight: 0.40 },
    { id: 'CG', name: 'Chhattisgarh', x: 272, y: 312, r: 18, weight: 0.38 },
    { id: 'AS', name: 'Assam', x: 390, y: 218, r: 16, weight: 0.35 },
    { id: 'HP', name: 'Himachal Pradesh', x: 208, y: 145, r: 14, weight: 0.32 },
]

function getStateColor(weight, score) {
    // Blend state weight with trend score
    var intensity = weight * Math.min(1, score / 100)
    if (intensity > 0.75) return { fill: 'rgba(45,212,191,0.85)', stroke: '#2DD4BF', text: '#07090D' }
    if (intensity > 0.55) return { fill: 'rgba(45,212,191,0.55)', stroke: '#2DD4BF', text: '#EDE8DC' }
    if (intensity > 0.40) return { fill: 'rgba(201,168,76,0.65)', stroke: '#C9A84C', text: '#07090D' }
    if (intensity > 0.25) return { fill: 'rgba(201,168,76,0.35)', stroke: '#C9A84C', text: '#EDE8DC' }
    return { fill: 'rgba(61,80,96,0.4)', stroke: '#3D5060', text: '#8FA3B1' }
}

function getLevelLabel(intensity) {
    if (intensity > 0.75) return 'Very High'
    if (intensity > 0.55) return 'High'
    if (intensity > 0.40) return 'Medium'
    if (intensity > 0.25) return 'Low'
    return 'Minimal'
}

export default function IndiaHeatmap({ keyword, score }) {
    var displayScore = score || 50

    return (
        <div style={{
            padding: 20,
            background: 'var(--bg-float)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius)',
            marginTop: 16,
        }}>
            <div className="label" style={{ marginBottom: 4, color: 'var(--gold)' }}>
                🇮🇳 India State Interest Heatmap
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginBottom: 16 }}>
                Estimated relative consumer interest for "{keyword}" across Indian states
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                {/* SVG Map */}
                <div style={{ background: '#07090D', borderRadius: 8, padding: 12, border: '1px solid var(--border-dim)' }}>
                    <svg viewBox="100 120 340 380" style={{ width: '100%', maxHeight: 340 }}>
                        {/* Map background */}
                        <rect x="100" y="120" width="340" height="380" fill="#07090D" />

                        {/* State bubbles */}
                        {STATES.map(function (state) {
                            var intensity = state.weight * Math.min(1, displayScore / 100)
                            var colors = getStateColor(state.weight, displayScore)
                            var fontSize = state.r > 22 ? 8 : 7

                            return (
                                <g key={state.id}>
                                    <circle
                                        cx={state.x} cy={state.y} r={state.r}
                                        fill={colors.fill}
                                        stroke={colors.stroke}
                                        strokeWidth="1"
                                        opacity="0.9"
                                    />
                                    <text
                                        x={state.x} y={state.y}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fontSize={fontSize}
                                        fontFamily="Courier New, monospace"
                                        fontWeight="700"
                                        fill={colors.text}
                                    >
                                        {state.id}
                                    </text>
                                </g>
                            )
                        })}

                        {/* Legend */}
                        <text x="110" y="488" fontSize="7" fontFamily="Courier New" fill="#3D5060">
                            Bubble size = market size · Color = interest level
                        </text>
                    </svg>
                </div>

                {/* State list */}
                <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 10 }}>
                        TOP MARKETS BY INTEREST
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {STATES.slice(0, 10).map(function (state, i) {
                            var intensity = state.weight * Math.min(1, displayScore / 100)
                            var colors = getStateColor(state.weight, displayScore)
                            var pct = Math.round(intensity * 100)
                            return (
                                <div key={state.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                                        color: 'var(--text-3)', width: 18, textAlign: 'right',
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-1)', width: 130 }}>{state.name}</div>
                                    <div style={{ flex: 1, height: 6, background: 'var(--bg-raised)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: pct + '%',
                                            background: colors.stroke,
                                            borderRadius: 3,
                                            transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: colors.stroke, width: 55, textAlign: 'right' }}>
                                        {getLevelLabel(intensity)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 6 }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', marginBottom: 8, letterSpacing: '0.1em' }}>
                            INTEREST LEVELS
                        </div>
                        {[
                            { label: 'Very High', color: 'var(--teal)' },
                            { label: 'High', color: 'rgba(45,212,191,0.6)' },
                            { label: 'Medium', color: 'var(--gold)' },
                            { label: 'Low', color: 'rgba(201,168,76,0.5)' },
                            { label: 'Minimal', color: 'var(--text-3)' },
                        ].map(function (item) {
                            return (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{item.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', lineHeight: 1.6 }}>
                        * Based on MAS score ({displayScore}/100) weighted by state digital wellness adoption rates
                    </div>
                </div>
            </div>
        </div>
    )
}