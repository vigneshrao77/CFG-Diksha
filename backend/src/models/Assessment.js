const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: Number },
  dimension: { type: String },
  question: { type: String },
  options: [{
    id: { type: String },
    text: { type: String },
    score: { type: Number }
  }]
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  assessmentId: { type: String },
  title: { type: String },
  type: { type: String },
  subject: { type: String },
  durationMinutes: { type: Number, default: 30 },
  totalQuestions: { type: Number },
  questions: [QuestionSchema],

  // Teacher Evaluation Fields
  studentId: { type: String, index: true },
  period: { type: String },
  assignment: { type: Number, min: 0, max: 20, default: 0 },
  test: { type: Number, min: 0, max: 5, default: 0 },
  discipline: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: Number, min: 0, max: 5, default: 0 },
  ela: { type: Number, min: 0, max: 5, default: 0 },
  total: { type: Number, min: 0, max: 40, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },
  teacherId: { type: String, default: 'T001' }
}, { timestamps: true });

assessmentSchema.index({ studentId: 1, period: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
