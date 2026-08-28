const mongoose = require('mongoose');

/**
 * ProgramEnrollment — REQ #1
 * Tracks which student is enrolled in which program, at which school.
 * This is the canonical source for "student ↔ program" linkage.
 */
const programEnrollmentSchema = new mongoose.Schema({
  student:        { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  program:        { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
  school:         { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  cohort:         { type: String },                    // e.g. "2026 Batch A"
  enrollmentDate: { type: String, required: true },    // YYYY-MM-DD
  status:         { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  completionDate: { type: String },                    // YYYY-MM-DD, set when status → completed
}, { timestamps: true });

// A student can only be enrolled in each program once
programEnrollmentSchema.index({ student: 1, program: 1 }, { unique: true });

module.exports = mongoose.model('ProgramEnrollment', programEnrollmentSchema);
