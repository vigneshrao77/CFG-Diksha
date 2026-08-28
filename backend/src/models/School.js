const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
