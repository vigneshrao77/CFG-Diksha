import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import LoadingState from '../../components/teacher/LoadingState';
import StatusBadge from '../../components/teacher/StatusBadge';
import EmptyState from '../../components/teacher/EmptyState';
import { getStudents, getHealthRecord, saveHealthRecord } from '../../services/teacherService';
import { useNotification } from '../../contexts/NotificationContext';

const BMI_RANGES = [
  { label: 'Below reference range', max: 18.5, color: 'var(--marigold)' },
  { label: 'Reference range', max: 25, color: 'var(--banyan-green)' },
  { label: 'Above reference range', max: Infinity, color: 'var(--kumkum-red)' },
];

function getBMIStatus(bmi) {
  if (bmi < 18.5) return 'Below reference range';
  if (bmi < 25) return 'Reference range';
  return 'Above reference range';
}

function getBMIColor(status) {
  if (status === 'Reference range') return 'var(--banyan-green)';
  if (status === 'Below reference range') return 'var(--marigold)';
  return 'var(--kumkum-red)';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
        BMI: {payload[0].value}
      </div>
    </div>
  );
};

export default function HealthCheckup() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ height: '', weight: '' });
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useNotification();

  // Derived BMI
  const { height, weight } = form;
  const bmi = height && weight && Number(height) > 0
    ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)
    : null;
  const bmiStatus = bmi ? getBMIStatus(Number(bmi)) : null;

  useEffect(() => {
    getStudents().then((list) => {
      setStudents(list);
      setLoadingStudents(false);
      // Auto-select first student if available
      if (list.length > 0 && !selectedId) {
        handleSelectStudent(list[0].id || list[0].studentId);
      }
    });
  }, []);

  // Filtered students list based on search and class
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const nameMatch = (s.name || s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (s.studentId || s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const classMatch = classFilter === 'all' || s.class === classFilter;
      return nameMatch && classMatch;
    });
  }, [students, searchQuery, classFilter]);

  const handleSelectStudent = async (id) => {
    if (!id) {
      setSelectedId(null);
      setHealthData(null);
      return;
    }
    setSelectedId(id);
    setForm({ height: '', weight: '' });
    setFormErrors({});
    setLoadingRecord(true);
    try {
      const data = await getHealthRecord(id);
      setHealthData(data);
    } finally {
      setLoadingRecord(false);
    }
  };

  const selectedStudentObj = students.find((s) => (s.id || s.studentId) === selectedId);

  const validate = () => {
    const errors = {};
    const h = Number(height);
    const w = Number(weight);
    if (!height) errors.height = 'Height is required';
    else if (h < 50 || h > 250) errors.height = 'Enter a valid height (50–250 cm)';
    if (!weight) errors.weight = 'Weight is required';
    else if (w < 10 || w > 200) errors.weight = 'Enter a valid weight (10–200 kg)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!selectedId) { showToast('warning', 'Please select a student first.'); return; }
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await saveHealthRecord({ studentId: selectedId, height: Number(height), weight: Number(weight) });
      if (result.success) {
        showToast('success', `Health record saved for ${healthData?.studentName || selectedStudentObj?.name}`, 'Health Checkup Saved');
        // Refresh records
        const updated = await getHealthRecord(selectedId);
        setHealthData(updated);
        setForm({ height: '', weight: '' });
      }
    } catch (e) {
      showToast('error', e.message || 'Failed to save record', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const latest = healthData?.records?.[healthData.records.length - 1];

  return (
    <TeacherLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Health Checkup</h1>
          <p className="page-subtitle">Record and track student health measurements with live search and class filtering</p>
        </div>

        {/* ── Search & Filter Control Bar ─────────────────────── */}
        <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 220 }}>
              <label htmlFor="health-search" className="form-label">
                🔍 Search Student
              </label>
              <input
                id="health-search"
                type="search"
                className="form-input"
                placeholder="Search by student name or ID (e.g. Arjun, S001)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ minWidth: 160 }}>
              <label htmlFor="health-class" className="form-label">
                🏫 Filter by Class
              </label>
              <select
                id="health-class"
                className="form-select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                <option value="Class A">Class A</option>
                <option value="Class B">Class B</option>
                <option value="Class C">Class C</option>
              </select>
            </div>

            {selectedStudentObj && (
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--ink-indigo-light)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
              }}>
                <StudentAvatar
                  name={selectedStudentObj.name}
                  initial={selectedStudentObj.initial}
                  avatarColor={selectedStudentObj.avatarColor}
                  size="sm"
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-indigo)' }}>
                  {selectedStudentObj.name} ({selectedStudentObj.class})
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--sp-6)' }} className="health-grid">
          {/* ── Left: Student Selector List ─────────────────────── */}
          <div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)' }}>
                  Students ({filteredStudents.length})
                </span>
              </div>

              {loadingStudents ? (
                <div style={{ padding: 'var(--sp-4)' }}><LoadingState rows={5} /></div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--slate-400)' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No students found</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Try clearing search or class filter</div>
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {filteredStudents.map((s) => {
                    const sid = s.id || s.studentId;
                    const isSelected = selectedId === sid;
                    return (
                      <div
                        key={sid}
                        onClick={() => handleSelectStudent(sid)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--slate-100)',
                          background: isSelected ? 'var(--ink-indigo-light)' : 'transparent',
                          borderLeft: `3px solid ${isSelected ? 'var(--ink-indigo)' : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--slate-100)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <StudentAvatar
                          name={s.name || s.studentName}
                          initial={s.initial}
                          avatarColor={s.avatarColor}
                          size="sm"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: 13, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.name || s.studentName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>
                            {s.class} · {sid}
                          </div>
                        </div>
                        {s.health?.bmi && (
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--slate-500)', background: 'var(--slate-100)', padding: '2px 6px', borderRadius: 4 }}>
                            BMI {s.health.bmi}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Form & History ─────────────────────── */}
          <div>
            {selectedStudentObj ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }} className="health-detail-grid">
                {/* Measurement Input Form */}
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <div className="section-heading">New Measurement for {selectedStudentObj.name}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                      <div className="form-group">
                        <label htmlFor="height-input" className="form-label">Height (cm)</label>
                        <input
                          id="height-input"
                          type="number"
                          className={`form-input${formErrors.height ? ' error' : ''}`}
                          placeholder="e.g. 165"
                          value={form.height}
                          onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                          min={50} max={250}
                          aria-describedby={formErrors.height ? 'height-err' : undefined}
                        />
                        {formErrors.height && <span id="height-err" className="form-error">{formErrors.height}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="weight-input" className="form-label">Weight (kg)</label>
                        <input
                          id="weight-input"
                          type="number"
                          className={`form-input${formErrors.weight ? ' error' : ''}`}
                          placeholder="e.g. 55"
                          value={form.weight}
                          onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                          min={10} max={200}
                          aria-describedby={formErrors.weight ? 'weight-err' : undefined}
                        />
                        {formErrors.weight && <span id="weight-err" className="form-error">{formErrors.weight}</span>}
                      </div>
                    </div>

                    {/* Auto-calculated BMI preview */}
                    <div style={{
                      background: bmi ? `${getBMIColor(bmiStatus)}12` : 'var(--slate-100)',
                      border: `1px solid ${bmi ? `${getBMIColor(bmiStatus)}40` : 'var(--slate-200)'}`,
                      borderRadius: 10, padding: 'var(--sp-4)',
                      transition: 'all 0.3s',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 4 }}>
                        Calculated BMI
                      </div>
                      {bmi ? (
                        <div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700, color: getBMIColor(bmiStatus), lineHeight: 1 }}>
                            {bmi}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <StatusBadge
                              variant={bmiStatus === 'Reference range' ? 'stable' : 'attention'}
                              label={bmiStatus}
                            />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 8 }}>
                            BMI = weight(kg) ÷ height(m)²
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--slate-400)', fontSize: 13 }}>Enter height and weight to calculate BMI</div>
                      )}
                    </div>

                    {/* Reference scale */}
                    <div style={{ background: 'var(--warm-neutral)', padding: 'var(--sp-3)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 6, fontWeight: 700 }}>BMI Reference Scales</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {BMI_RANGES.map((r) => (
                          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--slate-600)' }}>{r.label}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate-400)', marginLeft: 'auto' }}>
                              {r.max === Infinity ? '≥ 25.0' : r === BMI_RANGES[0] ? '< 18.5' : '18.5 – 24.9'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving || !selectedId || !height || !weight}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {saving ? 'Saving…' : '💾 Save Measurement'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setForm({ height: '', weight: '' })}>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* History & Trend */}
                <div>
                  {loadingRecord ? (
                    <LoadingState rows={4} />
                  ) : healthData ? (
                    <>
                      {latest && (
                        <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                          <div className="section-heading">Latest Logged Record ({latest.date})</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)' }}>
                            {[
                              { label: 'Height', value: `${latest.height} cm` },
                              { label: 'Weight', value: `${latest.weight} kg` },
                              { label: 'BMI', value: latest.bmi },
                            ].map((s) => (
                              <div key={s.label} style={{ textAlign: 'center', padding: 'var(--sp-3)', background: 'var(--warm-neutral)', borderRadius: 8 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--ink-indigo)' }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{s.label}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 'var(--sp-2)' }}>
                            <StatusBadge
                              variant={latest.bmiStatus === 'Reference range' ? 'stable' : 'attention'}
                              label={latest.bmiStatus}
                            />
                          </div>
                        </div>
                      )}

                      {healthData.records?.length > 1 && (
                        <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 'var(--sp-2)' }}>BMI Progress Trend</div>
                          <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={healthData.records}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Line type="monotone" dataKey="bmi" name="BMI" stroke="var(--banyan-green)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--banyan-green)' }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* History Table */}
                      <div className="card" style={{ overflow: 'hidden' }}>
                        <div className="card-header">
                          <div style={{ fontWeight: 700, fontSize: 13 }}>Measurement History</div>
                        </div>
                        <table className="data-table">
                          <thead>
                            <tr><th>Date</th><th>Height</th><th>Weight</th><th>BMI</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {[...healthData.records].reverse().map((r) => (
                              <tr key={r.date}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.date}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.height} cm</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.weight} kg</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>{r.bmi}</td>
                                <td>
                                  <StatusBadge
                                    variant={r.bmiStatus === 'Reference range' ? 'stable' : 'attention'}
                                    label={r.bmiStatus}
                                    showDot={false}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--slate-400)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>♥</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Select a student from the list</div>
                <div style={{ fontSize: 13 }}>Use the search box or class filter on the left to select a student.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .health-grid { grid-template-columns: 1fr !important; }
          .health-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </TeacherLayout>
  );
}
