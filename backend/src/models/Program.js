const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  programId:         { type: String },
  title:             { type: String },
  name:              { type: String, trim: true },
  slug:              { type: String, lowercase: true },
  description:       { type: String },
  icon:              { type: String },
  color:             { type: String, default: '#1E3A5F' },
  centers:           [{ type: String }],
  enrollment:        { type: Number, default: 0 },
  completion:        { type: Number, min: 0, max: 100, default: 0 },
  monthlyAttendance: [
    {
      month: String,
      value: Number,
    },
  ],
  cohortBreakdown: [
    {
      name:  String,
      value: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
