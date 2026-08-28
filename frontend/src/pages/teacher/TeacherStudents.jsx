import { useState, useEffect } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import StatusBadge from '../../components/teacher/StatusBadge';
import TrendIndicator from '../../components/teacher/TrendIndicator';
import LoadingState from '../../components/teacher/LoadingState';
import EmptyState from '../../components/teacher/EmptyState';
import StudentProfileModal from '../../components/teacher/StudentProfileModal';
import { getStudents } from '../../services/teacherService';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ search: '', class: 'all', performance: '', attendance: '', status: '' });

  const fetchStudents = async (f) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents(f);
      setStudents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(filters); }, []);

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    fetchStudents(updated);
  };

  return (
    <TeacherLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage and monitor all students across your classes</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label htmlFor="search-students" className="form-label">Search</label>
            <input
              id="search-students"
              type="search"
              className="form-input"
              placeholder="Search by name…"
              value={filters.search}
              onChange={(e) => handleFilter('search', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filter-class" className="form-label">Class</label>
            <select id="filter-class" className="form-select" value={filters.class} onChange={(e) => handleFilter('class', e.target.value)}>
              <option value="all">All Classes</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-perf" className="form-label">Performance</label>
            <select id="filter-perf" className="form-select" value={filters.performance} onChange={(e) => handleFilter('performance', e.target.value)}>
              <option value="">All</option>
              <option value="high">High (≥80%)</option>
              <option value="medium">Medium (60–80%)</option>
              <option value="low">Low (&lt;60%)</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-att" className="form-label">Attendance</label>
            <select id="filter-att" className="form-select" value={filters.attendance} onChange={(e) => handleFilter('attendance', e.target.value)}>
              <option value="">All</option>
              <option value="high">Good (≥85%)</option>
              <option value="low">Low (&lt;75%)</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="form-label">Status</label>
            <select id="filter-status" className="form-select" value={filters.status} onChange={(e) => handleFilter('status', e.target.value)}>
              <option value="">All</option>
              <option value="attention">Needs Attention</option>
            </select>
          </div>
        </div>

        {/* Summary line */}
        {!loading && (
          <div style={{ marginBottom: 'var(--sp-4)', fontSize: 13, color: 'var(--slate-500)' }}>
            Showing <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Content */}
        {loading && <div className="card"><LoadingState rows={8} /></div>}
        {error && (
          <div className="card" style={{ padding: 'var(--sp-4)', color: 'var(--kumkum-red)' }}>⚠️ {error}</div>
        )}
        {!loading && !error && students.length === 0 && (
          <EmptyState icon="🔍" title="No students found" message="Try adjusting your search or filters." />
        )}

        {!loading && !error && students.length > 0 && (
          <div className="card table-responsive-cards" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  <th>Performance</th>
                  <th>Behaviour</th>
                  <th>Health (BMI)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} onClick={() => setSelectedId(s.id)}>
                    <td data-label="Student">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StudentAvatar name={s.name} initial={s.initial} avatarColor={s.avatarColor} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{s.group}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Class">{s.class}</td>
                    <td data-label="Attendance">
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13 }}>{s.attendance.percentage}%</div>
                        <StatusBadge variant={s.attendance.todayStatus === 'present' ? 'present' : 'absent'} label={s.attendance.todayStatus === 'present' ? 'Present today' : 'Absent today'} />
                      </div>
                    </td>
                    <td data-label="Performance">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{s.performance.current}%</span>
                        <TrendIndicator change={s.performance.change} />
                      </div>
                    </td>
                    <td data-label="Behaviour">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }} title="Overall SEL Index">
                        🌱 {s.behaviour.overallSelIndex || 8}/10
                      </span>
                    </td>
                    <td data-label="Health (BMI)">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.health.bmi ?? '—'}</span>
                      {s.health.bmiStatus && s.health.bmiStatus !== 'N/A' && (
                        <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{s.health.bmiStatus}</div>
                      )}
                    </td>
                    <td data-label="Status">
                      {s.needsAttention
                        ? <StatusBadge variant="attention" />
                        : <StatusBadge variant="active" />
                      }
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedId(s.id)}
                        aria-label={`View profile for ${s.name}`}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      {selectedId && (
        <StudentProfileModal studentId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </TeacherLayout>
  );
}
