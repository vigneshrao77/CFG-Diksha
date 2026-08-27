const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  initial: { type: String, default: 'TR' },
  avatarColor: { type: String, default: '#1E3A5F' },
  classes: [{ type: String }],
  subject: { type: String, default: 'General' },
  role: { type: String, default: 'teacher' },
}, { timestamps: true });

// Pre-save hook to hash password if modified
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
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
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Teacher', teacherSchema);
