require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const School = require('../models/School');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Program = require('../models/Program');
const Attendance = require('../models/Attendance');
const Assessment = require('../models/Assessment');
const HealthRecord = require('../models/HealthRecord');
const BehaviourRecord = require('../models/BehaviourRecord');
const Alert = require('../models/Alert');
const Analytics = require('../models/Analytics');
const ActivityLog = require('../models/ActivityLog');
const Applicant = require('../models/Applicant');
const AlumniRecord = require('../models/AlumniRecord');
const ProgramEnrollment = require('../models/ProgramEnrollment');

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); } catch {}

async function seed() {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diksha_db';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB.');

    console.log('Dropping all collections to ensure a clean slate...');
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
      console.log(`- Dropped collection: ${collection.collectionName}`);
    }

    console.log('\n🌱 Seeding EXACTLY 5 documents per collection (V3 Schema)...\n');

    // ── 1. Schools ──
    const schoolsData = [
      { name: 'KHEL Centre - Danapur', area: 'Danapur', district: 'Patna', type: 'KHEL Centre', programsOffered: ['Foundational Literacy', 'Digital Skills', 'SEL Core'], totalStudents: 1, capacity: 50, attendanceRate: 85, established: '2023' },
      { name: 'Diksha Partner School - Kadamkuan', area: 'Kadamkuan', district: 'Patna', type: 'Government School', programsOffered: ['Remedial Support'], totalStudents: 1, capacity: 100, attendanceRate: 88, established: '2022' },
      { name: 'KHEL Centre - Phulwari Sharif', area: 'Phulwari Sharif', district: 'Patna', type: 'KHEL Centre', programsOffered: ['Foundational Literacy'], totalStudents: 1, capacity: 40, attendanceRate: 79, established: '2024' },
      { name: 'Diksha Main Hub - Patna', area: 'Patna Central', district: 'Patna', type: 'KHEL Centre', programsOffered: ['All Programs'], totalStudents: 1, capacity: 200, attendanceRate: 92, established: '2020' },
      { name: 'KHEL Centre - Digha', area: 'Digha', district: 'Patna', type: 'KHEL Centre', programsOffered: ['Digital Skills'], totalStudents: 1, capacity: 60, attendanceRate: 83, established: '2023' },
    ];
    const schools = await School.insertMany(schoolsData);
    console.log(`✅ Created ${schools.length} Schools.`);

    // ── 2. Teachers ──
    const teachersData = schools.map((school, i) => ({
      teacherId: `T00${i + 1}`,
      name: `Teacher ${i + 1}`,
      email: `teacher${i + 1}@diksha.edu`,
      password: 'password123',
      role: 'teacher',
      status: 'Active',
      centre: school._id,
      centreName: school.name,
      joinDate: '2023-01-15'
    }));
    const teachers = await Teacher.insertMany(teachersData);
    console.log(`✅ Created ${teachers.length} Teachers.`);

    // ── 3. Programs ──
    const programsData = schools.map((school, i) => ({
      name: `Program ${i + 1}`,
      slug: `program-${i + 1}`,
      description: 'A comprehensive foundational program.',
      centers: [school.name],
      enrollment: 1
    }));
    const programs = await Program.insertMany(programsData);
    console.log(`✅ Created ${programs.length} Programs.`);

    // ── 4. Students ──
    const studentsData = schools.map((school, i) => ({
      studentId: `S00${i + 1}`,
      name: `Student ${i + 1}`,
      class: `Class ${['A', 'B', 'C'][i % 3]}`,
      group: i % 2 === 0 ? 'Morning' : 'Afternoon',
      status: 'active',
      school: school._id,
      assignedTeacher: teachers[i]._id,
      dateOfBirth: '2012-05-10',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      joinDate: '2023-06-01',
      address: 'Patna, Bihar'
    }));
    const students = await Student.insertMany(studentsData);
    console.log(`✅ Created ${students.length} Students.`);

    // ── 5. Attendance ──
    const attendanceData = students.map((student, i) => ({
      student: student._id,
      studentId: student.studentId, // legacy
      date: new Date().toISOString().split('T')[0],
      status: i % 4 === 0 ? 'absent' : 'present',
      academicYear: '2026-27',
      class: student.class
    }));
    const attendance = await Attendance.insertMany(attendanceData);
    console.log(`✅ Created ${attendance.length} Attendance Records.`);

    // ── 6. Assessments ──
    const assessmentData = students.map((student, i) => ({
      student: student._id,
      studentId: student.studentId, // legacy
      academicYear: '2026-27',
      period: 'Period 4',
      subject: 'Foundational Literacy',
      assessmentType: 'written_test',
      evaluatorModel: 'Teacher',
      evaluatorId: teachers[i]._id,
      assignment: 15,
      test: 4,
      discipline: 4,
      notes: 4,
      ela: 4,
      total: 31,
      percentage: 77.5
    }));
    const assessments = await Assessment.insertMany(assessmentData);
    console.log(`✅ Created ${assessments.length} Assessments.`);

    // ── 7. HealthRecords ──
    const healthData = students.map((student, i) => ({
      student: student._id,
      studentId: student.studentId, // legacy
      date: new Date().toISOString().split('T')[0],
      height: 140 + i * 2,
      weight: 35 + i,
      bmi: 17.8,
      bmiStatus: 'Reference range',
      notes: 'Healthy.'
    }));
    const healthRecords = await HealthRecord.insertMany(healthData);
    console.log(`✅ Created ${healthRecords.length} Health Records.`);

    // ── 8. BehaviourRecords (SEL) ──
    const behaviourData = students.map((student, i) => ({
      student: student._id,
      studentId: student.studentId, // legacy
      academicYear: '2026-27',
      date: new Date().toISOString().split('T')[0],
      selfAwareness: 7 + (i % 3),
      selfManagement: 6 + (i % 4),
      socialAwareness: 8,
      relationshipSkills: 7,
      responsibleDecisionMaking: 8,
      recentObservation: 'Participated well in group activities.',
      aiInsight: `${student.name} is showing steady progress in social awareness.`,
      trend: i % 3 === 0 ? 'improving' : 'stable'
    }));
    const behaviourRecords = await BehaviourRecord.insertMany(behaviourData);
    console.log(`✅ Created ${behaviourRecords.length} Behaviour Records.`);

    // ── 9. Alerts ──
    const alertsData = students.map((student, i) => ({
      student: student._id,
      studentId: student.studentId, // legacy
      studentName: student.name,
      teacherId: teachers[i].teacherId,
      type: 'general',
      title: 'Monthly Check-in',
      message: 'Routine check-in completed.',
      severity: i % 5 === 0 ? 'warning' : 'info',
      read: false
    }));
    const alerts = await Alert.insertMany(alertsData);
    console.log(`✅ Created ${alerts.length} Alerts.`);

    // ── 10. Analytics ──
    const analyticsData = [
      { type: 'attendance', period: 'monthly', data: [{ month: 'Jan', value: 87 }] },
      { type: 'academic', period: 'monthly', data: [{ month: 'Jan', score: 78 }] },
      { type: 'health', period: 'annual', data: [{ year: '2026', coverage: 92 }] },
      { type: 'sel', period: 'monthly', data: [{ month: 'Jan', index: 8.1 }] },
      { type: 'comparison', period: 'monthly', data: [{ school: 'KHEL Centre - Danapur', score: 85 }] },
    ];
    const analytics = await Analytics.insertMany(analyticsData);
    console.log(`✅ Created ${analytics.length} Analytics Records.`);

    // ── 11. ActivityLogs ──
    const activityData = [
      { action: 'Seed script started', type: 'general', user: 'Admin' },
      { action: 'Created schools and programs', type: 'general', user: 'Admin' },
      { action: 'Created students and teachers', type: 'general', user: 'Admin' },
      { action: 'Generated assessment and attendance records', type: 'general', user: 'Admin' },
      { action: 'Seed script completed successfully', type: 'general', user: 'Admin' },
    ];
    const logs = await ActivityLog.insertMany(activityData);
    console.log(`✅ Created ${logs.length} Activity Logs.\n`);

    console.log('🎉 Seeding complete! Database is now perfectly clean with 5 interconnected documents per collection.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
