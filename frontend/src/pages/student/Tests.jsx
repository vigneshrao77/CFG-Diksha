import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { Link } from 'react-router-dom';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getTests().then(res => {
      if (res && res.success) {
        setTests(res.tests || []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#1E3A5F' }}>Loading Assessments...</div>;
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <div style={styles.badge}>
          <BookOpen size={14} color="#1E3A5F" /> ACADEMIC EVALUATIONS
        </div>
        <h1 style={styles.title}>Academic & Skill Assessments</h1>
        <p style={styles.subtitle}>Attempt teacher-assigned tests and view your performance history.</p>
      </div>

      <div style={styles.grid}>
        {tests.map(test => (
          <div key={test.id} style={{ ...styles.card, borderLeft: test.status === 'Completed' ? '4px solid #3F8F5F' : '4px solid #1E3A5F' }}>
            <div style={styles.cardHeader}>
              <span style={styles.subjectBadge}>{test.subject}</span>
              <span style={test.status === 'Completed' ? styles.statusCompleted : styles.statusAvailable}>
                {test.status}
              </span>
            </div>

            <h3 style={styles.testTitle}>{test.title}</h3>
            
            <div style={styles.metaRow}>
              <span><Clock size={14} /> {test.durationMinutes} mins</span>
              <span><BookOpen size={14} /> {test.totalQuestions} Questions</span>
            </div>

            {test.status === 'Completed' ? (
              <div style={styles.resultBox}>
                <span>Score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{test.score}</strong></span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B' }}>Completed {test.completedDate}</span>
              </div>
            ) : (
              <div style={styles.actionRow}>
                {/* 🔘 Marigold Action Button */}
                <Link to={`/student/tests/${test.id}`} style={styles.startBtnMarigold}>
                  Start Test <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto'
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  subjectBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  statusAvailable: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  statusCompleted: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  testTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '12px'
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#64748B',
    marginBottom: '16px'
  },
  resultBox: {
    backgroundColor: '#F7F7F5',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    border: '1px solid #E2E8F0'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  startBtnMarigold: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(242, 169, 59, 0.3)'
  }
};
