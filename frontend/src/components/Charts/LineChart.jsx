import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#1E3A5F', '#F2A93B', '#3F8F5F', '#9095ae']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-btn)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-dropdown)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 2, background: p.color, display: 'inline-block', borderRadius: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--slate-700)' }}>
            {p.name}: {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Props:
 *  data    array of objects
 *  lines   array of { key, name, color? }
 *  xKey    string
 *  height  number
 */
export default function DLineChart({ data = [], lines = [], xKey = 'month', height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-200)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'var(--slate-500)', fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)' }} />}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name || l.key}
            stroke={l.color || COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
