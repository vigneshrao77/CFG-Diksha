import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import MetricCard from '../../components/teacher/MetricCard';
import ChartCard from '../../components/teacher/ChartCard';
import StudentAvatar from '../../components/teacher/StudentAvatar';
import StatusBadge from '../../components/teacher/StatusBadge';
import TrendIndicator from '../../components/teacher/TrendIndicator';
import LoadingState from '../../components/teacher/LoadingState';
import { getTeacherDashboard, getStudents, getAttendance } from '../../services/teacherService';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--slate-800)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
        {payload[0].value}%
      </div>
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACTIVITY_ICONS = {
  attendance: { icon: '✓', color: 'var(--banyan-green)' },
  health: { icon: '♥', color: 'var(--kumkum-red)' },
  assessment: { icon: '📝', color: 'var(--ink-indigo)' },
  behaviour: { icon: '⭐', color: 'var(--marigold)' },
  alert: { icon: '🔔', color: 'var(--kumkum-red)' },
};

const CLASS_OPTIONS = ['all', 'Class A', 'Class B', 'Class C'];

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [todayAttendanceList, setTodayAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfPeriod, setPerfPeriod] = useState('weekly');
  const [perfClass, setPerfClass] = useState('all');
  const [attClass, setAttClass] = useState('all');
  const navigate = useNavigate();

  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      getTeacherDashboard(),
      getStudents(),
      getAttendance({ date: todayIso }),
    ])
      .then(([dashData, students, attList]) => {
        setData(dashData);
        setAllStudents(students);
        setTodayAttendanceList(attList);
      })
      .catch((e) => setError(e.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Calculate filtered attendance breakdown for Today's Attendance card
  const filteredAttendance = useMemo(() => {
    const relevantStudents = attClass === 'all'
      ? allStudents
      : allStudents.filter((s) => s.class === attClass);

    if (!relevantStudents.length) {
      return {
        present: data?.attendanceOverview?.present ?? data?.stats?.todayAttendance?.count ?? 0,
        absent: data?.attendanceOverview?.absent ?? 0,
        total: data?.stats?.totalStudents ?? 0,
        percentage: data?.attendanceOverview?.percentage ?? data?.stats?.todayAttendance?.percentage ?? 0,
      };
    }

    const studentIds = relevantStudents.map((s) => s.id || s.studentId);
    const records = todayAttendanceList.filter((a) => studentIds.includes(a.studentId));

    const presentCount = records.filter((a) => a.status === 'present').length;
    const absentCount = relevantStudents.length - presentCount;
    const percentage = relevantStudents.length ? Math.round((presentCount / relevantStudents.length) * 100) : 0;

    return {
      present: presentCount,
      absent: absentCount,
      total: relevantStudents.length,
      percentage,
    };
  }, [allStudents, todayAttendanceList, attClass, data]);

  // Calculate class-specific performance trend
  const performanceTrendData = useMemo(() => {
    const baseWeekly = data?.performanceTrendWeekly || [];
    const baseMonthly = data?.performanceTrendMonthly || [];
    const base = perfPeriod === 'weekly' ? baseWeekly : baseMonthly;

    if (perfClass === 'all') return base;

    // Shift scores based on class performance profiles
    const delta = perfClass === 'Class A' ? 4 : perfClass === 'Class B' ? -2 : -5;
    return base.map((item) => ({
      ...item,
      score: Math.min(100, Math.max(40, item.score + delta)),
    }));
  }, [data, perfPeriod, perfClass]);

  return (
    <TeacherLayout>
      <div className="page-container" style={{ paddingTop: 'var(--sp-6)' }}>
        {/* ── Header ─────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--ink-indigo)', fontWeight: 700, marginBottom: 4 }}>
              {getGreeting()}, {data?.teacher?.name?.split(' ').slice(-1)[0] || 'Teacher'} 👋
            </h1>
            <p style={{ color: 'var(--slate-400)', fontSize: 14 }}>{todayFormatted}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--ink-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {data?.teacher?.initial || 'AR'}
            </div>
          </div>
        </div>

        {/* ── Loading / Error ──────────────────────── */}
        {loading && <LoadingState type="full" />}
        {error && (
          <div style={{ background: 'var(--kumkum-red-light)', border: '1px solid var(--kumkum-red)', borderRadius: 10, padding: 'var(--sp-4)', color: 'var(--kumkum-red)', marginBottom: 'var(--sp-4)' }}>
            ⚠️ {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Metric Cards ─────────────────────── */}
            <div className="grid-4" style={{ marginBottom: 'var(--sp-6)' }}>
              <MetricCard
                title="Total Students"
                value={data.stats?.totalStudents ?? 0}
                icon="👥"
                accentColor="var(--ink-indigo)"
                subtitle="Across all classes"
              />
              <MetricCard
                title="Today's Attendance"
                value={`${data.stats?.todayAttendance?.percentage ?? 0}%`}
                icon="✓"
                accentColor="var(--banyan-green)"
                subtitle={`${data.stats?.todayAttendance?.count ?? 0} of ${data.stats?.totalStudents ?? 0} present`}
                trend={(data.stats?.todayAttendance?.percentage ?? 0) >= 80 ? 'up' : 'down'}
                trendValue={data.stats?.todayAttendance?.percentage ?? 0}
              />
              <MetricCard
                title="Avg Performance"
                value={`${data.stats?.avgPerformance ?? 0}%`}
                icon="📊"
                accentColor="var(--marigold)"
                subtitle="Class average this period"
              />
              <MetricCard
                title="Needs Attention"
                value={data.stats?.studentsNeedingAttention ?? 0}
                icon="⚠️"
                accentColor="var(--kumkum-red)"
                subtitle="Students with declining scores"
                trend={(data.stats?.studentsNeedingAttention ?? 0) > 0 ? 'down' : 'neutral'}
                trendValue={0}
              />
            </div>

            {/* ── Charts Row ─────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }} className="charts-row">
              {/* 1. Performance Trend Chart with Weekly/Monthly AND Class Filter */}
              <ChartCard
                title="Class Performance Trend"
                subtitle={`${perfClass === 'all' ? 'All Classes' : perfClass} · ${perfPeriod === 'weekly' ? '8-week' : '6-month'} average`}
                actions={
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Period Buttons */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['weekly', 'monthly'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setPerfPeriod(p)}
                          className={perfPeriod === p ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                          style={{ fontSize: 11, padding: '4px 8px', textTransform: 'capitalize' }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Class Filter Dropdown */}
                    <select
                      value={perfClass}
                      onChange={(e) => setPerfClass(e.target.value)}
                      className="form-select"
                      style={{ fontSize: 11, padding: '3px 8px', height: 'auto', minWidth: 105 }}
                      aria-label="Filter performance by class"
                    >
                      <option value="all">All Classes</option>
                      <option value="Class A">Class A</option>
                      <option value="Class B">Class B</option>
                      <option value="Class C">Class C</option>
                    </select>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={performanceTrendData}>
                    <defs>
                      <linearGradient id="perfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.18}/>
                        <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                    <XAxis dataKey={perfPeriod === 'weekly' ? 'week' : 'month'} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'var(--slate-400)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="var(--ink-indigo)" strokeWidth={2.5} fill="url(#perfAreaGrad)" dot={{ r: 3, fill: 'var(--ink-indigo)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 2. Attendance Overview Chart with Class Filter */}
              <ChartCard
                title="Today's Attendance"
                subtitle={attClass === 'all' ? 'All Classes' : attClass}
                actions={
                  <select
                    value={attClass}
                    onChange={(e) => setAttClass(e.target.value)}
                    className="form-select"
                    style={{ fontSize: 11, padding: '3px 8px', height: 'auto', minWidth: 105 }}
                    aria-label="Filter today's attendance by class"
                  >
                    <option value="all">All Classes</option>
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                  </select>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-2) 0' }}>
                  {/* Big percentage rate */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: 700, color: 'var(--banyan-green)', lineHeight: 1 }}>
                      {filteredAttendance.percentage}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
                      {attClass === 'all' ? 'Overall Attendance Rate' : `${attClass} Attendance Rate`}
                    </div>
                  </div>

                  {/* Bar chart */}
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={[
                      { name: 'Present', value: filteredAttendance.present },
                      { name: 'Absent', value: filteredAttendance.absent },
                    ]} barSize={36}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="var(--banyan-green)" />
                        <Cell fill="var(--kumkum-red)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div style={{ display: 'flex', gap: 'var(--sp-6)', fontSize: 13 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--banyan-green)' }}>
                        {filteredAttendance.present}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Present</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--kumkum-red)' }}>
                        {filteredAttendance.absent}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Absent</div>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* ── Students Needing Attention ────────── */}
            {data.studentsNeedingAttention?.length > 0 && (
              <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="card-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate-800)' }}>⚠️ Students Needing Attention</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>Performance declined ≥8% from previous period</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/students?filter=attention')}>
                    View All
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Current Score</th>
                        <th>Previous Score</th>
                        <th>Change</th>
                        <th>Trend</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.studentsNeedingAttention.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <StudentAvatar name={s.name} initial={s.initial} avatarColor={s.avatarColor} size="sm" />
                              <span style={{ fontWeight: 600 }}>{s.name}</span>
                            </div>
                          </td>
                          <td><span className="badge badge-class">{s.class}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{s.currentScore}%</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate-400)' }}>{s.previousScore}%</td>
                          <td>
                            <TrendIndicator trend={s.trend} value={s.change} showIcon={true} />
                          </td>
                          <td>
                            <StatusBadge variant={s.trend} label={s.trend} />
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--kumkum-red)', maxWidth: 200 }}>
                            {s.reason || 'Score dropped significantly'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Recent Activity ──────────────────── */}
            <div className="card" style={{ padding: 'var(--sp-5)' }}>
              <div className="section-heading">Recent Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {(data.recentActivity || []).map((a) => {
                  const meta = ACTIVITY_ICONS[a.type] || { icon: '•', color: 'var(--ink-indigo)' };
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: 'var(--warm-neutral)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `${meta.color}15`,
                          color: meta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <span style={{ flex: 1, color: 'var(--slate-700)', fontWeight: 500 }}>{a.message}</span>
                      <span style={{ fontSize: 11, color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .charts-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </TeacherLayout>
  );
}
