import { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import StudentAvatar from './StudentAvatar';
import StatusBadge from './StatusBadge';
import TrendIndicator from './TrendIndicator';
import { getStudentById, getPerformanceTrend } from '../../services/teacherService';

const TABS = ['Overview', 'Performance', 'Attendance', 'Health', 'Behaviour'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function StudentProfileModal({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [perfPeriod, setPerfPeriod] = useState('weekly');

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentById(studentId).then((data) => {
      setStudent(data);
      setLoading(false);
    });
  }, [studentId]);

  if (!studentId) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Student profile">
      <div className="modal-card" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{
          padding: 'var(--sp-6)',
          background: 'linear-gradient(135deg, var(--ink-indigo) 0%, var(--ink-indigo-mid) 100%)',
          color: '#fff',
        }}>
          {loading ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
              <div>
                <div className="skeleton" style={{ width: 200, height: 22, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 14 }} />
              </div>
            </div>
          ) : student && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                <StudentAvatar name={student.name} initial={student.initial} avatarColor={student.avatarColor} size="xl" />
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {student.name}
                  </h2>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 }}>
                    {student.class} · {student.group} Group
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    <StatusBadge variant={student.performance?.trend || 'stable'} />
                    {student.needsAttention && <StatusBadge variant="attention" />}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close student profile"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: 18, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Quick stats */}
          {student && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginTop: 'var(--sp-5)' }}>
              {[
                { label: 'Attendance', value: `${student.attendance?.percentage}%` },
                { label: 'Performance', value: `${student.performance?.current}%` },
                { label: 'Communication', value: `${student.behaviour?.communication}/10` },
                { label: 'Behaviour', value: `${student.behaviour?.behaviourPoints}/10` },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 'var(--sp-3)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ padding: '0 var(--sp-6)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 'var(--sp-6)', overflowY: 'auto', maxHeight: '55vh' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--slate-400)' }}>Loading student data…</div>
          ) : !student ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--slate-400)' }}>Student not found.</div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
                    <div>
                      <div className="section-heading">Contact Info</div>
                      {[
                        { label: 'Email', value: student.email },
                        { label: 'Phone', value: student.phone },
                        { label: 'Parent', value: student.parentName },
                        { label: 'Parent Phone', value: student.parentPhone },
                        { label: 'Address', value: student.address },
                        { label: 'Joined', value: student.joinDate },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14 }}>
                          <span style={{ color: 'var(--slate-400)', minWidth: 90, fontWeight: 600, fontSize: 12 }}>{row.label}</span>
                          <span style={{ color: 'var(--slate-700)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="section-heading">Latest Assessment</div>
                      {student.assessments?.current && (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                            {[
                              { label: 'Assignment', value: student.assessments.current.assignment, max: 20 },
                              { label: 'Test', value: student.assessments.current.test, max: 5 },
                              { label: 'Discipline', value: student.assessments.current.discipline, max: 5 },
                              { label: 'Notes', value: student.assessments.current.notes, max: 5 },
                              { label: 'ELA', value: student.assessments.current.ela, max: 5 },
                            ].map((item) => (
                              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--slate-500)' }}>{item.label}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.value}/{item.max}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{
                            background: 'var(--ink-indigo-light)',
                            borderRadius: 8, padding: '10px 14px',
                            display: 'flex', justifyContent: 'space-between',
                          }}>
                            <span style={{ fontWeight: 700, color: 'var(--ink-indigo)' }}>Total</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-indigo)', fontSize: 16 }}>
                              {student.assessments.current.total}/40 ({student.assessments.current.percentage}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {student.needsAttention && (
                    <div style={{
                      background: 'var(--marigold-light)',
                      border: '1px solid var(--marigold)',
                      borderRadius: 10, padding: 'var(--sp-4)',
                      display: 'flex', gap: 10,
                    }}>
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#b5720a', fontSize: 14, marginBottom: 2 }}>Attention Needed</div>
                        <div style={{ fontSize: 13, color: '#92610d' }}>{student.attentionReason}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PERFORMANCE TAB */}
              {activeTab === 'Performance' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-4)' }}>
                    {['weekly', 'monthly'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPerfPeriod(p)}
                        className={perfPeriod === p ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={perfPeriod === 'weekly' ? student.performance?.weeklyHistory : []}>
                      <defs>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--ink-indigo)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--ink-indigo)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" name="Score" stroke="var(--ink-indigo)" strokeWidth={2} fill="url(#perfGrad)" dot={{ r: 3, fill: 'var(--ink-indigo)' }} />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Assessment history table */}
                  <div style={{ marginTop: 'var(--sp-4)' }}>
                    <div className="section-heading">Assessment History</div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Assignment</th>
                          <th>Test</th>
                          <th>Discipline</th>
                          <th>Notes</th>
                          <th>ELA</th>
                          <th>Total</th>
                          <th>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.assessments?.history?.map((a) => (
                          <tr key={a.period}>
                            <td style={{ fontWeight: 600 }}>{a.period}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{a.assignment}/20</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{a.test}/5</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{a.discipline}/5</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{a.notes}/5</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{a.ela}/5</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.total}/40</td>
                            <td><StatusBadge variant={a.percentage >= 75 ? 'high' : a.percentage >= 50 ? 'medium' : 'low'} label={`${a.percentage}%`} showDot={false} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeTab === 'Attendance' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                    {[
                      { label: 'Attendance Rate', value: `${student.attendance?.percentage}%`, color: 'var(--banyan-green)' },
                      { label: 'Days Present', value: student.attendance?.present, color: 'var(--ink-indigo)' },
                      { label: 'Days Absent', value: student.attendance?.absent, color: 'var(--kumkum-red)' },
                    ].map((s) => (
                      <div key={s.label} style={{
                        background: `${s.color}10`, border: `1px solid ${s.color}30`,
                        borderRadius: 10, padding: 'var(--sp-4)', textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar-style attendance dots */}
                  <div className="section-heading">Last 30 Days</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {student.attendance?.history?.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.status}`}
                        aria-label={`${day.date}: ${day.status}`}
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: day.status === 'present' ? 'var(--banyan-green-light)' : 'var(--kumkum-red-light)',
                          border: `1px solid ${day.status === 'present' ? 'var(--banyan-green)' : 'var(--kumkum-red)'}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                          color: day.status === 'present' ? 'var(--banyan-green)' : 'var(--kumkum-red)',
                        }}
                      >
                        {new Date(day.date).getDate()}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--slate-500)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--banyan-green-light)', border: '1px solid var(--banyan-green)', display: 'inline-block' }}/>
                      Present
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--kumkum-red-light)', border: '1px solid var(--kumkum-red)', display: 'inline-block' }}/>
                      Absent
                    </span>
                  </div>
                </div>
              )}

              {/* HEALTH TAB */}
              {activeTab === 'Health' && (
                <div>
                  {student.health?.history?.length > 0 ? (
                    <>
                      {/* Latest record */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                        {(() => {
                          const latest = student.health.history[student.health.history.length - 1];
                          return [
                            { label: 'Height', value: `${latest.height} cm` },
                            { label: 'Weight', value: `${latest.weight} kg` },
                            { label: 'BMI', value: latest.bmi },
                          ].map((s) => (
                            <div key={s.label} style={{ background: 'var(--ink-indigo-light)', borderRadius: 10, padding: 'var(--sp-4)', textAlign: 'center' }}>
                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink-indigo)' }}>{s.value}</div>
                              <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{s.label}</div>
                            </div>
                          ));
                        })()}
                      </div>
                      <div style={{ marginBottom: 'var(--sp-4)' }}>
                        <StatusBadge variant={student.health.history[student.health.history.length - 1].bmiStatus === 'Reference range' ? 'stable' : 'attention'} label={student.health.history[student.health.history.length - 1].bmiStatus} />
                      </div>

                      {/* BMI trend */}
                      <div className="section-heading">BMI Trend</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={student.health.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="bmi" name="BMI" stroke="var(--banyan-green)" strokeWidth={2} dot={{ r: 4, fill: 'var(--banyan-green)' }} />
                        </LineChart>
                      </ResponsiveContainer>

                      <div className="section-heading" style={{ marginTop: 'var(--sp-4)' }}>History</div>
                      <table className="data-table">
                        <thead>
                          <tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {[...student.health.history].reverse().map((r) => (
                            <tr key={r.date}>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>{r.date}</td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>{r.height}</td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>{r.weight}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.bmi}</td>
                              <td><StatusBadge variant={r.bmiStatus === 'Reference range' ? 'stable' : 'attention'} label={r.bmiStatus} showDot={false} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--slate-400)' }}>No health records yet.</div>
                  )}
                </div>
              )}

              {/* BEHAVIOUR TAB */}
              {activeTab === 'Behaviour' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                    {[
                      { label: 'Communication', value: student.behaviour?.communication, color: 'var(--ink-indigo)', max: 10 },
                      { label: 'Behaviour', value: student.behaviour?.behaviourPoints, color: 'var(--banyan-green)', max: 10 },
                    ].map((s) => (
                      <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: 10, padding: 'var(--sp-5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-600)' }}>{s.label}</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}/10</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(s.value / 10) * 100}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Behaviour trend chart */}
                  <div className="section-heading">Trend (8 Weeks)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={student.behaviour?.history || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--slate-400)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="communication" name="Communication" stroke="var(--ink-indigo)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="behaviour" name="Behaviour" stroke="var(--banyan-green)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* AI Insight */}
                  <div style={{
                    marginTop: 'var(--sp-5)',
                    background: 'var(--ink-indigo-light)',
                    border: '1px solid rgba(30,58,95,0.15)',
                    borderLeft: '4px solid var(--ink-indigo)',
                    borderRadius: 10,
                    padding: 'var(--sp-4)',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>💡</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-indigo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        AI Insight (Demo)
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.7, margin: 0 }}>
                      {student.behaviour?.aiInsight}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 8 }}>
                      Last updated: {student.behaviour?.lastUpdated} · For informational use only
                    </p>
                  </div>

                  <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'var(--slate-100)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-600)', marginBottom: 4 }}>Recent Observation</div>
                    <p style={{ fontSize: 13, color: 'var(--slate-700)', margin: 0, lineHeight: 1.6 }}>
                      {student.behaviour?.recentObservation}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
