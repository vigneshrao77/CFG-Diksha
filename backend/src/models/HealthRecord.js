const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  // NEW A1: ObjectId ref — authoritative student reference
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  // LEGACY: studentId string kept for display/compat — non-authoritative
  studentId:  { type: String, index: true },  // @legacy — use student ObjectId ref instead

  date:       { type: String, required: true },    // YYYY-MM-DD
  height:     { type: Number, required: true },    // cm
  weight:     { type: Number, required: true },    // kg
  bmi:        { type: Number, required: true },
  bmiStatus:  {
    type: String,
    required: true,
    enum: ['Reference range', 'Mild Underweight', 'Moderate Underweight', 'Overweight', 'Obese'],
  },
  notes:      { type: String, default: '' },

  // ObjectId refs
  recordedByTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  school:            { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  recordedBy:        { type: String },  // @deprecated — use recordedByTeacher ref

}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
