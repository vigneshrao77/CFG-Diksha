import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, RotateCcw, Send, Sparkles, 
  Brain, Volume2, CheckCircle2, ShieldCheck, ArrowRight, 
  Award, TrendingUp, RefreshCw, AlertCircle
} from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function SELAnalysis() {
  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Processing & Answers State
  const [transcript, setTranscript] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]); // List of evaluations for all 12 questions

  // Final Report State
  const [submittingReport, setSubmittingReport] = useState(false);
  const [report, setReport] = useState(null);

  // Load 12 Questions
  useEffect(() => {
    studentService.generate12VoiceQuestions().then(res => {
      if (res && res.success) {
        setAssessment(res.assessment);
      }
      setLoading(false);
    });
  }, []);

  // Timer for Recording
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

  // Start Browser Microphone Recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setCurrentEvaluation(null);
    setErrorMessage('');
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop stream tracks ONLY inside onstop after chunks are flushed
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`[VoiceRecorder] Recording stopped | Audio blob size: ${blob.size} bytes | MIME: ${blob.type}`);

        setAudioBlob(blob);
        if (blob.size > 0) {
          setAudioUrl(URL.createObjectURL(blob));
        } else {
          console.warn('⚠️ Audio blob size is 0 bytes!');
          setErrorMessage('Microphone recorded 0 bytes of audio. Please try recording again.');
        }
      };

      // Start recording with 250ms timeslice to continuously collect audio chunks
      recorder.start(250);
      setIsRecording(true);
      console.log('[VoiceRecorder] Recording started');
    } catch (err) {
      console.error('[VoiceRecorder] Microphone access error:', err.message);
      setErrorMessage('Microphone access denied or unavailable. Please enable microphone permissions in your browser.');
    }
  };

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Discard & Record Again
  const discardRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setCurrentEvaluation(null);
    setErrorMessage('');
    setSeconds(0);
  };

  // Submit Answer -> Groq Whisper STT + Gemini Live AI Analysis
  const submitAnswer = async () => {
    setErrorMessage('');

    if (!audioBlob || audioBlob.size === 0) {
      setErrorMessage('Unable to transcribe your recording. Please try recording again.');
      return;
    }

    setTranscribing(true);

    let audioBase64 = null;
    try {
      const reader = new FileReader();
      audioBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert audio file'));
        reader.readAsDataURL(audioBlob);
      });
    } catch (e) {
      console.error('Error reading audio blob:', e.message);
      setErrorMessage('Unable to transcribe your recording. Please try recording again.');
      setTranscribing(false);
      return;
    }

    // Step 1: Groq + Whisper Speech-to-Text via Backend
    console.log('[Frontend] Sending audio blob (' + audioBlob.size + ' bytes) to Groq Whisper STT backend...');
    const sttRes = await studentService.transcribeGroqWhisper(audioBase64);

    if (!sttRes || !sttRes.success || !sttRes.transcript) {
      console.warn('[Frontend] Groq Whisper STT failed:', sttRes?.message);
      setErrorMessage(sttRes?.message || 'Unable to transcribe your recording. Please try recording again.');
      setTranscribing(false);
      return;
    }

    const finalTranscript = sttRes.transcript.trim();
    console.log('[Frontend] Groq Whisper STT Success:', finalTranscript);
    setTranscript(finalTranscript);
    setTranscribing(false);

    // Step 2: Gemini Live Voice Response Analysis
    setAnalyzing(true);
    const currentQ = assessment.questions[currentIndex];
    const evalRes = await studentService.analyzeVoiceResponse(
      currentQ.id,
      currentQ.question,
      currentQ.dimension,
      finalTranscript
    );

    if (evalRes && evalRes.success && evalRes.analysis) {
      setCurrentEvaluation(evalRes.analysis);
      setEvaluations(prev => [...prev, evalRes.analysis]);
    } else {
      setErrorMessage('Unable to evaluate response. Please try submitting again.');
    }
    setAnalyzing(false);
  };

  // Proceed to Next Question or Final Report
  const handleNextQuestion = async () => {
    if (currentIndex < (assessment?.questions?.length || 12) - 1) {
      setCurrentIndex(currentIndex + 1);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscript('');
      setCurrentEvaluation(null);
      setErrorMessage('');
      setSeconds(0);
    } else {
      // Final 12th Question -> Submit Report to Backend & MongoDB Atlas
      setSubmittingReport(true);
      const reportRes = await studentService.submitVoiceSELReport(evaluations, '2026-08');
      if (reportRes && reportRes.success) {
        setReport(reportRes.report);
      }
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1E3A5F', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Preparing AI SEL Voice Assessment...</p>
        <span style={{ fontSize: '12px', color: '#64748B' }}>Generating 12 open-ended scenario questions across 6 SEL dimensions</span>
      </div>
    );
  }

  const questions = assessment?.questions || [];
  const currentQ = questions[currentIndex];
  const totalQ = questions.length || 12;

  // -------------------------------------------------------------
  // FINAL PERSONALIZED STUDENT SEL REPORT SCREEN
  // -------------------------------------------------------------
  if (report) {
    const dimList = [
      { name: 'Self-Awareness', score: report.scores?.selfAwareness || 82, color: '#1E3A5F' },
      { name: 'Self-Management', score: report.scores?.selfManagement || 75, color: '#3F8F5F' },
      { name: 'Empathy / Social Awareness', score: report.scores?.empathy || 88, color: '#F2A93B' },
      { name: 'Communication', score: report.scores?.communication || 80, color: '#1E3A5F' },
      { name: 'Teamwork / Relationship Skills', score: report.scores?.teamwork || 90, color: '#3F8F5F' },
      { name: 'Responsible Decision-Making', score: report.scores?.decisionMaking || 78, color: '#1E3A5F' }
    ];

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.resultHeaderCard}>
          <div style={styles.resultIconCircle}>
            <Award size={38} color="#1E3A5F" />
          </div>
          <h1 style={styles.resultTitle}>SEL DEVELOPMENT REPORT</h1>
          <p style={styles.resultSub}>Comprehensive AI Voice-Based Social-Emotional Learning Evaluation</p>
          
          <div style={styles.scoreRow}>
            <div style={styles.overallScoreCircle}>
              <div style={styles.scoreNum}>{report.overallSELScore}%</div>
              <div style={styles.scoreSubLabel}>Overall SEL Development</div>
            </div>

            <div style={styles.overallScoreCircleComm}>
              <div style={styles.scoreNumComm}>{report.communicationScore}%</div>
              <div style={styles.scoreSubLabel}>Communication Score</div>
            </div>
          </div>

          {/* 📈 Growth Over Time Badge */}
          {report.growth && (
            <div style={styles.growthBadge}>
              <TrendingUp size={16} color="#3F8F5F" />
              <span>{report.growth.message}</span>
            </div>
          )}
        </div>

        {/* 6 Dimension Breakdown */}
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <h3 style={styles.sectionHeading}>Dimension Breakdown</h3>
          <div style={styles.dimGrid}>
            {dimList.map(d => (
              <div key={d.name} style={styles.dimCard}>
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

        {/* Strengths & Recommendations */}
        <div style={styles.reportGrid}>
          <div style={{ ...styles.card, borderLeft: '4px solid #3F8F5F' }}>
            <h4 style={{ ...styles.cardTitle, color: '#3F8F5F' }}>Key Strengths</h4>
            <ul style={styles.bulletList}>
              {report.strengths?.map((str, idx) => (
                <li key={idx} style={styles.bulletItem}><CheckCircle2 size={16} color="#3F8F5F" /> {str}</li>
              ))}
            </ul>
          </div>

          <div style={{ ...styles.card, borderLeft: '4px solid #1E3A5F' }}>
            <h4 style={{ ...styles.cardTitle, color: '#1E3A5F' }}>Recommendations</h4>
            <ul style={styles.bulletList}>
              {report.recommendations?.map((rec, idx) => (
                <li key={idx} style={styles.bulletItem}><Sparkles size={16} color="#F2A93B" /> {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // QUESTION DISPLAY & VOICE RECORDER SCREEN (1 TO 12)
  // -------------------------------------------------------------
  return (
    <div style={styles.pageWrapper}>
      {/* Header Bar */}
      <div style={styles.quizHeader}>
        <div>
          <div style={styles.badge}>
            <Brain size={14} color="#1E3A5F" /> VOICE SEL ASSESSMENT
          </div>
          <h1 style={styles.title}>{assessment?.assessmentTitle || 'AI SEL Voice Assessment'}</h1>
        </div>
        <div style={styles.progressCounter}>
          Question <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentIndex + 1}</strong> of <span style={{ fontFamily: 'var(--font-mono)' }}>{totalQ}</span>
        </div>
      </div>

      {/* Top Progress Bar */}
      <div style={styles.topTrack}>
        <div style={{ ...styles.topBar, width: `${((currentIndex + 1) / totalQ) * 100}%` }}></div>
      </div>

      {/* Scenario Question Card */}
      <div style={styles.card}>
        <div style={styles.questionCategoryBadge}>
          {currentQ?.dimension || 'SEL Scenario'}
        </div>
        <h2 style={styles.questionText}>"{currentQ?.question}"</h2>
        <div style={styles.focusText}>
          <span style={{ fontWeight: '700' }}>Evaluation Focus:</span> {currentQ?.assessmentFocus}
        </div>
      </div>

      {/* Microphone Voice Recorder Card */}
      <div style={styles.card}>
        <div style={styles.recorderControls}>
          {!isRecording ? (
            <button onClick={startRecording} style={styles.btnStartRecord}>
              <Mic size={20} /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} style={styles.btnStopRecord}>
              <Square size={20} /> Stop Recording
            </button>
          )}

          <div style={styles.timerDisplay}>
            {isRecording && <div style={styles.recordingPulse}></div>}
            <span style={{ fontFamily: 'var(--font-mono)' }}>00:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
        </div>

        {/* Audio Playback Controls if recorded */}
        {audioUrl && (
          <div style={styles.audioPlaybackRow}>
            <audio src={audioUrl} controls style={{ height: '36px', flex: 1 }} />
            <button onClick={discardRecording} style={styles.btnDiscard}>
              <RotateCcw size={14} /> Record Again
            </button>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="#C1473A" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C1473A' }}>{errorMessage}</span>
          </div>
        )}

        {/* Live Audio Transcript Box */}
        <div style={{ marginTop: '20px' }}>
          <label style={styles.inputLabel}>
            Groq Whisper STT Transcription:
          </label>
          <textarea
            value={transcript}
            readOnly
            placeholder="Click 'Start Recording', speak your answer out loud, click 'Stop Recording', and press 'Submit Answer' to transcribe with Groq Whisper..."
            rows={3}
            style={styles.textareaReadOnly}
          />
        </div>

        {/* Action Button: Submit Answer */}
        {audioBlob && !currentEvaluation && (
          <div style={styles.submitRow}>
            <button 
              onClick={submitAnswer} 
              disabled={transcribing || analyzing}
              style={transcribing || analyzing ? styles.btnDisabled : styles.btnMarigold}
            >
              {transcribing ? 'Converting Audio with Groq Whisper...' : analyzing ? 'Analyzing Response with Gemini AI...' : 'Submit Answer'}
              <Send size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Per-Question Gemini Evaluation Results */}
      {currentEvaluation && (
        <div style={{ ...styles.card, borderLeft: '4px solid #3F8F5F', backgroundColor: '#EDF7F1' }}>
          <div style={styles.evalHeader}>
            <CheckCircle2 size={24} color="#3F8F5F" />
            <div>
              <h3 style={styles.evalTitle}>Response Analyzed by Gemini AI</h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Target Dimension: {currentEvaluation.dimension}</span>
            </div>
          </div>

          <div style={styles.evalScoreRow}>
            <div style={styles.evalScoreBadge}>
              SEL Score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentEvaluation.selScore} / 10</strong>
            </div>
            <div style={styles.evalScoreBadgeComm}>
              Communication Score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentEvaluation.communicationScore} / 10</strong>
            </div>
          </div>

          <p style={styles.evalFeedback}>"{currentEvaluation.feedback}"</p>

          {currentEvaluation.speechIndicators && (
            <div style={styles.speechObsBox}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E3A5F' }}>Speech Delivery Indicator:</div>
              <span style={{ fontSize: '13px', color: '#475569' }}>{currentEvaluation.speechIndicators.observation}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={handleNextQuestion} style={styles.btnPrimary}>
              {currentIndex === totalQ - 1 ? 'Generate Final SEL Report' : 'Next Question'}
              <ArrowRight size={16} />
            </button>
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
    padding: '28px',
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
    marginBottom: '14px'
  },
  questionText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: '1.4',
    margin: '0 0 12px 0'
  },
  focusText: {
    fontSize: '13px',
    color: '#64748B'
  },
  recorderControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btnStartRecord: {
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
  btnStopRecord: {
    backgroundColor: '#C1473A',
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
  timerDisplay: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  recordingPulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#C1473A',
    animation: 'pulse 1s infinite'
  },
  audioPlaybackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    backgroundColor: '#F7F7F5',
    padding: '10px',
    borderRadius: '8px'
  },
  btnDiscard: {
    backgroundColor: '#ffffff',
    border: '1px solid #CBD5E1',
    color: '#475569',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  errorAlert: {
    marginTop: '16px',
    backgroundColor: '#FDF2F0',
    border: '1px solid #F87171',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px'
  },
  textareaReadOnly: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    fontSize: '14px',
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
    gap: '8px'
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
  evalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px'
  },
  evalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  evalScoreRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  evalScoreBadge: {
    backgroundColor: '#ffffff',
    border: '1px solid #C4E5D1',
    color: '#3F8F5F',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },
  evalScoreBadgeComm: {
    backgroundColor: '#ffffff',
    border: '1px solid #CBDCEE',
    color: '#1E3A5F',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },
  evalFeedback: {
    fontSize: '14px',
    color: '#334155',
    fontStyle: 'italic',
    margin: '0 0 12px 0'
  },
  speechObsBox: {
    backgroundColor: '#ffffff',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #CBDCEE'
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
    backgroundColor: '#FEF6EA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '2px solid #F2A93B'
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
  scoreRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    margin: '28px 0'
  },
  overallScoreCircle: {
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
  overallScoreCircleComm: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '6px solid #3F8F5F',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF7F1'
  },
  scoreNum: {
    fontFamily: 'var(--font-serif)',
    fontSize: '36px',
    fontWeight: '800',
    color: '#1E3A5F'
  },
  scoreNumComm: {
    fontFamily: 'var(--font-serif)',
    fontSize: '36px',
    fontWeight: '800',
    color: '#3F8F5F'
  },
  scoreSubLabel: {
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
    gap: '8px'
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
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  },
  bulletList: {
    listStyle: 'none',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  bulletItem: {
    fontSize: '14px',
    color: '#334155',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  }
};
