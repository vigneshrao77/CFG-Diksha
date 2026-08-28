const mongoose = require('mongoose');

/**
 * Report — Admin-generated periodic reports
 * Stores generated report snapshots for download/history.
 */
const reportSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  type:      { type: String, enum: ['monthly', 'quarterly', 'annual', 'custom'], required: true },
  period:    { type: String, required: true },     // e.g. "Aug 2026", "Q2 2026"
  centre:    { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  centreName:{ type: String },                     // denormalized for display
  program:   { type: String },                     // program slug e.g. 'khel'
  generatedBy: { type: String, default: 'Admin' },
  summary: {
    totalStudents:  { type: Number, default: 0 },
    activeCentres:  { type: Number, default: 0 },
    programsRun:    { type: Number, default: 0 },
    avgAttendance:  { type: Number, default: 0 },
    holisticScore:  { type: Number, default: 0 },
  },
  // Full data payload (flexible for different report types)
  data: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
}, { timestamps: true });

reportSchema.index({ type: 1, period: 1, centre: 1 });

module.exports = mongoose.model('Report', reportSchema);
