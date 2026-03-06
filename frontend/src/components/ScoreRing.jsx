export default function ScoreRing({ score = 0, size = 80 }) {
  const r   = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (score / 100) * circ

  const color =
    score >= 75 ? '#2DD4BF' :
    score >= 60 ? '#2DD4BF' :
    score >= 45 ? '#FCD34D' : '#F87171'

  return (
    <div className="score-ring" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
        {/* fill */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',
            filter: `drop-shadow(0 0 5px ${color}88)`,
          }}
        />
      </svg>
      <div className="score-inner">
        <span style={{
          fontFamily: 'var(--f-mono)',
          fontWeight: 500,
          fontSize: size > 60 ? 17 : 13,
          color,
          lineHeight: 1,
        }}>
          {score}
        </span>
        {size > 55 && (
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.08em', marginTop: 2 }}>
            MAS
          </span>
        )}
      </div>
    </div>
  )
}
