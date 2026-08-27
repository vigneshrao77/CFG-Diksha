import { useState, useEffect } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import ScoreInput from '../../components/teacher/ScoreInput';
import StatusBadge from '../../components/teacher/StatusBadge';
import TrendIndicator from '../../components/teacher/TrendIndicator';
import LoadingState from '../../components/teacher/LoadingState';
import EmptyState from '../../components/teacher/EmptyState';
import { getAssessments, saveAssessment } from '../../services/teacherService';
import { useNotification } from '../../contexts/NotificationContext';

const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
const FIELDS = [
  { key: 'assignment', label: 'Assignment', max: 20 },
  { key: 'test', label: 'Test', max: 5 },
  { key: 'discipline', label: 'Discipline', max: 5 },
  { key: 'notes', label: 'Notes', max: 5 },
  { key: 'ela', label: 'ELA', max: 5 },
];
const MAX_TOTAL = 40;

function calcTotal(scores) {
  return FIELDS.reduce((sum, f) => sum + (Number(scores[f.key]) || 0), 0);
}

export default function Assessments() {
  const [rows, setRows] = useState([]);
  const [editedScores, setEditedScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ class: 'all', search: '', period: 'Period 4' });
  const { showToast } = useNotification();

  const fetchData = async (f) => {
    setLoading(true);
    try {
      const data = await getAssessments(f);
      setRows(data);
      // Pre-fill editable scores from current
      const init = {};
      data.forEach((r) => {
        init[r.studentId] = { ...r.current };
      });
      setEditedScores(init);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(filters); }, []);

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    fetchData(updated);
  };

  const handleScore = (studentId, field, value) => {
    setEditedScores((prev) => {
      const updated = { ...prev[studentId], [field]: value };
      return { ...prev, [studentId]: updated };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let savedCount = 0;
    try {
      for (const row of rows) {
        const scores = editedScores[row.studentId];
        if (!scores) continue;
        await saveAssessment({ studentId: row.studentId, period: filters.period, scores });
        savedCount++;
      }
      showToast('success', `Assessments saved for ${savedCount} students (${filters.period})`, 'Assessments Saved');
      fetchData(filters);
    } catch (e) {
      showToast('error', e.message || 'Failed to save assessments', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const getPerformanceVariant = (pct) => pct >= 75 ? 'high' : pct >= 50 ? 'medium' : 'low';

  return (
    <TeacherLayout>
      <div className="page-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">Assessments</h1>
            <p className="page-subtitle">Enter and manage student marks (Total: 40)</p>
          </div>
          <button className="btn btn-primary" onClick={handleSaveAll} disabled={saving || loading}>
            {saving ? 'Saving…' : '💾 Save All Marks'}
          </button>
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 180 }}>
              <label htmlFor="asmnt-search" className="form-label">Search Student</label>
              <input id="asmnt-search" type="search" className="form-input" placeholder="Student name…"
                value={filters.search} onChange={(e) => handleFilter('search', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="asmnt-class" className="form-label">Class</label>
              <select id="asmnt-class" className="form-select" value={filters.class} onChange={(e) => handleFilter('class', e.target.value)}>
                <option value="all">All Classes</option>
                <option value="Class A">Class A</option>
                <option value="Class B">Class B</option>
                <option value="Class C">Class C</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="asmnt-period" className="form-label">Assessment Period</label>
              <select id="asmnt-period" className="form-select" value={filters.period} onChange={(e) => handleFilter('period', e.target.value)}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ background: 'var(--ink-indigo-light)', borderRadius: 8, padding: '10px 16px', marginBottom: 'var(--sp-4)', fontSize: 12, color: 'var(--ink-indigo)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span><strong>Assignment</strong> /20</span>
          <span><strong>Test</strong> /5</span>
          <span><strong>Discipline</strong> /5</span>
          <span><strong>Notes</strong> /5</span>
          <span><strong>ELA</strong> /5</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700 }}>Total /40</span>
        </div>

        {loading && <LoadingState rows={8} />}
        {!loading && rows.length === 0 && <EmptyState icon="📝" title="No students found" message="Try adjusting your filters." />}

        {!loading && rows.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <div className="card" style={{ overflow: 'hidden', minWidth: 800 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    {FIELDS.map((f) => <th key={f.key}>{f.label} /{f.max}</th>)}
                    <th>Total /40</th>
                    <th>%</th>
                    <th>vs Prev</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const scores = editedScores[row.studentId] || {};
                    const total = calcTotal(scores);
                    const pct = Math.round((total / MAX_TOTAL) * 100);
                    return (
                      <tr key={row.studentId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <StudentAvatar name={row.studentName} initial={row.initial} avatarColor={row.avatarColor} size="sm" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{row.studentName}</div>
                              <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{row.class}</div>
                            </div>
                          </div>
                        </td>
                        {FIELDS.map((f) => (
                          <td key={f.key} style={{ padding: '10px 8px' }}>
                            <ScoreInput
                              id={`${row.studentId}-${f.key}`}
                              label={f.label}
                              value={scores[f.key] ?? ''}
                              onChange={(val) => handleScore(row.studentId, f.key, val)}
                              max={f.max}
                            />
                          </td>
                        ))}
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16,
                            color: total >= 32 ? 'var(--banyan-green)' : total >= 20 ? 'var(--ink-indigo)' : 'var(--kumkum-red)',
                          }}>
                            {total}
                          </span>
                          <span style={{ color: 'var(--slate-400)', fontSize: 12 }}>/40</span>
                        </td>
                        <td>
                          <StatusBadge variant={getPerformanceVariant(pct)} label={`${pct}%`} showDot={false} />
                        </td>
                        <td>
                          {row.previous ? (
                            <div>
                              <TrendIndicator change={row.change} />
                              <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>was {row.previous.percentage}%</div>
                            </div>
                          ) : <span style={{ color: 'var(--slate-300)', fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
