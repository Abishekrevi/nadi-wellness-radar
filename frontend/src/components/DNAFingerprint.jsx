export default function DNAFingerprint({ strands, historicalMatch }) {
  const barColor = s =>
    s >= 70 ? 'var(--teal)'  :
    s >= 45 ? 'var(--gold)'  :
    s >= 25 ? 'var(--amber)' : 'var(--red)'

  return (
    <div>
      {strands?.map((strand, i) => (
        <div key={strand.id} className="dna-row" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="mono" style={{ width: 38, fontSize: 9, color: 'var(--gold)', fontWeight: 500, flexShrink: 0 }}>
            {strand.id}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5, lineHeight: 1 }}>
              {strand.name}
            </div>
            <div className="dna-track">
              <div className="dna-fill" style={{
                width: `${strand.score}%`,
                background: `linear-gradient(90deg, ${barColor(strand.score)}, ${barColor(strand.score)}99)`,
              }}/>
            </div>
          </div>
          <div className="mono" style={{
            width: 32, textAlign: 'right', fontSize: 12,
            fontWeight: 500, color: barColor(strand.score), flexShrink: 0,
          }}>
            {strand.score}
          </div>
        </div>
      ))}

      {historicalMatch && (
        <div style={{
          marginTop: 14,
          padding: 12,
          background: 'var(--bg-float)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius)',
        }}>
          <div className="label" style={{ marginBottom: 10 }}>DNA pattern match</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 'var(--radius)' }}>
              <div className="label" style={{ color: 'var(--teal)', marginBottom: 4 }}>Closest trend</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>{historicalMatch.closestTrend?.name || '—'}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>{historicalMatch.trendScore}% similar</div>
            </div>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 'var(--radius)' }}>
              <div className="label" style={{ color: 'var(--red)', marginBottom: 4 }}>Closest fad</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>{historicalMatch.closestFad?.name || '—'}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>{historicalMatch.fadScore}% similar</div>
            </div>
            <div style={{
              padding: '8px 12px',
              background: historicalMatch.verdict === 'TREND' ? 'rgba(45,212,191,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${historicalMatch.verdict === 'TREND' ? 'rgba(45,212,191,0.2)' : 'rgba(248,113,113,0.2)'}`,
              borderRadius: 'var(--radius)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0,
            }}>
              <span style={{ fontSize: 20 }}>{historicalMatch.verdict === 'TREND' ? '🧬' : '⚠️'}</span>
              <span className="mono" style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                color: historicalMatch.verdict === 'TREND' ? 'var(--teal)' : 'var(--red)',
              }}>
                {historicalMatch.verdict}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
