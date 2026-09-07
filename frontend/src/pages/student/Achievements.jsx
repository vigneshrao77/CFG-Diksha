import React from 'react';
import { Award, Sparkles, Trophy, MessageSquare, Star } from 'lucide-react';
import { MOCK_ACHIEVEMENTS } from '../../data/mockData';

export default function Achievements() {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <div style={styles.badge}>
          <Sparkles size={14} /> Student Milestones
        </div>
        <h1 style={styles.title}>Badges & Achievements</h1>
        <p style={styles.subtitle}>Recognizing your academic performance, discipline, and Social-Emotional Growth.</p>
      </div>

      <div style={styles.grid}>
        {MOCK_ACHIEVEMENTS.map(item => (
          <div key={item.id} style={styles.card}>
            <div style={styles.iconCircle}>
              <Trophy size={28} color="#eab308" />
            </div>
            <span style={styles.catBadge}>{item.category}</span>
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.cardDesc}>{item.description}</p>
            <div style={styles.dateTag}>Earned in {item.dateEarned}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  header: {
    marginBottom: '24px'
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#eab308',
    backgroundColor: '#fef9c3',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
    textAlign: 'center'
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#fef08a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto'
  },
  catBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#4f46e5',
    backgroundColor: '#e0e7ff',
    padding: '2px 8px',
    borderRadius: '8px',
    display: 'inline-block',
    marginBottom: '8px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0'
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 14px 0',
    lineHeight: '1.4'
  },
  dateTag: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600'
  }
};
