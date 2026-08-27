const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action:    { type: String, required: true },
  user:      { type: String, default: 'Admin' },
  role:      { type: String, default: 'admin' },
  details:   { type: String },
  type:      { type: String, enum: ['teacher_add', 'report', 'alert', 'program', 'health', 'general'], default: 'general' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'activitylogs');
