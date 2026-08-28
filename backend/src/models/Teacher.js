const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  teacherId:     { type: String, required: true, unique: true, index: true },
  name:          { type: String, required: true, trim: true },
  email:         { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password:      { type: String },
  school:        { type: String, default: 'Diksha Model High School' },
  subjects:      [{ type: String }],
  initial:       { type: String, default: 'TR' },
  avatarColor:   { type: String, default: '#1E3A5F' },
  classes:       [{ type: String }],
  subject:       { type: String, default: 'General' },
  role:          { type: String, default: 'teacher' },
  centre:        { type: String, default: 'KHEL Centre - Danapur' },
  phone:         { type: String },
  qualification: { type: String, default: 'B.Ed, B.Sc' },
  rating:        { type: Number, default: 4.8 },
  status:        { type: String, default: 'Active' },
  joinDate:      { type: String },
}, { timestamps: true });

// Pre-save hook to hash password if modified
teacherSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
teacherSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Teacher', teacherSchema);
