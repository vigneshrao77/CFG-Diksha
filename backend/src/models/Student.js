const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId:       { type: String, required: true, unique: true, index: true },
  name:            { type: String, required: true },
  class:           { type: String, required: true },
  group:           { type: String, default: 'Morning' },
  initial:         String,
  avatarColor:     String,
  email:           String,
  phone:           String,
  parentName:      String,
  parentPhone:     String,
  address:         String,
  joinDate:        String,
  // EXTENDED B2: added 'alumni'
  status:          { type: String, enum: ['active', 'inactive', 'alumni'], default: 'active' },
  // ObjectId refs
  school:          { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  // NEW B1: demographics — not required retroactively; enforce at app layer for new records
  dateOfBirth:     { type: String },   // YYYY-MM-DD
  gender:          { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
}, { timestamps: true });

// NEW B1: Virtual — age computed from dateOfBirth (not stored, never stale)
studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob   = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
});

// NEW E5: Keep School.students in sync when a student is created, deleted, or moved
async function syncSchoolCount(schoolId) {
  if (!schoolId) return;
  const School = mongoose.model('School');
  const count  = await mongoose.model('Student').countDocuments({ school: schoolId, status: { $ne: 'inactive' } });
  await School.findByIdAndUpdate(schoolId, { students: count });
}

studentSchema.post('save', async function () {
  await syncSchoolCount(this.school);
});

studentSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await syncSchoolCount(doc.school);
});

studentSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await syncSchoolCount(doc.school);
});

module.exports = mongoose.model('Student', studentSchema);
