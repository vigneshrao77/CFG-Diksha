const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// All student routes require authMiddleware
router.use(authMiddleware);

// Dashboard & Progress
router.get('/dashboard', studentController.getDashboard);
router.get('/progress', studentController.getProgress);

// Leaderboard
router.get('/leaderboard', studentController.getLeaderboard);

// 🎤 Groq + Whisper + Gemini AI Voice SEL Pipeline Endpoints
router.get('/voice/status', studentController.getMonthlyAssessmentStatus);
router.post('/voice/generate-questions', studentController.generate12VoiceQuestions);
router.post('/voice/transcribe', studentController.transcribeGroqWhisper);
router.post('/voice/analyze-question', studentController.analyzeVoiceResponse);
router.post('/voice/submit-report', studentController.submitVoiceSELReport);
router.get('/voice/history', studentController.getVoiceSELHistory);
router.get('/voice/report/:month', studentController.getVoiceSELReportByMonth);

// Legacy SEL & Speech backwards compatibility routes
router.post('/sel/generate', studentController.generate12VoiceQuestions);
router.post('/sel/submit', studentController.submitVoiceSELReport);
router.get('/sel/history', studentController.getVoiceSELHistory);
router.post('/communication/transcribe', studentController.transcribeGroqWhisper);
router.post('/communication/analyze', studentController.analyzeVoiceResponse);

module.exports = router;
