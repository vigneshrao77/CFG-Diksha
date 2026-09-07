const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  generatedDate: { type: Date, default: Date.now },
  summary: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
