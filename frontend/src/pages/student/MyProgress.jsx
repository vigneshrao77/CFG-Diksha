import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Award, Calendar, Brain, BookOpen, 
  ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle
} from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function MyProgress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getProgress().then(res => {
      if (res && res.success) {
        setData(res);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#1E3A5F', fontWeight: 700 }}>Loading Growth & Progress Analytics...</p>
      </div>
    );
  }

  const monthlyAcademics = data?.monthlyAcademics || [];
  const monthlySEL = data?.monthlySEL || [];

  const firstSEL = monthlySEL[0] || {};
  const lastSEL = monthlySEL[monthlySEL.length - 1] || {};

  const dimensionsGrowth = [
    { name: 'Self-Awareness', prev: firstSEL.dimensions?.selfAwareness || 70, curr: lastSEL.dimensions?.selfAwareness || 80 },
    { name: 'Self-Management', prev: firstSEL.dimensions?.selfManagement || 65, curr: lastSEL.dimensions?.selfManagement || 70 },
    { name: 'Empathy / Social Awareness', prev: firstSEL.dimensions?.empathy || 75, curr: lastSEL.dimensions?.empathy || 85 },
    { name: 'Communication', prev: firstSEL.dimensions?.communication || 72, curr: lastSEL.dimensions?.communication || 90 },
    { name: 'Teamwork / Relationship Skills', prev: firstSEL.dimensions?.teamwork || 68, curr: lastSEL.dimensions?.teamwork || 75 },
    { name: 'Responsible Decision-Making', prev: firstSEL.dimensions?.responsibleDecisionMaking || 70, curr: lastSEL.dimensions?.responsibleDecisionMaking || 80 }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>
            <Sparkles size={14} color="#1E3A5F" /> GROWTH TRACKING & ANALYTICS
          </div>
          <h1 style={styles.title}>My Progress & Growth Over Time</h1>
          <p style={styles.subtitle}>
            Tracking your monthly trajectory across academics, attendance, behaviour, and Social-Emotional Learning.
          </p>
        </div>
      </div>

      {/* Highlights Banner */}
      <div style={styles.highlightsGrid}>
        <div style={{ ...styles.highlightCard, borderLeft: '4px solid #3F8F5F' }}>
          <div style={{ ...styles.iconBox, backgroundColor: '#EDF7F1', color: '#3F8F5F' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <span style={styles.highlightLabel}>Academic Assignment Score</span>
            <div style={styles.highlightValue}>18 <small style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#64748B' }}>/ 20 marks</small></div>
            <span style={styles.greenText}><ArrowUpRight size={14} /> +10% improvement</span>
          </div>
        </div>

        <div style={{ ...styles.highlightCard, borderLeft: '4px solid #1E3A5F' }}>
          <div style={{ ...styles.iconBox, backgroundColor: '#EBF2FA', color: '#1E3A5F' }}>
            <Brain size={20} />
          </div>
          <div>
            <span style={styles.highlightLabel}>Overall SEL Progress</span>
            <div style={styles.highlightValue}>80% <small style={{ fontSize: '13px', color: '#64748B' }}>Overall</small></div>
            <span style={styles.greenText}><ArrowUpRight size={14} /> +10% 3-month growth</span>
          </div>
        </div>

        <div style={{ ...styles.highlightCard, borderLeft: '4px solid #F2A93B' }}>
          <div style={{ ...styles.iconBox, backgroundColor: '#FEF6EA', color: '#F2A93B' }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={styles.highlightLabel}>Attendance Consistency</span>
            <div style={styles.highlightValue}>91.6%</div>
            <span style={styles.greenText}><CheckCircle size={14} /> High Standing</span>
          </div>
        </div>
      </div>

      {/* SEL Dimension Growth Comparison */}
      <div style={{ ...styles.card, marginTop: '28px' }}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconBox, backgroundColor: '#EBF2FA', color: '#1E3A5F' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 style={styles.cardTitle}>SEL Dimension Growth Comparison</h3>
            <p style={styles.cardSub}>Comparing initial month vs current month</p>
          </div>
        </div>

        <div style={styles.growthGrid}>
          {dimensionsGrowth.map(dim => {
            const diff = dim.curr - dim.prev;
            const isPositive = diff >= 0;
            return (
              <div key={dim.name} style={styles.growthCard}>
                <div style={styles.growthHeader}>
                  <span style={styles.dimName}>{dim.name}</span>
                  <span style={isPositive ? styles.diffBadgePos : styles.diffBadgeNeg}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? `+${diff}%` : `${diff}%`}
                  </span>
                </div>
                <div style={styles.compRow}>
                  <div>
                    <span style={styles.compLabel}>Previous</span>
                    <span style={styles.compValPrev}>{dim.prev}%</span>
                  </div>
                  <div style={styles.arrowDivider}>→</div>
                  <div>
                    <span style={styles.compLabel}>Current</span>
                    <span style={styles.compValCurr}>{dim.curr}%</span>
                  </div>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.bar, width: `${dim.curr}%`, backgroundColor: isPositive ? '#3F8F5F' : '#F2A93B' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Assignment Trend Table */}
      <div style={{ ...styles.card, marginTop: '28px' }}>
        <h3 style={styles.cardTitle}>Monthly Academic Assignment History</h3>
        <p style={styles.cardSub}>Teacher evaluated assignments (Out of 20 Marks)</p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Month</th>
                <th style={styles.th}>Assignment Score</th>
                <th style={styles.th}>Percentage</th>
                <th style={styles.th}>Monthly Trend</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAcademics.map(item => (
                <tr key={item.month}>
                  <td style={styles.tdMono}><strong>{item.month}</strong></td>
                  <td style={styles.tdMono}>{item.assignmentScore} / {item.assignmentMax || 20}</td>
                  <td style={styles.tdMono}><strong>{item.percentage}%</strong></td>
                  <td style={styles.td}>
                    <span style={styles.greenText}>
                      <ArrowUpRight size={14} /> +{item.previousMonthComparison}% vs prior
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    padding: '60px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '28px'
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
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px'
  },
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  iconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  highlightLabel: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600'
  },
  highlightValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E293B'
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
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  cardSub: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0
  },
  growthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  growthCard: {
    backgroundColor: '#F7F7F5',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E2E8F0'
  },
  growthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  dimName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1E293B'
  },
  diffBadgePos: {
    fontFamily: 'var(--font-mono)',
    backgroundColor: '#EDF7F1',
    color: '#3F8F5F',
    fontSize: '12px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  diffBadgeNeg: {
    fontFamily: 'var(--font-mono)',
    backgroundColor: '#FDF2F0',
    color: '#C1473A',
    fontSize: '12px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  compRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  compLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B'
  },
  compValPrev: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: '700',
    color: '#94A3B8'
  },
  compValCurr: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: '800',
    color: '#1E293B'
  },
  arrowDivider: {
    color: '#CBD5E1',
    fontWeight: '700'
  },
  track: {
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    borderRadius: '4px'
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
    fontSize: '14px',
    color: '#1E293B',
    borderBottom: '1px solid #F1F5F9'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#1E293B',
    borderBottom: '1px solid #F1F5F9'
  }
};
