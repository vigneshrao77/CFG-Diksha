const mongoose = require('mongoose');

/**
 * Program — Educational programs run by Diksha Foundation.
 *
 * REQ #7 resolution (option a):
 *   monthlyAttendance and cohortBreakdown have been REMOVED from this model.
 *   Analytics is the canonical rollup store for these time-series aggregates.
 *   Query: Analytics.find({ type: 'attendance', period: 'monthly', 'data.programSlug': slug })
 *   The removed fields are documented here as @deprecated in case cached data exists in Atlas:
 *     monthlyAttendance: [{ month: String, value: Number }]  -- @deprecated removed in v2
 *     cohortBreakdown:   [{ name: String, value: Number }]   -- @deprecated removed in v2
 */
const programSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  icon:        { type: String },
  color:       { type: String, default: '#1E3A5F' },
  centers:     [{ type: String }],   // area names for quick display
  enrollment:  { type: Number, default: 0 },
  completion:  { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
