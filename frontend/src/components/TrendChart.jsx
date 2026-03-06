import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-float)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--radius)',
      padding: '8px 12px',
      fontFamily: 'var(--f-mono)',
      fontSize: 11,
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 3 }}>{label}</div>
      <div style={{ color: 'var(--gold)', fontWeight: 500 }}>Interest: {payload[0].value}</div>
    </div>
  )
}

export default function TrendChart({ data, color = '#C9A84C', height = 110 }) {
  if (!data?.length) return (
    <div style={{
      height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px dashed var(--border-dim)',
      borderRadius: 'var(--radius)',
      fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-3)',
    }}>
      No trend data
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.22}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date"
          tick={{ fontSize: 9, fill: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}
          tickLine={false} axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide domain={[0,100]}/>
        <Tooltip content={<Tip/>}/>
        <Area type="monotone" dataKey="value"
          stroke={color} strokeWidth={2}
          fill={`url(#grad-${color.replace('#','')})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
