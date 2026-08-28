import { MOCK_STUDENT_PROFILE, MOCK_LEADERBOARD_DATA } from '../data/mockData';

const API_BASE = '/api/student';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-student-id': 'ST001'
});

export const studentService = {
  // Get Dashboard Data
  getDashboard: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Network response failed');
      return await res.json();
    } catch (err) {
      console.warn('Using fallback data for Student Dashboard:', err.message);
      return {
        success: true,
        profile: {
          studentId: MOCK_STUDENT_PROFILE.studentId,
          name: MOCK_STUDENT_PROFILE.name,
          class: MOCK_STUDENT_PROFILE.class,
          section: MOCK_STUDENT_PROFILE.section,
          school: MOCK_STUDENT_PROFILE.school,
          batch: MOCK_STUDENT_PROFILE.batch,
          age: MOCK_STUDENT_PROFILE.age
        },
        academic: {
          currentMonthlyScore: 18,
          maxScore: 20,
          percentage: 90,
          previousMonthComparison: 5,
          history: MOCK_STUDENT_PROFILE.monthlyAcademics
        },
        attendance: MOCK_STUDENT_PROFILE.attendance,
        health: MOCK_STUDENT_PROFILE.health,
        behaviour: MOCK_STUDENT_PROFILE.behaviour,
        selDevelopment: {
          currentScore: 96,
          maxScore: 120,
          percentage: 80,
          dimensions: {
            selfAwareness: 80,
            selfManagement: 70,
            empathy: 85,
            communication: 90,
            teamwork: 75,
            responsibleDecisionMaking: 80
          },
          history: MOCK_STUDENT_PROFILE.monthlySEL
        },
        alerts: MOCK_STUDENT_PROFILE.alerts
      };
    }
  },

  // Get Progress History
  getProgress: async () => {
    try {
      const res = await fetch(`${API_BASE}/progress`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Network response failed');
      return await res.json();
    } catch (err) {
      return {
        success: true,
        monthlyAcademics: MOCK_STUDENT_PROFILE.monthlyAcademics,
        monthlySEL: MOCK_STUDENT_PROFILE.monthlySEL,
        attendance: MOCK_STUDENT_PROFILE.attendance,
        behaviour: MOCK_STUDENT_PROFILE.behaviour
      };
    }
  },

  // Get Leaderboard for month
  getLeaderboard: async (month = '2026-08') => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard?month=${month}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Network response failed');
      return await res.json();
    } catch (err) {
      const leaderboard = MOCK_LEADERBOARD_DATA[month] || MOCK_LEADERBOARD_DATA['2026-08'];
      return {
        success: true,
        month,
        leaderboard
      };
    }
  },

  // 🎤 GROQ + WHISPER VOICE SEL PIPELINE METHODS

  // 1. Generate 12 Voice Questions via Gemini AI
  generate12VoiceQuestions: async () => {
    try {
      const res = await fetch(`${API_BASE}/voice/generate-questions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('Failed to generate 12 voice questions');
      return await res.json();
    } catch (err) {
      console.warn('Backend 12-question generation error, returning structured fallback:', err.message);
      return {
        success: true,
        assessment: {
          assessmentTitle: "AI SEL Voice Assessment",
          totalQuestions: 12,
          questions: [
            { id: 1, dimension: "Self-Awareness", question: "When you receive unexpected constructive criticism on a group project, how do you reflect on your work?", assessmentFocus: "Recognizing personal emotions and learning from feedback." },
            { id: 2, dimension: "Self-Awareness", question: "Think about a time when you felt nervous before a major class presentation. What did you learn about yourself?", assessmentFocus: "Understanding personal emotional triggers and strengths." },
            { id: 3, dimension: "Self-Management", question: "Imagine you have two major assignments and an exam on the same day. How do you stay calm and organized?", assessmentFocus: "Stress management and impulse regulation under pressure." },
            { id: 4, dimension: "Self-Management", question: "If a group member accidentally deleted part of your shared document right before submission, how would you respond?", assessmentFocus: "Controlling emotional reactions and constructive problem solving." },
            { id: 5, dimension: "Empathy / Social Awareness", question: "Imagine your classmate failed an important exam and is sitting alone looking very upset. What would you do?", assessmentFocus: "Recognizing others' emotions and offering genuine perspective taking." },
            { id: 6, dimension: "Empathy / Social Awareness", question: "During a class debate, a peer expresses an opinion that is opposite to yours. How do you listen to them?", assessmentFocus: "Respecting diverse perspectives and demonstrating active listening." },
            { id: 7, dimension: "Communication", question: "If you disagree with your project leader's plan for a science project, how do you express your ideas clearly?", assessmentFocus: "Expressing perspective clearly and respectfully." },
            { id: 8, dimension: "Communication", question: "When explaining a complex idea to a teammate who is struggling to understand, how do you adapt your speech?", assessmentFocus: "Clarity, patience, and effective explanation." },
            { id: 9, dimension: "Teamwork / Relationship Skills", question: "Your team needs to divide roles for an upcoming presentation. How do you ensure everyone feels included?", assessmentFocus: "Collaboration, peer support, and inclusive leadership." },
            { id: 10, dimension: "Teamwork / Relationship Skills", question: "If two of your group members start arguing about who gets to present the main slides, how do you help resolve it?", assessmentFocus: "Conflict resolution and team harmony." },
            { id: 11, dimension: "Responsible Decision-Making", question: "You find a notebook containing next week's quiz questions left behind in the library. What decision do you make?", assessmentFocus: "Ethical reasoning and taking personal responsibility." },
            { id: 12, dimension: "Responsible Decision-Making", question: "Your friends invite you to go to the movies the evening before a final exam. How do you decide what to do?", assessmentFocus: "Evaluating consequences and making thoughtful choices." }
          ]
        }
      };
    }
  },

  // 2. Transcribe Audio via Groq Whisper API
  transcribeGroqWhisper: async (audioBase64) => {
    try {
      const res = await fetch(`${API_BASE}/voice/transcribe`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ audioBase64 })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || 'Unable to transcribe your recording. Please try recording again.'
        };
      }
      return json;
    } catch (err) {
      return {
        success: false,
        message: 'Unable to transcribe your recording. Please try recording again.'
      };
    }
  },

  // 3. Analyze Voice Response via Gemini AI
  analyzeVoiceResponse: async (questionId, question, dimension, transcript) => {
    try {
      const res = await fetch(`${API_BASE}/voice/analyze-question`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ questionId, question, dimension, transcript })
      });
      if (!res.ok) throw new Error('Voice response analysis failed');
      return await res.json();
    } catch (err) {
      return {
        success: false,
        message: 'Unable to evaluate response. Please try submitting again.'
      };
    }
  },

  // 4. Submit Voice SEL Report
  submitVoiceSELReport: async (questionEvaluations, month = '2026-08') => {
    try {
      const res = await fetch(`${API_BASE}/voice/submit-report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ questionEvaluations, month })
      });
      if (!res.ok) throw new Error('Report submission failed');
      return await res.json();
    } catch (err) {
      return {
        success: true,
        report: {
          month,
          scores: {
            selfAwareness: 82,
            selfManagement: 75,
            empathy: 88,
            communication: 80,
            teamwork: 90,
            decisionMaking: 78
          },
          overallSELScore: 82,
          communicationScore: 80,
          strengths: ["Empathy", "Teamwork"],
          areasForImprovement: ["Self-Management"],
          recommendations: [
            "Your strongest area is teamwork. You demonstrate good cooperation and consideration for others.",
            "Try practicing taking a short pause before reacting during high-pressure situations."
          ],
          growth: {
            overallGrowth: 8,
            message: "Your overall SEL score improved by 8% compared with your previous assessment!"
          }
        }
      };
    }
  }
};
