const mongoose = require('mongoose');

const LeaderboardRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  school: { type: String, required: true },
  class: { type: String, required: true },
  month: { type: String, required: true }, // YYYY-MM e.g. "2026-08"
  assignmentScore: { type: Number, required: true }, // Out of 20
  assignmentMax: { type: Number, default: 20 },
  assignmentPercentage: { type: Number, required: true }, // (assignmentScore/20)*100
  selScore: { type: Number, required: true }, // Out of 120
  selMax: { type: Number, default: 120 },
  selPercentage: { type: Number, required: true }, // (selScore/120)*100
  combinedScore: { type: Number, required: true }, // (assignmentPercentage*0.5) + (selPercentage*0.5)
  previousCombinedScore: { type: Number, default: 0 },
  improvement: { type: Number, default: 0 }, // combinedScore - previousCombinedScore
  isMostImproved: { type: Boolean, default: false }
}, { timestamps: true });

LeaderboardRecordSchema.index({ studentId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('LeaderboardRecord', LeaderboardRecordSchema);
