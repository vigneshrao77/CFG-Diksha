require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const HealthRecord = require('../models/HealthRecord');
const Assessment = require('../models/Assessment');
const BehaviourRecord = require('../models/BehaviourRecord');
const Alert = require('../models/Alert');
const Teacher = require('../models/Teacher');

const SEED_STUDENTS = [
  { studentId: 'S001', name: 'Arjun Sharma', class: 'Class A', group: 'Morning', initial: 'AS', avatarColor: '#1E3A5F', email: 'arjun.sharma@diksha.edu', phone: '9876543210', parentName: 'Rajesh Sharma', parentPhone: '9876543211', address: '12 MG Road, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S002', name: 'Priya Patel', class: 'Class A', group: 'Morning', initial: 'PP', avatarColor: '#3F8F5F', email: 'priya.patel@diksha.edu', phone: '9876543220', parentName: 'Sunita Patel', parentPhone: '9876543221', address: '45 Residency Road, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S003', name: 'Ravi Kumar', class: 'Class A', group: 'Morning', initial: 'RK', avatarColor: '#6B48A2', email: 'ravi.kumar@diksha.edu', phone: '9876543230', parentName: 'Suresh Kumar', parentPhone: '9876543231', address: '8 Brigade Road, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S004', name: 'Meena Reddy', class: 'Class A', group: 'Morning', initial: 'MR', avatarColor: '#2E7D8E', email: 'meena.reddy@diksha.edu', phone: '9876543240', parentName: 'Latha Reddy', parentPhone: '9876543241', address: '23 Indiranagar, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S005', name: 'Suresh Nair', class: 'Class B', group: 'Afternoon', initial: 'SN', avatarColor: '#A0522D', email: 'suresh.nair@diksha.edu', phone: '9876543250', parentName: 'Anitha Nair', parentPhone: '9876543251', address: '77 Koramangala, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S006', name: 'Kavya Menon', class: 'Class B', group: 'Afternoon', initial: 'KM', avatarColor: '#1E6B5F', email: 'kavya.menon@diksha.edu', phone: '9876543260', parentName: 'Priya Menon', parentPhone: '9876543261', address: '34 Whitefield, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S007', name: 'Rohan Gupta', class: 'Class B', group: 'Afternoon', initial: 'RG', avatarColor: '#7B3F8F', email: 'rohan.gupta@diksha.edu', phone: '9876543270', parentName: 'Amit Gupta', parentPhone: '9876543271', address: '56 HSR Layout, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S008', name: 'Aisha Khan', class: 'Class B', group: 'Afternoon', initial: 'AK', avatarColor: '#2E5EA0', email: 'aisha.khan@diksha.edu', phone: '9876543280', parentName: 'Salma Khan', parentPhone: '9876543281', address: '90 JP Nagar, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S009', name: 'Dev Verma', class: 'Class C', group: 'Morning', initial: 'DV', avatarColor: '#8F5F1E', email: 'dev.verma@diksha.edu', phone: '9876543290', parentName: 'Rakesh Verma', parentPhone: '9876543291', address: '15 Marathahalli, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S010', name: 'Sneha Joshi', class: 'Class C', group: 'Morning', initial: 'SJ', avatarColor: '#3F5F8F', email: 'sneha.joshi@diksha.edu', phone: '9876543300', parentName: 'Geeta Joshi', parentPhone: '9876543301', address: '67 Banashankari, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S011', name: 'Aryan Singh', class: 'Class C', group: 'Morning', initial: 'AS', avatarColor: '#6B3A2E', email: 'aryan.singh@diksha.edu', phone: '9876543310', parentName: 'Manish Singh', parentPhone: '9876543311', address: '29 Rajajinagar, Bangalore', joinDate: '2024-01-15', status: 'active' },
  { studentId: 'S012', name: 'Lakshmi Iyer', class: 'Class C', group: 'Morning', initial: 'LI', avatarColor: '#2E8F5F', email: 'lakshmi.iyer@diksha.edu', phone: '9876543320', parentName: 'Radha Iyer', parentPhone: '9876543321', address: '11 Basavanagudi, Bangalore', joinDate: '2024-01-15', status: 'active' },
];

async function seedData() {
  const studentCount = await Student.countDocuments();
  if (studentCount > 0) return; // already seeded

  console.log('🌱 Populating initial MongoDB dataset for Diksha Teacher workspace...');

  // Create demo teacher
  const teacherExists = await Teacher.findOne({ email: 'anika.reddy@diksha.edu' });
  if (!teacherExists) {
    await Teacher.create({
      teacherId: 'T001',
      name: 'Ms. Anika Reddy',
      email: 'anika.reddy@diksha.edu',
      password: 'password123',
      initial: 'AR',
      avatarColor: '#1E3A5F',
      classes: ['Class A', 'Class B', 'Class C'],
      subject: 'Primary Education',
      role: 'teacher',
    });
  }

  // Insert students
  await Student.insertMany(SEED_STUDENTS);

  const today = new Date().toISOString().split('T')[0];

  // Insert attendance, assessments, health, behaviour for each student
  for (const s of SEED_STUDENTS) {
    // 30 days of attendance
    const attRecords = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const isAbsent = (s.studentId === 'S004' && i % 4 === 0) || (s.studentId === 'S005' && i % 2 === 0);
      attRecords.push({
        studentId: s.studentId,
        date: d.toISOString().split('T')[0],
        status: isAbsent ? 'absent' : 'present',
        class: s.class,
        teacherId: 'T001',
      });
    }
    await Attendance.insertMany(attRecords);

    // Assessments
    const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
    for (let pIdx = 0; pIdx < periods.length; pIdx++) {
      const period = periods[pIdx];
      const isDeclining = (s.studentId === 'S004' || s.studentId === 'S007' || s.studentId === 'S010') && period === 'Period 4';
      const isHigh = s.studentId === 'S001' || s.studentId === 'S008';
      const assignment = isDeclining ? 11 : isHigh ? 19 : 15;
      const test = isDeclining ? 2 : 4;
      const discipline = isDeclining ? 3 : 4;
      const notes = isDeclining ? 2 : 4;
      const ela = isDeclining ? 3 : 4;
      const total = assignment + test + discipline + notes + ela;
      await Assessment.create({
        studentId: s.studentId,
        period,
        assignment,
        test,
        discipline,
        notes,
        ela,
        total,
        percentage: Math.round((total / 40) * 100),
        teacherId: 'T001',
      });
    }

    // Health
    const months = ['2024-02-15', '2024-05-10', today];
    for (const d of months) {
      await HealthRecord.create({
        studentId: s.studentId,
        date: d,
        height: 165,
        weight: 55,
        bmi: 20.2,
        bmiStatus: 'Reference range',
      });
    }

    // Behaviour
    const isBehavIssue = s.studentId === 'S007';
    await BehaviourRecord.create({
      studentId: s.studentId,
      communication: s.studentId === 'S008' ? 10 : isBehavIssue ? 5 : 8,
      behaviourPoints: s.studentId === 'S008' ? 10 : isBehavIssue ? 4 : 8,
      recentObservation: isBehavIssue
        ? 'Frequently off-task during group tasks. Needs structured encouragement.'
        : 'Active participation and steady collaborative work in class.',
      aiInsight: isBehavIssue
        ? `${s.name} would benefit from smaller group activities and frequent check-ins.`
        : `${s.name} demonstrates consistent enthusiasm and positive peer relationships.`,
      trend: isBehavIssue ? 'declining' : 'stable',
    });
  }

  // Sample alert
  await Alert.create({
    alertId: 'A001',
    studentId: 'S004',
    studentName: 'Meena Reddy',
    type: 'performance',
    title: 'Performance Check-In',
    message: 'Your recent assessment performance has decreased. Please review your recent work and speak with your teacher at your earliest convenience.',
    severity: 'warning',
    read: false,
  });

  console.log('✅ Initial database seed ready!');
}

// Standalone execution
if (require.main === module) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diksha_db';
  mongoose.connect(uri).then(async () => {
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await HealthRecord.deleteMany({});
    await Assessment.deleteMany({});
    await BehaviourRecord.deleteMany({});
    await Alert.deleteMany({});
    await Teacher.deleteMany({});
    await seedData();
    console.log('Full reset & seed completed.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seedData };
