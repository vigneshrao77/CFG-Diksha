const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  // NEW A1: ObjectId ref — authoritative student reference
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  // LEGACY: studentId string kept for display/compat — non-authoritative
  studentId:  { type: String, index: true },  // @legacy — use student ObjectId ref instead

  period:     { type: String, required: true },

  // Academic scores
  assignment: { type: Number, min: 0, max: 20, default: 0 },
  test:       { type: Number, min: 0, max: 5, default: 0 },
  discipline: { type: Number, min: 0, max: 5, default: 0 },
  notes:      { type: Number, min: 0, max: 5, default: 0 },
  ela:        { type: Number, min: 0, max: 5, default: 0 },
  total:      { type: Number, min: 0, max: 40, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },

  // ObjectId refs
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  school:     { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  teacherId:  { type: String },   // @deprecated — use teacher ref

  // Program linkage
  program:    { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  // NEW C2: academic year
  academicYear: { type: String }, // e.g. "2025-26"

  // NEW C3: subject and type — different axis from evaluatorType
  subject:        { type: String },   // e.g. "Math", "Science", "Arts", "SEL"
  assessmentType: {
    type: String,
    enum: ['written_test', 'project', 'practical', 'oral', 'rubric_based', 'self_assessment'],
  },

  // D1: Self-assessment and peer review
  evaluatorType:  { type: String, enum: ['teacher', 'self', 'peer'], default: 'teacher' },
  // Polymorphic: Teacher._id when teacher; Student._id when self/peer
  evaluatedBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'evaluatorModel' },
  evaluatorModel: { type: String, enum: ['Teacher', 'Student'], default: 'Teacher' },

}, { timestamps: true });

// A1: Authoritative unique index on ObjectId ref × period × evaluatorType
// Sparse=true → safe during backfill (only enforced when student field is present)
assessmentSchema.index({ student: 1, period: 1, evaluatorType: 1 }, { unique: true, sparse: true });

// C2: Year-over-year compound index
assessmentSchema.index({ student: 1, academicYear: 1 });

// @legacy: { studentId, period } index DROPPED per A1 requirement

module.exports = mongoose.model('Assessment', assessmentSchema);
