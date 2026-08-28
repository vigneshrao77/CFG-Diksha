const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  school: { type: String, required: true },
  subjects: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
