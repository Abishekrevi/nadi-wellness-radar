import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const ICONS = { SMV:'📈', CPC:'🌐', PSD:'🎯', SET:'🔬', ISR:'🇮🇳', EAS:'💰', RPV:'🔄', IAI:'✅' }

const STRANDS = [
  { id:'SMV', name:'Search Momentum Velocity',   weight:'18%', desc:'Rate of change in search interest. Real trends show gradual S-curves; fads spike then cliff.', trend:'Steady 15-40% monthly growth over 3-6 months', fad:'Spike >300% in <30 days, then rapid decline' },
  { id:'CPC', name:'Cross-Platform Coherence',   weight:'15%', desc:'Is the signal appearing across multiple independent platforms simultaneously?', trend:'Growing on 4+ platform types at once', fad:'Strong on Instagram, weak on Reddit & news' },
  { id:'PSD', name:'Problem-Solution Depth',     weight:'16%', desc:'Is there a genuine, unsolved consumer problem behind this trend?', trend:'Clear problem articulation before solution discovery', fad:'Mostly aesthetic/aspirational language' },
  { id:'SET', name:'Scientific Evidence Trajectory',weight:'12%',desc:'Is research catching up or preceding consumer interest?', trend:'PubMed papers rising 12-24 months before consumer peak', fad:'Consumer buzz without any research backing' },
  { id:'ISR', name:'India-Specific Resonance',   weight:'14%', desc:"Alignment with India's wellness infrastructure — Ayurvedic roots, FSSAI, Ayush.", trend:'Ayurvedic validation OR Ayush/FSSAI backing', fad:'Western trend without Indian cultural anchoring' },
  { id:'EAS', name:'Economic Accessibility Score',weight:'10%',desc:'Can the average Indian consumer actually afford and access this?', trend:'Mass-market pricing potential within 12-18 months', fad:'Luxury pricing, metro-only distribution' },
  { id:'RPV', name:'Repeat Purchase Velocity',   weight:'9%',  desc:'Are consumers reordering (habit formation) or one-time experimenting (fad)?', trend:'Growth in "reordering", "monthly", "refill" mentions', fad:'High initial trial, near-zero reorder mentions' },
  { id:'IAI', name:'Influencer Authenticity Index',weight:'6%', desc:'Who is talking about this — genuine users or paid promoters?', trend:'Organic word-of-mouth + doctor/expert validation', fad:'High #ad/#sponsored ratio, micro-influencer only' },
]

const TRENDS = [
  { name:'Ashwagandha', market:'₹450Cr+', timeline:'2016 → 2021', signal:'PubMed +400%, stress narrative, Ayurvedic roots' },
  { name:'Moringa',     market:'₹200Cr+', timeline:'2017 → 2022', signal:'WHO validation, protein narrative, farmer ecosystem' },
  { name:'Gut Health',  market:'₹800Cr+', timeline:'2018 → 2023', signal:'Microbiome research surge, IBS/PCOS discourse' },
  { name:'Collagen',    market:'₹350Cr+', timeline:'2019 → 2022', signal:'Beauty-from-within trend, repeat purchase strong' },
]

const FADS = [
  { name:'Charcoal Toothpaste',    decline:'18 months', signal:'Dentist pushback, no repeats, safety fears' },
  { name:'Celery Juice Craze',     decline:'12 months', signal:'Single influencer origin, no India fit' },
  { name:'Activated Charcoal Food',decline:'8 months',  signal:'No problem-solution depth, no reorders' },
  { name:'Jade Eggs',              decline:'6 months',  signal:'No scientific backing, safety concerns' },
]

export default function ModelExplainer() {
  const [sources,     setSources]     = useState(null)
  const [activeStrand,setActiveStrand]= useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/api/sources`).then(r => setSources(r.data)).catch(()=>{})
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28, marginBottom: 8 }}>
          <span style={{ color: 'var(--gold)' }}>DNA Trend Fingerprinting™</span>
          <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — how NADI thinks</span>
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 680, lineHeight: 1.7 }}>
          Every wellness trend has a genetic fingerprint — a combination of 8 signal strands that predict
          whether it becomes a lasting market shift or a fleeting fad. NADI matches new trends against
          historical DNA patterns of Indian wellness winners and losers.
        </p>
      </div>

      {/* MAS Formula */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 12 }}>Momentum Acceleration Score — Formula</div>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--gold)',
          padding: 16, background: 'var(--bg-float)', border: '1px solid var(--border-hi)',
          borderRadius: 'var(--radius)', marginBottom: 16, letterSpacing: '0.03em',
        }}>
          MAS = Σ(StrandScore × StrandWeight) × VelocityMultiplier × IndiaFactor
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { range: '75 – 100', label: 'BREAKOUT TREND',  sub: 'Act now — 6-month window',    color: 'var(--teal)'  },
            { range: '60 – 74',  label: 'EMERGING TREND',  sub: 'Build plan — 3-month window',  color: 'var(--teal)'  },
            { range: '45 – 59',  label: 'NASCENT SIGNAL',  sub: 'Monitor — set weekly alerts',  color: 'var(--amber)' },
            { range: '0 – 44',   label: 'FAD / NOISE',     sub: 'Do not invest resources yet',  color: 'var(--red)'   },
          ].map(r => (
            <div key={r.range} style={{
              padding: 14, background: 'var(--bg-float)',
              border: '1px solid var(--border-dim)', borderRadius: 'var(--radius)',
            }}>
              <div className="mono" style={{ fontSize: 16, fontWeight: 500, color: r.color, marginBottom: 4 }}>{r.range}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 8 Strands */}
      <div style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 14 }}>The 8 DNA strands — click to expand</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
          {STRANDS.map(s => (
            <div key={s.id}
              className="card"
              style={{
                padding: 18, cursor: 'pointer',
                borderColor: activeStrand === s.id ? 'var(--border-hi)' : 'var(--border-dim)',
                background: activeStrand === s.id ? 'rgba(201,168,76,0.04)' : 'var(--bg-raised)',
                transition: 'all 0.2s',
              }}
              onClick={() => setActiveStrand(activeStrand === s.id ? null : s.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{ICONS[s.id]}</span>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 500, letterSpacing: '0.08em' }}>
                    {s.id} — {s.weight}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{s.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{s.desc}</div>

              {activeStrand === s.id && (
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="anim-in">
                  <div style={{ padding: '8px 10px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.18)', borderRadius: 'var(--radius)' }}>
                    <div className="label" style={{ color: 'var(--teal)', marginBottom: 4 }}>Trend pattern</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.trend}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 'var(--radius)' }}>
                    <div className="label" style={{ color: 'var(--red)', marginBottom: 4 }}>Fad pattern</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.fad}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Historical validation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, borderColor: 'rgba(45,212,191,0.2)' }}>
          <div className="label" style={{ color: 'var(--teal)', marginBottom: 14 }}>✅ Proven trends — training DNA</div>
          {TRENDS.map(t => (
            <div key={t.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--gold)' }}>{t.market}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.timeline} · {t.signal}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20, borderColor: 'rgba(248,113,113,0.2)' }}>
          <div className="label" style={{ color: 'var(--red)', marginBottom: 14 }}>❌ Proven fads — failure DNA</div>
          {FADS.map(f => (
            <div key={f.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>−{f.decline}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{f.signal}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      {sources && (
        <div className="card" style={{ padding: 24 }}>
          <div className="label" style={{ marginBottom: 16 }}>
            📡 Data sources — {sources.total_sources.toLocaleString()}+ monitored live
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {Object.entries(sources.breakdown).map(([k, v]) => (
              <div key={k} className="stat-box">
                <div className="stat-val" style={{ fontSize: 22, color: 'var(--gold)' }}>
                  {typeof v === 'number' ? v.toLocaleString() : v}
                </div>
                <div className="stat-label" style={{ marginTop: 4, lineHeight: 1.4 }}>
                  {k.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
