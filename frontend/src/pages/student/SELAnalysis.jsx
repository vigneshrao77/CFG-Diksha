import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mic, Square, RotateCcw, ArrowRight, CheckCircle2, 
  Sparkles, AlertCircle, Calendar, Brain, ShieldCheck, 
  CheckCircle, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { studentService } from '../../services/studentService';

export default function SELAnalysis() {
  const navigate = useNavigate();

  // Current Assessment Month (YYYY-MM)
  const currentMonth = '2026-08';
  const monthDisplay = 'August 2026';

  // State
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedReport, setCompletedReport] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Per-Question Evaluations
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Refs for media recording
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Initial Load: Check if current month's assessment is already completed
  useEffect(() => {
    checkMonthlyStatus();
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (e) {}
    }
  };

  const checkMonthlyStatus = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Check local storage key for instant persistence
      const localCompleted = localStorage.getItem(`diksha_sel_completed_${currentMonth}`);
      if (localCompleted === 'true') {
        setIsCompleted(true);
        setLoading(false);
        return;
      }

      // 2. Backend Status Check for this month
      const statusRes = await studentService.getMonthlyAssessmentStatus(currentMonth);
      
      if (statusRes && statusRes.isCompleted) {
        localStorage.setItem(`diksha_sel_completed_${currentMonth}`, 'true');
        setIsCompleted(true);
        setCompletedReport(statusRes.report);
        setLoading(false);
        return;
      }

      // 3. If not yet completed, generate fresh dynamic questions via Gemini AI
      const qRes = await studentService.generate12VoiceQuestions(currentMonth);
      if (qRes && qRes.isCompleted) {
        localStorage.setItem(`diksha_sel_completed_${currentMonth}`, 'true');
        setIsCompleted(true);
        setCompletedReport(qRes.report);
      } else if (qRes && qRes.assessment) {
        setAssessment(qRes.assessment);
      }
    } catch (err) {
      console.warn('Status check warning:', err.message);
      setErrorMessage('Failed to initialize assessment. Please refresh the page.');
    }
    setLoading(false);
  };

  // Timer counter
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Start Audio Recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setCurrentEvaluation(null);
    setErrorMessage('');
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 100) {
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        } else {
          setErrorMessage('Microphone recorded no sound. Please check your mic and try again.');
        }
      };

      recorder.start(500);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err.message);
      setErrorMessage('Microphone access denied or unavailable. Please enable microphone permissions.');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Discard & Record Again
  const discardRecording = () => {
    cleanupAudio();
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setCurrentEvaluation(null);
    setErrorMessage('');
    setSeconds(0);
  };

  // Submit Spoken Answer -> Groq Whisper STT + Gemini 4-Heading AI Evaluation
  const submitAnswer = async () => {
    setErrorMessage('');

    if (!audioBlob || audioBlob.size === 0) {
      setErrorMessage('Please record your answer before submitting.');
      return;
    }

    setTranscribing(true);

    let audioBase64 = '';
    try {
      const reader = new FileReader();
      audioBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to encode audio file'));
        reader.readAsDataURL(audioBlob);
      });
    } catch (e) {
      setErrorMessage('Unable to process recording. Please try recording again.');
      setTranscribing(false);
      return;
    }

    // 1. Groq Whisper STT
    const sttRes = await studentService.transcribeGroqWhisper(audioBase64);
    if (!sttRes || !sttRes.success || !sttRes.transcript) {
      setErrorMessage(sttRes?.message || 'Unable to transcribe your recording. Please try recording again.');
      setTranscribing(false);
      return;
    }

    const finalTranscript = sttRes.transcript.trim();
    setTranscript(finalTranscript);
    setTranscribing(false);

    // 2. Gemini Live Voice Evaluation with 4 Headings
    setAnalyzing(true);
    const questions = assessment?.questions || [];
    const currentQ = questions[currentIndex] || {};

    const evalRes = await studentService.analyzeVoiceResponse(
      currentQ.id || currentIndex + 1,
      currentQ.question || '',
      currentQ.dimension || 'Self-Awareness',
      finalTranscript
    );

    if (evalRes && evalRes.success && evalRes.analysis) {
      const formattedEval = {
        ...evalRes.analysis,
        questionId: currentQ.id || currentIndex + 1,
        question: currentQ.question,
        dimension: currentQ.dimension,
        transcript: finalTranscript
      };
      setCurrentEvaluation(formattedEval);
      setEvaluations(prev => [...prev, formattedEval]);
    } else {
      setErrorMessage('Unable to evaluate response. Please try submitting again.');
    }
    setAnalyzing(false);
  };

  // Advance to Next Question or Complete Assessment
  const handleNextQuestion = async () => {
    cleanupAudio();
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setCurrentEvaluation(null);
    setErrorMessage('');
    setSeconds(0);

    const questions = assessment?.questions || [];
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Final Question Answered -> Submit Report to Database & Mark Completed
      setSubmittingReport(true);
      const reportRes = await studentService.submitVoiceSELReport(evaluations, currentMonth);
      localStorage.setItem(`diksha_sel_completed_${currentMonth}`, 'true');
      setIsCompleted(true);
      if (reportRes && reportRes.success) {
        setCompletedReport(reportRes.report);
      }
      setSubmittingReport(false);
    }
  };

  if (loading || submittingReport) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1E3A5F', fontWeight: 700, fontFamily: 'var(--font-sans)', marginTop: '16px' }}>
          {submittingReport ? 'Finalizing Monthly SEL Assessment...' : 'Checking Monthly Assessment Status...'}
        </p>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {submittingReport ? 'Saving results and synchronizing My Progress dashboard' : 'Please wait a moment'}
        </span>
      </div>
    );
  }

  // =============================================================
  // 1. ALREADY COMPLETED STATE (PREVENT RETAKING SAME MONTH)
  // =============================================================
  if (isCompleted) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.completionBannerCard}>
          <div style={styles.iconCircleSuccess}>
            <CheckCircle2 size={40} color="#3F8F5F" />
          </div>

          <span style={styles.badgeCompleted}>
            <ShieldCheck size={14} color="#3F8F5F" /> ASSESSMENT RECORDED
          </span>

          <h1 style={styles.completionHeading}>
            SEL Analysis test has already been taken for this month.
          </h1>

          <p style={styles.completionSub}>
            You have already completed your official Social-Emotional Learning assessment for <strong>{monthDisplay} ({currentMonth})</strong>. 
            To maintain reliable historical growth tracking, only one SEL Analysis can be taken per calendar month.
          </p>

          {/* Quick Summary Pill */}
          <div style={styles.summaryPillRow}>
            <div style={styles.summaryPill}>
              <span style={styles.pillLabel}>Assessment Period:</span>
              <strong style={styles.pillVal}>{monthDisplay}</strong>
            </div>
            <div style={styles.summaryPill}>
              <span style={styles.pillLabel}>Status:</span>
              <strong style={{ ...styles.pillVal, color: '#3F8F5F' }}>✓ Completed</strong>
            </div>
            {completedReport?.overallSELScore && (
              <div style={styles.summaryPill}>
                <span style={styles.pillLabel}>Overall Score:</span>
                <strong style={styles.pillVal}>{completedReport.overallSELScore}%</strong>
              </div>
            )}
          </div>

          {/* Call-to-action directing to My Progress */}
          <div style={{ marginTop: '28px' }}>
            <button 
              onClick={() => navigate('/student/progress')}
              style={styles.btnGoToProgress}
            >
              View Full Performance & Reports in My Progress
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={styles.infoFooterText}>
            When <strong>September 2026</strong> begins, your new monthly SEL assessment will automatically become available.
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // 2. ACTIVE QUESTIONNAIRE (ONLY WHEN NOT COMPLETED)
  // =============================================================
  const questions = assessment?.questions || [];
  const currentQ = questions[currentIndex] || {};
  const totalQ = questions.length || 6;

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={styles.badge}>
              <Sparkles size={14} color="#1E3A5F" /> MONTHLY VOICE SEL ASSESSMENT ({currentMonth})
            </div>
            <h1 style={styles.title}>Monthly AI SEL Voice Assessment</h1>
            <p style={styles.subtitle}>
              Speak your authentic thoughts into the microphone. Gemini AI and Groq Whisper evaluate each response across 4 core areas.
            </p>
          </div>

          <div style={styles.qCounterBadge}>
            Question {currentIndex + 1} of {totalQ}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.statusBarWrapper}>
        <div 
          style={{
            ...styles.statusBarFill,
            width: `${((currentIndex + 1) / totalQ) * 100}%`
          }}
        />
      </div>

      {/* Scenario Question Card */}
      <div style={styles.card}>
        <div style={styles.dimensionTagRow}>
          <span style={styles.dimensionBadge}>{currentQ?.dimension || 'Self-Awareness'}</span>
        </div>
        <h2 style={styles.questionText}>"{currentQ?.question}"</h2>
        <div style={styles.focusText}>
          <span style={{ fontWeight: '700' }}>Evaluation Focus:</span> {currentQ?.assessmentFocus || 'Reflective thinking and situational awareness.'}
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

        {/* Audio Playback Controls */}
        {audioUrl && (
          <div style={styles.audioPlaybackRow}>
            <audio key={audioUrl} src={audioUrl} controls preload="auto" style={{ height: '36px', flex: 1 }} />
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
            style={styles.transcriptBox}
          />
        </div>

        {/* Submit Button */}
        <div style={styles.actionRow}>
          <button
            onClick={submitAnswer}
            disabled={!audioBlob || transcribing || analyzing}
            style={!audioBlob || transcribing || analyzing ? styles.btnDisabled : styles.btnSubmit}
          >
            {transcribing ? 'Transcribing Speech...' : analyzing ? 'Evaluating with Gemini AI...' : 'Submit Answer'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Per-Question 4-Heading AI Evaluation Results Card */}
      {currentEvaluation && (
        <div style={{ ...styles.card, borderLeft: '4px solid #3F8F5F', backgroundColor: '#F4FAF6' }}>
          <div style={styles.evalHeader}>
            <CheckCircle2 size={24} color="#3F8F5F" />
            <div>
              <h3 style={styles.evalTitle}>Evidence-Based AI Evaluation</h3>
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
            {currentEvaluation.analysis?.depthLevel && (
              <div style={styles.evalDepthBadge}>
                Depth: <strong style={{ textTransform: 'capitalize' }}>{currentEvaluation.analysis.depthLevel}</strong>
              </div>
            )}
          </div>

          {/* 4 MANDATORY HEADINGS */}
          <div style={styles.fourHeadingsGrid}>
            <div style={styles.headingBox}>
              <div style={styles.headingTitleSEL}>🧠 SEL Evaluation</div>
              <p style={styles.headingText}>
                {currentEvaluation.selAnalysis || currentEvaluation.feedback}
              </p>
            </div>

            <div style={styles.headingBox}>
              <div style={styles.headingTitleComm}>🗣️ Communication</div>
              <p style={styles.headingText}>
                {currentEvaluation.communicationAnalysis || 'Clear articulation with structured conversational flow.'}
              </p>
            </div>

            <div style={styles.headingBox}>
              <div style={styles.headingTitleStr}>🌟 Strengths</div>
              <ul style={styles.bulletList}>
                {(currentEvaluation.strengths || ['Directly answered the question.']).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={styles.headingBox}>
              <div style={styles.headingTitleImp}>📈 Improvements</div>
              <ul style={styles.bulletList}>
                {(currentEvaluation.improvements || currentEvaluation.areasForImprovement || ['Include step-by-step reasoning.']).map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={handleNextQuestion} style={styles.btnPrimary}>
              {currentIndex === totalQ - 1 ? 'Complete Monthly Assessment' : 'Next Question'}
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
    maxWidth: '920px',
    margin: '0 auto'
  },
  loadingContainer: {
    padding: '80px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #1E3A5F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  completionBannerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '48px 36px',
    textAlign: 'center',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)',
    marginTop: '20px'
  },
  iconCircleSuccess: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#EDF7F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '2px solid #C4E5D1'
  },
  badgeCompleted: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '800',
    color: '#3F8F5F',
    backgroundColor: '#EDF7F1',
    padding: '4px 12px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px'
  },
  completionHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '26px',
    fontWeight: '800',
    color: '#1E293B',
    margin: '0 0 12px 0'
  },
  completionSub: {
    fontSize: '14px',
    color: '#64748B',
    maxWidth: '600px',
    margin: '0 auto 24px auto',
    lineHeight: '1.6'
  },
  summaryPillRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },
  summaryPill: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  pillLabel: {
    color: '#64748B',
    fontWeight: '500'
  },
  pillVal: {
    color: '#1E293B',
    fontWeight: '700'
  },
  btnGoToProgress: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 16px rgba(30, 58, 95, 0.25)',
    transition: 'all 0.2s ease'
  },
  infoFooterText: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '20px'
  },
  header: {
    marginBottom: '20px'
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
    fontSize: '30px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '4px'
  },
  qCounterBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #CBDCEE'
  },
  statusBarWrapper: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E2E8F0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  statusBarFill: {
    height: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: 'var(--shadow-card)',
    marginBottom: '24px'
  },
  dimensionTagRow: {
    marginBottom: '12px'
  },
  dimensionBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A5F',
    backgroundColor: '#EBF2FA',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  questionText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: '1.4',
    margin: '0 0 12px 0'
  },
  focusText: {
    fontSize: '13px',
    color: '#64748B',
    borderLeft: '2px solid #F2A93B',
    paddingLeft: '10px'
  },
  recorderControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  btnStartRecord: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnStopRecord: {
    backgroundColor: '#C1473A',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  timerDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E293B'
  },
  recordingPulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#C1473A',
    animation: 'pulse 1.2s infinite ease-in-out'
  },
  audioPlaybackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#F8FAFC',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    marginBottom: '16px'
  },
  btnDiscard: {
    backgroundColor: '#ffffff',
    border: '1px solid #CBD5E1',
    color: '#64748B',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FDF2F0',
    border: '1px solid #F8D7DA',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    marginBottom: '6px'
  },
  transcriptBox: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'var(--font-sans)',
    resize: 'none'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px'
  },
  btnSubmit: {
    backgroundColor: '#F2A93B',
    color: '#1E3A5F',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
    color: '#94A3B8',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  evalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  evalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0
  },
  evalScoreRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '14px'
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
  evalDepthBadge: {
    backgroundColor: '#FEF6EA',
    border: '1px solid #F2A93B',
    color: '#B45309',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },
  fourHeadingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '10px'
  },
  headingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 14px',
    border: '1px solid #E2E8F0'
  },
  headingTitleSEL: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#1E3A5F',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  headingTitleComm: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#6366F1',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  headingTitleStr: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#3F8F5F',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  headingTitleImp: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  headingText: {
    margin: 0,
    fontSize: '12px',
    color: '#334155',
    lineHeight: '1.5'
  },
  bulletList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#334155',
    lineHeight: '1.4'
  },
  btnPrimary: {
    backgroundColor: '#1E3A5F',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
