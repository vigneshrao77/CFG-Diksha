import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getDashboard().then(res => {
      if (res && res.alerts) {
        setAlerts(res.alerts);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <div style={styles.badge}>
          <Bell size={14} /> Alert Center
        </div>
        <h1 style={styles.title}>Teacher Alerts & System Notifications</h1>
        <p style={styles.subtitle}>Important updates on your monthly academic and SEL progress.</p>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p style={{ color: '#4f46e5' }}>Loading Notifications...</p>
        ) : alerts.length > 0 ? (
          <div style={styles.list}>
            {alerts.map(item => (
              <div key={item.id} style={item.type === 'improvement' ? styles.itemSuccess : styles.itemInfo}>
                {item.type === 'improvement' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertTriangle size={20} color="#2563eb" />}
                <div style={{ flex: 1 }}>
                  <h4 style={styles.itemTitle}>{item.title}</h4>
                  <p style={styles.itemMsg}>{item.message}</p>
                </div>
                <span style={styles.date}>{item.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>No notifications found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '24px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  header: {
    marginBottom: '24px'
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  itemSuccess: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  itemInfo: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  itemMsg: {
    fontSize: '13px',
    color: '#475569',
    marginTop: '2px',
    margin: 0
  },
  date: {
    fontSize: '11px',
    color: '#94a3b8'
  }
};
