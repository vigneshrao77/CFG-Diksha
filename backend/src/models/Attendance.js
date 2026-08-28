const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // NEW A1: ObjectId ref — authoritative student reference
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  // LEGACY: studentId string kept for display/compat — non-authoritative, do not use for joins
  studentId: { type: String, index: true },  // @legacy — use student ObjectId ref instead

  date:      { type: String, required: true }, // YYYY-MM-DD
  // EXTENDED: added 'late' and 'excused'
  status:    { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  class:     String,

  // ObjectId refs
  teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  school:    { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  teacherId: { type: String },  // @deprecated — use teacher ref

  // Program ref: distinguishes KHEL after-school from govt-school hours
  program:   { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  // NEW C2: academic year — required for new docs, nullable on historical backfill
  academicYear: { type: String }, // e.g. "2025-26"

}, { timestamps: true });

// A1: New authoritative unique index on ObjectId ref
// Sparse=true → only enforced when student field is present (safe during backfill)
attendanceSchema.index({ student: 1, date: 1 }, { unique: true, sparse: true });

// C2: Compound index for year-over-year queries
attendanceSchema.index({ student: 1, academicYear: 1 });

// @legacy index kept for backward compat with old queries using studentId string
// attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true }); ← DROPPED (A1 requirement)

module.exports = mongoose.model('Attendance', attendanceSchema);
