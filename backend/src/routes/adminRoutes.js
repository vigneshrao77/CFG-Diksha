const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Admin API route operational' });
});

// Dashboard
router.get('/dashboard', ctrl.getDashboardMetrics);

// Schools
router.get('/schools/areas',    ctrl.getAreas);
router.get('/schools',          ctrl.getSchools);
router.get('/schools/:id',      ctrl.getSchoolById);
router.post('/schools/compare', ctrl.compareSchools);

// Programs
router.get('/programs',     ctrl.getPrograms);
router.get('/programs/:id', ctrl.getProgramById);

// Analytics
router.get('/analytics', ctrl.getAnalytics);

// Comparisons
router.get('/comparisons', ctrl.getComparisons);

// Teachers
router.get('/teachers',        ctrl.getTeachers);
router.post('/teachers',       ctrl.addTeacher);
router.put('/teachers/:id',    ctrl.updateTeacher);
router.delete('/teachers/:id', ctrl.removeTeacher);

// Reports
router.get('/reports', ctrl.getReportData);

module.exports = router;
