const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  dimension: { type: String },
  question: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    score: { type: Number }
  }]
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['academic_test', 'sel_assessment', 'communication_assessment'], required: true },
  subject: { type: String },
  durationMinutes: { type: Number, default: 30 },
  totalQuestions: { type: Number, default: 30 },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);
