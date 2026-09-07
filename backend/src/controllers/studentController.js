const mongoose = require('mongoose');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const LeaderboardRecord = require('../models/LeaderboardRecord');
const VoiceSELResult = require('../models/VoiceSELResult');

// Attempt to load Google Generative AI if key is set
let GoogleGenerativeAI = null;
try {
  const genAiModule = require('@google/generative-ai');
  GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (e) {
  console.warn('@google/generative-ai SDK not available or error importing:', e.message);
}

// Helper: Try loading available Gemini model
async function getGeminiModel(genAI) {
  const modelNames = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
  for (const name of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      return model;
    } catch (e) {
      // try next model
    }
  }
  return genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
}

// Helper: Robust JSON extraction from LLM responses (strips thinking tags, markdown, trailing commas)
function extractJSON(raw) {
  if (!raw) return null;
  let text = String(raw).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonSub = text.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonSub);
    } catch (e) {
      const fixed = jsonSub.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed);
    }
  }
  return JSON.parse(text);
}

// Default Fallback Mock Data for demo mode when database/keys are uninitialized
const DEMO_STUDENT = {
  studentId: 'ST001',
  name: 'Sahasra V.',
  class: 'Class 10',
  section: 'A',
  school: 'Diksha Model High School',
  batch: '2025-2026',
  age: 15,
  health: {
    height: 162,
    weight: 54,
    bmi: 20.6,
    lastCheckupDate: '2026-08-15'
  },
  attendance: {
    presentDays: 22,
    absentDays: 2,
    percentage: 91.6
  },
  behaviour: {
    disciplineScore: 92,
    points: 45,
    observations: [
      'Active participant in group discussions.',
      'Exhibits high empathy during team tasks.'
    ],
    teacherFeedback: 'Sahasra demonstrates remarkable emotional maturity and steady academic focus this term.'
  },
  monthlyAcademics: [
    { month: '2026-06', assignmentScore: 16, assignmentMax: 20, percentage: 80, previousMonthComparison: 0 },
    { month: '2026-07', assignmentScore: 17, assignmentMax: 20, percentage: 85, previousMonthComparison: 5 },
    { month: '2026-08', assignmentScore: 18, assignmentMax: 20, percentage: 90, previousMonthComparison: 5 }
  ],
  monthlySEL: [
    {
      month: '2026-06',
      rawScore: 84,
      maxScore: 120,
      percentage: 70,
      dimensions: {
        selfAwareness: 70,
        selfManagement: 65,
        empathy: 75,
        communication: 72,
        teamwork: 68,
        responsibleDecisionMaking: 70
      }
    },
    {
      month: '2026-07',
      rawScore: 90,
      maxScore: 120,
      percentage: 75,
      dimensions: {
        selfAwareness: 75,
        selfManagement: 70,
        empathy: 80,
        communication: 78,
        teamwork: 72,
        responsibleDecisionMaking: 75
      }
    },
    {
      month: '2026-08',
      rawScore: 96,
      maxScore: 120,
      percentage: 80,
      dimensions: {
        selfAwareness: 80,
        selfManagement: 70,
        empathy: 85,
        communication: 90,
        teamwork: 75,
        responsibleDecisionMaking: 80
      }
    }
  ],
  alerts: [
    {
      id: 'ALT01',
      title: 'Communication Growth',
      message: 'Your communication score improved by 12% this month! Keep up the excellent teamwork.',
      type: 'improvement',
      date: '2026-08-20',
      isRead: false
    },
    {
      id: 'ALT02',
      title: 'Assignment Performance',
      message: 'Great job scoring 18/20 in your August monthly assignment.',
      type: 'academic',
      date: '2026-08-18',
      isRead: false
    }
  ]
};

const DEMO_LEADERBOARD = [
  {
    rank: 1,
    studentId: 'ST003',
    studentName: 'Aarav Patel',
    assignmentScore: 19,
    assignmentMax: 20,
    assignmentPercentage: 95,
    selScore: 102,
    selMax: 120,
    selPercentage: 85,
    combinedScore: 90.0,
    improvement: 3.5,
    isMostImproved: false
  },
  {
    rank: 2,
    studentId: 'ST001',
    studentName: 'Sahasra V.',
    assignmentScore: 18,
    assignmentMax: 20,
    assignmentPercentage: 90,
    selScore: 96,
    selMax: 120,
    selPercentage: 80,
    combinedScore: 85.0,
    improvement: 5.0,
    isMostImproved: true
  },
  {
    rank: 3,
    studentId: 'ST002',
    studentName: 'Rohan Sharma',
    assignmentScore: 17,
    assignmentMax: 20,
    assignmentPercentage: 85,
    selScore: 98,
    selMax: 120,
    selPercentage: 81.6,
    combinedScore: 83.3,
    improvement: 2.1,
    isMostImproved: false
  }
];

// In-Memory store for monthly assessments & teacher marks status
const IN_MEMORY_COMPLETED_SEL = new Map([
  ['ST001_2026-07', {
    studentId: 'ST001',
    assessmentType: 'SEL',
    month: '2026-07',
    year: 2026,
    status: 'COMPLETED',
    overallSELScore: 78,
    communicationScore: 76,
    scores: { selfAwareness: 78, selfManagement: 72, empathy: 82, communication: 76, teamwork: 80, decisionMaking: 76 },
    strengths: ['Active listening in group discussions', 'Constructive peer support'],
    areasForImprovement: ['Practice speaking under strict time constraints'],
    completedAt: new Date('2026-07-28')
  }],
  ['ST001_2026-06', {
    studentId: 'ST001',
    assessmentType: 'SEL',
    month: '2026-06',
    year: 2026,
    status: 'COMPLETED',
    overallSELScore: 70,
    communicationScore: 72,
    scores: { selfAwareness: 70, selfManagement: 65, empathy: 75, communication: 72, teamwork: 68, decisionMaking: 70 },
    strengths: ['Initial self-reflection on school goals'],
    areasForImprovement: ['Build confidence in conflict resolution'],
    completedAt: new Date('2026-06-28')
  }]
]);

const TEACHER_MARKS_STATUS = {
  '2026-08': { isUpdated: true, updatedDate: '2026-08-25', updatedBy: 'Class Teacher (Mrs. S. Rao)', verified: true },
  '2026-07': { isUpdated: true, updatedDate: '2026-07-28', updatedBy: 'Class Teacher (Mrs. S. Rao)', verified: true },
  '2026-06': { isUpdated: true, updatedDate: '2026-06-29', updatedBy: 'Class Teacher (Mrs. S. Rao)', verified: true }
};

// Helper: Seed or fetch current student from DB
async function getOrCreateStudent(studentId) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      let student = await Student.findOne({ studentId }).maxTimeMS(2000);
      if (!student) {
        student = new Student({ ...DEMO_STUDENT, studentId });
        await student.save();
      }
      return student;
    }
  } catch (err) {
    // console.warn('DB lookup skipped, returning demo student');
  }
  return DEMO_STUDENT;
}

// 1. Student Dashboard Controller
exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const student = await getOrCreateStudent(studentId);
    
    const latestAcademic = student.monthlyAcademics && student.monthlyAcademics.length > 0
      ? student.monthlyAcademics[student.monthlyAcademics.length - 1]
      : { assignmentScore: 18, assignmentMax: 20, percentage: 90, previousMonthComparison: 5 };

    const latestSEL = student.monthlySEL && student.monthlySEL.length > 0
      ? student.monthlySEL[student.monthlySEL.length - 1]
      : { rawScore: 96, maxScore: 120, percentage: 80, dimensions: { selfAwareness: 80, selfManagement: 70, empathy: 85, communication: 90, teamwork: 75, responsibleDecisionMaking: 80 } };

    res.json({
      success: true,
      profile: {
        studentId: student.studentId,
        name: student.name,
        class: student.class,
        section: student.section,
        school: student.school,
        batch: student.batch,
        age: student.age
      },
      academic: {
        currentMonthlyScore: latestAcademic.assignmentScore,
        maxScore: latestAcademic.assignmentMax || 20,
        percentage: latestAcademic.percentage,
        previousMonthComparison: latestAcademic.previousMonthComparison,
        history: student.monthlyAcademics
      },
      attendance: student.attendance,
      health: student.health,
      behaviour: student.behaviour,
      selDevelopment: {
        currentScore: latestSEL.rawScore,
        maxScore: latestSEL.maxScore || 120,
        percentage: latestSEL.percentage,
        dimensions: latestSEL.dimensions,
        history: student.monthlySEL
      },
      alerts: student.alerts || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. My Progress Controller
exports.getProgress = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const student = await getOrCreateStudent(studentId);

    // Query all completed Voice SEL results for this student
    let dbVoiceResults = [];
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        dbVoiceResults = await VoiceSELResult.find({ studentId, assessmentType: 'SEL' }).sort({ month: 1 }).lean();
      }
    } catch (e) {
      console.warn('VoiceSELResult query warning in getProgress:', e.message);
    }

    // Merge DB Voice SEL results into monthlySEL array
    const monthlySELMap = new Map();
    (student.monthlySEL || []).forEach(item => {
      monthlySELMap.set(item.month, {
        month: item.month,
        status: 'COMPLETED',
        rawScore: item.rawScore,
        maxScore: item.maxScore || 120,
        percentage: item.percentage,
        dimensions: item.dimensions,
        strengths: item.strengths || [],
        areasForImprovement: item.areasForImprovement || [],
        recommendations: item.recommendations || []
      });
    });

    dbVoiceResults.forEach(doc => {
      monthlySELMap.set(doc.month, {
        month: doc.month,
        status: 'COMPLETED',
        rawScore: Math.round((doc.overallSELScore / 100) * 120),
        maxScore: 120,
        percentage: doc.overallSELScore,
        communicationScore: doc.communicationScore,
        dimensions: doc.scores,
        strengths: doc.strengths || [],
        areasForImprovement: doc.areasForImprovement || [],
        recommendations: doc.recommendations || [],
        questionTranscripts: doc.questionTranscripts || [],
        growth: doc.growth,
        completedAt: doc.completedAt
      });
    });

    const mergedMonthlySEL = Array.from(monthlySELMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // Sample assignments breakdown per month for holistic progress reporting
    const monthlyAssignmentsMap = {
      '2026-08': [
        { id: 1, title: 'Science Lab Analysis', score: 85, maxScore: 100, status: 'COMPLETED' },
        { id: 2, title: 'Mathematics Problem Set', score: 92, maxScore: 100, status: 'COMPLETED' },
        { id: 3, title: 'Social Studies Group Essay', score: 88, maxScore: 100, status: 'COMPLETED' }
      ],
      '2026-07': [
        { id: 1, title: 'Literature Mid-Term Essay', score: 82, maxScore: 100, status: 'COMPLETED' },
        { id: 2, title: 'Physics Numerical Problem Set', score: 88, maxScore: 100, status: 'COMPLETED' }
      ],
      '2026-06': [
        { id: 1, title: 'Introductory Term Assignment', score: 80, maxScore: 100, status: 'COMPLETED' }
      ]
    };

    res.json({
      success: true,
      profile: {
        studentId: student.studentId,
        name: student.name,
        class: student.class,
        section: student.section,
        school: student.school,
        batch: student.batch,
        age: student.age
      },
      monthlyAcademics: student.monthlyAcademics,
      monthlySEL: mergedMonthlySEL,
      monthlyAssignments: monthlyAssignmentsMap,
      attendance: student.attendance,
      behaviour: student.behaviour
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Leaderboard Controller
exports.getLeaderboard = async (req, res) => {
  try {
    const month = req.query.month || '2026-08';
    
    let records = [];
    try {
      records = await LeaderboardRecord.find({ month }).lean();
    } catch (e) {
      console.warn('DB Leaderboard lookup failed, using demo dataset:', e.message);
    }

    if (!records || records.length === 0) {
      records = DEMO_LEADERBOARD;
    }

    records.sort((a, b) => {
      if (b.combinedScore !== a.combinedScore) {
        return b.combinedScore - a.combinedScore;
      }
      return b.selScore - a.selScore;
    });

    const leaderboard = records.map((rec, index) => ({
      rank: index + 1,
      studentId: rec.studentId,
      studentName: rec.studentName,
      assignmentScore: rec.assignmentScore,
      assignmentMax: rec.assignmentMax || 20,
      assignmentPercentage: rec.assignmentPercentage || Math.round((rec.assignmentScore / 20) * 100),
      selScore: rec.selScore,
      selMax: rec.selMax || 120,
      selPercentage: rec.selPercentage || Math.round((rec.selScore / 120) * 100),
      combinedScore: Number(rec.combinedScore.toFixed(1)),
      improvement: rec.improvement || 0,
      isMostImproved: rec.isMostImproved || index === 1
    }));

    res.json({
      success: true,
      month,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// 🎤 MONTHLY VOICE SEL PIPELINE (ONE ASSESSMENT PER MONTH)
// -------------------------------------------------------------

// 4. Check Monthly Assessment Status (GET /api/student/voice/status)
exports.getMonthlyAssessmentStatus = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const month = req.query.month || new Date().toISOString().substring(0, 7); // e.g. "2026-08"

    let existingReport = IN_MEMORY_COMPLETED_SEL.get(`${studentId}_${month}`) || null;
    try {
      if (!existingReport && mongoose.connection && mongoose.connection.readyState === 1) {
        existingReport = await VoiceSELResult.findOne({ studentId, assessmentType: 'SEL', month }).lean();
      }
    } catch (dbErr) {}

    if (existingReport) {
      return res.json({
        success: true,
        isCompleted: true,
        month,
        report: existingReport
      });
    }

    res.json({
      success: true,
      isCompleted: false,
      month
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================================
// FIXED SEL ASSESSMENT BLUEPRINT (Fixed Criteria & Framework)
// =============================================================
const FIXED_SEL_ASSESSMENT_BLUEPRINT = [
  {
    id: 1,
    criterion: 'Self-Awareness',
    dimension: 'Self-Awareness',
    dimensionKey: 'selfAwareness',
    assessmentFocus: 'Recognizing personal emotions, emotional triggers, strengths, and self-reflection.',
    theme: 'Personal feedback, self-discovery, handling mistakes, or understanding emotional reactions.'
  },
  {
    id: 2,
    criterion: 'Self-Management',
    dimension: 'Self-Management',
    dimensionKey: 'selfManagement',
    assessmentFocus: 'Regulating emotions, managing stress, impulse control, and staying organized under pressure.',
    theme: 'Competing deadlines, unexpected changes in plans, staying focused during exam stress, or project setbacks.'
  },
  {
    id: 3,
    criterion: 'Empathy / Social Awareness',
    dimension: 'Empathy / Social Awareness',
    dimensionKey: 'empathy',
    assessmentFocus: 'Recognizing others’ emotions, perspective-taking, respecting diverse backgrounds, and compassionate support.',
    theme: 'Supporting a distressed or isolated peer, handling diverse viewpoints in class debates, or active listening.'
  },
  {
    id: 4,
    criterion: 'Relationship Skills / Teamwork',
    dimension: 'Relationship Skills / Teamwork',
    dimensionKey: 'teamwork',
    assessmentFocus: 'Collaboration, conflict resolution, active listening, and inclusive leadership in groups.',
    theme: 'Resolving group disagreements, dividing team tasks fairly, or mediating project disputes.'
  },
  {
    id: 5,
    criterion: 'Communication',
    dimension: 'Communication',
    dimensionKey: 'communication',
    assessmentFocus: 'Clarity of expression, structured articulation, constructive tone, and adapting speech to audience.',
    theme: 'Explaining a complex idea to a struggling teammate, respectfully disagreeing with a leader, or public presentation.'
  },
  {
    id: 6,
    criterion: 'Responsible Decision-Making',
    dimension: 'Responsible Decision-Making',
    dimensionKey: 'decisionMaking',
    assessmentFocus: 'Ethical reasoning, evaluating long-term consequences, personal accountability, and moral choices.',
    theme: 'Academic integrity dilemmas, standing up against peer pressure, or making fair choices under temptation.'
  }
];

// Helper: Validate generated questions against the fixed blueprint
function validateGeneratedQuestions(generatedQuestions) {
  if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== FIXED_SEL_ASSESSMENT_BLUEPRINT.length) {
    return false;
  }
  for (let i = 0; i < FIXED_SEL_ASSESSMENT_BLUEPRINT.length; i++) {
    const bp = FIXED_SEL_ASSESSMENT_BLUEPRINT[i];
    const q = generatedQuestions[i];
    if (!q || !q.question || typeof q.question !== 'string' || q.question.trim().length < 15) {
      return false;
    }
    // Enforce blueprint's fixed criterion
    q.id = bp.id;
    q.dimension = bp.criterion;
    q.criterion = bp.criterion;
    if (!q.assessmentFocus) {
      q.assessmentFocus = bp.assessmentFocus;
    }
  }
  return true;
}

// 5. Dynamic SEL Scenario Questions via Gemini AI (POST /api/student/voice/generate-questions)
exports.generate12VoiceQuestions = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const student = await getOrCreateStudent(studentId);
    const month = req.body.month || req.query.month || new Date().toISOString().substring(0, 7);

    // 1. Backend Guard: Check if assessment is already completed for this month
    let existing = IN_MEMORY_COMPLETED_SEL.get(`${studentId}_${month}`) || null;
    try {
      if (!existing && mongoose.connection && mongoose.connection.readyState === 1) {
        existing = await VoiceSELResult.findOne({ studentId, assessmentType: 'SEL', month }).lean();
      }
    } catch (e) {}

    if (existing) {
      return res.json({
        success: false,
        isCompleted: true,
        message: `You have already completed your SEL Assessment for ${month}.`,
        report: existing
      });
    }

    const studentAge = student.age || 15;
    const studentClass = student.class || 'Class 10';
    const studentName = student.name || 'Student';

    // 2. Fetch previous months questions to avoid semantic repetition
    let previousQuestionsSummary = '';
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const pastDocs = await VoiceSELResult.find({ studentId }).sort({ createdAt: -1 }).limit(3).lean();
        const pastQList = [];
        pastDocs.forEach(d => {
          if (d.questionTranscripts) {
            d.questionTranscripts.forEach(qt => { if (qt.question) pastQList.push(qt.question); });
          }
        });
        if (pastQList.length > 0) {
          previousQuestionsSummary = `PREVIOUS QUESTIONS TO AVOID (Do not rephrase or repeat these scenarios):\n- ${pastQList.slice(0, 6).join('\n- ')}`;
        }
      }
    } catch (e) {}

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();

    // Construct blueprint prompt for Gemini
    const blueprintDescription = FIXED_SEL_ASSESSMENT_BLUEPRINT.map(bp => (
      `Question ${bp.id}: Criterion = "${bp.criterion}" | Focus = "${bp.assessmentFocus}" | Theme = "${bp.theme}"`
    )).join('\n');

    const prompt = `You are an expert Social-Emotional Learning (SEL) curriculum designer.

TASK:
Generate fresh, realistic, scenario-based voice assessment questions for:
Student ID: ${studentId}
Student Name: ${studentName}
Month: ${month}
Grade/Class: ${studentClass} (Age: ${studentAge})

FIXED ASSESSMENT BLUEPRINT (You MUST generate exactly 1 question for each criterion in this exact order):
${blueprintDescription}

${previousQuestionsSummary}

REQUIREMENTS:
1. Every question must be an open-ended scenario suitable for a school student to speak out loud.
2. Maintain moderate, age-appropriate difficulty.
3. Every question must primarily assess the assigned criterion in the blueprint.
4. Do NOT mention the criterion name inside the question text.
5. Generate fresh scenarios meaningfully different from past questions.

Return ONLY a valid JSON object matching this exact structure:
{
  "assessmentTitle": "Monthly Voice SEL Assessment (${month})",
  "month": "${month}",
  "totalQuestions": 6,
  "questions": [
    {
      "id": 1,
      "dimension": "Self-Awareness",
      "question": "Scenario text for Self-Awareness...",
      "assessmentFocus": "Recognizing personal emotions and learning from feedback."
    },
    {
      "id": 2,
      "dimension": "Self-Management",
      "question": "Scenario text for Self-Management...",
      "assessmentFocus": "Stress regulation and staying organized under pressure."
    },
    {
      "id": 3,
      "dimension": "Empathy / Social Awareness",
      "question": "Scenario text for Empathy...",
      "assessmentFocus": "Recognizing others' feelings and compassionate support."
    },
    {
      "id": 4,
      "dimension": "Relationship Skills / Teamwork",
      "question": "Scenario text for Teamwork...",
      "assessmentFocus": "Conflict resolution and collaborative leadership."
    },
    {
      "id": 5,
      "dimension": "Communication",
      "question": "Scenario text for Communication...",
      "assessmentFocus": "Clarity of expression and adapting speech."
    },
    {
      "id": 6,
      "dimension": "Responsible Decision-Making",
      "question": "Scenario text for Responsible Decision-Making...",
      "assessmentFocus": "Ethical choices and accountability."
    }
  ]
}`;

    // Try Gemini AI first
    if (geminiApiKey && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = await getGeminiModel(genAI);
        const result = await model.generateContent(prompt);
        const jsonAssessment = extractJSON(result.response.text());

        if (jsonAssessment && validateGeneratedQuestions(jsonAssessment.questions)) {
          console.log(`✅ Gemini Dynamically Generated ${jsonAssessment.questions.length} Valid Blueprint Questions for ${month}`);
          return res.json({ success: true, isCompleted: false, assessment: jsonAssessment });
        }
      } catch (geminiError) {
        console.warn('Gemini question generation warning:', geminiError.message);
      }
    }

    // Try Groq LLM (qwen/qwen3.6-27b) backup
    if (groqApiKey) {
      try {
        const resGroq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen/qwen3.6-27b',
            messages: [
              { role: 'system', content: 'You are an expert SEL curriculum designer. Follow the assessment blueprint and return ONLY valid JSON.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (resGroq.ok) {
          const dataGroq = await resGroq.json();
          const jsonAssessment = extractJSON(dataGroq.choices[0].message.content);
          if (jsonAssessment && validateGeneratedQuestions(jsonAssessment.questions)) {
            console.log(`✅ Groq LLM Dynamically Generated ${jsonAssessment.questions.length} Valid Blueprint Questions for ${month}`);
            return res.json({ success: true, isCompleted: false, assessment: jsonAssessment });
          }
        }
      } catch (groqErr) {
        console.warn('Groq LLM question generation warning:', groqErr.message);
      }
    }

    // High-Quality Dynamic Seed Pools strictly mapped to Fixed Blueprint
    const monthSeedIndex = Math.abs((studentId + month).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 3;

    const scenarioSeeds = [
      [
        { id: 1, dimension: "Self-Awareness", question: "When you receive unexpected constructive criticism on a group project, how do you reflect on your work?", assessmentFocus: "Recognizing personal emotions and learning from feedback." },
        { id: 2, dimension: "Self-Management", question: "Imagine you have two major assignments and an exam on the same day. How do you stay calm and organized?", assessmentFocus: "Stress management and impulse regulation under pressure." },
        { id: 3, dimension: "Empathy / Social Awareness", question: "Imagine your classmate failed an important exam and is sitting alone looking very upset. What would you do?", assessmentFocus: "Recognizing others' emotions and offering genuine perspective taking." },
        { id: 4, dimension: "Relationship Skills / Teamwork", question: "If two of your project group members disagree strongly on who should present the main slides, how would you help resolve it?", assessmentFocus: "Conflict resolution and collaborative leadership." },
        { id: 5, dimension: "Communication", question: "When explaining a complex idea to a teammate who is struggling to understand, how do you adapt your explanation?", assessmentFocus: "Clarity, patience, and effective communication." },
        { id: 6, dimension: "Responsible Decision-Making", question: "You find an unlabelled notebook containing next week's quiz questions left behind in the library. What decision do you make?", assessmentFocus: "Ethical reasoning and taking personal responsibility." }
      ],
      [
        { id: 1, dimension: "Self-Awareness", question: "Think about a time when you felt nervous before a major class presentation. What did you discover about your strengths and triggers?", assessmentFocus: "Understanding personal emotional triggers and building confidence." },
        { id: 2, dimension: "Self-Management", question: "Your team has only two days left to submit a complex project, but several tasks remain incomplete. How do you prioritize your time?", assessmentFocus: "Prioritization, staying composed, and managing project deadlines." },
        { id: 3, dimension: "Empathy / Social Awareness", question: "During a class discussion, a peer shares a personal opinion that differs greatly from the rest of the class. How do you respond respectfully?", assessmentFocus: "Active listening and respecting diverse viewpoints." },
        { id: 4, dimension: "Relationship Skills / Teamwork", question: "A member of your study group is consistently not contributing to shared tasks. How do you address the issue constructively?", assessmentFocus: "Constructive peer feedback and teamwork accountability." },
        { id: 5, dimension: "Communication", question: "You need to present a suggestion to your teacher about adjusting assignment deadlines for the class. How would you state your case?", assessmentFocus: "Persuasive, respectful, and articulate communication." },
        { id: 6, dimension: "Responsible Decision-Making", question: "Your friends encourage you to skip an extracurricular team commitment to attend a party. How do you weigh your decision?", assessmentFocus: "Evaluating long-term consequences and honoring commitments." }
      ],
      [
        { id: 1, dimension: "Self-Awareness", question: "When you realize that you made a significant mistake in a team assignment, how do you acknowledge it and move forward?", assessmentFocus: "Honest self-reflection and taking ownership of actions." },
        { id: 2, dimension: "Self-Management", question: "You are preparing for an important competition while handling daily schoolwork. What techniques do you use to prevent burnout?", assessmentFocus: "Emotional regulation, wellness, and self-discipline." },
        { id: 3, dimension: "Empathy / Social Awareness", question: "A new student joined your school mid-term and seems hesitant to participate during lunch or group work. How would you help them feel welcomed?", assessmentFocus: "Inclusivity, empathy, and positive social awareness." },
        { id: 4, dimension: "Relationship Skills / Teamwork", question: "During a robotics project, your team is divided between two different design strategies. How do you guide the group to consensus?", assessmentFocus: "Collaborative problem-solving and consensus building." },
        { id: 5, dimension: "Communication", question: "If you feel your contributions to a group task are being overlooked by peers, how do you express your feelings professionally?", assessmentFocus: "Assertive, constructive, and clear interpersonal communication." },
        { id: 6, dimension: "Responsible Decision-Making", question: "You see someone accidentally drop an expensive electronic item in the corridor without realizing it. What steps do you take?", assessmentFocus: "Moral integrity, civic responsibility, and proactive ethics." }
      ]
    ];

    const selectedPool = scenarioSeeds[monthSeedIndex];
    validateGeneratedQuestions(selectedPool);

    res.json({
      success: true,
      isCompleted: false,
      assessment: {
        assessmentTitle: `Monthly Voice SEL Assessment (${month})`,
        month,
        totalQuestions: 6,
        questions: selectedPool
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Groq + Whisper Speech-to-Text Live API Call
exports.transcribeGroqWhisper = async (req, res) => {
  try {
    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
    const { audioBase64 } = req.body;

    console.log('\n--- [BACKEND VOICE PIPELINE LOG] ---');
    console.log('Audio received →', audioBase64 ? 'Yes' : 'No');

    if (!audioBase64) {
      console.log('Groq API request → Skipped (No audio data payload)');
      console.log('-------------------------------------\n');
      return res.status(400).json({
        success: false,
        message: 'Unable to transcribe your recording. Please try recording again.'
      });
    }

    // Extract MIME type & byte size
    const mimeMatch = audioBase64.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
    const base64Data = audioBase64.split(',')[1] || audioBase64;
    const audioBuffer = Buffer.from(base64Data, 'base64');

    console.log('Audio file size →', audioBuffer.length, 'bytes');
    console.log('Audio MIME type →', mimeType);

    if (audioBuffer.length < 50) {
      console.warn('⚠️ Audio file size is suspiciously empty (< 50 bytes)');
      console.log('-------------------------------------\n');
      return res.status(400).json({
        success: false,
        message: 'Unable to transcribe your recording. Please try recording again.'
      });
    }

    if (!groqApiKey) {
      console.error('❌ GROQ_API_KEY is missing from backend/.env');
      console.log('-------------------------------------\n');
      return res.status(500).json({
        success: false,
        message: 'Groq API key is missing in backend environment.'
      });
    }

    let fileExt = 'webm';
    if (mimeType.includes('mp4') || mimeType.includes('m4a')) fileExt = 'mp4';
    else if (mimeType.includes('ogg')) fileExt = 'ogg';
    else if (mimeType.includes('wav')) fileExt = 'wav';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) fileExt = 'mp3';
    const filename = `speech.${fileExt}`;

    console.log(`Groq API request → Sending to https://api.groq.com/openai/v1/audio/transcriptions (${filename})...`);

    const audioFile = new File([audioBuffer], filename, { type: mimeType });
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0');
    formData.append('prompt', 'Transcribe verbatim exact spoken words as said without changing words.');

    let groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: formData
    });

    console.log('Groq response (whisper-large-v3) → HTTP', groqResponse.status, groqResponse.statusText);

    // If primary model encounters an error, retry with whisper-large-v3-turbo
    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn('⚠️ whisper-large-v3 returned error, retrying with whisper-large-v3-turbo...', errText);

      const retryFormData = new FormData();
      const retryFile = new File([audioBuffer], filename, { type: mimeType });
      retryFormData.append('file', retryFile);
      retryFormData.append('model', 'whisper-large-v3-turbo');

      groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: retryFormData
      });
      console.log('Groq retry response (whisper-large-v3-turbo) → HTTP', groqResponse.status);
    }

    if (groqResponse.ok) {
      const groqData = await groqResponse.json();
      const transcriptionText = groqData.text ? groqData.text.trim() : '';

      console.log('Transcription →', transcriptionText ? `"${transcriptionText}"` : '[Empty transcription returned]');
      console.log('-------------------------------------\n');

      if (!transcriptionText) {
        return res.status(400).json({
          success: false,
          message: 'Unable to transcribe your recording. Please try recording again.'
        });
      }

      return res.json({
        success: true,
        transcript: transcriptionText,
        provider: "groq-whisper"
      });
    } else {
      const errText = await groqResponse.text();
      console.error('❌ Groq API Error Response:', errText);
      console.log('-------------------------------------\n');
      return res.status(400).json({
        success: false,
        message: 'Unable to transcribe your recording. Please try recording again.'
      });
    }
  } catch (error) {
    console.error('❌ Exception in transcribeGroqWhisper:', error.message);
    console.log('-------------------------------------\n');
    res.status(500).json({
      success: false,
      message: 'Unable to transcribe your recording. Please try recording again.'
    });
  }
};

// Builder: Formulates the human-like, 4-heading evidence-based evaluation prompt
function buildEvidenceBasedPrompt(question, dimension, transcript, questionId) {
  return `You are an expert Social-Emotional Learning (SEL) and communication evaluator.

TASK:
Carefully evaluate the student's actual response to the scenario question.

MANDATORY 4 HEADINGS TO PROVIDE:
1. SEL: Detailed assessment of what the answer demonstrates about the student's emotional awareness, self-regulation, empathy, or decision-making.
2. Communication: Assessment of clarity, organization, expression, and coherence.
3. Strengths: Bullet points of positive aspects based ONLY on direct evidence from what the student said.
4. Improvements: Bullet points of constructive guidance based ONLY on direct evidence from what the student said.

EVALUATION PHILOSOPHY:
- Evaluate the actual answer, not keywords.
- Do NOT jump to scores. Analyze what the student said first.
- Differentiate between a generic answer (deserves 4-6) vs a reasoned answer with examples/evidence (deserves 7-9).
- Off-topic or audio check phrases ("can you hear me", "am I already there") score 1-2 with feedback asking for an answer to the prompt.
- Allow full partial credit across the 0-10 spectrum.
- Do NOT invent facts the student never mentioned.
- Do NOT penalize valid alternative perspectives.

INPUT:
Question: "${question}"
Target Dimension: "${dimension}"
Student Transcript: "${transcript}"

Return ONLY valid JSON matching this exact structure:
{
  "questionId": ${questionId || 1},
  "dimension": "${dimension}",
  "selScore": 7,
  "communicationScore": 8,
  "selAnalysis": "Detailed SEL perspective evaluation...",
  "communicationAnalysis": "Detailed communication clarity evaluation...",
  "strengths": [
    "Evidence-based positive point 1",
    "Evidence-based positive point 2"
  ],
  "improvements": [
    "Constructive actionable growth point 1"
  ],
  "feedback": "2-3 encouraging sentences summarizing the evaluation.",
  "analysis": {
    "questionIntent": "Core intent of the question",
    "keyPointsIdentified": ["Point 1 from transcript", "Point 2 from transcript"],
    "missingOrWeakAspects": ["Missing depth or examples"],
    "depthLevel": "Thoughtful"
  },
  "speechIndicators": {
    "observation": "Clear delivery with structured flow.",
    "confidenceRelatedIndicator": "Constructive, focused tone."
  }
}`;
}

// Helper: Groq LLM Fallback Evaluator when Gemini API is rate-limited (429)
async function evaluateWithGroqLLM(groqApiKey, question, dimension, transcript, questionId) {
  try {
    const prompt = buildEvidenceBasedPrompt(question, dimension, transcript, questionId);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b',
        messages: [
          { role: 'system', content: 'You are an expert, evidence-based SEL evaluator. Output ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        const parsed = extractJSON(content);
        if (parsed && typeof parsed.selScore === 'number') {
          console.log('✅ Groq LLM (qwen/qwen3.6-27b) Live AI Evaluation Success');
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Groq LLM evaluation warning:', err.message);
  }
  return null;
}

// Helper: Smart Dynamic Fallback Evaluator (used when offline/no API keys)
function evaluateSmartFallback(question, dimension, transcript, questionId) {
  const lower = transcript.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const wordCount = words.length;

  const testPhrases = ['can you hear me', 'am i available', 'am i already there', 'testing', 'check check', 'mic test', 'hello hello', '1 2 3', 'one two three', 'is it working'];
  const isAudioTest = testPhrases.some(p => lower.includes(p)) || wordCount < 3;

  if (isAudioTest) {
    return {
      questionId: questionId || 1,
      dimension: dimension || "Self-Awareness",
      selScore: 1,
      communicationScore: 1,
      selAnalysis: "The response consists of microphone check phrases and does not demonstrate reflection or action regarding the scenario.",
      communicationAnalysis: "Audio testing phrasing was detected without substantive response to the question.",
      strengths: ["Audio recording was received successfully."],
      improvements: ["Provide a direct answer addressing what you would do or think in this situation."],
      feedback: "Your recording appeared to test your microphone rather than answering the scenario question. Please record an answer addressing the prompt.",
      analysis: {
        questionIntent: `Evaluating ${dimension} in response to scenario prompt.`,
        keyPointsIdentified: [],
        missingOrWeakAspects: ["Did not address the scenario question."],
        depthLevel: "Off-topic/Audio Test"
      },
      speechIndicators: {
        observation: "Microphone testing phrase detected.",
        confidenceRelatedIndicator: "Off-topic audio test."
      }
    };
  }

  const reasoningWords = ['because', 'since', 'therefore', 'so that', 'when', 'for example', 'such as', 'i feel', 'i think', 'experience', 'project', 'helped', 'learned', 'listen', 'support', 'understand', 'discuss', 'solution'];
  const reasoningCount = reasoningWords.filter(rw => lower.includes(rw)).length;

  let selScore = 5;
  let commScore = 6;
  let depth = "Superficial";

  if (wordCount >= 20 && reasoningCount >= 2) {
    selScore = 8;
    commScore = 8;
    depth = "Thoughtful";
  } else if (wordCount >= 35 && reasoningCount >= 3) {
    selScore = 9;
    commScore = 9;
    depth = "Exceptional";
  } else if (wordCount >= 10 && reasoningCount >= 1) {
    selScore = 6;
    commScore = 7;
    depth = "Partially Satisfactory";
  } else if (wordCount < 8) {
    selScore = 4;
    commScore = 5;
    depth = "Limited";
  }

  return {
    questionId: questionId || 1,
    dimension: dimension || "Self-Awareness",
    selScore,
    communicationScore: commScore,
    selAnalysis: `The response demonstrates a ${depth.toLowerCase()} level of ${dimension} by touching on the scenario topic and expressing initial reasoning.`,
    communicationAnalysis: "The response communicates the core message clearly and maintains a constructive conversational tone.",
    strengths: [
      `Demonstrated relevant ${dimension.toLowerCase()} perspective in response.`,
      "Expressed ideas clearly and directly."
    ],
    improvements: [
      depth === "Limited" || depth === "Superficial"
        ? "Include specific personal examples or explain WHY you would take these steps."
        : "Elaborate further on long-term reflections and impact."
    ],
    feedback: `You provided a ${depth.toLowerCase()} response addressing the question. Adding specific real-life examples and explaining your reasoning will make your response even stronger.`,
    analysis: {
      questionIntent: `Assessing ${dimension} competencies regarding: "${question.substring(0, 60)}..."`,
      keyPointsIdentified: ["Addressed the general scenario topic."],
      missingOrWeakAspects: depth === "Limited" || depth === "Superficial" 
        ? ["Could provide specific personal examples and explain WHY or HOW."]
        : ["Could elaborate further on long-term reflections."],
      depthLevel: depth
    },
    speechIndicators: {
      observation: "Clear voice delivery.",
      confidenceRelatedIndicator: "Steady articulation."
    }
  };
}

// 7. Live 4-Heading Voice Response Analysis (POST /api/student/voice/analyze-question)
exports.analyzeVoiceResponse = async (req, res) => {
  try {
    const { questionId, question, dimension, transcript } = req.body;

    console.log('\n--- [BACKEND VOICE EVALUATION LOG] ---');
    console.log('Question ID →', questionId);
    console.log('Question →', `"${question}"`);
    console.log('Target Dimension →', dimension);
    console.log('Student Transcript / Answer →', `"${transcript}"`);

    if (!transcript || transcript.trim() === '') {
      return res.status(400).json({ success: false, message: 'Transcript cannot be empty' });
    }

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();

    // 1. Primary AI Evaluator: Gemini AI
    if (geminiApiKey && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = await getGeminiModel(genAI);

        const prompt = buildEvidenceBasedPrompt(question, dimension, transcript, questionId);
        const result = await model.generateContent(prompt);
        const jsonResult = extractJSON(result.response.text());

        if (jsonResult && typeof jsonResult.selScore === 'number') {
          console.log(`✅ Gemini Live Evaluation Success: SEL Score ${jsonResult.selScore}/10 | Comm Score ${jsonResult.communicationScore}/10 | Depth: ${jsonResult.analysis?.depthLevel}`);
          console.log('-------------------------------------\n');
          return res.json({ success: true, analysis: jsonResult });
        }
      } catch (geminiError) {
        console.warn('Gemini AI rate limited or unavailable:', geminiError.message);
      }
    }

    // 2. Secondary AI Evaluator: Groq LLM (qwen/qwen3.6-27b) using GROQ_API_KEY
    if (groqApiKey) {
      const groqEval = await evaluateWithGroqLLM(groqApiKey, question, dimension, transcript, questionId);
      if (groqEval && typeof groqEval.selScore === 'number') {
        console.log(`✅ Groq LLM Live Evaluation Success: SEL Score ${groqEval.selScore}/10 | Comm Score ${groqEval.communicationScore}/10 | Depth: ${groqEval.analysis?.depthLevel}`);
        console.log('-------------------------------------\n');
        return res.json({ success: true, analysis: groqEval });
      }
    }

    // 3. Smart Evidence-Based Fallback Evaluator
    const fallbackEval = evaluateSmartFallback(question, dimension, transcript, questionId);
    console.log(`✅ Smart Fallback Evaluation: SEL Score ${fallbackEval.selScore}/10 | Comm Score ${fallbackEval.communicationScore}/10 | Depth: ${fallbackEval.analysis?.depthLevel}`);
    console.log('-------------------------------------\n');
    return res.json({ success: true, analysis: fallbackEval });

  } catch (error) {
    console.error('❌ Exception in analyzeVoiceResponse:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Submit Monthly Voice SEL Report (POST /api/student/voice/submit-report)
exports.submitVoiceSELReport = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const month = req.body.month || new Date().toISOString().substring(0, 7); // e.g. "2026-08"
    const year = parseInt(month.split('-')[0], 10) || 2026;
    const { questionEvaluations } = req.body;

    if (!questionEvaluations || !Array.isArray(questionEvaluations)) {
      return res.status(400).json({ success: false, message: 'Evaluations array required' });
    }

    // 1. Backend Guard: Check if assessment is already completed for this month
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const existing = await VoiceSELResult.findOne({ studentId, assessmentType: 'SEL', month }).lean();
      if (existing) {
        return res.json({
          success: true,
          isAlreadyCompleted: true,
          message: `Assessment for ${month} is already submitted.`,
          report: existing
        });
      }
    }

    // 2. Calculate Dimension Scores (0-100%)
    const dimTotals = {
      selfAwareness: [],
      selfManagement: [],
      empathy: [],
      communication: [],
      teamwork: [],
      decisionMaking: []
    };

    let totalCommScoreSum = 0;

    questionEvaluations.forEach(ev => {
      const sScore = Number(ev.selScore) || 7;
      const cScore = Number(ev.communicationScore) || 7;
      totalCommScoreSum += cScore;

      const dimName = (ev.dimension || '').toLowerCase();

      if (dimName.includes('awareness') && !dimName.includes('social')) {
        dimTotals.selfAwareness.push(sScore);
      } else if (dimName.includes('management')) {
        dimTotals.selfManagement.push(sScore);
      } else if (dimName.includes('empathy') || dimName.includes('social')) {
        dimTotals.empathy.push(sScore);
      } else if (dimName.includes('communication')) {
        dimTotals.communication.push(sScore);
      } else if (dimName.includes('teamwork') || dimName.includes('relationship')) {
        dimTotals.teamwork.push(sScore);
      } else if (dimName.includes('decision')) {
        dimTotals.decisionMaking.push(sScore);
      } else {
        dimTotals.selfAwareness.push(sScore);
      }
    });

    const calcDimPercent = (arr) => {
      if (!arr || arr.length === 0) return 80;
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.round((avg / 10) * 100);
    };

    const scores = {
      selfAwareness: calcDimPercent(dimTotals.selfAwareness),
      selfManagement: calcDimPercent(dimTotals.selfManagement),
      empathy: calcDimPercent(dimTotals.empathy),
      communication: calcDimPercent(dimTotals.communication),
      teamwork: calcDimPercent(dimTotals.teamwork),
      decisionMaking: calcDimPercent(dimTotals.decisionMaking)
    };

    const overallSELScore = Math.round(
      (scores.selfAwareness + scores.selfManagement + scores.empathy + 
       scores.communication + scores.teamwork + scores.decisionMaking) / 6
    );

    const overallCommScore = Math.round(((totalCommScoreSum / (questionEvaluations.length || 6)) / 10) * 100);

    // Collect all strengths & improvements
    const allStrengths = [];
    const allAreas = [];
    questionEvaluations.forEach(ev => {
      if (ev.strengths && Array.isArray(ev.strengths)) {
        ev.strengths.forEach(s => { if (s && !allStrengths.includes(s)) allStrengths.push(s); });
      }
      if (ev.improvements && Array.isArray(ev.improvements)) {
        ev.improvements.forEach(a => { if (a && !allAreas.includes(a)) allAreas.push(a); });
      } else if (ev.areasForImprovement && Array.isArray(ev.areasForImprovement)) {
        ev.areasForImprovement.forEach(a => { if (a && !allAreas.includes(a)) allAreas.push(a); });
      }
    });

    const recommendations = [
      `Your strongest SEL dimension this month is ${Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0].replace(/([A-Z])/g, ' $1').toLowerCase()} (${Math.max(...Object.values(scores))}%). Continue applying these skills in collaborative school activities.`,
      "Practice taking a short pause before responding in challenging situations to further strengthen self-management."
    ];

    // 3. Growth Comparison against previous month
    let growth = { overallGrowth: 0, message: "This is your first completed monthly SEL assessment.", previousMonth: "" };
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const prevDoc = await VoiceSELResult.findOne({ studentId, assessmentType: 'SEL', month: { $ne: month } }).sort({ month: -1 }).lean();
        if (prevDoc) {
          const diff = overallSELScore - prevDoc.overallSELScore;
          growth = {
            overallGrowth: diff,
            previousMonth: prevDoc.month,
            message: diff >= 0
              ? `Overall SEL score improved by +${diff}% compared to ${prevDoc.month} assessment.`
              : `Overall SEL score changed by ${diff}% compared to ${prevDoc.month} assessment.`
          };
        }
      }
    } catch (e) {}

    // 4. Save to In-Memory store & Database
    const reportData = {
      studentId,
      assessmentType: 'SEL',
      month,
      year,
      status: 'COMPLETED',
      scores,
      overallSELScore,
      communicationScore: overallCommScore,
      strengths: allStrengths.slice(0, 5),
      areasForImprovement: allAreas.slice(0, 5),
      recommendations,
      questionTranscripts: questionEvaluations,
      growth,
      completedAt: new Date()
    };

    IN_MEMORY_COMPLETED_SEL.set(`${studentId}_${month}`, reportData);

    let savedReport = reportData;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        savedReport = await VoiceSELResult.findOneAndUpdate(
          { studentId, assessmentType: 'SEL', month },
          reportData,
          { upsert: true, new: true }
        );

        // Update Student Monthly History
        const student = await getOrCreateStudent(studentId);
        const assignmentScore = (student.monthlyAcademics && student.monthlyAcademics.length > 0)
          ? student.monthlyAcademics[student.monthlyAcademics.length - 1].assignmentScore
          : 18;
        const assignmentPercentage = (assignmentScore / 20) * 100;
        const combinedScore = (assignmentPercentage * 0.5) + (overallSELScore * 0.5);

        await LeaderboardRecord.findOneAndUpdate(
          { studentId, month },
          {
            studentId,
            studentName: student.name || 'Sahasra V.',
            school: student.school || 'Diksha Model High School',
            class: student.class || 'Class 10',
            month,
            assignmentScore,
            assignmentMax: 20,
            assignmentPercentage,
            selScore: Math.round((overallSELScore / 100) * 120),
            selMax: 120,
            selPercentage: overallSELScore,
            combinedScore,
            improvement: growth.overallGrowth
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr) {
      // console.warn('VoiceSELResult DB Save warning:', dbErr.message);
    }

    res.json({
      success: true,
      report: savedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Get Voice SEL History (GET /api/student/voice/history)
exports.getVoiceSELHistory = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    let history = [];
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        history = await VoiceSELResult.find({ studentId, assessmentType: 'SEL' }).sort({ month: -1 }).lean();
      }
    } catch (e) {
      console.warn('DB history lookup warning:', e.message);
    }

    if (!history || history.length === 0) {
      // Demo historical records for August, July, June
      history = [
        {
          studentId,
          assessmentType: 'SEL',
          month: '2026-08',
          year: 2026,
          status: 'COMPLETED',
          overallSELScore: 82,
          communicationScore: 84,
          scores: { selfAwareness: 82, selfManagement: 78, empathy: 88, communication: 84, teamwork: 85, decisionMaking: 80 },
          strengths: ["Strong empathy during collaborative discussions", "Thoughtful self-reflection on feedback"],
          areasForImprovement: ["Provide specific step-by-step reasoning under high pressure"],
          recommendations: ["Continue leveraging your strong empathy in team projects."],
          growth: { overallGrowth: 5, previousMonth: "2026-07", message: "Overall SEL score improved by +5% compared to 2026-07 assessment." },
          completedAt: new Date('2026-08-25')
        },
        {
          studentId,
          assessmentType: 'SEL',
          month: '2026-07',
          year: 2026,
          status: 'COMPLETED',
          overallSELScore: 77,
          communicationScore: 78,
          scores: { selfAwareness: 76, selfManagement: 72, empathy: 82, communication: 78, teamwork: 80, decisionMaking: 75 },
          strengths: ["Active listener in group scenarios"],
          areasForImprovement: ["Develop confidence when expressing differing opinions"],
          recommendations: ["Practice sharing independent ideas in class debates."],
          growth: { overallGrowth: 4, previousMonth: "2026-06", message: "Overall SEL score improved by +4% compared to 2026-06 assessment." },
          completedAt: new Date('2026-07-28')
        }
      ];
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Get Specific Monthly Report (GET /api/student/voice/report/:month)
exports.getVoiceSELReportByMonth = async (req, res) => {
  try {
    const studentId = req.user?.studentId || 'ST001';
    const month = req.params.month || '2026-08';

    let report = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        report = await VoiceSELResult.findOne({ studentId, assessmentType: 'SEL', month }).lean();
      }
    } catch (e) {}

    if (!report) {
      // Fallback demo monthly report for requested month
      report = {
        studentId,
        assessmentType: 'SEL',
        month,
        year: parseInt(month.split('-')[0], 10) || 2026,
        status: 'COMPLETED',
        overallSELScore: month === '2026-08' ? 82 : 77,
        communicationScore: month === '2026-08' ? 84 : 78,
        scores: { selfAwareness: 82, selfManagement: 78, empathy: 88, communication: 84, teamwork: 85, decisionMaking: 80 },
        strengths: ["Strong empathy during collaborative discussions", "Thoughtful self-reflection on feedback"],
        areasForImprovement: ["Provide specific step-by-step reasoning under high pressure"],
        recommendations: ["Continue leveraging your strong empathy in team projects."],
        growth: { overallGrowth: 5, previousMonth: "2026-07", message: `Overall SEL score improved compared to previous assessment.` },
        completedAt: new Date()
      };
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
