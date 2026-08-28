const mongoose = require('mongoose');

/**
 * Alert — Teacher/system-to-student notification.
 * alertId (manual string) is kept for legacy compat — use _id for new docs.
 */
const alertSchema = new mongoose.Schema({
  // NEW A1: ObjectId ref — authoritative student reference
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  // LEGACY: studentId string kept for display/compat — non-authoritative
  studentId:  { type: String, index: true },   // @legacy — use student ObjectId ref instead

  studentName: String,
  // E1: 'health' added to enum
  type: {
    type: String,
    enum: ['performance', 'attendance', 'assignment', 'behaviour', 'health', 'general'],
    default: 'general',
  },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  read:     { type: Boolean, default: false },

  // ObjectId refs
  teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  school:    { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  teacherId: { type: String },    // @deprecated — use teacher ref
  alertId:   { type: String },    // @deprecated — use _id
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
