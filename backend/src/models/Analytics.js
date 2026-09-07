const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type:   { type: String, enum: ['attendance', 'academic', 'sel', 'health', 'comparison'], required: true },
  period: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
  label:  { type: String },
  data:   { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

analyticsSchema.index({ type: 1, period: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema, 'analytics');
