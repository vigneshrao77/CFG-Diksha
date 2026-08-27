import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#1E3A5F', '#F2A93B', '#3F8F5F', '#9095ae', '#C1473A']

/**
 * Props:
 *  data        array of { name, value }
 *  colors      optional array of hex strings
 *  total       string or number — shown in center with Fraunces
 *  totalLabel  string — shown below total
 *  size        number (default 200)
 */
export default function DonutChart({ data = [], colors, total, totalLabel = '', size = 200 }) {
  const cols = colors || COLORS
  const cx = size / 2
  const cy = size / 2
  const ir = size * 0.3
  const or = size * 0.46

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={ir}
            outerRadius={or}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={cols[i % cols.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{val}</span>,
              name
            ]}
            contentStyle={{
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-btn)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      {total !== undefined && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: size * 0.15,
            fontWeight: 700,
            color: 'var(--ink-indigo)',
            lineHeight: 1,
          }}>
            {total}
          </span>
          {totalLabel && (
            <span style={{
              fontSize: size * 0.07,
              color: 'var(--slate-500)',
              fontFamily: 'var(--font-sans)',
              marginTop: 4,
            }}>
              {totalLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
