const mongoose = require('mongoose');

const behaviourRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  communication: { type: Number, min: 0, max: 10, default: 5 },
  behaviourPoints: { type: Number, min: 0, max: 10, default: 5 },
  recentObservation: { type: String, default: '' },
  aiInsight: { type: String, default: '' },
  trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
  recordedBy: { type: String, default: 'T001' },
}, { timestamps: true });

module.exports = mongoose.model('BehaviourRecord', behaviourRecordSchema);
