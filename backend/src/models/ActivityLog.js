const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action:    { type: String, required: true },
  user:      { type: String, default: 'Admin' },
  role:      { type: String, default: 'admin' },
  details:   { type: String },
  type:      { type: String, enum: ['teacher_add', 'report', 'alert', 'program', 'health', 'general'], default: 'general' },
  timestamp: { type: Date, default: Date.now },
  // REQ #7: Admin is NOT a separate collection — actorModel updated to Teacher | Student
  // (Student because self/peer evaluations from REQ #2 may generate activity log entries)
  actorId:    { type: mongoose.Schema.Types.ObjectId, refPath: 'actorModel' },
  actorModel: { type: String, enum: ['Teacher', 'Student'] },  // dropped 'Admin' — Teacher with role:admin covers that
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'activitylogs');
