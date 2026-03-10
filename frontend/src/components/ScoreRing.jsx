export default function ScoreRing({ score = 0, size = 80 }) {
  var r = (size - 14) / 2
  var circ = 2 * Math.PI * r
  var dash = circ - (score / 100) * circ

  var color =
    score >= 75 ? '#00E5CC' :
      score >= 60 ? '#00E5CC' :
        score >= 45 ? '#FFB830' : '#FF5C5C'

  var glowColor =
    score >= 75 ? 'rgba(0,229,204,0.6)' :
      score >= 60 ? 'rgba(0,229,204,0.5)' :
        score >= 45 ? 'rgba(255,184,48,0.5)' : 'rgba(255,92,92,0.5)'

  return (
    <div className="score-ring" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Outer glow track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7} />
        {/* Fill arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)',
            filter: 'drop-shadow(0 0 8px ' + glowColor + ')',
          }}
        />
      </svg>
      <div className="score-inner">
        <span style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 800,
          fontSize: size > 70 ? 22 : size > 50 ? 17 : 13,
          color,
          lineHeight: 1,
          textShadow: '0 0 20px ' + glowColor,
        }}>
          {score}
        </span>
        {size > 55 && (
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: 3, textTransform: 'uppercase' }}>
            MAS
          </span>
        )}
      </div>
    </div>
  )
}