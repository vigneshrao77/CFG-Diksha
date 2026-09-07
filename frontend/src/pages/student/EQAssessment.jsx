import React, { useEffect, useState } from 'react';
import { 
  Brain, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, 
  RotateCcw, Award, ShieldAlert, BarChart3, TrendingUp 
} from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function EQAssessment() {
  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    studentService.generateSELAssessment().then(res => {
      if (res && res.success) {
        setAssessment(res.assessment);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1E3A5F', fontWeight: 700 }}>Generating Scenario-Based SEL Assessment via AI...</p>
        <span style={{ fontSize: '12px', color: '#64748B' }}>Constructing 30 scenarios across 6 core competencies</span>
      </div>
    );
  }

  const questions = assessment?.questions || [];
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const isCompleted = Object.keys(selectedAnswers).length === totalQ;

  const handleSelectOption = (q, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        dimension: q.dimension,
        optionId: option.id,
        selectedScore: option.score
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersList = Object.values(selectedAnswers);
    const res = await studentService.submitSELAssessment(answersList, '2026-08');
    if (res && res.success) {
      setResult(res);
    }
    setSubmitting(false);
  };

  // Result Screen
  if (result) {
    const dimList = [
      { name: 'Self-Awareness', key: 'selfAwareness', score: result.dimensions?.selfAwareness || 80, color: '#1E3A5F' },
      { name: 'Self-Management', key: 'selfManagement', score: result.dimensions?.selfManagement || 75, color: '#3F8F5F' },
      { name: 'Empathy / Social Awareness', key: 'empathy', score: result.dimensions?.empathy || 85, color: '#F2A93B' },
      { name: 'Communication', key: 'communication', score: result.dimensions?.communication || 90, color: '#1E3A5F' },
      { name: 'Teamwork / Relationship Skills', key: 'teamwork', score: result.dimensions?.teamwork || 80, color: '#3F8F5F' },
      { name: 'Responsible Decision-Making', key: 'responsibleDecisionMaking', score: result.dimensions?.responsibleDecisionMaking || 85, color: '#1E3A5F' }
    ];

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.resultHeaderCard}>
          <div style={styles.resultIconCircle}>
            <Award size={36} color="#1E3A5F" />
          </div>
          <h1 style={styles.resultTitle}>SEL Assessment Completed!</h1>
          <p style={styles.resultSub}>Your monthly Social-Emotional Learning profile has been saved.</p>
          
          <div style={styles.overallScoreCircle}>
            <div style={styles.scoreNum}>{result.percentage}%</div>
            <div style={styles.scoreSubLabel}>{result.rawScore} / {result.maxScore} Total Score</div>
          </div>

          <div style={styles.growthBadge}>
            <TrendingUp size={16} /> Growth vs Prior Month: {result.summary?.improvement || '+5%'}
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: '24px' }}>
          <h3 style={styles.sectionHeading}>Competency Dimension Breakdown</h3>
          <div style={styles.dimGrid}>
            {dimList.map(d => (
              <div key={d.key} style={styles.dimCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={styles.dimName}>{d.name}</span>
                  <span style={{ fontWeight: 800, color: d.color, fontFamily: 'var(--font-mono)' }}>{d.score}%</span>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.bar, width: `${d.score}%`, backgroundColor: d.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Header Bar */}
      <div style={styles.quizHeader}>
        <div>
          <div style={styles.badge}>
            <Brain size={14} /> MONTHLY SEL ASSESSMENT
          </div>
          <h1 style={styles.title}>{assessment?.assessmentTitle || 'Social-Emotional Learning Assessment'}</h1>
        </div>
        <div style={styles.progressCounter}>
          Question <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentIndex + 1}</strong> of <span style={{ fontFamily: 'var(--font-mono)' }}>{totalQ}</span>
        </div>
      </div>

      {/* Top Progress Bar */}
      <div style={styles.topTrack}>
        <div style={{ ...styles.topBar, width: `${((currentIndex + 1) / totalQ) * 100}%` }}></div>
      </div>

      {/* Question Card */}
      <div style={styles.card}>
        <div style={styles.questionCategoryBadge}>
          {currentQ?.dimension || 'SEL Scenario'}
        </div>
        <h2 style={styles.questionText}>{currentQ?.question}</h2>

        <div style={styles.optionsList}>
          {currentQ?.options?.map(opt => {
            const isSelected = selectedAnswers[currentQ.id]?.optionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(currentQ, opt)}
                style={isSelected ? styles.optionSelected : styles.optionNormal}
              >
                <span style={isSelected ? styles.optIdSelected : styles.optIdNormal}>{opt.id}</span>
                <span style={styles.optText}>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={styles.navFooter}>
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          style={currentIndex === 0 ? styles.btnDisabled : styles.btnSecondary}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <div style={styles.answeredStatus}>
          Answered: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Object.keys(selectedAnswers).length}</strong> / {totalQ}
        </div>

        {currentIndex === totalQ - 1 ? (
          <button 
            onClick={handleSubmit} 
            disabled={!isCompleted || submitting}
            style={!isCompleted || submitting ? styles.btnDisabled : styles.btnMarigold}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button 
            onClick={handleNext} 
            style={styles.btnPrimary}
          >
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  loadingContainer: {
    padding: '80px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
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
    fontSize: '26px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  progressCounter: {
    fontSize: '14px',
    color: '#64748B'
  },
  topTrack: {
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  topBar: {
    height: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)',
    marginBottom: '24px'
  },
  questionCategoryBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '4px 12px',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  questionText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: '1.4',
    marginBottom: '24px'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  optionNormal: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F7F7F5',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '15px',
    color: '#334155'
  },
  optionSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    borderRadius: '8px',
    border: '2px solid #1E3A5F',
    backgroundColor: '#EBF2FA',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#1E3A5F',
    fontWeight: '700'
  },
  optIdNormal: {
    fontFamily: 'var(--font-mono)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  optIdSelected: {
    fontFamily: 'var(--font-mono)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  optText: {
    flex: 1
  },
  navFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  btnPrimary: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  /* 🔘 Marigold submit button */
  btnMarigold: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(242, 169, 59, 0.3)'
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    color: '#475569',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'not-allowed',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  answeredStatus: {
    fontSize: '13px',
    color: '#64748B'
  },
  resultHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px 24px',
    textAlign: 'center',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)'
  },
  resultIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#EBF2FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto'
  },
  resultTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  resultSub: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '6px'
  },
  overallScoreCircle: {
    margin: '24px auto',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '6px solid #1E3A5F',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F5'
  },
  scoreNum: {
    fontFamily: 'var(--font-serif)',
    fontSize: '36px',
    fontWeight: '800',
    color: '#1E3A5F'
  },
  scoreSubLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600'
  },
  growthBadge: {
    backgroundColor: '#EDF7F1',
    color: '#3F8F5F',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  sectionHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: '16px'
  },
  dimGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  dimCard: {
    backgroundColor: '#F7F7F5',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0'
  },
  dimName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155'
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
  }
};
