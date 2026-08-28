const mongoose = require('mongoose');

const MonthlyAcademicSchema = new mongoose.Schema({
  month: { type: String, required: true }, // Format YYYY-MM
  assignmentScore: { type: Number, default: 0 }, // Out of 20
  assignmentMax: { type: Number, default: 20 },
  percentage: { type: Number, default: 0 },
  previousMonthComparison: { type: Number, default: 0 }
}, { _id: false });

const MonthlySELSchema = new mongoose.Schema({
  month: { type: String, required: true },
  rawScore: { type: Number, default: 0 }, // Out of 120
  maxScore: { type: Number, default: 120 },
  percentage: { type: Number, default: 0 },
  dimensions: {
    selfAwareness: { type: Number, default: 0 },
    selfManagement: { type: Number, default: 0 },
    empathy: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    teamwork: { type: Number, default: 0 },
    responsibleDecisionMaking: { type: Number, default: 0 }
  }
}, { _id: false });

const HealthSchema = new mongoose.Schema({
  height: { type: Number, default: 0 }, // cm
  weight: { type: Number, default: 0 }, // kg
  bmi: { type: Number, default: 0 },
  lastCheckupDate: { type: Date, default: Date.now }
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  percentage: { type: Number, default: 100 }
}, { _id: false });

const BehaviourSchema = new mongoose.Schema({
  disciplineScore: { type: Number, default: 100 },
  points: { type: Number, default: 0 },
  observations: [{ type: String }],
  teacherFeedback: { type: String, default: '' }
}, { _id: false });

const AlertSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['academic', 'attendance', 'sel', 'general', 'improvement'], default: 'general' },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, default: 'A' },
  group: { type: String, default: 'Morning' },
  school: { type: String, default: 'Diksha Model High School' },
  batch: { type: String, default: '2025-2026' },
  age: { type: Number, default: 15 },
  initial: String,
  avatarColor: String,
  email: String,
  phone: String,
  parentName: String,
  parentPhone: String,
  address: String,
  joinDate: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  health: { type: HealthSchema, default: () => ({}) },
  attendance: { type: AttendanceSchema, default: () => ({}) },
  behaviour: { type: BehaviourSchema, default: () => ({}) },
  monthlyAcademics: [MonthlyAcademicSchema],
  monthlySEL: [MonthlySELSchema],
  alerts: [AlertSchema],
  achievements: [{
    id: String,
    title: String,
    category: String,
    dateEarned: String,
    description: String,
    icon: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
