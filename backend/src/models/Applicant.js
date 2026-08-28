const mongoose = require('mongoose');

/**
 * Applicant — REQ #6
 * Represents a child in the pre-enrollment pipeline before they become a Student.
 * Pipeline stages: applied → shortlisted → assessed → enrolled → rejected
 *
 * When status reaches 'enrolled':
 *   1. Create a Student document from this applicant's data
 *   2. Set convertedToStudent = <new Student._id>
 *   3. Set status = 'enrolled'
 */
const applicantSchema = new mongoose.Schema({
  // Personal details — mirrors Student shape for easy promotion
  name:            { type: String, required: true, trim: true },
  parentName:      { type: String },
  parentPhone:     { type: String },
  address:         { type: String },

  // Centre they applied to
  school:          { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

  // Community outreach source
  outreachSource:  { type: String },   // e.g. "community visit", "referral", "camp"

  // Due diligence (verification of household/eligibility)
  dueDiligenceStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },

  // Informal assessment (pre-enrollment screening)
  informalAssessmentScore: { type: Number, min: 0, max: 100 },
  recommendedProgram:      { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  // Pipeline status
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'assessed', 'enrolled', 'rejected'],
    default: 'applied',
  },

  // Set once enrolled — links back to the created Student document
  convertedToStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
}, { timestamps: true });

applicantSchema.index({ school: 1, status: 1 });
applicantSchema.index({ convertedToStudent: 1 }, { sparse: true });

module.exports = mongoose.model('Applicant', applicantSchema);
