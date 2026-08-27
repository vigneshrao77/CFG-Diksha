const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  period: { type: String, required: true },
  assignment: { type: Number, min: 0, max: 20, default: 0 },
  test: { type: Number, min: 0, max: 5, default: 0 },
  discipline: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: Number, min: 0, max: 5, default: 0 },
  ela: { type: Number, min: 0, max: 5, default: 0 },
  total: { type: Number, min: 0, max: 40, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },
  teacherId: { type: String, default: 'T001' },
}, { timestamps: true });

assessmentSchema.index({ studentId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
