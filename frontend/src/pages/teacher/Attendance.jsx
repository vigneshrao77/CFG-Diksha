import { useState, useEffect } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import LoadingState from '../../components/teacher/LoadingState';
import EmptyState from '../../components/teacher/EmptyState';
import ConfirmDialog from '../../components/teacher/ConfirmDialog';
import { getAttendance, saveAttendance } from '../../services/teacherService';
import { useNotification } from '../../contexts/NotificationContext';

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useNotification();

  const fetchAttendance = async (date, cls) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendance(date, cls);
      setRecords(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(selectedDate, selectedClass); }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    fetchAttendance(e.target.value, selectedClass);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    fetchAttendance(selectedDate, e.target.value);
  };

  const toggleStatus = (studentId) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: r.status === 'present' ? 'absent' : 'present' }
          : r
      )
    );
  };

  const markAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAttendance({ date: selectedDate, classId: selectedClass, records: records.map(({ studentId, status }) => ({ studentId, status })) });
      showToast('success', `Attendance saved for ${selectedDate}`, 'Attendance Saved');
    } catch (e) {
      showToast('error', e.message || 'Failed to save attendance', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const percentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <TeacherLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">Attendance</h1>
            <p className="page-subtitle">Mark and review student attendance</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button className="btn btn-secondary" onClick={() => markAll('present')} disabled={loading}>
              ✓ Mark All Present
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
              {saving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label htmlFor="att-date" className="form-label">Date</label>
              <input
                id="att-date"
                type="date"
                className="form-input"
                value={selectedDate}
                max={today}
                onChange={handleDateChange}
                style={{ width: 180 }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="att-class" className="form-label">Class</label>
              <select id="att-class" className="form-select" value={selectedClass} onChange={handleClassChange} style={{ width: 180 }}>
                <option value="all">All Classes</option>
                <option value="Class A">Class A</option>
                <option value="Class B">Class B</option>
                <option value="Class C">Class C</option>
              </select>
            </div>

            {/* Summary pills */}
            {!loading && records.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--banyan-green-light)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--banyan-green)' }}>{presentCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--banyan-green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Present</div>
                </div>
                <div style={{ background: 'var(--kumkum-red-light)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--kumkum-red)' }}>{absentCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--kumkum-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Absent</div>
                </div>
                <div style={{ background: 'var(--ink-indigo-light)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--ink-indigo)' }}>{percentage}%</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-indigo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance List */}
        {loading && <LoadingState rows={8} />}
        {error && <div style={{ color: 'var(--kumkum-red)', padding: 'var(--sp-4)' }}>⚠️ {error}</div>}
        {!loading && records.length === 0 && (
          <EmptyState icon="📋" title="No students found" message="Select a different date or class." />
        )}

        {!loading && records.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {records.map((record, i) => (
              <div
                key={record.studentId}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
                  padding: 'var(--sp-4) var(--sp-4)',
                  borderBottom: i < records.length - 1 ? '1px solid var(--slate-100)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--slate-100)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar + Name */}
                <StudentAvatar name={record.studentName} initial={record.initial} avatarColor={record.avatarColor} size="md" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{record.studentName}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>
                    {record.class} · Overall: {record.attendancePercentage}%
                  </div>
                </div>

                {/* Attendance toggle */}
                <div className="attendance-toggle" role="group" aria-label={`Attendance for ${record.studentName}`}>
                  <button
                    className={`att-present ${record.status === 'present' ? 'active' : ''}`}
                    onClick={() => record.status !== 'present' && toggleStatus(record.studentId)}
                    aria-pressed={record.status === 'present'}
                    aria-label="Mark present"
                  >
                    ✓ Present
                  </button>
                  <button
                    className={`att-absent ${record.status === 'absent' ? 'active' : ''}`}
                    onClick={() => record.status !== 'absent' && toggleStatus(record.studentId)}
                    aria-pressed={record.status === 'absent'}
                    aria-label="Mark absent"
                  >
                    ✕ Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Save on Mobile */}
        {!loading && records.length > 0 && (
          <div style={{
            position: 'fixed', bottom: 'calc(var(--bottom-nav-height) + 16px)', right: 16,
            display: 'none', zIndex: 90,
          }} className="fab-save">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: 'var(--radius-pill)', padding: '12px 24px', boxShadow: '0 4px 20px rgba(30,58,95,0.4)' }}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </div>
        )}
      </div>
      <style>{`@media (max-width: 640px) { .fab-save { display: block !important; } }`}</style>
    </TeacherLayout>
  );
}
