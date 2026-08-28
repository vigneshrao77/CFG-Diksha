const mongoose = require('mongoose');

/**
 * AlumniRecord — REQ #3
 * Extended alumni tracking for students who have graduated from the program.
 * Created when Student.status is set to 'alumni'.
 *
 * IMPORTANT: Student.status: 'inactive' docs are NOT automatically alumni.
 * A human decision is required before setting status → 'alumni' and creating an AlumniRecord.
 * See migration notes in schema_reference.md.
 */
const alumniRecordSchema = new mongoose.Schema({
  student:           { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  graduationDate:    { type: String },                 // YYYY-MM-DD
  higherEducation:   { type: String },                 // e.g. "Class 11 at Govt. Senior Secondary"
  currentOccupation: { type: String },                 // e.g. "Apprentice mechanic"
  achievements:      { type: String },                 // free text — donor storytelling content
  lastContactDate:   { type: String },                 // YYYY-MM-DD
  contactMethod:     { type: String },                 // e.g. "phone", "visit", "alumni event"
}, { timestamps: true });

module.exports = mongoose.model('AlumniRecord', alumniRecordSchema);
