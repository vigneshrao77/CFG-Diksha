/**
 * CFG-Diksha Mock Data
 * Comprehensive dataset for 12 students covering all teacher module features.
 *
 * Student profiles cover:
 *  - High performer      (Arjun Sharma, Aisha Khan)
 *  - Improving           (Priya Patel, Kavya Menon, Aryan Singh)
 *  - Stable              (Ravi Kumar, Dev Verma, Lakshmi Iyer)
 *  - Declining (attention)(Meena Reddy, Rohan Gupta, Sneha Joshi)
 *  - Low attendance      (Suresh Nair)
 *
 * Performance Decline Threshold: -8% from previous period → flagged for attention.
 */

// --- Avatar colour seeds (deterministic by student index) ---
const AVATAR_COLORS = [
  '#1E3A5F', '#3F8F5F', '#6B48A2', '#2E7D8E',
  '#A0522D', '#1E6B5F', '#7B3F8F', '#2E5EA0',
  '#8F5F1E', '#3F5F8F', '#6B3A2E', '#2E8F5F',
];

// --- Helper: generate weekly performance history (8 weeks) ---
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

// --- Helper: generate 30-day attendance history ---
function genAttendanceHistory(percentage) {
  const days = [];
  const today = new Date('2024-08-27');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends
    const present = Math.random() * 100 < percentage;
    days.push({
      date: d.toISOString().split('T')[0],
      status: present ? 'present' : 'absent',
    });
  }
  return days;
}

// --- Helper: generate assessment history (4 periods) ---
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

// --- Helper: generate health records ---
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

// --- Helper: behaviour trend history ---
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

// ============================================================
// MOCK STUDENTS DATA
// ============================================================
export const MOCK_STUDENTS = [
  // 1 — HIGH PERFORMER
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
      aiInsight: 'Arjun consistently demonstrates strong communication skills and peer leadership. Engagement during group activities is among the highest in the class.',
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

  // 2 — IMPROVING
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
      aiInsight: 'Priya\'s classroom participation has increased significantly over the past month. Communication clarity in written work has also improved.',
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

  // 3 — STABLE
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
      aiInsight: 'Ravi maintains consistent performance across assessments. One-on-one interaction tends to yield better results than group settings.',
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

  // 4 — DECLINING ⚠️ (NEEDS ATTENTION)
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
      recentObservation: 'Seems distracted during lessons. Engagement has visibly reduced compared to previous months.',
      trend: 'declining',
      aiInsight: 'Meena\'s participation has decreased over the last three weeks. Assessment scores have declined and she has been absent more frequently. A check-in conversation may help identify challenges.',
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
  },

  // 5 — LOW ATTENDANCE ⚠️
  {
    id: 'S005',
    name: 'Suresh Nair',
    class: 'Class B',
    group: 'Afternoon',
    initial: 'SN',
    avatarColor: AVATAR_COLORS[4],
    email: 'suresh.nair@diksha.edu',
    phone: '9876543250',
    parentName: 'Anitha Nair',
    parentPhone: '9876543251',
    address: '77 Koramangala, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 58,
      present: 35,
      absent: 25,
      total: 60,
      history: genAttendanceHistory(58),
      todayStatus: 'absent',
    },
    health: {
      history: genHealthHistory(165, 58),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 12, test: 3, discipline: 3, notes: 2, ela: 3, total: 23, percentage: 58 },
      history: genAssessmentHistory(23),
      previousTotal: 24,
      previousPercentage: 60,
    },
    behaviour: {
      communication: 5,
      behaviourPoints: 6,
      recentObservation: 'Misses many classes. When present, is cooperative but lacks continuity.',
      trend: 'stable',
      aiInsight: 'Suresh\'s attendance at 58% is significantly below the group average. Missed sessions directly impact assessment readiness. A parent conversation may be warranted.',
      lastUpdated: '2024-08-15',
      history: genBehaviourHistory(5, 6, 'stable'),
    },
    performance: {
      current: 58,
      previous: 60,
      change: -2,
      trend: 'stable',
      weeklyHistory: genWeeklyPerf(58, 'stable'),
    },
    notifications: [],
    needsAttention: true,
    attentionReason: 'Attendance critically low at 58%',
  },

  // 6 — IMPROVING BEHAVIOUR
  {
    id: 'S006',
    name: 'Kavya Menon',
    class: 'Class B',
    group: 'Afternoon',
    initial: 'KM',
    avatarColor: AVATAR_COLORS[5],
    email: 'kavya.menon@diksha.edu',
    phone: '9876543260',
    parentName: 'Priya Menon',
    parentPhone: '9876543261',
    address: '34 Whitefield, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 88,
      present: 53,
      absent: 7,
      total: 60,
      history: genAttendanceHistory(88),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(160, 50),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 15, test: 4, discipline: 4, notes: 4, ela: 4, total: 31, percentage: 78 },
      history: genAssessmentHistory(31),
      previousTotal: 28,
      previousPercentage: 70,
    },
    behaviour: {
      communication: 8,
      behaviourPoints: 8,
      recentObservation: 'Communication skills have improved notably. More collaborative in group tasks.',
      trend: 'improving',
      aiInsight: 'Kavya\'s communication score has risen from 5/10 to 8/10 over 8 weeks. Group activity engagement and verbal participation have both improved substantially.',
      lastUpdated: '2024-08-23',
      history: genBehaviourHistory(8, 8, 'improving'),
    },
    performance: {
      current: 78,
      previous: 70,
      change: +8,
      trend: 'improving',
      weeklyHistory: genWeeklyPerf(78, 'improving'),
    },
    notifications: [],
    needsAttention: false,
  },

  // 7 — DECLINING + LOW BEHAVIOUR ⚠️ (NEEDS ATTENTION)
  {
    id: 'S007',
    name: 'Rohan Gupta',
    class: 'Class B',
    group: 'Afternoon',
    initial: 'RG',
    avatarColor: AVATAR_COLORS[6],
    email: 'rohan.gupta@diksha.edu',
    phone: '9876543270',
    parentName: 'Amit Gupta',
    parentPhone: '9876543271',
    address: '56 HSR Layout, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 80,
      present: 48,
      absent: 12,
      total: 60,
      history: genAttendanceHistory(80),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(170, 65),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 11, test: 3, discipline: 2, notes: 2, ela: 3, total: 21, percentage: 53 },
      history: genAssessmentHistory(21),
      previousTotal: 28,
      previousPercentage: 70,
    },
    behaviour: {
      communication: 5,
      behaviourPoints: 4,
      recentObservation: 'Frequently off-task. Has had minor conflicts with peers. Needs structured support.',
      trend: 'declining',
      aiInsight: 'Rohan\'s behaviour and communication scores have both declined over 6 weeks. Combined with declining academic performance, targeted support is recommended. Consider a structured check-in.',
      lastUpdated: '2024-08-24',
      history: genBehaviourHistory(5, 4, 'declining'),
    },
    performance: {
      current: 53,
      previous: 70,
      change: -17,
      trend: 'declining',
      weeklyHistory: genWeeklyPerf(53, 'declining'),
    },
    notifications: [],
    needsAttention: true,
    attentionReason: 'Performance declined 24% and behaviour score critical',
  },

  // 8 — HIGH PERFORMER
  {
    id: 'S008',
    name: 'Aisha Khan',
    class: 'Class B',
    group: 'Afternoon',
    initial: 'AK',
    avatarColor: AVATAR_COLORS[7],
    email: 'aisha.khan@diksha.edu',
    phone: '9876543280',
    parentName: 'Salma Khan',
    parentPhone: '9876543281',
    address: '90 JP Nagar, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 98,
      present: 59,
      absent: 1,
      total: 60,
      history: genAttendanceHistory(98),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(162, 52),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 19, test: 5, discipline: 5, notes: 5, ela: 5, total: 39, percentage: 98 },
      history: genAssessmentHistory(39),
      previousTotal: 37,
      previousPercentage: 93,
    },
    behaviour: {
      communication: 10,
      behaviourPoints: 10,
      recentObservation: 'Exceptional communicator. Consistently helps peers understand concepts.',
      trend: 'stable',
      aiInsight: 'Aisha is the highest academic achiever in the group. Strong communication and behaviour scores reflect her positive influence on the classroom environment.',
      lastUpdated: '2024-08-25',
      history: genBehaviourHistory(10, 10, 'stable'),
    },
    performance: {
      current: 98,
      previous: 93,
      change: +5,
      trend: 'improving',
      weeklyHistory: genWeeklyPerf(98, 'improving'),
    },
    notifications: [],
    needsAttention: false,
  },

  // 9 — STABLE
  {
    id: 'S009',
    name: 'Dev Verma',
    class: 'Class C',
    group: 'Morning',
    initial: 'DV',
    avatarColor: AVATAR_COLORS[8],
    email: 'dev.verma@diksha.edu',
    phone: '9876543290',
    parentName: 'Rakesh Verma',
    parentPhone: '9876543291',
    address: '15 Marathahalli, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 83,
      present: 50,
      absent: 10,
      total: 60,
      history: genAttendanceHistory(83),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(175, 70),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 14, test: 3, discipline: 3, notes: 3, ela: 3, total: 26, percentage: 65 },
      history: genAssessmentHistory(26),
      previousTotal: 25,
      previousPercentage: 63,
    },
    behaviour: {
      communication: 7,
      behaviourPoints: 7,
      recentObservation: 'Steady and reliable. Follows instructions well. Could benefit from more active participation.',
      trend: 'stable',
      aiInsight: 'Dev maintains consistent performance with minimal variation. Encouraging more voluntary participation in discussions could further support his development.',
      lastUpdated: '2024-08-19',
      history: genBehaviourHistory(7, 7, 'stable'),
    },
    performance: {
      current: 65,
      previous: 63,
      change: +2,
      trend: 'stable',
      weeklyHistory: genWeeklyPerf(65, 'stable'),
    },
    notifications: [],
    needsAttention: false,
  },

  // 10 — DECLINING ⚠️ (NEEDS ATTENTION)
  {
    id: 'S010',
    name: 'Sneha Joshi',
    class: 'Class C',
    group: 'Morning',
    initial: 'SJ',
    avatarColor: AVATAR_COLORS[9],
    email: 'sneha.joshi@diksha.edu',
    phone: '9876543300',
    parentName: 'Geeta Joshi',
    parentPhone: '9876543301',
    address: '67 Banashankari, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 86,
      present: 52,
      absent: 8,
      total: 60,
      history: genAttendanceHistory(86),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(157, 49),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 13, test: 3, discipline: 3, notes: 3, ela: 3, total: 25, percentage: 63 },
      history: genAssessmentHistory(25),
      previousTotal: 32,
      previousPercentage: 80,
    },
    behaviour: {
      communication: 6,
      behaviourPoints: 7,
      recentObservation: 'Has become quieter recently. Previously very vocal and enthusiastic.',
      trend: 'declining',
      aiInsight: 'Sneha\'s scores have declined noticeably from her earlier high performance. The change in communication pattern may indicate external stress factors. A supportive check-in is advisable.',
      lastUpdated: '2024-08-22',
      history: genBehaviourHistory(6, 7, 'declining'),
    },
    performance: {
      current: 63,
      previous: 80,
      change: -17,
      trend: 'declining',
      weeklyHistory: genWeeklyPerf(63, 'declining'),
    },
    notifications: [],
    needsAttention: true,
    attentionReason: 'Performance dropped sharply from 80% to 63%',
  },

  // 11 — IMPROVING
  {
    id: 'S011',
    name: 'Aryan Singh',
    class: 'Class C',
    group: 'Morning',
    initial: 'AS',
    avatarColor: AVATAR_COLORS[10],
    email: 'aryan.singh@diksha.edu',
    phone: '9876543310',
    parentName: 'Manish Singh',
    parentPhone: '9876543311',
    address: '29 Rajajinagar, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 87,
      present: 52,
      absent: 8,
      total: 60,
      history: genAttendanceHistory(87),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(174, 67),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 15, test: 4, discipline: 4, notes: 4, ela: 3, total: 30, percentage: 75 },
      history: genAssessmentHistory(30),
      previousTotal: 24,
      previousPercentage: 60,
    },
    behaviour: {
      communication: 7,
      behaviourPoints: 8,
      recentObservation: 'Shows consistent improvement. Responds well to constructive feedback.',
      trend: 'improving',
      aiInsight: 'Aryan has shown a 15-point improvement in assessment scores over two periods. His positive response to structured feedback indicates strong growth mindset.',
      lastUpdated: '2024-08-23',
      history: genBehaviourHistory(7, 8, 'improving'),
    },
    performance: {
      current: 75,
      previous: 60,
      change: +15,
      trend: 'improving',
      weeklyHistory: genWeeklyPerf(75, 'improving'),
    },
    notifications: [],
    needsAttention: false,
  },

  // 12 — STABLE HIGH
  {
    id: 'S012',
    name: 'Lakshmi Iyer',
    class: 'Class C',
    group: 'Morning',
    initial: 'LI',
    avatarColor: AVATAR_COLORS[11],
    email: 'lakshmi.iyer@diksha.edu',
    phone: '9876543320',
    parentName: 'Radha Iyer',
    parentPhone: '9876543321',
    address: '11 Basavanagudi, Bangalore',
    joinDate: '2024-01-15',
    status: 'active',
    attendance: {
      percentage: 92,
      present: 55,
      absent: 5,
      total: 60,
      history: genAttendanceHistory(92),
      todayStatus: 'present',
    },
    health: {
      history: genHealthHistory(163, 53),
    },
    assessments: {
      current: { period: 'Period 4', assignment: 17, test: 4, discipline: 5, notes: 4, ela: 5, total: 35, percentage: 88 },
      history: genAssessmentHistory(35),
      previousTotal: 34,
      previousPercentage: 85,
    },
    behaviour: {
      communication: 9,
      behaviourPoints: 9,
      recentObservation: 'Calm and focused. Assists peers without prompting. Strong positive influence.',
      trend: 'stable',
      aiInsight: 'Lakshmi maintains a high performance trajectory with consistent behaviour scores. Her peer support role benefits the overall classroom dynamic.',
      lastUpdated: '2024-08-25',
      history: genBehaviourHistory(9, 9, 'stable'),
    },
    performance: {
      current: 88,
      previous: 85,
      change: +3,
      trend: 'stable',
      weeklyHistory: genWeeklyPerf(88, 'stable'),
    },
    notifications: [],
    needsAttention: false,
  },
];

// ============================================================
// DERIVED DATA HELPERS
// ============================================================

/** Class average performance trend (weekly, 8 weeks) */
export const CLASS_PERFORMANCE_TREND_WEEKLY = (() => {
  const weeks = 8;
  return Array.from({ length: weeks }, (_, i) => {
    const label = `Wk ${i + 1}`;
    const avgScore =
      Math.round(
        MOCK_STUDENTS.reduce((sum, s) => {
          const entry = s.performance.weeklyHistory[i];
          return sum + (entry ? entry.score : 70);
        }, 0) / MOCK_STUDENTS.length
      );
    return { week: label, score: avgScore };
  });
})();

/** Class average performance trend (monthly) */
export const CLASS_PERFORMANCE_TREND_MONTHLY = [
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 70 },
  { month: 'May', score: 71 },
  { month: 'Jun', score: 69 },
  { month: 'Jul', score: 73 },
  { month: 'Aug', score: 75 },
];

/** Today's attendance summary */
export const TODAY_ATTENDANCE = (() => {
  const present = MOCK_STUDENTS.filter((s) => s.attendance.todayStatus === 'present').length;
  const absent = MOCK_STUDENTS.length - present;
  return { present, absent, total: MOCK_STUDENTS.length, percentage: Math.round((present / MOCK_STUDENTS.length) * 100) };
})();

/** Average class performance */
export const AVG_PERFORMANCE = Math.round(
  MOCK_STUDENTS.reduce((s, st) => s + st.performance.current, 0) / MOCK_STUDENTS.length
);

/** Students needing attention */
export const STUDENTS_NEEDING_ATTENTION = MOCK_STUDENTS.filter((s) => s.needsAttention);

/** Recent activity feed */
export const RECENT_ACTIVITY = [
  { id: 1, type: 'attendance', message: 'Attendance marked for Class A — Morning', time: '2 hours ago', icon: '✓', studentName: null },
  { id: 2, type: 'health', message: 'Health checkup recorded for Arjun Sharma', time: '1 day ago', icon: '♥', studentName: 'Arjun Sharma' },
  { id: 3, type: 'assessment', message: 'Assessments submitted for Period 4 — Class B', time: '2 days ago', icon: '📝', studentName: null },
  { id: 4, type: 'behaviour', message: 'Behaviour points updated for Rohan Gupta', time: '3 days ago', icon: '⭐', studentName: 'Rohan Gupta' },
  { id: 5, type: 'alert', message: 'Performance alert sent to Meena Reddy', time: '4 days ago', icon: '🔔', studentName: 'Meena Reddy' },
];

/** Stored alerts (teacher → student) */
export let MOCK_ALERTS = [
  {
    id: 'A001',
    studentId: 'S004',
    studentName: 'Meena Reddy',
    teacherId: 'T001',
    type: 'performance',
    title: 'Performance Check-In',
    message: 'Your recent assessment performance has decreased. Please review your recent work and speak with your teacher at the earliest convenience.',
    createdAt: '2024-08-23T10:30:00Z',
    read: false,
    severity: 'warning',
  },
];

/** Teacher profile (demo) */
export const TEACHER_PROFILE = {
  id: 'T001',
  name: 'Ms. Anika Reddy',
  initial: 'AR',
  avatarColor: '#1E3A5F',
  email: 'anika.reddy@diksha.edu',
  classes: ['Class A', 'Class B', 'Class C'],
};
