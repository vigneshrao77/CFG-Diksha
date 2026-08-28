import React, { useEffect, useState } from 'react';
import { 
  Trophy, Medal, Award, Flame, Calendar, Sparkles, 
  ArrowUpRight, ShieldCheck, ChevronDown
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { MOCK_LEADERBOARD_MONTHS } from '../../data/mockData';

export default function Leaderboard() {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studentService.getLeaderboard(selectedMonth).then(res => {
      if (res && res.success) {
        setLeaderboardData(res.leaderboard || []);
      }
      setLoading(false);
    });
  }, [selectedMonth]);

  const topThree = leaderboardData.slice(0, 3);

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.badge}>
            <Trophy size={14} /> MONTHLY HOLISTIC GROWTH
          </div>
          <h1 style={styles.title}>Student Leaderboard</h1>
          <p style={styles.subtitle}>
            Combining 50% Monthly Assignment Performance + 50% Social-Emotional Learning (SEL) Assessment.
          </p>
        </div>

        {/* Month Selector */}
        <div style={styles.monthSelectorBox}>
          <Calendar size={16} color="#1E3A5F" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>Select Month:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.selectInput}
          >
            {MOCK_LEADERBOARD_MONTHS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>Loading Leaderboard for {selectedMonth}...</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <div style={styles.podiumContainer}>
              {/* Rank 2 - Left */}
              <div style={styles.podiumItemRank2}>
                <div style={styles.rankBadge2}>2</div>
                <div style={styles.podiumAvatar}>{topThree[1].studentName.charAt(0)}</div>
                <h4 style={styles.podiumName}>{topThree[1].studentName}</h4>
                <div style={styles.podiumScore}>{topThree[1].combinedScore}% <small style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#64748B' }}>Overall</small></div>
                <div style={styles.podiumBreakdown}>
                  Assignment: {topThree[1].assignmentScore}/20 | SEL: {topThree[1].selPercentage}%
                </div>
                {topThree[1].isMostImproved && (
                  <span style={styles.improvedBadge}>
                    <Flame size={12} /> Most Improved (+{topThree[1].improvement}%)
                  </span>
                )}
              </div>

              {/* Rank 1 - Center (Tallest with Marigold accents) */}
              <div style={styles.podiumItemRank1}>
                <Trophy size={28} color="#F2A93B" />
                <div style={styles.rankBadge1}>1</div>
                <div style={styles.podiumAvatar1}>{topThree[0].studentName.charAt(0)}</div>
                <h3 style={styles.podiumName1}>{topThree[0].studentName}</h3>
                <div style={styles.podiumScore1}>{topThree[0].combinedScore}% <small style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#64748B' }}>Overall</small></div>
                <div style={styles.podiumBreakdown1}>
                  Assignment: {topThree[0].assignmentScore}/20 | SEL: {topThree[0].selPercentage}%
                </div>
              </div>

              {/* Rank 3 - Right */}
              <div style={styles.podiumItemRank3}>
                <div style={styles.rankBadge3}>3</div>
                <div style={styles.podiumAvatar}>{topThree[2].studentName.charAt(0)}</div>
                <h4 style={styles.podiumName}>{topThree[2].studentName}</h4>
                <div style={styles.podiumScore}>{topThree[2].combinedScore}% <small style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#64748B' }}>Overall</small></div>
                <div style={styles.podiumBreakdown}>
                  Assignment: {topThree[2].assignmentScore}/20 | SEL: {topThree[2].selPercentage}%
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div style={styles.card}>
            <div style={styles.tableHeaderRow}>
              <h3 style={styles.tableTitle}>Rankings & Combined Holistic Scores</h3>
              <div style={styles.privacyNote}>
                <ShieldCheck size={14} color="#3F8F5F" /> Privacy Enforced: Health & private diagnostic data excluded.
              </div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Student Name</th>
                    <th style={styles.th}>Assignment (50%)</th>
                    <th style={styles.th}>SEL Assessment (50%)</th>
                    <th style={styles.th}>Combined Score</th>
                    <th style={styles.th}>Monthly Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map(item => {
                    const isSelf = item.studentId === 'ST001';
                    return (
                      <tr key={item.studentId} style={isSelf ? styles.trHighlight : styles.trNormal}>
                        <td style={styles.tdRank}>
                          {item.rank === 1 ? <Medal size={20} color="#F2A93B" /> : 
                           item.rank === 2 ? <Medal size={20} color="#94A3B8" /> : 
                           item.rank === 3 ? <Medal size={20} color="#1E3A5F" /> : 
                           <strong style={{ fontFamily: 'var(--font-mono)' }}>#{item.rank}</strong>}
                        </td>
                        <td style={styles.tdName}>
                          {item.studentName} {isSelf && <span style={styles.youBadge}>You</span>}
                          {item.isMostImproved && (
                            <span style={styles.mostImprovedPill}>
                              <Flame size={12} /> Most Improved
                            </span>
                          )}
                        </td>
                        <td style={styles.tdMono}>
                          {item.assignmentScore} / {item.assignmentMax || 20} <span style={styles.percentSub}>({item.assignmentPercentage}%)</span>
                        </td>
                        <td style={styles.tdMono}>
                          {item.selScore} / {item.selMax || 120} <span style={styles.percentSub}>({item.selPercentage}%)</span>
                        </td>
                        <td style={styles.tdCombined}>
                          <strong>{item.combinedScore}%</strong>
                        </td>
                        <td style={styles.tdGrowth}>
                          <span style={styles.greenText}>
                            <ArrowUpRight size={14} /> +{item.improvement}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px'
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#FEF6EA',
    padding: '4px 12px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
    border: '1px solid #F2A93B'
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
  monthSelectorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  selectInput: {
    fontFamily: 'var(--font-mono)',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontWeight: '700',
    color: '#1E293B',
    outline: 'none',
    cursor: 'pointer'
  },
  loadingBox: {
    padding: '60px',
    textAlign: 'center',
    color: '#1E3A5F',
    fontWeight: '700'
  },
  podiumContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '16px',
    marginBottom: '32px'
  },
  podiumItemRank1: {
    backgroundColor: '#ffffff',
    border: '2px solid #F2A93B',
    borderRadius: '16px',
    padding: '24px 20px',
    width: '240px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(242, 169, 59, 0.15)',
    transform: 'translateY(-12px)',
    position: 'relative'
  },
  podiumItemRank2: {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '20px 16px',
    width: '210px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-card)'
  },
  podiumItemRank3: {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '20px 16px',
    width: '210px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-card)'
  },
  rankBadge1: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankBadge2: {
    backgroundColor: '#94A3B8',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    margin: '0 auto 8px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankBadge3: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    margin: '0 auto 8px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  podiumAvatar1: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#FEF6EA',
    color: '#1E3A5F',
    fontSize: '24px',
    fontWeight: '800',
    fontFamily: 'var(--font-serif)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8px auto',
    border: '2px solid #F2A93B'
  },
  podiumAvatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: 'var(--font-serif)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px auto'
  },
  podiumName1: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1E293B',
    margin: '4px 0'
  },
  podiumName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1E293B',
    margin: '4px 0'
  },
  podiumScore1: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E3A5F'
  },
  podiumScore: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E3A5F'
  },
  podiumBreakdown1: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '4px'
  },
  podiumBreakdown: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '4px'
  },
  improvedBadge: {
    backgroundColor: '#FEF6EA',
    color: '#1E3A5F',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #F2A93B'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px'
  },
  tableTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  privacyNote: {
    fontSize: '12px',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '4px 10px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '14px 16px',
    fontSize: '12px',
    color: '#64748B',
    borderBottom: '2px solid #E2E8F0',
    fontWeight: '700'
  },
  trNormal: {
    borderBottom: '1px solid #F1F5F9'
  },
  trHighlight: {
    backgroundColor: '#EDF7F1',
    borderBottom: '1px solid #C4E5D1'
  },
  tdRank: {
    padding: '16px',
    fontSize: '14px'
  },
  tdName: {
    padding: '16px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1E293B'
  },
  tdMono: {
    fontFamily: 'var(--font-mono)',
    padding: '16px',
    fontSize: '14px',
    color: '#334155'
  },
  tdCombined: {
    fontFamily: 'var(--font-serif)',
    padding: '16px',
    fontSize: '18px',
    color: '#1E3A5F',
    fontWeight: '800'
  },
  tdGrowth: {
    padding: '16px',
    fontSize: '14px'
  },
  percentSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#64748B'
  },
  youBadge: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '6px'
  },
  mostImprovedPill: {
    backgroundColor: '#FEF6EA',
    color: '#1E3A5F',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    border: '1px solid #F2A93B'
  },
  greenText: {
    fontFamily: 'var(--font-mono)',
    color: '#3F8F5F',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center'
  }
};
