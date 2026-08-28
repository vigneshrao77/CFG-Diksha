import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import StatusBadge from '../../components/teacher/StatusBadge';
import LoadingState from '../../components/teacher/LoadingState';
import { getBehaviourList, saveBehaviourRecord } from '../../services/teacherService';
import { useNotification } from '../../contexts/NotificationContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 3 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Behaviour() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  
  // CASEL Dimensions
  const [editForm, setEditForm] = useState({ 
    selfAwareness: '', 
    selfManagement: '', 
    socialAwareness: '',
    relationshipSkills: '',
    responsibleDecisionMaking: '',
    observation: '' 
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    getBehaviourList({ class: classFilter }).then((data) => {
      setStudents(data);
      if (data.length > 0) {
        const exists = data.find((s) => s.studentId === selected?.studentId);
        setSelected(exists || data[0]);
      } else {
        setSelected(null);
      }
      setLoading(false);
    });
  }, [classFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const name = (s.studentName || s.name || '').toLowerCase();
      const id = (s.studentId || s.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [students, searchQuery]);

  const handleSelectStudent = (s) => {
    setSelected(s);
    setEditMode(false);
  };

  const handleEdit = () => {
    if (!selected) return;
    setEditForm({
      selfAwareness: selected.selfAwareness,
      selfManagement: selected.selfManagement,
      socialAwareness: selected.socialAwareness,
      relationshipSkills: selected.relationshipSkills,
      responsibleDecisionMaking: selected.responsibleDecisionMaking,
      observation: selected.recentObservation || '',
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveBehaviourRecord({
        studentId: selected.studentId,
        selfAwareness: Number(editForm.selfAwareness),
        selfManagement: Number(editForm.selfManagement),
        socialAwareness: Number(editForm.socialAwareness),
        relationshipSkills: Number(editForm.relationshipSkills),
        responsibleDecisionMaking: Number(editForm.responsibleDecisionMaking),
        observation: editForm.observation,
      });
      showToast('success', `Behaviour record updated for ${selected.studentName}`, 'Saved');
      const updated = await getBehaviourList({ class: classFilter });
      setStudents(updated);
      const updatedSelected = updated.find((s) => s.studentId === selected.studentId);
      if (updatedSelected) setSelected(updatedSelected);
      setEditMode(false);
    } catch (e) {
      showToast('error', e.message || 'Failed to save', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const PointsDisplay = ({ label, value, color }) => (
    <div style={{ padding: 'var(--sp-4)', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-600)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color }}>{value}/10</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(value / 10) * 100}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <TeacherLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Behaviour & AI Insights (CASEL SEL)</h1>
          <p className="page-subtitle">Evaluate social-emotional development across 5 CASEL competencies</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--sp-6)' }} className="behaviour-grid">
          {/* ── Left: Search & Filter ─────────────────────── */}
          <div>
            <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
              <div className="form-group" style={{ marginBottom: 'var(--sp-3)' }}>
                <label htmlFor="beh-search" className="form-label">🔍 Search Student</label>
                <input
                  id="beh-search"
                  type="search"
                  className="form-input"
                  placeholder="Search by name or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="beh-class" className="form-label">🏫 Filter by Class</label>
                <select
                  id="beh-class"
                  className="form-select"
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setLoading(true); }}
                >
                  <option value="all">All Classes</option>
                  <option value="Class A">Class A</option>
                  <option value="Class B">Class B</option>
                  <option value="Class C">Class C</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header" style={{ padding: '10px 16px' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-500)' }}>
                  Students ({filteredStudents.length})
                </span>
              </div>

              {loading ? (
                <div style={{ padding: 'var(--sp-4)' }}><LoadingState rows={6} /></div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--slate-400)' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No students found</div>
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {filteredStudents.map((s) => {
                    const isActive = selected?.studentId === s.studentId;
                    return (
                      <div
                        key={s.studentId}
                        onClick={() => handleSelectStudent(s)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-3)',
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--slate-100)',
                          background: isActive ? 'var(--ink-indigo-light)' : 'transparent',
                          borderLeft: `3px solid ${isActive ? 'var(--ink-indigo)' : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--slate-100)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <StudentAvatar name={s.studentName} initial={s.initial} avatarColor={s.avatarColor} size="sm" />
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontWeight: isActive ? 700 : 600, fontSize: 13, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.studentName}
                          </div>
                          <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>
                            <span>{s.class}</span>
                            <span>·</span>
                            <span title="Overall SEL Index">🌱 {s.overallSelIndex}/10</span>
                          </div>
                        </div>
                        <StatusBadge variant={s.trend} showDot={false} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Detail Panel ─────────────────────── */}
          <div>
            {selected ? (
              <>
                {/* Header */}
                <div className="card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                      <StudentAvatar name={selected.studentName} initial={selected.initial} avatarColor={selected.avatarColor} size="lg" />
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-indigo)' }}>
                          {selected.studentName}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 6 }}>
                          {selected.class} · ID: {selected.studentId}
                        </div>
                        <StatusBadge variant={selected.trend} label={`Trend: ${selected.trend}`} />
                      </div>
                    </div>
                    {!editMode ? (
                      <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
                        ✏️ Evaluate SEL
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                          Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving…' : 'Save Evaluation'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!editMode ? (
                  <>
                    {/* Points Grid (CASEL) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                      <PointsDisplay label="Self-Awareness" value={selected.selfAwareness} color="var(--ink-indigo)" />
                      <PointsDisplay label="Self-Management" value={selected.selfManagement} color="var(--coral-rose)" />
                      <PointsDisplay label="Social Awareness" value={selected.socialAwareness} color="var(--sunflower)" />
                      <PointsDisplay label="Relationship Skills" value={selected.relationshipSkills} color="var(--banyan-green)" />
                      <PointsDisplay label="Decision-Making" value={selected.responsibleDecisionMaking} color="var(--slate-600)" />
                      <PointsDisplay label="Overall SEL Index" value={selected.overallSelIndex} color="var(--ink-indigo)" />
                    </div>

                    {/* Observation */}
                    <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--slate-600)', marginBottom: 6 }}>Teacher Observation</div>
                      <p style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>
                        {selected.recentObservation || 'No recent observation recorded.'}
                      </p>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 8 }}>
                        Last updated: {selected.lastUpdated || 'Today'}
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div style={{
                      background: 'var(--ink-indigo-light)',
                      border: '1px solid rgba(30,58,95,0.12)',
                      borderLeft: '4px solid var(--ink-indigo)',
                      borderRadius: 10,
                      padding: 'var(--sp-4)',
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>💡</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-indigo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          AI Summary & Recommendation
                        </span>
                      </div>
                      <p style={{ fontSize: 13.5, color: 'var(--slate-700)', lineHeight: 1.75, margin: 0 }}>
                        {selected.aiInsight}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Edit Form */
                  <div className="card" style={{ padding: 'var(--sp-5)' }}>
                    <div className="section-heading">Evaluate CASEL Dimensions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                        <div className="form-group">
                          <label className="form-label">Self-Awareness (1–10)</label>
                          <input type="number" className="form-input" min={1} max={10} value={editForm.selfAwareness} onChange={(e) => setEditForm({ ...editForm, selfAwareness: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Self-Management (1–10)</label>
                          <input type="number" className="form-input" min={1} max={10} value={editForm.selfManagement} onChange={(e) => setEditForm({ ...editForm, selfManagement: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Social Awareness (1–10)</label>
                          <input type="number" className="form-input" min={1} max={10} value={editForm.socialAwareness} onChange={(e) => setEditForm({ ...editForm, socialAwareness: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Relationship Skills (1–10)</label>
                          <input type="number" className="form-input" min={1} max={10} value={editForm.relationshipSkills} onChange={(e) => setEditForm({ ...editForm, relationshipSkills: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Responsible Decision-Making (1–10)</label>
                          <input type="number" className="form-input" min={1} max={10} value={editForm.responsibleDecisionMaking} onChange={(e) => setEditForm({ ...editForm, responsibleDecisionMaking: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Observation Note</label>
                        <textarea
                          className="form-textarea"
                          rows={4}
                          value={editForm.observation}
                          onChange={(e) => setEditForm({ ...editForm, observation: e.target.value })}
                          placeholder="Describe recent behaviour observations..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
