const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  type:             { type: String, enum: ['KHEL Centre', 'Government School'], required: true },
  area:             { type: String, required: true },
  district:         { type: String, required: true },
  state:            { type: String, default: 'Bihar' },
  students:         { type: Number, default: 0 },
  capacity:         { type: Number, default: 0 },
  status:           { type: String, enum: ['Excellent', 'Progressing', 'Needs Attention'], default: 'Progressing' },
  attendanceRate:   { type: Number, min: 0, max: 100, default: 0 },
  avgAcademicScore: { type: Number, min: 0, max: 100, default: 0 },
  selIndex:         { type: Number, min: 0, max: 100, default: 0 },
  healthCoverage:   { type: Number, min: 0, max: 100, default: 0 },
  established:      { type: String },
  head:             { type: String },
  programs:         [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
