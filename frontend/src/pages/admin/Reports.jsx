import React, { useState, useEffect, useRef } from 'react'
import { FileText, Download, Eye } from 'lucide-react'
import DBarChart from '../../components/Charts/BarChart.jsx'
import DLineChart from '../../components/Charts/LineChart.jsx'
import DRadarChart from '../../components/Charts/RadarChart.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import { getReportData, getSchools } from '../../services/adminService.js'

const REPORT_TYPES = [
  { id: 'donor',    label: 'Donor Impact Report',     desc: 'High-level impact metrics for CSR & donor presentations' },
  { id: 'govt',     label: 'Government Compliance',   desc: 'Attendance, enrollment, and program compliance data' },
  { id: 'internal', label: 'Internal Audit',           desc: 'Detailed operational and staff metrics for internal review' },
]

const PROGRAMS = [
  { id: 'all',        label: 'All Programs' },
  { id: 'sel',        label: 'SEL' },
  { id: 'academics',  label: 'Academics' },
  { id: 'arts',       label: 'Arts' },
  { id: 'lifeskills', label: 'Life Skills' },
  { id: 'science',    label: 'Science & Digital' },
]

const COHORTS = [
  { id: 'all',        label: 'All Cohorts' },
  { id: 'age-6-10',  label: 'Age 6–10' },
  { id: 'age-11-14', label: 'Age 11–14' },
  { id: 'age-15-18', label: 'Age 15–18' },
  { id: '2024-25',   label: 'Batch 2024-25' },
  { id: '2025-26',   label: 'Batch 2025-26' },
]

export default function Reports() {
  const [schools, setSchools]       = useState([])
  const [reportType, setReportType] = useState('donor')
  const [filters, setFilters]       = useState({ centre: 'all', program: 'all', dateRange: 'monthly', cohort: 'all' })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    getSchools().then(setSchools).catch(console.error)
  }, [])

  async function handleGenerate() {
    setLoading(true)
    try {
      const data = await getReportData(filters)
      setReportData(data)
      setPreviewing(true)
    } catch (err) {
      alert(`Failed to generate report: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleExportPDF() {
    if (!reportRef.current) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      let y = 0
      const pageH = pdf.internal.pageSize.getHeight()
      while (y < pdfH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -y, pdfW, pdfH)
        y += pageH
      }
      const filename = `Diksha_${REPORT_TYPES.find(r => r.id === reportType)?.label.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('PDF export error:', err)
      window.print()
    }
  }

  const centreOptions = [
    { _id: 'all', name: 'All Sites Combined' },
    ...schools,
  ]

  const filterLabel = (key, options, valKey = 'id', labelKey = 'label') =>
    options.find(o => o[valKey] === filters[key])?.[labelKey] || 'All'

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Build and export dynamic impact reports for donors, government, and internal audits</p>
        </div>
        {previewing && (
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setPreviewing(false)}>
              <Eye size={15} /> Hide Preview
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF}>
              <Download size={15} /> Export PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Report Builder Panel */}
        <div className="card">
          <h2 className="section-title">Report Builder</h2>

          {/* Report Type */}
          <div className="form-group mb-4">
            <label className="form-label">Report Type</label>
            <div className="flex flex-col gap-2 mt-2">
              {REPORT_TYPES.map(r => (
                <label key={r.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: `2px solid ${reportType === r.id ? 'var(--ink-indigo)' : 'var(--slate-200)'}`,
                  borderRadius: 'var(--radius-btn)',
                  cursor: 'pointer',
                  background: reportType === r.id ? 'var(--ink-indigo-10)' : 'var(--white)',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="reportType"
                    value={r.id}
                    checked={reportType === r.id}
                    onChange={() => setReportType(r.id)}
                    style={{ marginTop: 2, accentColor: 'var(--ink-indigo)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--slate-900)' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Centre / Site</label>
              <select className="form-control" value={filters.centre} onChange={e => setFilters(f => ({ ...f, centre: e.target.value }))}>
                {centreOptions.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program</label>
              <select className="form-control" value={filters.program} onChange={e => setFilters(f => ({ ...f, program: e.target.value }))}>
                {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <select className="form-control" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}>
                <option value="monthly">Last 1 Month</option>
                <option value="quarterly">Last Quarter</option>
                <option value="annual">Last 1 Year (Annual)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cohort / Batch</label>
              <select className="form-control" value={filters.cohort} onChange={e => setFilters(f => ({ ...f, cohort: e.target.value }))}>
                {COHORTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="divider" />

          <button
            className="btn btn-primary w-full"
            style={{ height: 44, fontSize: 15 }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating from Database…' : <><FileText size={16} /> Generate Report Preview</>}
          </button>
        </div>

        {/* Report Preview */}
        <div>
          {!previewing ? (
            <div className="card" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <FileText size={48} style={{ color: 'var(--slate-300)', margin: '0 auto var(--space-4)' }} />
                <div style={{ fontSize: 14, color: 'var(--slate-400)' }}>Configure and generate a dynamic report to see the preview here.</div>
              </div>
            </div>
          ) : loading ? (
            <Spinner />
          ) : reportData ? (
            <div id="diksha-report" ref={reportRef} style={{ background: 'var(--white)', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', padding: 'var(--space-8)' }}>
              {/* Report Header */}
              <div style={{ borderBottom: '3px solid var(--ink-indigo)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: 40, height: 40, background: 'var(--marigold)', borderRadius: 'var(--radius-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink-indigo)' }}>Diksha Foundation</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>Holistic Education Impact Report</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <ReportMeta label="Report Type" value={REPORT_TYPES.find(r => r.id === reportType)?.label} />
                  <ReportMeta label="Centre" value={filterLabel('centre', centreOptions, '_id', 'name')} />
                  <ReportMeta label="Period" value={filters.dateRange} />
                  <ReportMeta label="Program" value={filterLabel('program', PROGRAMS)} />
                  <ReportMeta label="Cohort" value={filterLabel('cohort', COHORTS)} />
                  <ReportMeta label="Generated" value={new Date(reportData.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </div>
              </div>

              {/* KPI Summary */}
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-indigo)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>Key Impact Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <KPIBox label="Total Students" value={reportData.metrics?.totalStudents || 0} color="var(--ink-indigo)" />
                <KPIBox label="Attendance Rate" value={`${reportData.metrics?.overallAttendance || 0}%`} color="var(--banyan-green)" />
                <KPIBox label="Avg Academic Score" value={`${reportData.metrics?.avgAcademicScore || 0}%`} color="var(--ink-indigo-60)" />
                <KPIBox label="SEL Index" value={`${reportData.metrics?.avgSELIndex || 0}%`} color="var(--banyan-green)" />
              </div>

              {/* Attendance Chart */}
              {reportData.attendance && reportData.attendance.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-indigo)', marginBottom: 'var(--space-3)', fontWeight: 700 }}>Attendance Trend</h3>
                  <DLineChart
                    data={reportData.attendance}
                    xKey="month"
                    lines={[
                      { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
                      { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
                      { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
                    ]}
                    height={200}
                  />
                </>
              )}

              {/* Academic */}
              {reportData.academic && reportData.academic[0]?.baselineVsEndline && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-indigo)', marginBottom: 'var(--space-3)', fontWeight: 700 }}>Academic Progress — Baseline vs Endline</h3>
                  <DBarChart
                    data={reportData.academic[0].baselineVsEndline}
                    xKey="school"
                    bars={[
                      { key: 'baseline', name: 'Baseline', color: '#9095ae' },
                      { key: 'endline',  name: 'Endline',  color: '#1E3A5F' },
                    ]}
                    height={200}
                  />
                </div>
              )}

              {/* SEL Radar */}
              {reportType !== 'govt' && reportData.sel && reportData.sel[0]?.competencies && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-indigo)', marginBottom: 'var(--space-3)', fontWeight: 700 }}>SEL Competency Profile</h3>
                  <DRadarChart
                    data={reportData.sel[0].competencies}
                    series={[
                      { key: 'KHEL 1', name: 'KHEL 1', color: '#1E3A5F' },
                      { key: 'KHEL 2', name: 'KHEL 2', color: '#F2A93B' },
                      { key: 'KHEL 3', name: 'KHEL 3', color: '#3F8F5F' },
                    ]}
                    height={260}
                  />
                </div>
              )}

              {/* School Summary Table */}
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink-indigo)', marginBottom: 'var(--space-3)', fontWeight: 700 }}>Centre-wise Summary</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--ink-indigo)', color: 'var(--white)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Centre / School</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Students</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Attendance %</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Academic</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>SEL</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.schools?.map((s, i) => (
                      <tr key={s._id} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                        <td style={{ padding: '7px 12px', fontWeight: 600 }}>{s.name}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{s.students}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: s.attendanceRate >= 80 ? 'var(--banyan-green)' : 'var(--kumkum-red)' }}>{s.attendanceRate}%</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{s.avgAcademicScore}%</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{s.selIndex}%</td>
                        <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                            background: s.status === 'Excellent' ? 'var(--banyan-green-10)' : s.status === 'Progressing' ? 'var(--marigold-10)' : 'var(--kumkum-red-10)',
                            color: s.status === 'Excellent' ? 'var(--banyan-green)' : s.status === 'Progressing' ? '#9a6200' : 'var(--kumkum-red)',
                          }}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--slate-400)', fontFamily: 'var(--font-mono)' }}>
                  Generated: {new Date(reportData.generatedAt).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-indigo)', fontWeight: 700 }}>
                  Diksha Foundation — Confidential Dynamic Report
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ReportMeta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-700)', marginTop: 2 }}>{value}</div>
    </div>
  )
}

function KPIBox({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-btn)', padding: 'var(--space-3)' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
