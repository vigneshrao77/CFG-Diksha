import React, { useEffect, useState } from 'react'
import DBarChart from '../../components/Charts/BarChart.jsx'
import DRadarChart from '../../components/Charts/RadarChart.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import { getComparisonData } from '../../services/adminService.js'

const COMP_COLORS = ['#1E3A5F', '#F2A93B', '#3F8F5F', '#9095ae', '#C1473A', '#8E44AD', '#D35400']

export default function Comparisons() {
  const [schools, setSchools] = useState([])
  const [selectedCentres, setSelectedCentres] = useState([])
  const [activeView, setActiveView] = useState('bar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getComparisonData()
      .then((data) => {
        if (data && data.schools) {
          setSchools(data.schools)
          // Default select up to 4 schools
          setSelectedCentres(data.schools.slice(0, 4).map(s => s._id))
        }
      })
      .catch((err) => {
        console.error('Failed to load comparison data:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const schoolMap = Object.fromEntries(schools.map(s => [s._id, s]))
  const selectedSchools = selectedCentres.map(id => schoolMap[id]).filter(Boolean)

  // Build chart data using selected centres' dynamic metrics
  const chartData = [
    { metric: 'Attendance %', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.attendanceRate])) },
    { metric: 'Academic Score', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.avgAcademicScore])) },
    { metric: 'SEL Index', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.selIndex])) },
    { metric: 'Health Coverage %', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.healthCoverage])) },
  ]

  const radarData = [
    { subject: 'Attendance', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.attendanceRate])) },
    { subject: 'Academic', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.avgAcademicScore])) },
    { subject: 'SEL Index', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.selIndex])) },
    { subject: 'Health', ...Object.fromEntries(selectedSchools.map(s => [s.name.replace(/\s+/g, ''), s.healthCoverage])) },
  ]

  function toggleCentre(id) {
    setSelectedCentres(sel =>
      sel.includes(id)
        ? sel.filter(x => x !== id)
        : [...sel, id]
    )
  }

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Comparisons</h1>
          <p className="page-subtitle">Benchmark schools and KHEL centres across all key metrics</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn ${activeView === 'bar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveView('bar')}>Bar Chart</button>
          <button className={`btn ${activeView === 'radar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveView('radar')}>Radar Chart</button>
          <button className={`btn ${activeView === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveView('table')}>Table</button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Centre Selector */}
          <div className="card mb-6">
            <h2 className="section-title">Select Schools / Centres to Compare</h2>
            <div className="flex gap-2 flex-wrap">
              {schools.map((c) => {
                const isSelected = selectedCentres.includes(c._id)
                const colorIdx = selectedCentres.indexOf(c._id) % COMP_COLORS.length
                const color = isSelected ? COMP_COLORS[colorIdx] : 'var(--slate-200)'
                return (
                  <button
                    key={c._id}
                    onClick={() => toggleCentre(c._id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${color}`,
                      background: isSelected ? COMP_COLORS[colorIdx] + '18' : 'var(--white)',
                      color: isSelected ? COMP_COLORS[colorIdx] : 'var(--slate-600)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
            {selectedCentres.length < 2 && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: 12, color: 'var(--kumkum-red)' }}>
                Please select at least 2 schools to compare.
              </div>
            )}
          </div>

          {selectedCentres.length >= 2 && (
            <>
              {/* Bar Chart View */}
              {activeView === 'bar' && (
                <div className="card">
                  <h2 className="section-title">Side-by-Side Comparison</h2>
                  <DBarChart
                    data={chartData}
                    xKey="metric"
                    bars={selectedSchools.map((s, i) => ({
                      key: s.name.replace(/\s+/g, ''),
                      name: s.name,
                      color: COMP_COLORS[i % COMP_COLORS.length],
                    }))}
                    height={320}
                  />
                </div>
              )}

              {/* Radar View */}
              {activeView === 'radar' && (
                <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
                  <h2 className="section-title">Multi-Dimensional Radar</h2>
                  <DRadarChart
                    data={radarData}
                    series={selectedSchools.map((s, i) => ({
                      key: s.name.replace(/\s+/g, ''),
                      name: s.name,
                      color: COMP_COLORS[i % COMP_COLORS.length],
                    }))}
                    height={380}
                  />
                </div>
              )}

              {/* Table View */}
              {activeView === 'table' && (
                <div className="card">
                  <h2 className="section-title">Ranked Comparison Table</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--slate-200)' }}>
                          <th style={thStyle}>Centre / School</th>
                          <th style={thStyle}>Attendance %</th>
                          <th style={thStyle}>Academic Score</th>
                          <th style={thStyle}>SEL Index</th>
                          <th style={thStyle}>Health Coverage %</th>
                          <th style={thStyle}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSchools
                          .sort((a, b) => (b.attendanceRate + b.avgAcademicScore + b.selIndex) - (a.attendanceRate + a.avgAcademicScore + a.selIndex))
                          .map((s, i) => (
                            <tr key={s._id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                              <td style={tdStyle}>
                                <div className="flex items-center gap-2">
                                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COMP_COLORS[i % COMP_COLORS.length], flexShrink: 0 }} />
                                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                                </div>
                              </td>
                              <td style={tdStyle}><MetricCell value={s.attendanceRate} good={s.attendanceRate >= 80} /></td>
                              <td style={tdStyle}><MetricCell value={s.avgAcademicScore} good={s.avgAcademicScore >= 70} /></td>
                              <td style={tdStyle}><MetricCell value={s.selIndex} good={s.selIndex >= 65} /></td>
                              <td style={tdStyle}><MetricCell value={s.healthCoverage} good={s.healthCoverage >= 80} /></td>
                              <td style={tdStyle}>
                                <span className={s.status === 'Excellent' ? 'chip chip-green' : s.status === 'Progressing' ? 'chip chip-marigold' : 'chip chip-red'}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--slate-500)',
}

const tdStyle = {
  padding: '10px 16px',
  verticalAlign: 'middle',
}

function MetricCell({ value, good }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: good ? 'var(--banyan-green)' : 'var(--kumkum-red)' }}>
      {value}%
    </span>
  )
}
