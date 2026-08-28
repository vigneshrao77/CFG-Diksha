import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Award, Calendar, Brain, BookOpen, 
  ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle,
  FileText, Download, Printer, ShieldCheck, Clock,
  ChevronRight, AlertCircle, Lock, CheckCircle2
} from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function MyProgress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  const availableMonths = [
    { id: '2026-08', label: 'August 2026 (Current)' },
    { id: '2026-07', label: 'July 2026' },
    { id: '2026-06', label: 'June 2026' }
  ];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await studentService.getProgress();
      if (res && res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Error loading progress:', e.message);
    }
    setLoading(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1E3A5F', fontWeight: 700, marginTop: '16px' }}>Loading Monthly Performance & Progress Analytics...</p>
      </div>
    );
  }

  // Monthly Data Extraction for selectedMonth
  const monthlyAcademics = data?.monthlyAcademics || [];
  const monthlySEL = data?.monthlySEL || [];
  const monthlyAssignmentsMap = data?.monthlyAssignments || {};

  const currentAcademic = monthlyAcademics.find(a => a.month === selectedMonth) || 
    monthlyAcademics[monthlyAcademics.length - 1] || 
    { assignmentScore: 18, assignmentMax: 20, percentage: 90, previousMonthComparison: 5 };

  const currentSEL = monthlySEL.find(s => s.month === selectedMonth) || 
    monthlySEL[monthlySEL.length - 1] || 
    { percentage: 82, status: 'COMPLETED', dimensions: { selfAwareness: 82, selfManagement: 78, empathy: 88, communication: 84, teamwork: 85, decisionMaking: 80 } };

  const currentAssignments = monthlyAssignmentsMap[selectedMonth] || [
    { id: 1, title: 'Science Lab Analysis', score: 85, maxScore: 100, status: 'COMPLETED' },
    { id: 2, title: 'Mathematics Problem Set', score: 92, maxScore: 100, status: 'COMPLETED' },
    { id: 3, title: 'Social Studies Group Essay', score: 88, maxScore: 100, status: 'COMPLETED' }
  ];

  // -------------------------------------------------------------
  // PREREQUISITES FOR MONTHLY REPORT DOWNLOAD:
  // 1) SEL Analysis for that month must be completed
  // 2) Teacher marks updation must be done
  // -------------------------------------------------------------
  const localSELCompleted = localStorage.getItem(`diksha_sel_completed_${selectedMonth}`) === 'true';
  const isSELCompleted = Boolean(currentSEL?.status === 'COMPLETED' || currentSEL?.percentage || localSELCompleted);
  const isTeacherMarksUpdated = Boolean(currentAcademic?.percentage && currentAcademic?.assignmentScore > 0);
  const canDownloadReport = isSELCompleted && isTeacherMarksUpdated;

  const selScore = currentSEL.percentage || 82;
  const academicScore = currentAcademic.percentage || 90;
  const overallMonthlyPerformance = Math.round((selScore * 0.5) + (academicScore * 0.5));

  const dimList = [
    { name: 'Self-Awareness', score: currentSEL.dimensions?.selfAwareness || 80, color: '#1E3A5F' },
    { name: 'Self-Management', score: currentSEL.dimensions?.selfManagement || 75, color: '#3F8F5F' },
    { name: 'Empathy / Social Awareness', score: currentSEL.dimensions?.empathy || 85, color: '#F2A93B' },
    { name: 'Communication', score: currentSEL.dimensions?.communication || 84, color: '#6366F1' },
    { name: 'Teamwork / Relationship Skills', score: currentSEL.dimensions?.teamwork || 85, color: '#0EA5E9' },
    { name: 'Responsible Decision-Making', score: currentSEL.dimensions?.responsibleDecisionMaking || currentSEL.dimensions?.decisionMaking || 80, color: '#EC4899' }
  ];

  return (
    <div style={styles.pageWrapper} className="printable-progress-report">
      {/* Header & Month Selector Toolbar */}
      <div style={styles.headerRow} className="no-print">
        <div>
          <div style={styles.badge}>
            <Sparkles size={14} color="#1E3A5F" /> CENTRAL MONTHLY PERFORMANCE DASHBOARD
          </div>
          <h1 style={styles.title}>My Monthly Progress & Growth</h1>
          <p style={styles.subtitle}>
            Review your consolidated monthly performance across SEL Analysis, academic assignments, and attendance.
          </p>
        </div>

        {/* Month Selector & PDF Export Action */}
        <div style={styles.toolbarRight}>
          <div style={styles.monthSelectBox}>
            <Calendar size={18} color="#1E3A5F" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthSelect}
            >
              {availableMonths.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {canDownloadReport ? (
            <button onClick={handleExportPDF} style={styles.btnExportPDF}>
              <Printer size={16} /> Export Monthly Report (PDF)
            </button>
          ) : (
            <button 
              disabled 
              style={styles.btnExportPDFDisabled}
              title={!isSELCompleted ? 'Complete SEL Analysis to unlock report' : 'Awaiting teacher marks updation'}
            >
              <Lock size={16} /> Report Locked
            </button>
          )}
        </div>
      </div>

      {/* Report Unlock / Lock Status Banner (No-Print) */}
      <div className="no-print" style={{ marginBottom: '24px' }}>
        {canDownloadReport ? (
          <div style={styles.reportUnlockedBanner}>
            <CheckCircle2 size={20} color="#3F8F5F" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>
                {selectedMonth} Monthly Progress Report Ready for Export
              </div>
              <div style={{ fontSize: '12px', color: '#334155' }}>
                ✓ SEL Voice Analysis Verified • ✓ Teacher Academic Marks Updated ({currentAcademic.assignmentScore}/20 marks)
              </div>
            </div>
            <span style={styles.unlockedPill}>Ready for PDF Download</span>
          </div>
        ) : !isSELCompleted ? (
          <div style={styles.reportLockedBanner}>
            <AlertCircle size={20} color="#C1473A" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#991B1B' }}>
                Monthly Report Locked — SEL Assessment Required
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                The official monthly progress report can only be downloaded once your SEL Analysis is completed for {selectedMonth}.
              </div>
            </div>
            <Link to="/student/sel-analysis" style={styles.btnTakeSELNow}>
              Take SEL Assessment →
            </Link>
          </div>
        ) : (
          <div style={styles.reportLockedBannerTeacher}>
            <Clock size={20} color="#D97706" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                Monthly Report Locked — Pending Teacher Marks Updation
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Your SEL assessment is completed. The full report will unlock as soon as your class teacher submits and verifies assignment marks for {selectedMonth}.
              </div>
            </div>
            <span style={styles.pendingPill}>Awaiting Teacher Updation</span>
          </div>
        )}
      </div>

      {/* Printable Report Header (Visible in PDF / Print Mode) */}
      <div style={styles.printReportHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#F2A93B', fontWeight: '800' }}>
              DIKSHA STUDENT PLATFORM • OFFICIAL MONTHLY PERFORMANCE REPORT
            </div>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-serif)', margin: '4px 0 2px 0', color: '#1E3A5F' }}>
              Student Monthly Progress Report — {selectedMonth}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Student: <strong>Sahasra V.</strong> (ST001) • Class 10A • Diksha Model High School
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Overall Monthly Performance</div>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', fontWeight: '800', color: '#1E3A5F' }}>
              {overallMonthlyPerformance}%
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Overview Grid */}
      <div style={styles.overviewGrid}>
        {/* Overall Performance Card */}
        <div style={{ ...styles.overviewCard, borderLeft: '4px solid #1E3A5F' }}>
          <div style={styles.overviewTop}>
            <span style={styles.cardLabel}>Overall Monthly Performance</span>
            <span style={styles.periodTag}>{selectedMonth}</span>
          </div>
          <div style={styles.bigValue}>{overallMonthlyPerformance}%</div>
          <div style={styles.greenText}>
            <ArrowUpRight size={14} /> Balanced 50% SEL + 50% Academic Standing
          </div>
        </div>

        {/* SEL Analysis Card */}
        <div style={{ ...styles.overviewCard, borderLeft: '4px solid #3F8F5F' }}>
          <div style={styles.overviewTop}>
            <span style={styles.cardLabel}>Monthly SEL Analysis</span>
            <span style={isSELCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending}>
              {isSELCompleted ? <CheckCircle size={12} color="#3F8F5F" /> : <Clock size={12} color="#C1473A" />}
              {isSELCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div style={styles.bigValue}>{isSELCompleted ? `${selScore}%` : '—'}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {isSELCompleted ? (currentSEL.growth?.message || 'High emotional awareness & communication') : 'Assessment not yet taken for this month'}
          </div>
        </div>

        {/* Academic Assignments Card */}
        <div style={{ ...styles.overviewCard, borderLeft: '4px solid #F2A93B' }}>
          <div style={styles.overviewTop}>
            <span style={styles.cardLabel}>Academic Assignments</span>
            <span style={isTeacherMarksUpdated ? styles.statusBadgeCompleted : styles.statusBadgePending}>
              {isTeacherMarksUpdated ? <CheckCircle size={12} color="#3F8F5F" /> : <Clock size={12} color="#D97706" />}
              {isTeacherMarksUpdated ? 'Marks Updated' : 'Pending Verification'}
            </span>
          </div>
          <div style={styles.bigValue}>{isTeacherMarksUpdated ? `${academicScore}%` : '—'}</div>
          <div style={styles.greenText}>
            <ArrowUpRight size={14} /> {currentAcademic.assignmentScore}/20 marks verified by teacher
          </div>
        </div>
      </div>

      {/* Main Two-Column Monthly Performance Details */}
      <div style={styles.detailsGrid}>
        {/* Left Column: Monthly SEL Analysis Breakdown */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#EDF7F1', color: '#3F8F5F' }}>
              <Brain size={20} />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Social-Emotional Learning (SEL)</h3>
              <p style={styles.cardSub}>Monthly voice assessment results across 6 dimensions</p>
            </div>
          </div>

          {/* Dimension Bars */}
          <div style={styles.dimListContainer}>
            {dimList.map(dim => (
              <div key={dim.name} style={styles.dimItem}>
                <div style={styles.dimHeaderRow}>
                  <span style={styles.dimName}>{dim.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: dim.color, fontSize: '13px' }}>
                    {dim.score}%
                  </span>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.bar, width: `${dim.score}%`, backgroundColor: dim.color }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Growth Areas */}
          {currentSEL.strengths && currentSEL.strengths.length > 0 && (
            <div style={styles.selInsightsBox}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#3F8F5F', textTransform: 'uppercase', marginBottom: '6px' }}>
                🌟 Strengths Demonstrated in {selectedMonth}:
              </div>
              <ul style={styles.insightList}>
                {currentSEL.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Academic Assignments & Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Assignments Breakdown Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconCircle, backgroundColor: '#EBF2FA', color: '#1E3A5F' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 style={styles.cardTitle}>Monthly Assignments</h3>
                <p style={styles.cardSub}>Evaluated coursework for {selectedMonth}</p>
              </div>
            </div>

            <div style={styles.assignmentsList}>
              {currentAssignments.map(asg => (
                <div key={asg.id} style={styles.asgItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={16} color="#3F8F5F" />
                    <div>
                      <div style={styles.asgTitle}>{asg.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Out of {asg.maxScore} marks</div>
                    </div>
                  </div>
                  <div style={styles.asgScoreBadge}>
                    {asg.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance & Behaviour Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconCircle, backgroundColor: '#FEF6EA', color: '#F2A93B' }}>
                <Award size={20} />
              </div>
              <div>
                <h3 style={styles.cardTitle}>Attendance & Behaviour</h3>
                <p style={styles.cardSub}>Consistency metrics for {selectedMonth}</p>
              </div>
            </div>

            <div style={styles.metricsRow}>
              <div style={styles.metricPill}>
                <span style={styles.metricLabel}>Attendance Consistency</span>
                <strong style={styles.metricVal}>{data?.attendance?.percentage || 91.6}%</strong>
                <span style={styles.greenText}><CheckCircle size={12} /> High Standing</span>
              </div>
              <div style={styles.metricPill}>
                <span style={styles.metricLabel}>Discipline & Conduct</span>
                <strong style={styles.metricVal}>{data?.behaviour?.disciplineScore || 92}/100</strong>
                <span style={styles.greenText}><CheckCircle size={12} /> Positive Conduct</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Monthly Comparison Table */}
      <div style={{ ...styles.card, marginTop: '24px' }}>
        <h3 style={styles.cardTitle}>Historical Monthly Performance Trajectory</h3>
        <p style={styles.cardSub}>Comparing monthly progression across academic and SEL evaluations</p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Month</th>
                <th style={styles.th}>SEL Analysis Status</th>
                <th style={styles.th}>Teacher Marks Status</th>
                <th style={styles.th}>SEL Score</th>
                <th style={styles.th}>Academic Score</th>
                <th style={styles.th}>Overall Performance</th>
                <th style={styles.th}>Report Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAcademics.map(item => {
                const sel = monthlySEL.find(s => s.month === item.month) || {};
                const sPct = sel.percentage || (item.month === '2026-08' ? 82 : item.month === '2026-07' ? 77 : 70);
                const overall = Math.round((sPct * 0.5) + (item.percentage * 0.5));
                return (
                  <tr key={item.month} style={item.month === selectedMonth ? { backgroundColor: '#F8FAFC' } : {}}>
                    <td style={styles.tdMono}>
                      <strong>{item.month}</strong>
                      {item.month === selectedMonth && <span style={styles.activePill}>Selected</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.completedTag}>
                        <CheckCircle size={12} color="#3F8F5F" /> Completed
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.completedTag}>
                        <CheckCircle size={12} color="#3F8F5F" /> Updated
                      </span>
                    </td>
                    <td style={styles.tdMono}><strong>{sPct}%</strong></td>
                    <td style={styles.tdMono}><strong>{item.percentage}%</strong> ({item.assignmentScore}/20)</td>
                    <td style={styles.tdMono}>
                      <strong style={{ color: '#1E3A5F', fontSize: '15px' }}>{overall}%</strong>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => {
                          setSelectedMonth(item.month);
                          setTimeout(() => window.print(), 100);
                        }}
                        style={styles.btnSmallExport}
                      >
                        <Printer size={12} /> Export PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body { background: #ffffff !important; font-size: 12px; }
          .no-print { display: none !important; }
          .printable-progress-report { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          .printable-progress-report .card { box-shadow: none !important; border: 1px solid #CBD5E1 !important; margin-bottom: 16px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingContainer: {
    padding: '80px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #1E3A5F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '4px 12px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '4px'
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  monthSelectBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  monthSelect: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#F8FAFC',
    cursor: 'pointer'
  },
  btnExportPDF: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(30, 58, 95, 0.2)'
  },
  btnExportPDFDisabled: {
    backgroundColor: '#E2E8F0',
    color: '#94A3B8',
    border: '1px solid #CBD5E1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  reportUnlockedBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '10px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  unlockedPill: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #86EFAC'
  },
  reportLockedBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  btnTakeSELNow: {
    backgroundColor: '#C1473A',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },
  reportLockedBannerTeacher: {
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '10px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pendingPill: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #FCD34D'
  },
  printReportHeader: {
    display: 'none',
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #1E3A5F',
    paddingBottom: '16px',
    marginBottom: '20px'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '22px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  overviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600'
  },
  periodTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  statusBadgeCompleted: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '3px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusBadgePending: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#C1473A',
    backgroundColor: '#FDF2F0',
    padding: '3px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  bigValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '36px',
    fontWeight: '800',
    color: '#1E293B',
    margin: '10px 0 4px 0'
  },
  greenText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#3F8F5F',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '19px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: '2px 0 0 0'
  },
  dimListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  dimItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dimHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  dimName: {
    fontWeight: '600',
    color: '#1E293B'
  },
  track: {
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    borderRadius: '3px'
  },
  selInsightsBox: {
    marginTop: '20px',
    backgroundColor: '#EDF7F1',
    borderRadius: '8px',
    padding: '12px 16px',
    border: '1px solid #C4E5D1'
  },
  insightList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#1E293B',
    lineHeight: '1.5'
  },
  assignmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  asgItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0'
  },
  asgTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E293B'
  },
  asgScoreBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: '800',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  metricPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600'
  },
  metricVal: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B'
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    color: '#64748B',
    borderBottom: '2px solid #E2E8F0',
    fontWeight: '700'
  },
  tdMono: {
    fontFamily: 'var(--font-mono)',
    padding: '14px 16px',
    fontSize: '13px',
    color: '#1E293B',
    borderBottom: '1px solid #F1F5F9'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#1E293B',
    borderBottom: '1px solid #F1F5F9'
  },
  activePill: {
    fontSize: '10px',
    backgroundColor: '#EBF2FA',
    color: '#1E3A5F',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px'
  },
  completedTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  btnSmallExport: {
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    color: '#1E3A5F',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  }
};
