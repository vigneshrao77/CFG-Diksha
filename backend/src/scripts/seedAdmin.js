const School      = require('../models/School');
const Program     = require('../models/Program');
const Analytics   = require('../models/Analytics');
const ActivityLog = require('../models/ActivityLog');

const initialSchools = [
  {
    name: 'KHEL Centre - Danapur',
    type: 'KHEL Centre',
    area: 'Danapur',
    district: 'Patna',
    state: 'Bihar',
    students: 185,
    capacity: 200,
    status: 'Excellent',
    attendanceRate: 92,
    avgAcademicScore: 84,
    selIndex: 88,
    healthCoverage: 95,
    established: '2018',
    head: 'Pooja Kumari',
    programs: ['khel', 'swasthya', 'pragati'],
  },
  {
    name: 'KHEL Centre - Phulwari Sharif',
    type: 'KHEL Centre',
    area: 'Phulwari Sharif',
    district: 'Patna',
    state: 'Bihar',
    students: 160,
    capacity: 180,
    status: 'Excellent',
    attendanceRate: 90,
    avgAcademicScore: 81,
    selIndex: 85,
    healthCoverage: 92,
    established: '2019',
    head: 'Sunita Devi',
    programs: ['khel', 'udaan', 'swasthya'],
  },
  {
    name: 'KHEL Centre - Bakhtiyarpur',
    type: 'KHEL Centre',
    area: 'Bakhtiyarpur',
    district: 'Patna',
    state: 'Bihar',
    students: 140,
    capacity: 160,
    status: 'Progressing',
    attendanceRate: 85,
    avgAcademicScore: 76,
    selIndex: 79,
    healthCoverage: 88,
    established: '2020',
    head: 'Amit Kumar',
    programs: ['khel', 'pragati'],
  },
  {
    name: 'KHEL Centre - Fatwah',
    type: 'KHEL Centre',
    area: 'Fatwah',
    district: 'Patna',
    state: 'Bihar',
    students: 125,
    capacity: 150,
    status: 'Progressing',
    attendanceRate: 83,
    avgAcademicScore: 74,
    selIndex: 77,
    healthCoverage: 85,
    established: '2021',
    head: 'Rekha Sharma',
    programs: ['khel', 'swasthya'],
  },
  {
    name: 'Govt. Middle School - Danapur Cantt',
    type: 'Government School',
    area: 'Danapur',
    district: 'Patna',
    state: 'Bihar',
    students: 210,
    capacity: 250,
    status: 'Progressing',
    attendanceRate: 78,
    avgAcademicScore: 68,
    selIndex: 71,
    healthCoverage: 80,
    established: '2005',
    head: 'Manoj Sinha',
    programs: ['pragati', 'swasthya'],
  },
  {
    name: 'Govt. Primary School - Khagaul',
    type: 'Government School',
    area: 'Khagaul',
    district: 'Patna',
    state: 'Bihar',
    students: 175,
    capacity: 200,
    status: 'Needs Attention',
    attendanceRate: 71,
    avgAcademicScore: 62,
    selIndex: 65,
    healthCoverage: 74,
    established: '2010',
    head: 'Geeta Kumari',
    programs: ['pragati'],
  },
  {
    name: 'Govt. High School - Maner',
    type: 'Government School',
    area: 'Maner',
    district: 'Patna',
    state: 'Bihar',
    students: 155,
    capacity: 200,
    status: 'Progressing',
    attendanceRate: 80,
    avgAcademicScore: 72,
    selIndex: 75,
    healthCoverage: 83,
    established: '2008',
    head: 'Rajesh Prasad',
    programs: ['udaan', 'swasthya'],
  },
  {
    name: 'KHEL Centre - Sampatchak',
    type: 'KHEL Centre',
    area: 'Sampatchak',
    district: 'Patna',
    state: 'Bihar',
    students: 98,
    capacity: 120,
    status: 'Progressing',
    attendanceRate: 86,
    avgAcademicScore: 78,
    selIndex: 82,
    healthCoverage: 90,
    established: '2022',
    head: 'Kavita Singh',
    programs: ['khel', 'digital'],
  },
];

const initialPrograms = [
  {
    name: 'KHEL (Holistic Learning)',
    slug: 'khel',
    description: 'Activity-based experiential learning integrating SEL, values, and creative expression.',
    icon: 'BookOpen',
    color: '#FF6B35',
    centers: ['Danapur', 'Phulwari Sharif', 'Bakhtiyarpur', 'Fatwah', 'Sampatchak'],
    enrollment: 510,
    completion: 88,
    monthlyAttendance: [
      { month: 'Jul', value: 84 },
      { month: 'Aug', value: 87 },
      { month: 'Sep', value: 89 },
      { month: 'Oct', value: 86 },
      { month: 'Nov', value: 91 },
      { month: 'Dec', value: 93 },
    ],
    cohortBreakdown: [
      { name: 'Grade 1-3', value: 180 },
      { name: 'Grade 4-5', value: 210 },
      { name: 'Grade 6-8', value: 120 },
    ],
  },
  {
    name: 'Pragati (Remedial Education)',
    slug: 'pragati',
    description: 'Foundational literacy and numeracy bridge program for first-generation learners.',
    icon: 'TrendingUp',
    color: '#1E3A5F',
    centers: ['Danapur', 'Bakhtiyarpur', 'Danapur Cantt', 'Khagaul'],
    enrollment: 390,
    completion: 82,
    monthlyAttendance: [
      { month: 'Jul', value: 78 },
      { month: 'Aug', value: 81 },
      { month: 'Sep', value: 83 },
      { month: 'Oct', value: 80 },
      { month: 'Nov', value: 85 },
      { month: 'Dec', value: 87 },
    ],
    cohortBreakdown: [
      { name: 'FLN Level 1', value: 150 },
      { name: 'FLN Level 2', value: 160 },
      { name: 'FLN Level 3', value: 80 },
    ],
  },
  {
    name: 'Udaan (Adolescent Girls)',
    slug: 'udaan',
    description: 'Life skills, leadership, and digital literacy program for adolescent girls.',
    icon: 'Users',
    color: '#E8A838',
    centers: ['Phulwari Sharif', 'Maner'],
    enrollment: 195,
    completion: 91,
    monthlyAttendance: [
      { month: 'Jul', value: 88 },
      { month: 'Aug', value: 90 },
      { month: 'Sep', value: 92 },
      { month: 'Oct', value: 89 },
      { month: 'Nov', value: 94 },
      { month: 'Dec', value: 95 },
    ],
    cohortBreakdown: [
      { name: 'Age 11-13', value: 90 },
      { name: 'Age 14-16', value: 105 },
    ],
  },
  {
    name: 'Swasthya (Health & Wellness)',
    slug: 'swasthya',
    description: 'Regular health screenings, nutrition support, and mental health counseling.',
    icon: 'Activity',
    color: '#2E7D32',
    centers: ['Danapur', 'Phulwari Sharif', 'Bakhtiyarpur', 'Fatwah', 'Maner'],
    enrollment: 780,
    completion: 96,
    monthlyAttendance: [
      { month: 'Jul', value: 91 },
      { month: 'Aug', value: 93 },
      { month: 'Sep', value: 94 },
      { month: 'Oct', value: 92 },
      { month: 'Nov', value: 96 },
      { month: 'Dec', value: 97 },
    ],
    cohortBreakdown: [
      { name: 'Screened', value: 710 },
      { name: 'Follow-up Care', value: 70 },
    ],
  },
  {
    name: 'Digital Saksharta (Tech Literacy)',
    slug: 'digital',
    description: 'Basic computing, online safety, and digital exploration for students and teachers.',
    icon: 'School',
    color: '#6A1B9A',
    centers: ['Danapur', 'Phulwari Sharif', 'Sampatchak'],
    enrollment: 240,
    completion: 85,
    monthlyAttendance: [
      { month: 'Jul', value: 82 },
      { month: 'Aug', value: 85 },
      { month: 'Sep', value: 87 },
      { month: 'Oct', value: 86 },
      { month: 'Nov', value: 90 },
      { month: 'Dec', value: 91 },
    ],
    cohortBreakdown: [
      { name: 'Junior Tech', value: 130 },
      { name: 'Senior Tech', value: 110 },
    ],
  },
];

const initialAnalytics = [
  {
    type: 'attendance',
    period: 'monthly',
    label: '2026 Monthly Trend',
    data: [
      { month: 'Jul', rate: 81.2, govt: 74.0, 'KHEL 1': 88, 'KHEL 2': 84, 'KHEL 3': 80, 'Govt Schools': 74 },
      { month: 'Aug', rate: 84.5, govt: 76.5, 'KHEL 1': 90, 'KHEL 2': 86, 'KHEL 3': 83, 'Govt Schools': 76 },
      { month: 'Sep', rate: 86.8, govt: 77.2, 'KHEL 1': 92, 'KHEL 2': 88, 'KHEL 3': 85, 'Govt Schools': 77 },
      { month: 'Oct', rate: 85.1, govt: 75.8, 'KHEL 1': 90, 'KHEL 2': 87, 'KHEL 3': 84, 'Govt Schools': 75 },
      { month: 'Nov', rate: 89.4, govt: 79.1, 'KHEL 1': 93, 'KHEL 2': 90, 'KHEL 3': 87, 'Govt Schools': 79 },
      { month: 'Dec', rate: 91.2, govt: 80.5, 'KHEL 1': 95, 'KHEL 2': 92, 'KHEL 3': 89, 'Govt Schools': 81 },
    ],
  },
  {
    type: 'attendance',
    period: 'annual',
    label: 'Annual Trend (2022-2026)',
    data: [
      { year: '2022', rate: 76.4, govt: 68.2 },
      { year: '2023', rate: 80.1, govt: 71.5 },
      { year: '2024', rate: 83.7, govt: 74.8 },
      { year: '2025', rate: 86.9, govt: 77.3 },
      { year: '2026', rate: 89.8, govt: 79.9 },
    ],
  },
  {
    type: 'sel',
    period: 'monthly',
    label: 'SEL Competency Scores',
    data: {
      competencies: [
        { subject: 'Self-Awareness', score: 86, benchmark: 70 },
        { subject: 'Self-Management', score: 81, benchmark: 65 },
        { subject: 'Social Awareness', score: 89, benchmark: 72 },
        { subject: 'Relationship Skills', score: 84, benchmark: 68 },
        { subject: 'Decision Making', score: 78, benchmark: 62 },
        { subject: 'Empathy & Values', score: 92, benchmark: 75 },
      ],
      trend: [
        { month: 'Jul', overall: 78.5 },
        { month: 'Aug', overall: 80.2 },
        { month: 'Sep', overall: 82.1 },
        { month: 'Oct', overall: 81.7 },
        { month: 'Nov', overall: 84.3 },
        { month: 'Dec', overall: 85.8 },
      ],
    },
  },
  {
    type: 'academic',
    period: 'monthly',
    label: 'Academic Growth (Baseline vs Endline)',
    data: {
      baselineVsEndline: [
        { subject: 'Language & Literacy', baseline: 48, endline: 82 },
        { subject: 'Mathematics & Logic', baseline: 42, endline: 76 },
        { subject: 'Environmental Studies', baseline: 55, endline: 85 },
        { subject: 'Creative Arts & Expression', baseline: 60, endline: 89 },
        { subject: 'English Communication', baseline: 36, endline: 68 },
      ],
      subjectBreakdown: [
        { name: 'Advanced (>80%)', value: 45 },
        { name: 'Proficient (60-80%)', value: 38 },
        { name: 'Developing (40-60%)', value: 12 },
        { name: 'Emerging (<40%)', value: 5 },
      ],
    },
  },
  {
    type: 'health',
    period: 'monthly',
    label: 'Health & Nutrition Indicators',
    data: {
      screeningCoverage: [
        { category: 'General Health Exam', rate: 94 },
        { category: 'Vision Screening', rate: 91 },
        { category: 'Dental Checkup', rate: 88 },
        { category: 'Hb / Anemia Screening', rate: 85 },
        { category: 'BMI / Growth Tracking', rate: 96 },
      ],
      bmiDistribution: [
        { name: 'Normal Weight', value: 72 },
        { name: 'Mild Underweight', value: 18 },
        { name: 'Moderate Underweight', value: 7 },
        { name: 'Overweight', value: 3 },
      ],
      dietarySupport: [
        { month: 'Jul', mealsDistributed: 14200, nutritionSupplements: 320 },
        { month: 'Aug', mealsDistributed: 15400, nutritionSupplements: 345 },
        { month: 'Sep', mealsDistributed: 16100, nutritionSupplements: 360 },
        { month: 'Oct', mealsDistributed: 15800, nutritionSupplements: 350 },
        { month: 'Nov', mealsDistributed: 16900, nutritionSupplements: 380 },
        { month: 'Dec', mealsDistributed: 17500, nutritionSupplements: 395 },
      ],
    },
  },
  {
    type: 'comparison',
    period: 'monthly',
    label: 'Centre Comparison Matrix',
    data: [
      { name: 'Attendance (%)', Danapur: 92, Phulwari: 90, Bakhtiyarpur: 85, Fatwah: 83, GovtDanapur: 78 },
      { name: 'Academic Avg (%)', Danapur: 84, Phulwari: 81, Bakhtiyarpur: 76, Fatwah: 74, GovtDanapur: 68 },
      { name: 'SEL Index', Danapur: 88, Phulwari: 85, Bakhtiyarpur: 79, Fatwah: 77, GovtDanapur: 71 },
      { name: 'Health Cover (%)', Danapur: 95, Phulwari: 92, Bakhtiyarpur: 88, Fatwah: 85, GovtDanapur: 80 },
    ],
  },
];

const initialActivities = [
  { action: 'Teacher Anika Reddy submitted monthly attendance for Class A', type: 'alert', details: 'Class A attendance: 92%' },
  { action: 'Health checkup completed at KHEL Centre - Danapur', type: 'health', details: '185 children screened' },
  { action: 'New program Udaan adolescent girls batch onboarded', type: 'program', details: '45 new enrollments' },
  { action: 'Baseline vs Endline learning assessment report generated', type: 'report', details: 'District average +28% growth' },
];

async function seedAdminData() {
  const schoolCount = await School.countDocuments();
  if (schoolCount === 0) {
    await School.insertMany(initialSchools);
    console.log('✅ Seeded schools collection in Diksha database');
  }

  const programCount = await Program.countDocuments();
  if (programCount === 0) {
    await Program.insertMany(initialPrograms);
    console.log('✅ Seeded programs collection in Diksha database');
  }

  const analyticsCount = await Analytics.countDocuments();
  if (analyticsCount === 0) {
    await Analytics.insertMany(initialAnalytics);
    console.log('✅ Seeded analytics collection in Diksha database');
  }

  const activityCount = await ActivityLog.countDocuments();
  if (activityCount === 0) {
    await ActivityLog.insertMany(initialActivities);
    console.log('✅ Seeded activitylogs collection in Diksha database');
  }
}

module.exports = { seedAdminData };
