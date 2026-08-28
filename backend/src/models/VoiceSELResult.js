const mongoose = require('mongoose');

const VoiceSELResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  assessmentType: { type: String, default: 'SEL' },
  month: { type: String, required: true }, // Format YYYY-MM e.g. "2026-08"
  year: { type: Number, default: 2026 },
  status: { type: String, default: 'COMPLETED' },

  scores: {
    selfAwareness: { type: Number, required: true }, // Percentage 0-100
    selfManagement: { type: Number, required: true },
    empathy: { type: Number, required: true },
    communication: { type: Number, required: true },
    teamwork: { type: Number, required: true },
    decisionMaking: { type: Number, required: true }
  },

  overallSELScore: { type: Number, required: true }, // Average of 6 SEL dimensions (0-100)
  communicationScore: { type: Number, required: true }, // Average communication score (0-100)

  strengths: [{ type: String }],
  areasForImprovement: [{ type: String }],
  recommendations: [{ type: String }],

  questionTranscripts: [{
    questionId: Number,
    dimension: String,
    question: String,
    transcript: String,
    selScore: Number, // 1-10
    communicationScore: Number, // 1-10
    selAnalysis: String,
    communicationAnalysis: String,
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    feedback: String,
    speechIndicators: {
      observation: String,
      confidenceRelatedIndicator: String
    }
  }],

  growth: {
    overallGrowth: { type: Number, default: 0 },
    message: { type: String, default: '' },
    previousMonth: { type: String, default: '' }
  },

  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Enforce strictly ONE assessment per student + assessmentType + month
VoiceSELResultSchema.index({ studentId: 1, assessmentType: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('VoiceSELResult', VoiceSELResultSchema);
