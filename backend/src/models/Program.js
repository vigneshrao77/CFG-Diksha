const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  programId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Program', ProgramSchema);
