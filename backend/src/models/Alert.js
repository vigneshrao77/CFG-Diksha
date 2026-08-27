const mongoose = require('mongoose');

/**
 * Alert — Teacher-to-student notification
 * Compatible with future student notification system.
 */
const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, index: true },
  studentName: String,
  teacherId: { type: String, default: 'T001' },
  type: { type: String, enum: ['performance', 'attendance', 'assignment', 'behaviour', 'general'], default: 'general' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
