const mongoose = require('mongoose');

const behaviourRecordSchema = new mongoose.Schema({
  // NEW A1: ObjectId ref — authoritative student reference
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  // LEGACY: studentId string kept for display/compat — non-authoritative
  studentId:  { type: String, index: true },  // @legacy — use student ObjectId ref instead

  date:       { type: String }, // YYYY-MM-DD

  // LEGACY SEL fields — kept, do not delete; historical values must not be auto-mapped
  // See migration note: communication ≈ overlaps with relationshipSkills for manual backfill
  communication:   { type: Number, min: 0, max: 10, default: 5 },  // @legacy
  behaviourPoints: { type: Number, min: 0, max: 10, default: 5 },  // @legacy

  // NEW C1: CASEL five competency dimensions (0–10, matching legacy scale)
  selfAwareness:            { type: Number, min: 0, max: 10 },
  selfManagement:           { type: Number, min: 0, max: 10 },
  socialAwareness:          { type: Number, min: 0, max: 10 },
  relationshipSkills:       { type: Number, min: 0, max: 10 },
  responsibleDecisionMaking:{ type: Number, min: 0, max: 10 },

  recentObservation: { type: String, default: '' },
  aiInsight:         { type: String, default: '' },
  trend:             { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },

  // ObjectId refs
  recordedByTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  school:            { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  recordedBy:        { type: String },  // @deprecated — use recordedByTeacher ref

  // Program linkage
  program:    { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  // NEW C2: academic year
  academicYear: { type: String }, // e.g. "2025-26"

}, { timestamps: true });

// NEW C1: Virtual — overallSelIndex = average of the five CASEL dimensions
// Intended to eventually feed School.selIndex via Analytics rollup
behaviourRecordSchema.virtual('overallSelIndex').get(function () {
  const dims = [
    this.selfAwareness,
    this.selfManagement,
    this.socialAwareness,
    this.relationshipSkills,
    this.responsibleDecisionMaking,
  ].filter(v => v != null);
  if (dims.length === 0) return null;
  const avg = dims.reduce((sum, v) => sum + v, 0) / dims.length;
  return Math.round(avg * 10) / 10; // 1 decimal place
});

// C2: compound index for year-over-year queries
behaviourRecordSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.model('BehaviourRecord', behaviourRecordSchema);
