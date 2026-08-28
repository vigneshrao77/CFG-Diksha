const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  height: { type: Number, required: true }, // cm
  weight: { type: Number, required: true }, // kg
  bmi: { type: Number, required: true },
  bmiStatus: { type: String, required: true },
  notes: { type: String, default: '' },
  recordedBy: { type: String, default: 'T001' },
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
