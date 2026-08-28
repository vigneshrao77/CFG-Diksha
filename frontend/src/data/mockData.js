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
