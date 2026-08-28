// ============================================================
// STUDENT MODULE MOCK DATA
// ============================================================
export const MOCK_STUDENT_PROFILE = {
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

export const MOCK_LEADERBOARD_MONTHS = [
  { id: '2026-08', name: 'August 2026' },
  { id: '2026-07', name: 'July 2026' },
  { id: '2026-06', name: 'June 2026' }
];

export const MOCK_LEADERBOARD_DATA = {
  '2026-08': [
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
    },
    {
      rank: 4,
      studentId: 'ST004',
      studentName: 'Ananya Gupta',
      assignmentScore: 18,
      assignmentMax: 20,
      assignmentPercentage: 90,
      selScore: 90,
      selMax: 120,
      selPercentage: 75,
      combinedScore: 82.5,
      improvement: 1.0,
      isMostImproved: false
    },
    {
      rank: 5,
      studentId: 'ST005',
      studentName: 'Vikram Singh',
      assignmentScore: 16,
      assignmentMax: 20,
      assignmentPercentage: 80,
      selScore: 92,
      selMax: 120,
      selPercentage: 76.6,
      combinedScore: 78.3,
      improvement: 4.2,
      isMostImproved: false
    }
  ],
  '2026-07': [
    {
      rank: 1,
      studentId: 'ST003',
      studentName: 'Aarav Patel',
      assignmentScore: 18,
      assignmentMax: 20,
      assignmentPercentage: 90,
      selScore: 99,
      selMax: 120,
      selPercentage: 82.5,
      combinedScore: 86.3,
      improvement: 1.2,
      isMostImproved: false
    },
    {
      rank: 2,
      studentId: 'ST002',
      studentName: 'Rohan Sharma',
      assignmentScore: 17,
      assignmentMax: 20,
      assignmentPercentage: 85,
      selScore: 93,
      selMax: 120,
      selPercentage: 77.5,
      combinedScore: 81.3,
      improvement: 1.5,
      isMostImproved: false
    },
    {
      rank: 3,
      studentId: 'ST001',
      studentName: 'Sahasra V.',
      assignmentScore: 17,
      assignmentMax: 20,
      assignmentPercentage: 85,
      selScore: 90,
      selMax: 120,
      selPercentage: 75,
      combinedScore: 80.0,
      improvement: 4.0,
      isMostImproved: true
    }
  ]
};

export const MOCK_ACHIEVEMENTS = [
  {
    id: 'ACH01',
    title: 'SEL Trailblazer',
    category: 'Holistic Growth',
    dateEarned: 'August 2026',
    description: 'Scored 80%+ in monthly Social-Emotional Learning assessment.',
    icon: 'Sparkles'
  },
  {
    id: 'ACH02',
    title: 'Master Communicator',
    category: 'Communication',
    dateEarned: 'August 2026',
    description: 'Demonstrated exceptional empathy and verbal clarity in speech analysis.',
    icon: 'MessageSquare'
  },
  {
    id: 'ACH03',
    title: 'Top 3 Podium Rank',
    category: 'Leaderboard',
    dateEarned: 'August 2026',
    description: 'Achieved Rank 2 on the Monthly Holistic Growth Leaderboard.',
    icon: 'Trophy'
  },
  {
    id: 'ACH04',
    title: 'Perfect Attendance',
    category: 'Discipline',
    dateEarned: 'July 2026',
    description: 'Maintained over 90% attendance throughout the month.',
    icon: 'Award'
  }
];

// ============================================================
// TEACHER MODULE MOCK DATA (12 Students)
// ============================================================
const AVATAR_COLORS = [
  '#1E3A5F', '#3F8F5F', '#6B48A2', '#2E7D8E',
  '#A0522D', '#1E6B5F', '#7B3F8F', '#2E5EA0',
  '#8F5F1E', '#3F5F8F', '#6B3A2E', '#2E8F5F',
];

function genWeeklyPerf(finalScore, trend) {
  const weeks = [];
  const step = trend === 'improving' ? -2 : trend === 'declining' ? 2 : 0;
  for (let i = 8; i >= 1; i--) {
    const noise = Math.round((Math.random() - 0.5) * 4);
    weeks.push({
      week: `Wk ${9 - i}`,
      score: Math.max(30, Math.min(100, finalScore + i * step + noise)),
    });
  }
  return weeks;
}

function genAttendanceHistory(percentage) {
  const days = [];
  const today = new Date('2024-08-27');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const present = Math.random() * 100 < percentage;
    days.push({
      date: d.toISOString().split('T')[0],
      status: present ? 'present' : 'absent',
    });
  }
  return days;
}

function genAssessmentHistory(currentTotal) {
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
  return periods.map((period, i) => {
    const base = Math.max(12, Math.min(40, currentTotal + (3 - i) * 2 + Math.round((Math.random() - 0.5) * 4)));
    const assignment = Math.round(base * 0.5);
    const test = Math.min(5, Math.round(base * 0.125));
    const discipline = Math.min(5, Math.round(base * 0.125));
    const notes = Math.min(5, Math.round(base * 0.125));
    const ela = Math.min(5, base - assignment - test - discipline - notes);
    const total = assignment + test + discipline + notes + ela;
    return {
      period,
      assignment: Math.min(20, Math.max(0, assignment)),
      test: Math.min(5, Math.max(0, test)),
      discipline: Math.min(5, Math.max(0, discipline)),
      notes: Math.min(5, Math.max(0, notes)),
      ela: Math.min(5, Math.max(0, ela)),
      total: Math.min(40, Math.max(0, total)),
      percentage: Math.round((total / 40) * 100),
    };
  });
}

function genHealthHistory(height, weight) {
  const records = [];
  const months = ['2024-02-15', '2024-05-10', '2024-08-15'];
  months.forEach((date, i) => {
    const h = height - (2 - i) * 0.5;
    const w = weight - (2 - i) * 0.8;
    const bmi = w / ((h / 100) ** 2);
    records.push({
      date,
      height: Math.round(h * 10) / 10,
      weight: Math.round(w * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      bmiStatus: bmi < 18.5 ? 'Below reference range' : bmi < 25 ? 'Reference range' : 'Above reference range',
    });
  });
  return records;
}

function genBehaviourHistory(comm, behav, trend) {
  const weeks = [];
  for (let i = 8; i >= 1; i--) {
    const step = trend === 'improving' ? 0.3 : trend === 'declining' ? -0.3 : 0;
    const noise = (Math.random() - 0.5) * 0.5;
    weeks.push({
      week: `Wk ${9 - i}`,
      communication: Math.max(1, Math.min(10, Math.round((comm + i * step + noise) * 10) / 10)),
      behaviour: Math.max(1, Math.min(10, Math.round((behav + i * step + noise) * 10) / 10)),
    });
  }
  return weeks;
}

export const MOCK_STUDENTS = [
  {
    id: 'S001',
    name: 'Arjun Sharma',
    class: 'Class A',
    group: 'Morning',
    initial: 'AS',
    avatarColor: AVATAR_COLORS[0],
    email: 'arjun.sharma@diksha.edu',
    phone: '9876543210',
    parentName: 'Rajesh Sharma',
    parentPhone: '9876543211',
    address: '12 MG Road, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 95,
      present: 57,
      absent: 3,
      total: 60,
      history: genAttendanceHistory(95),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(168, 62),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 18, test: 5, discipline: 5, notes: 4, ela: 5, total: 37, percentage: 93 },
      history: genAssessmentHistory(37),
      previousTotal: 34,
      previousPercentage: 85,
    },
    behaviour: {
      communication: 9,
      behaviourPoints: 9,
      recentObservation: 'Actively participates in group discussions. Shows leadership in collaborative tasks.',
      trend: 'stable',
      aiInsight: 'Arjun consistently demonstrates strong communication skills and peer leadership.',
      lastUpdated: '2024-08-20',
      history: genBehaviourHistory(9, 9, 'stable'),
    },
    performance: {
      current: 93,
      previous: 85,
      change: +8,
      trend: 'improving',
      weeklyHistory: genWeeklyPerf(93, 'improving'),
    },
    notifications: [],
    needsAttention: false,
  },
  {
    id: 'S002',
    name: 'Priya Patel',
    class: 'Class A',
    group: 'Morning',
    initial: 'PP',
    avatarColor: AVATAR_COLORS[1],
    email: 'priya.patel@diksha.edu',
    phone: '9876543220',
    parentName: 'Sunita Patel',
    parentPhone: '9876543221',
    address: '45 Residency Road, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 90,
      present: 54,
      absent: 6,
      total: 60,
      history: genAttendanceHistory(90),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(155, 48),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 16, test: 4, discipline: 4, notes: 4, ela: 4, total: 32, percentage: 80 },
      history: genAssessmentHistory(32),
      previousTotal: 28,
      previousPercentage: 70,
    },
    behaviour: {
      communication: 8,
      behaviourPoints: 8,
      recentObservation: 'Has been asking more questions in class. Shows growing confidence.',
      trend: 'improving',
      aiInsight: 'Priya\'s classroom participation has increased significantly over the past month.',
      lastUpdated: '2024-08-22',
      history: genBehaviourHistory(8, 8, 'improving'),
    },
    performance: {
      current: 80,
      previous: 70,
      change: +10,
      trend: 'improving',
      weeklyHistory: genWeeklyPerf(80, 'improving'),
    },
    notifications: [],
    needsAttention: false,
  },
  {
    id: 'S003',
    name: 'Ravi Kumar',
    class: 'Class A',
    group: 'Morning',
    initial: 'RK',
    avatarColor: AVATAR_COLORS[2],
    email: 'ravi.kumar@diksha.edu',
    phone: '9876543230',
    parentName: 'Suresh Kumar',
    parentPhone: '9876543231',
    address: '8 Brigade Road, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 85,
      present: 51,
      absent: 9,
      total: 60,
      history: genAttendanceHistory(85),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(172, 68),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 14, test: 3, discipline: 4, notes: 3, ela: 3, total: 27, percentage: 68 },
      history: genAssessmentHistory(27),
      previousTotal: 26,
      previousPercentage: 65,
    },
    behaviour: {
      communication: 7,
      behaviourPoints: 7,
      recentObservation: 'Steady performance. Works well individually but less engaged in group settings.',
      trend: 'stable',
      aiInsight: 'Ravi maintains consistent performance across assessments.',
      lastUpdated: '2024-08-18',
      history: genBehaviourHistory(7, 7, 'stable'),
    },
    performance: {
      current: 68,
      previous: 65,
      change: +3,
      trend: 'stable',
      weeklyHistory: genWeeklyPerf(68, 'stable'),
    },
    notifications: [],
    needsAttention: false,
  },
  {
    id: 'S004',
    name: 'Meena Reddy',
    class: 'Class A',
    group: 'Morning',
    initial: 'MR',
    avatarColor: AVATAR_COLORS[3],
    email: 'meena.reddy@diksha.edu',
    phone: '9876543240',
    parentName: 'Latha Reddy',
    parentPhone: '9876543241',
    address: '23 Indiranagar, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 82,
      present: 49,
      absent: 11,
      total: 60,
      history: genAttendanceHistory(82),
      todayStatus: 'absent',
    },
    health: {
      history: genHealthHistory(158, 52),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 13, test: 3, discipline: 3, notes: 3, ela: 3, total: 25, percentage: 63 },
      history: genAssessmentHistory(25),
      previousTotal: 30,
      previousPercentage: 75,
    },
    behaviour: {
      communication: 6,
      behaviourPoints: 6,
      recentObservation: 'Seems distracted during lessons. Engagement has visibly reduced.',
      trend: 'declining',
      aiInsight: 'Meena\'s participation has decreased over the last three weeks.',
      lastUpdated: '2024-08-21',
      history: genBehaviourHistory(6, 6, 'declining'),
    },
    performance: {
      current: 63,
      previous: 75,
      change: -12,
      trend: 'declining',
      weeklyHistory: genWeeklyPerf(63, 'declining'),
    },
    notifications: [],
    needsAttention: true,
    attentionReason: 'Performance declined 16% from previous period',
  }
];

export const CLASS_PERFORMANCE_TREND_WEEKLY = [
  { week: 'Wk 1', score: 72 },
  { week: 'Wk 2', score: 74 },
  { week: 'Wk 3', score: 73 },
  { week: 'Wk 4', score: 76 },
  { week: 'Wk 5', score: 75 },
  { week: 'Wk 6', score: 78 },
  { week: 'Wk 7', score: 80 },
  { week: 'Wk 8', score: 82 },
];

export const CLASS_PERFORMANCE_TREND_MONTHLY = [
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 70 },
  { month: 'May', score: 71 },
  { month: 'Jun', score: 69 },
  { month: 'Jul', score: 73 },
  { month: 'Aug', score: 75 },
];

export const TODAY_ATTENDANCE = { present: 10, absent: 2, total: 12, percentage: 83 };
export const AVG_PERFORMANCE = 76;
export const STUDENTS_NEEDING_ATTENTION = MOCK_STUDENTS.filter((s) => s.needsAttention);

export const RECENT_ACTIVITY = [
  { id: 1, type: 'attendance', message: 'Attendance marked for Class A — Morning', time: '2 hours ago', icon: '✓', studentName: null },
  { id: 2, type: 'health', message: 'Health checkup recorded for Arjun Sharma', time: '1 day ago', icon: '♥', studentName: 'Arjun Sharma' },
  { id: 3, type: 'assessment', message: 'Assessments submitted for Period 4 — Class B', time: '2 days ago', icon: '📝', studentName: null },
];

export let MOCK_ALERTS = [
  {
    id: 'A001',
    studentId: 'S004',
    studentName: 'Meena Reddy',
    teacherId: 'T001',
    type: 'performance',
    title: 'Performance Check-In',
    message: 'Your recent assessment performance has decreased. Please review your recent work with your teacher.',
    createdAt: '2024-08-23T10:30:00Z',
    read: false,
    severity: 'warning',
  },
];

export const TEACHER_PROFILE = {
  id: 'T001',
  name: 'Ms. Anika Reddy',
  initial: 'AR',
  avatarColor: '#1E3A5F',
  email: 'anika.reddy@diksha.edu',
  classes: ['Class A', 'Class B', 'Class C'],
};

// Admin compatibility stubs
export const mockSchools = [];
export const mockAreas = [];
export const mockPrograms = [];
export const mockTeachers = [];
export const mockAttendanceTrend = { monthly: [], annual: [] };
export const mockSELData = { competencies: [], trend: [] };
export const mockAcademicData = { baselineVsEndline: [], subjectBreakdown: [] };
export const mockHealthData = { screeningCoverage: [], bmiDistribution: [], dietarySupport: [] };
export const mockDashboardMetrics = {};
export const mockComparisonMetrics = [];
export const mockCohorts = [];
