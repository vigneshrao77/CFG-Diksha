const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  group: { type: String, default: 'Morning' },
  initial: String,
  avatarColor: String,
  email: String,
  phone: String,
  parentName: String,
  parentPhone: String,
  address: String,
  joinDate: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
