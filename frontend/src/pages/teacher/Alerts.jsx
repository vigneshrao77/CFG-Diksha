import { useState, useEffect } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import StatusBadge from '../../components/teacher/StatusBadge';
import TrendIndicator from '../../components/teacher/TrendIndicator';
import LoadingState from '../../components/teacher/LoadingState';
import EmptyState from '../../components/teacher/EmptyState';
import { getStudents, getTeacherAlerts, sendStudentAlert, getStudentById } from '../../services/teacherService';
import { useNotification } from '../../contexts/NotificationContext';

const ALERT_TYPES = [
  { value: 'performance', label: '📊 Performance', severity: 'warning' },
  { value: 'attendance', label: '✓ Attendance', severity: 'warning' },
  { value: 'assignment', label: '📝 Assignment', severity: 'info' },
  { value: 'behaviour', label: '⭐ Behaviour', severity: 'info' },
  { value: 'general', label: '💬 General', severity: 'info' },
];

const TEMPLATE_MESSAGES = {
  performance: "Your recent assessment performance has decreased. Please review your recent work and speak with your teacher at your earliest convenience.",
  attendance: "Your attendance has fallen this month. Regular attendance is important for your learning. Please try to attend sessions consistently.",
  assignment: "One or more of your recent assignments is incomplete or has not been submitted. Please complete and submit the work as soon as possible.",
  behaviour: "We have noticed some changes in your classroom behaviour recently. Let's work together to support a positive learning environment.",
  general: "Your teacher would like to connect with you regarding your progress. Please speak with your teacher at the next available opportunity.",
};

export default function Alerts() {
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alertType, setAlertType] = useState('performance');
  const [title, setTitle] = useState('Performance Check-In');
  const [message, setMessage] = useState(TEMPLATE_MESSAGES.performance);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    Promise.all([getStudents(), getTeacherAlerts()]).then(([s, a]) => {
      setStudents(s);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  const handleSelectStudent = async (id) => {
    setSelectedStudentId(id);
    if (!id) { setSelectedStudent(null); return; }
    const data = await getStudentById(id);
    setSelectedStudent(data);
  };

  const handleTypeChange = (type) => {
    setAlertType(type);
    setMessage(TEMPLATE_MESSAGES[type] || '');
    const typeObj = ALERT_TYPES.find((t) => t.value === type);
    setTitle(typeObj ? typeObj.label.replace(/^[^ ]+ /, '') : '');
  };

  const handleSend = async () => {
    if (!selectedStudentId) { showToast('warning', 'Please select a student first.'); return; }
    if (!message.trim()) { showToast('warning', 'Please enter a message.'); return; }
    setSending(true);
    try {
      const typeObj = ALERT_TYPES.find((t) => t.value === alertType);
      await sendStudentAlert({
        studentId: selectedStudentId,
        type: alertType,
        title,
        message: message.trim(),
        severity: typeObj?.severity || 'info',
      });
      showToast('success', `Alert sent to ${selectedStudent?.name}`, 'Alert Sent');
      setPreview(false);
      // Refresh alerts
      const updated = await getTeacherAlerts();
      setAlerts(updated);
    } catch (e) {
      showToast('error', e.message || 'Failed to send alert', 'Error');
    } finally {
      setSending(false);
    }
  };

  const TYPE_COLORS = {
    performance: 'var(--kumkum-red)',
    attendance: 'var(--marigold)',
    assignment: 'var(--ink-indigo)',
    behaviour: '#6B48A2',
    general: 'var(--slate-500)',
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TeacherLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Student Alerts</h1>
          <p className="page-subtitle">Send supportive notifications to students — these appear on their dashboard</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--sp-6)' }} className="alerts-grid">
          {/* ── Compose ─────────────────────── */}
          <div>
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div className="section-heading">Compose Alert</div>

              {loading ? <LoadingState rows={4} type="cards" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  {/* 1. Select Student */}
                  <div>
                    <label htmlFor="alert-student" className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                      1. Select Student
                    </label>
                    <select id="alert-student" className="form-select" value={selectedStudentId}
                      onChange={(e) => handleSelectStudent(e.target.value)}>
                      <option value="">— Choose a student —</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {s.class}</option>
                      ))}
                    </select>

                    {/* Student Performance Summary */}
                    {selectedStudent && (
                      <div style={{ marginTop: 'var(--sp-3)', background: 'var(--ink-indigo-light)', borderRadius: 10, padding: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                        <StudentAvatar name={selectedStudent.name} initial={selectedStudent.initial} avatarColor={selectedStudent.avatarColor} size="md" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedStudent.name}</div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--slate-500)', marginTop: 4, flexWrap: 'wrap' }}>
                            <span>Attendance: <strong>{selectedStudent.attendance?.percentage}%</strong></span>
                            <span>Performance: <strong>{selectedStudent.performance?.current}%</strong></span>
                            <span>Behaviour: <strong>{selectedStudent.behaviour?.behaviourPoints}/10</strong></span>
                          </div>
                          {selectedStudent.needsAttention && (
                            <div style={{ marginTop: 6 }}>
                              <StatusBadge variant="attention" label="Needs Attention" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Alert Type */}
                  <div>
                    <div className="form-label" style={{ marginBottom: 8 }}>2. Alert Type</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ALERT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeChange(type.value)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-btn)',
                            border: `1px solid ${alertType === type.value ? TYPE_COLORS[type.value] : 'var(--slate-200)'}`,
                            background: alertType === type.value ? `${TYPE_COLORS[type.value]}15` : 'var(--white)',
                            color: alertType === type.value ? TYPE_COLORS[type.value] : 'var(--slate-600)',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: alertType === type.value ? 700 : 500,
                            transition: 'all 0.15s',
                            fontFamily: 'var(--font-ui)',
                          }}
                          aria-pressed={alertType === type.value}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Title */}
                  <div className="form-group">
                    <label htmlFor="alert-title" className="form-label">3. Alert Title</label>
                    <input id="alert-title" type="text" className="form-input" value={title}
                      onChange={(e) => setTitle(e.target.value)} placeholder="Enter alert title…" maxLength={80} />
                  </div>

                  {/* 4. Message */}
                  <div className="form-group">
                    <label htmlFor="alert-message" className="form-label">4. Message</label>
                    <textarea
                      id="alert-message"
                      className="form-textarea"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter a supportive, constructive message for the student…"
                      style={{ resize: 'vertical' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>
                      Use encouraging and supportive language. Avoid punitive or alarming messages.
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setPreview(!preview)}
                      disabled={!selectedStudentId || !message.trim()}
                    >
                      {preview ? 'Edit' : '👁 Preview'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSend}
                      disabled={sending || !selectedStudentId || !message.trim()}
                    >
                      {sending ? 'Sending…' : '🔔 Send Alert'}
                    </button>
                  </div>

                  {/* Preview */}
                  {preview && selectedStudent && (
                    <div style={{
                      border: `2px dashed ${TYPE_COLORS[alertType] || 'var(--slate-300)'}`,
                      borderRadius: 12, padding: 'var(--sp-5)',
                      background: `${TYPE_COLORS[alertType] || 'var(--slate-300)'}08`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 8 }}>
                        Preview — will appear on student dashboard
                      </div>
                      <div style={{ borderLeft: `4px solid ${TYPE_COLORS[alertType]}`, paddingLeft: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate-800)', marginBottom: 6 }}>
                          {title}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--slate-600)', lineHeight: 1.7, margin: 0 }}>{message}</p>
                        <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 10 }}>
                          From your teacher · {new Date().toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sent Alerts ─────────────────────── */}
          <div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: 14 }}>Sent Alerts</div>
                <span style={{ fontSize: 12, background: 'var(--ink-indigo-light)', color: 'var(--ink-indigo)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                  {alerts.length}
                </span>
              </div>
              {alerts.length === 0 ? (
                <EmptyState icon="🔕" title="No alerts sent yet" message="Send your first alert using the form." />
              ) : (
                alerts.map((a) => (
                  <div key={a.id} style={{
                    padding: 'var(--sp-4)',
                    borderBottom: '1px solid var(--slate-100)',
                    borderLeft: `3px solid ${TYPE_COLORS[a.type] || 'var(--slate-300)'}`,
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--slate-800)' }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2, marginBottom: 4 }}>
                          → {a.studentName}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: 0, lineHeight: 1.5 }}>
                          {a.message.length > 80 ? a.message.slice(0, 80) + '…' : a.message}
                        </p>
                        <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 6 }}>
                          {formatTime(a.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <StatusBadge variant={a.read ? 'stable' : 'attention'} label={a.read ? 'Read' : 'Unread'} showDot={false} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .alerts-grid { grid-template-columns: 1fr !important; } }`}</style>
    </TeacherLayout>
  );
}
