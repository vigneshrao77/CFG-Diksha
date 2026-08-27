import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
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
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.color, display: 'inline-block' }} />
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
 *  bars    array of { key, name, color? }
 *  xKey    string (x-axis data key)
 *  height  number (default 260)
 *  rounded bool — rounded bar tops
 */
export default function DBarChart({ data = [], bars = [], xKey = 'name', height = 260, rounded = true }) {
  const radius = rounded ? [4, 4, 0, 0] : [0, 0, 0, 0]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,58,95,0.04)' }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)' }} />}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name || b.key}
            fill={b.color || COLORS[i % COLORS.length]}
            radius={radius}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
