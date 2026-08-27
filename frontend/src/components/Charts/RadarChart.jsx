import React from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

const COLORS = ['#1E3A5F', '#F2A93B', '#3F8F5F']

/**
 * Props:
 *  data    array of { subject, [key]: value }
 *  series  array of { key, name, color? }
 *  height  number
 */
export default function DRadarChart({ data = [], series = [], height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius={height * 0.34}>
        <PolarGrid stroke="var(--slate-200)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: 'var(--slate-600)', fontFamily: 'var(--font-sans)' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: 'var(--slate-400)', fontFamily: 'var(--font-mono)' }}
          tickCount={5}
        />
        <Tooltip
          contentStyle={{
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-btn)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}
        />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)' }} />
        )}
        {series.map((s, i) => (
          <Radar
            key={s.key}
            name={s.name || s.key}
            dataKey={s.key}
            stroke={s.color || COLORS[i % COLORS.length]}
            fill={s.color || COLORS[i % COLORS.length]}
            fillOpacity={0.12}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )
}
