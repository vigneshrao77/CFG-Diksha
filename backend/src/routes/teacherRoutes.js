const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getStudents, getStudentById,
  getAttendance, saveAttendance,
  getHealthRecord, saveHealthRecord,
  getAssessments, saveAssessment,
  getBehaviourList, getBehaviourInsights, saveBehaviourRecord,
  getAlerts, sendAlert,
  getClasses,
} = require('../controllers/teacherController');

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Teacher API route operational' });
});

// Dashboard
router.get('/dashboard', getDashboard);

// Students
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance', saveAttendance);

// Health
router.get('/health/:id', getHealthRecord);
router.post('/health', saveHealthRecord);

// Assessments
router.get('/assessments', getAssessments);
router.post('/assessments', saveAssessment);

// Behaviour
router.get('/behaviour', getBehaviourList);
router.get('/behaviour/:id', getBehaviourInsights);
router.post('/behaviour', saveBehaviourRecord);

// Alerts
router.get('/alerts', getAlerts);
router.post('/alerts', sendAlert);

// Classes
router.get('/classes', getClasses);

module.exports = router;
