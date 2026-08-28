const mongoose = require('mongoose');

/**
 * Task — REQ #5
 * Centralized task management for teachers, volunteers, and admins.
 * Supports volunteer↔management communication around program delivery.
 */
const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  // Both teachers, volunteers, and admins are stored in the Teacher collection
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  school:      { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  program:     { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  dueDate:     { type: String },                                      // YYYY-MM-DD
  status:      { type: String, enum: ['todo', 'in_progress', 'done', 'blocked'], default: 'todo' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ school: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
