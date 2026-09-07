import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    studentService.getTestById(id).then(res => {
      if (res && res.success) {
        setTest(res.test);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#1E3A5F' }}>Loading Test Interface...</div>;
  }

  const questions = test?.questions || [];
  const currentQ = questions[currentIndex];

  const handleOptionSelect = (qId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const handleSubmit = async () => {
    const res = await studentService.submitTest(id, answers);
    if (res && res.success) {
      setSubmitted(res);
    }
  };

  if (submitted) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.resultCard}>
          <CheckCircle2 size={48} color="#3F8F5F" />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0', color: '#1E293B' }}>Test Submitted Successfully!</h2>
          <p style={{ color: '#64748B' }}>Your test evaluation report is ready.</p>

          <div style={styles.scoreCircle}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: '800', color: '#1E3A5F' }}>{submitted.score}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748B' }}>({submitted.percentage}%)</span>
          </div>

          <p style={styles.feedback}>{submitted.feedback}</p>

          <button onClick={() => navigate('/student/tests')} style={styles.btnPrimary}>
            Return to Tests List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.headerRow}>
        <h1 style={styles.testTitle}>{test.title}</h1>
        <div style={styles.timerBadge}>
          <Clock size={16} /> <span style={{ fontFamily: 'var(--font-mono)' }}>28:40</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.qNum}>Question {currentIndex + 1} of {questions.length}</div>
        <h2 style={styles.qText}>{currentQ.question}</h2>

        <div style={styles.optionsList}>
          {currentQ.options.map(opt => {
            const isSelected = answers[currentQ.id] === opt.id;
            return (
              <button 
                key={opt.id} 
                onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                style={isSelected ? styles.optSelected : styles.optNormal}
              >
                <span style={isSelected ? styles.optIdSelected : styles.optIdNormal}>{opt.id}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.footerRow}>
        <button 
          disabled={currentIndex === 0} 
          onClick={() => setCurrentIndex(currentIndex - 1)}
          style={currentIndex === 0 ? styles.btnDisabled : styles.btnSecondary}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button onClick={handleSubmit} style={styles.btnMarigold}>
            Submit Test
          </button>
        ) : (
          <button onClick={() => setCurrentIndex(currentIndex + 1)} style={styles.btnPrimary}>
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '850px',
    margin: '0 auto'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  testTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  timerBadge: {
    backgroundColor: '#FEF6EA',
    color: '#1E3A5F',
    padding: '6px 14px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid #F2A93B'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    border: '1px solid #E2E8F0',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-card)'
  },
  qNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: '8px'
  },
  qText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '20px'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optNormal: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F7F7F5',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#334155'
  },
  optSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '2px solid #1E3A5F',
    backgroundColor: '#EBF2FA',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1E3A5F',
    fontWeight: '700'
  },
  optIdNormal: {
    fontFamily: 'var(--font-mono)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optIdSelected: {
    fontFamily: 'var(--font-mono)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  btnPrimary: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  btnMarigold: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(242, 169, 59, 0.3)'
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    color: '#475569',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  btnDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    cursor: 'not-allowed'
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid #E2E8F0',
    maxWidth: '500px',
    margin: '40px auto',
    boxShadow: 'var(--shadow-card)'
  },
  scoreCircle: {
    margin: '24px auto',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#EBF2FA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #1E3A5F'
  },
  feedback: {
    fontSize: '14px',
    color: '#334155',
    marginBottom: '24px'
  }
};
