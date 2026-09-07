import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, RotateCcw, Send, Sparkles, 
  MessageSquare, Brain, Volume2, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { studentService } from '../../services/studentService';

const PROMPTS = [
  "Tell us about a time when you helped someone in school or in your community.",
  "Describe a situation where you had to work with someone you disagreed with.",
  "Tell us about a challenge you faced during a team project and how you handled it.",
  "Describe how you respond when a friend or classmate is feeling down."
];

export default function CommunicationAssessment() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const timerRef = useRef(null);
  const currentPrompt = PROMPTS[promptIndex];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setSeconds(0);
      setTranscript('');
      setAnalysisResult(null);
    } else {
      setIsRecording(false);
      const sampleTranscripts = [
        "In our science fair project, my partner wanted to use a different experiment setup. Instead of arguing, I listened to their perspective, we tested both ideas on a small scale, and integrated the best parts of both into our final presentation.",
        "During sports day, a classmate was feeling left out because they weren't selected for the relay. I invited them to join our strategy team and cheer together, which made them feel valued and happy.",
        "When preparing for the annual debate competition, I felt very nervous about public speaking. I practiced in front of my mirror, sought feedback from my teacher, and focused on breathing calmly before walking up to the podium."
      ];
      setTranscript(sampleTranscripts[promptIndex % sampleTranscripts.length]);
    }
  };

  const handleNextPrompt = () => {
    setPromptIndex((promptIndex + 1) % PROMPTS.length);
    setTranscript('');
    setAnalysisResult(null);
    setSeconds(0);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setAnalyzing(true);
    await studentService.transcribeAudio(transcript);
    const res = await studentService.analyzeCommunication(transcript, currentPrompt);
    if (res && res.success) {
      setAnalysisResult(res.analysis);
    }
    setAnalyzing(false);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>
          <MessageSquare size={14} color="#1E3A5F" /> SPEECH & VERBAL SEL ASSESSMENT
        </div>
        <h1 style={styles.title}>Communication Analysis</h1>
        <p style={styles.subtitle}>
          Express your thoughts naturally in response to scenario prompts. Powered by Azure Speech-to-Text & AI analysis.
        </p>
      </div>

      {/* Prompt Card */}
      <div style={styles.card}>
        <div style={styles.promptHeader}>
          <span style={styles.promptTag}>Scenario Prompt #{promptIndex + 1}</span>
          <button onClick={handleNextPrompt} style={styles.nextPromptBtn}>
            <RotateCcw size={14} /> New Prompt
          </button>
        </div>
        <h2 style={styles.promptText}>"{currentPrompt}"</h2>
      </div>

      {/* Audio Recorder Interface */}
      <div style={styles.card}>
        <div style={styles.recorderControls}>
          <button 
            onClick={handleToggleRecording} 
            style={isRecording ? styles.btnStopRecord : styles.btnStartRecord}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop Recording' : 'Start Speaking'}
          </button>

          <div style={styles.timerDisplay}>
            {isRecording && <div style={styles.recordingPulse}></div>}
            <span style={{ fontFamily: 'var(--font-mono)' }}>00:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
        </div>

        {/* Transcript Box */}
        <div style={{ marginTop: '24px' }}>
          <label style={styles.inputLabel}>Live Audio Transcript:</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click 'Start Speaking' to record your response..."
            rows={4}
            style={styles.textarea}
          />
        </div>

        {transcript && (
          <div style={styles.submitRow}>
            {/* 🔘 Marigold Submit action */}
            <button 
              onClick={handleAnalyze} 
              disabled={analyzing}
              style={analyzing ? styles.btnDisabled : styles.btnMarigold}
            >
              {analyzing ? 'Analyzing Speech with AI...' : 'Submit & Analyze Speech'}
              <Send size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Analysis Result Display */}
      {analysisResult && (
        <div style={{ ...styles.card, borderLeft: '4px solid #3F8F5F', backgroundColor: '#EDF7F1' }}>
          <div style={styles.resultHeader}>
            <div style={styles.resultIcon}>
              <Brain size={24} color="#1E3A5F" />
            </div>
            <div>
              <h3 style={styles.resultTitle}>Communication & SEL Feedback</h3>
              <p style={styles.resultSub}>Speech analysis score breakdown</p>
            </div>
          </div>

          <div style={styles.scoresGrid}>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Verbal Expression</span>
              <span style={styles.scoreVal}>{analysisResult.communication}%</span>
            </div>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Empathy & Perspective</span>
              <span style={styles.scoreVal}>{analysisResult.empathy}%</span>
            </div>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Self-Awareness</span>
              <span style={styles.scoreVal}>{analysisResult.selfAwareness}%</span>
            </div>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Self-Management</span>
              <span style={styles.scoreVal}>{analysisResult.selfManagement}%</span>
            </div>
          </div>

          <div style={styles.feedbackBox}>
            <div style={{ fontWeight: '700', color: '#1E3A5F', marginBottom: '4px', fontFamily: 'var(--font-serif)' }}>AI Encouragement & Feedback:</div>
            <p style={{ color: '#334155', margin: 0, fontSize: '14px', lineHeight: '1.5', fontStyle: 'italic' }}>"{analysisResult.feedback}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    padding: '32px',
    maxWidth: '900px',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)',
    marginBottom: '24px'
  },
  promptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  promptTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  nextPromptBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#1E3A5F',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  promptText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E293B',
    margin: 0,
    lineHeight: '1.4'
  },
  recorderControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btnStartRecord: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px'
  },
  btnStopRecord: {
    backgroundColor: '#C1473A',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px'
  },
  timerDisplay: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  recordingPulse: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#C1473A',
    animation: 'pulse 1s infinite'
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '15px',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px'
  },
  /* 🔘 Marigold Submit action */
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
  btnDisabled: {
    backgroundColor: '#94A3B8',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'not-allowed',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px'
  },
  resultIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    backgroundColor: '#EBF2FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resultTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  resultSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #CBDCEE',
    textAlign: 'center'
  },
  scoreLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600'
  },
  scoreVal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1E3A5F'
  },
  feedbackBox: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #CBDCEE'
  }
};
