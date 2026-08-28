import React, { useEffect, useState } from 'react';
import { 
  User, Award, TrendingUp, Calendar, HeartPulse, Activity, 
  Sparkles, Bell, ArrowUpRight, CheckCircle2, AlertTriangle, 
  Brain, MessageSquare, Target, ShieldCheck, Flame, BookOpen
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getDashboard().then(res => {
      if (res && res.success) {
        setData(res);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1E3A5F', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Loading Student Dashboard...</p>
      </div>
    );
  }

  const { profile, academic, attendance, health, behaviour, selDevelopment, alerts } = data;

  const selDimensionsList = [
    { label: 'Self-Awareness', key: 'selfAwareness', value: selDevelopment.dimensions?.selfAwareness || 80, color: '#1E3A5F' },
    { label: 'Self-Management', key: 'selfManagement', value: selDevelopment.dimensions?.selfManagement || 70, color: '#3F8F5F' },
    { label: 'Empathy / Social Awareness', key: 'empathy', value: selDevelopment.dimensions?.empathy || 85, color: '#F2A93B' },
    { label: 'Communication', key: 'communication', value: selDevelopment.dimensions?.communication || 90, color: '#1E3A5F' },
    { label: 'Teamwork / Relationship Skills', key: 'teamwork', value: selDevelopment.dimensions?.teamwork || 75, color: '#3F8F5F' },
    { label: 'Responsible Decision-Making', key: 'responsibleDecisionMaking', value: selDevelopment.dimensions?.responsibleDecisionMaking || 80, color: '#1E3A5F' }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Top Storytelling Banner Header */}
      <div style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <div style={styles.avatarCircle}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <div style={styles.welcomeTag}>
              <Sparkles size={13} color="#F2A93B" /> WELCOME BACK
            </div>
            <h1 style={styles.heroTitle}>{profile.name}</h1>
            <p style={styles.heroSub}>
              {profile.class} - Section {profile.section} | {profile.school} | Batch <span style={{ fontFamily: 'var(--font-mono)' }}>{profile.batch}</span>
            </p>
          </div>
        </div>
        <div style={styles.quickActionNav}>
          {/* 🔘 Marigold button for key attention action */}
          <Link to="/student/sel-analysis" style={styles.actionBtnMarigold}>
            <Brain size={16} /> Start Voice SEL Analysis
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={styles.dashboardGrid}>

        {/* 1. Academic Performance Card (Left Banyan Green status accent) */}
        <div style={{ ...styles.card, borderLeft: '4px solid #3F8F5F' }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: '#EDF7F1', color: '#3F8F5F' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Academic Performance</h3>
              <p style={styles.cardSub}>Teacher-Uploaded Monthly Assignment</p>
            </div>
          </div>
          
          <div style={styles.metricRow}>
            <div>
              <div style={styles.bigMetric}>
                {academic.currentMonthlyScore} <span style={styles.metricMax}>/ {academic.maxScore}</span>
              </div>
              <div style={styles.metricLabel}>Monthly Assignment Marks</div>
            </div>
            {/* 📊 Banyan Green positive metric */}
            <div style={styles.badgeSuccess}>
              <TrendingUp size={14} /> +{academic.previousMonthComparison}% vs last month
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${academic.percentage}%`, backgroundColor: '#3F8F5F' }}></div>
          </div>
          <div style={styles.progressInfo}>
            <span>Performance Score</span>
            <span style={{ fontWeight: 700, color: '#3F8F5F', fontFamily: 'var(--font-mono)' }}>{academic.percentage}%</span>
          </div>
        </div>

        {/* 2. Attendance Card */}
        <div style={{ ...styles.card, borderLeft: '4px solid #1E3A5F' }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: '#F1F5F9', color: '#1E3A5F' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Attendance Overview</h3>
              <p style={styles.cardSub}>Monthly Present vs Absent Days</p>
            </div>
          </div>

          <div style={styles.metricRow}>
            <div>
              <div style={styles.bigMetric}>
                {attendance.percentage}%
              </div>
              <div style={styles.metricLabel}>Overall Attendance</div>
            </div>
            <div style={styles.statPillContainer}>
              <span style={styles.statPillGreen}><CheckCircle2 size={12} /> {attendance.presentDays} Present</span>
              <span style={styles.statPillRed}>{attendance.absentDays} Absent</span>
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${attendance.percentage}%`, backgroundColor: '#1E3A5F' }}></div>
          </div>
          <div style={styles.progressInfo}>
            <span>Status: Healthy Standing</span>
            <span style={{ fontWeight: 600, color: '#3F8F5F' }}>Excellent</span>
          </div>
        </div>

        {/* 3. Private Health & BMI Card */}
        <div style={{ ...styles.card, borderLeft: '4px solid #C1473A' }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: '#FDF2F0', color: '#C1473A' }}>
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Health & Fitness</h3>
              <p style={styles.cardSub}>Private Metric Records</p>
            </div>
          </div>

          <div style={styles.healthGrid}>
            <div style={styles.healthItem}>
              <span style={styles.healthLabel}>Height</span>
              <span style={styles.healthValue}>{health.height} <small style={{ fontFamily: 'var(--font-sans)', fontSize: '11px' }}>cm</small></span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.healthLabel}>Weight</span>
              <span style={styles.healthValue}>{health.weight} <small style={{ fontFamily: 'var(--font-sans)', fontSize: '11px' }}>kg</small></span>
            </div>
            <div style={styles.healthItem}>
              <span style={styles.healthLabel}>BMI Ratio</span>
              <span style={styles.healthValue}>{health.bmi}</span>
            </div>
          </div>
          <div style={styles.healthFooter}>
            <ShieldCheck size={14} color="#3F8F5F" /> Private to you only. Last checkup: <span style={{ fontFamily: 'var(--font-mono)' }}>{health.lastCheckupDate}</span>
          </div>
        </div>

        {/* 4. Behaviour & Discipline Card */}
        <div style={{ ...styles.card, borderLeft: '4px solid #F2A93B' }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: '#FEF6EA', color: '#F2A93B' }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Behaviour & Discipline</h3>
              <p style={styles.cardSub}>Teacher Observations & Points</p>
            </div>
          </div>

          <div style={styles.behaviourRow}>
            <div style={styles.behaviourBadge}>
              <Flame size={15} color="#F2A93B" /> <span style={{ fontFamily: 'var(--font-mono)' }}>{behaviour.points}</span> Reward Points
            </div>
            <div style={styles.behaviourScore}>
              Score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{behaviour.disciplineScore}/100</strong>
            </div>
          </div>

          <div style={styles.feedbackBox}>
            <p style={styles.feedbackText}>"{behaviour.teacherFeedback}"</p>
            <span style={styles.feedbackAuthor}>— Class Teacher Feedback</span>
          </div>
        </div>

      </div>

      {/* 5. SEL Development Section */}
      <div style={{ ...styles.card, marginTop: '32px' }}>
        <div style={styles.selHeaderRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: '#EBF2FA', color: '#1E3A5F' }}>
              <Brain size={22} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Social-Emotional Learning (SEL) Growth</h2>
              <p style={styles.cardSub}>6 Core Competency Dimensions measured deterministically</p>
            </div>
          </div>
          <div style={styles.selScoreBadge}>
            Overall SEL: <strong style={{ fontFamily: 'var(--font-mono)' }}>{selDevelopment.percentage}%</strong> ({selDevelopment.currentScore}/{selDevelopment.maxScore})
          </div>
        </div>

        <div style={styles.selGrid}>
          {selDimensionsList.map(dim => (
            <div key={dim.key} style={styles.selCardItem}>
              <div style={styles.selItemTop}>
                <span style={styles.selItemTitle}>{dim.label}</span>
                <span style={{ ...styles.selItemPercent, color: dim.color, fontFamily: 'var(--font-mono)' }}>{dim.value}%</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressBar, width: `${dim.value}%`, backgroundColor: dim.color }}></div>
              </div>
              <div style={styles.selStatusText}>
                {dim.value >= 80 ? 'Strong Demonstration' : dim.value >= 60 ? 'Good Progress' : 'Developing'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Teacher Alerts & System Notifications */}
      <div style={{ ...styles.card, marginTop: '32px' }}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconBox, backgroundColor: '#FDF2F0', color: '#C1473A' }}>
            <Bell size={20} />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Teacher Alerts & Progress Updates</h3>
            <p style={styles.cardSub}>Automated insights regarding performance changes</p>
          </div>
        </div>

        <div style={styles.alertsList}>
          {alerts && alerts.length > 0 ? (
            alerts.map(alert => (
              <div key={alert.id} style={alert.type === 'improvement' ? styles.alertBoxSuccess : styles.alertBoxInfo}>
                <div style={{ ...styles.alertColorBar, backgroundColor: alert.type === 'improvement' ? '#3F8F5F' : '#1E3A5F' }}></div>
                <div style={{ flex: 1, paddingLeft: '8px' }}>
                  <h4 style={styles.alertTitle}>{alert.title}</h4>
                  <p style={styles.alertMessage}>{alert.message}</p>
                </div>
                <span style={styles.alertDate}>{alert.date}</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748B', fontSize: '14px' }}>No pending alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #1E3A5F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  heroBanner: {
    backgroundColor: '#1E3A5F',
    borderRadius: '16px',
    padding: '32px 36px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
    boxShadow: 'var(--shadow-card)'
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  avatarCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'var(--font-serif)',
    border: '2px solid #F2A93B'
  },
  welcomeTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#F2A93B',
    letterSpacing: '0.08em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: '#ffffff'
  },
  heroSub: {
    fontSize: '14px',
    color: '#CBD5E1',
    marginTop: '4px'
  },
  quickActionNav: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  /* 🔘 Marigold button */
  actionBtnMarigold: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(242, 169, 59, 0.3)'
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  /* 🃏 Card styling */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '18px'
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E293B',
    margin: 0
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '14px'
  },
  bigMetric: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E293B'
  },
  metricMax: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    color: '#94A3B8',
    fontWeight: '600'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px'
  },
  badgeSuccess: {
    backgroundColor: '#EDF7F1',
    color: '#3F8F5F',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  progressTrack: {
    height: '8px',
    backgroundColor: '#F1F5F9',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease-in-out'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#64748B'
  },
  statPillContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-end'
  },
  statPillGreen: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statPillRed: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#C1473A',
    backgroundColor: '#FDF2F0',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  healthItem: {
    backgroundColor: '#F7F7F5',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #E2E8F0'
  },
  healthLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600'
  },
  healthValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B'
  },
  healthFooter: {
    fontSize: '12px',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '8px 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600'
  },
  behaviourRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  behaviourBadge: {
    backgroundColor: '#FEF6EA',
    color: '#1E3A5F',
    fontSize: '13px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid #F2A93B'
  },
  behaviourScore: {
    fontSize: '14px',
    color: '#334155'
  },
  feedbackBox: {
    backgroundColor: '#F7F7F5',
    borderRadius: '8px',
    padding: '12px 16px',
    borderLeft: '4px solid #1E3A5F'
  },
  feedbackText: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: '#334155',
    margin: 0
  },
  feedbackAuthor: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    marginTop: '6px',
    display: 'block'
  },
  selHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  selScoreBadge: {
    backgroundColor: '#EBF2FA',
    color: '#1E3A5F',
    fontSize: '14px',
    padding: '6px 14px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  selGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px'
  },
  selCardItem: {
    backgroundColor: '#F7F7F5',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E2E8F0'
  },
  selItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  selItemTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155'
  },
  selItemPercent: {
    fontSize: '16px',
    fontWeight: '800'
  },
  selStatusText: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '6px',
    textAlign: 'right',
    fontWeight: '600'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  alertBoxSuccess: {
    backgroundColor: '#EDF7F1',
    border: '1px solid #C4E5D1',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  alertBoxInfo: {
    backgroundColor: '#EBF2FA',
    border: '1px solid #CBDCEE',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  alertColorBar: {
    width: '4px',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1E293B',
    margin: 0
  },
  alertMessage: {
    fontSize: '13px',
    color: '#475569',
    marginTop: '2px',
    margin: 0
  },
  alertDate: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#94A3B8',
    whiteSpace: 'nowrap'
  }
};
