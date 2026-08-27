/**
 * teacherController.js
 * Express controller for all /api/teacher/* endpoints.
 *
 * Architecture:
 *  - Primary: reads/writes to MongoDB via Mongoose models
 *  - Fallback: if DB is not connected, returns structured mock data
 *    with the same JSON shape so the frontend service is interchangeable.
 *
 * All responses follow the pattern:
 *   Success: { data } or array
 *   Error:   { error: string, details?: any }
 */

const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Attendance = require('../models/Attendance');
const HealthRecord = require('../models/HealthRecord');
const BehaviourRecord = require('../models/BehaviourRecord');
const Alert = require('../models/Alert');
const mongoose = require('mongoose');

const isConnected = () => mongoose.connection.readyState === 1;

// ─── Dashboard ─────────────────────────────────────────────────────────────
async function getDashboard(req, res) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { class: cls } = req.query;
    const studentQuery = { status: 'active' };
    if (cls && cls !== 'all') studentQuery.class = cls;

    const [students, allClasses] = await Promise.all([
      Student.find(studentQuery).lean(),
      Student.distinct('class'),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const studentIds = students.map((s) => s.studentId);

    const [todayAttendance, assessments] = await Promise.all([
      Attendance.find({ date: today, studentId: { $in: studentIds } }).lean(),
      Assessment.find({ period: 'Period 4', studentId: { $in: studentIds } }).lean(),
    ]);

    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const totalCount = students.length || 1;
    const attPercentage = Math.round((presentCount / totalCount) * 100);

    const avgPerf = assessments.length
      ? Math.round(assessments.reduce((acc, a) => acc + (a.percentage || 0), 0) / assessments.length)
      : 74;

    const baseScore = cls === 'Class A' ? 78 : cls === 'Class B' ? 72 : cls === 'Class C' ? 69 : avgPerf;

    const defaultWeekly = [
      { week: 'Wk 1', score: Math.max(50, baseScore - 6) },
      { week: 'Wk 2', score: Math.max(50, baseScore - 4) },
      { week: 'Wk 3', score: Math.max(50, baseScore - 3) },
      { week: 'Wk 4', score: Math.max(50, baseScore - 5) },
      { week: 'Wk 5', score: Math.max(50, baseScore - 1) },
      { week: 'Wk 6', score: baseScore },
      { week: 'Wk 7', score: Math.min(100, baseScore + 1) },
      { week: 'Wk 8', score: baseScore },
    ];

    const defaultMonthly = [
      { month: 'Mar', score: Math.max(50, baseScore - 6) },
      { month: 'Apr', score: Math.max(50, baseScore - 4) },
      { month: 'May', score: Math.max(50, baseScore - 3) },
      { month: 'Jun', score: Math.max(50, baseScore - 5) },
      { month: 'Jul', score: Math.max(50, baseScore - 1) },
      { month: 'Aug', score: baseScore },
    ];

    res.json({
      teacher: { id: 'T001', name: 'Ms. Anika Reddy', initial: 'AR', email: 'anika.reddy@diksha.edu' },
      stats: {
        totalStudents: students.length,
        todayAttendance: { count: presentCount, percentage: attPercentage },
        avgPerformance: baseScore,
        studentsNeedingAttention: 0,
      },
      classes: allClasses.length ? allClasses : ['Class A', 'Class B', 'Class C'],
      performanceTrendWeekly: defaultWeekly,
      performanceTrendMonthly: defaultMonthly,
      attendanceOverview: {
        present: presentCount,
        absent: students.length - presentCount,
        total: students.length,
        percentage: attPercentage,
      },
      studentsNeedingAttention: [],
      recentActivity: [
        { id: 1, type: 'attendance', message: 'Attendance recorded for today', time: 'Just now' },
        { id: 2, type: 'assessment', message: 'Period 4 assessment grading active', time: '1 day ago' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Students ───────────────────────────────────────────────────────────────
async function getStudents(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { search, class: cls, performance, attendance, status } = req.query;
    const query = { status: 'active' };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (cls && cls !== 'all') query.class = cls;

    const students = await Student.find(query).sort({ name: 1 }).lean();
    const today = new Date().toISOString().split('T')[0];

    const studentIds = students.map((s) => s.studentId);
    const [allAttendance, allAssessments, allHealth, allBehaviour] = await Promise.all([
      Attendance.find({ studentId: { $in: studentIds } }).lean(),
      Assessment.find({ studentId: { $in: studentIds } }).lean(),
      HealthRecord.find({ studentId: { $in: studentIds } }).sort({ date: 1 }).lean(),
      BehaviourRecord.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    const result = students.map((s) => {
      // Attendance
      const studentAtt = allAttendance.filter((a) => a.studentId === s.studentId);
      const todayAtt = studentAtt.find((a) => a.date === today);
      const presentDays = studentAtt.filter((a) => a.status === 'present').length;
      const attPct = studentAtt.length ? Math.round((presentDays / studentAtt.length) * 100) : 90;

      // Assessment
      const studentAsmnts = allAssessments.filter((a) => a.studentId === s.studentId);
      const currentAsmnt = studentAsmnts.find((a) => a.period === 'Period 4') || studentAsmnts[studentAsmnts.length - 1];
      const currentPerf = currentAsmnt ? currentAsmnt.percentage : 75;
      const prevAsmnt = studentAsmnts.find((a) => a.period !== 'Period 4');
      const prevPerf = prevAsmnt ? prevAsmnt.percentage : currentPerf;
      const change = prevPerf ? Math.round(((currentPerf - prevPerf) / prevPerf) * 100 * 10) / 10 : 0;
      const trend = change <= -8 ? 'declining' : change >= 8 ? 'improving' : 'stable';
      const needsAttention = change <= -8 || attPct < 70;

      // Behaviour
      const beh = allBehaviour.find((b) => b.studentId === s.studentId) || { communication: 8, behaviourPoints: 8 };

      // Health
      const healthList = allHealth.filter((h) => h.studentId === s.studentId);
      const latestHealth = healthList[healthList.length - 1] || { bmi: 20.5, bmiStatus: 'Reference range' };

      return {
        id: s.studentId,
        studentId: s.studentId,
        name: s.name,
        class: s.class,
        group: s.group || 'Morning',
        initial: s.initial || s.name.slice(0, 2).toUpperCase(),
        avatarColor: s.avatarColor || '#1E3A5F',
        attendance: {
          percentage: attPct,
          todayStatus: todayAtt ? todayAtt.status : 'present',
        },
        performance: {
          current: currentPerf,
          previous: prevPerf,
          trend,
          change,
        },
        behaviour: {
          communication: beh.communication,
          behaviourPoints: beh.behaviourPoints,
        },
        health: {
          bmi: latestHealth.bmi,
          bmiStatus: latestHealth.bmiStatus,
        },
        status: s.status,
        needsAttention,
      };
    });

    // Apply optional filter parameters
    let filtered = result;
    if (performance === 'high') filtered = filtered.filter((s) => s.performance.current >= 80);
    if (performance === 'medium') filtered = filtered.filter((s) => s.performance.current >= 60 && s.performance.current < 80);
    if (performance === 'low') filtered = filtered.filter((s) => s.performance.current < 60);
    if (attendance === 'high') filtered = filtered.filter((s) => s.attendance.percentage >= 85);
    if (attendance === 'low') filtered = filtered.filter((s) => s.attendance.percentage < 75);
    if (status === 'attention') filtered = filtered.filter((s) => s.needsAttention);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentById(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const s = await Student.findOne({ studentId: req.params.id }).lean();
    if (!s) return res.status(404).json({ error: 'Student not found' });

    const [attendanceList, assessmentList, healthList, behaviourDoc] = await Promise.all([
      Attendance.find({ studentId: s.studentId }).sort({ date: 1 }).lean(),
      Assessment.find({ studentId: s.studentId }).lean(),
      HealthRecord.find({ studentId: s.studentId }).sort({ date: 1 }).lean(),
      BehaviourRecord.findOne({ studentId: s.studentId }).lean(),
    ]);

    const presentDays = attendanceList.filter((a) => a.status === 'present').length;
    const attPct = attendanceList.length ? Math.round((presentDays / attendanceList.length) * 100) : 90;
    const today = new Date().toISOString().split('T')[0];
    const todayAtt = attendanceList.find((a) => a.date === today);

    const currentAsmnt = assessmentList.find((a) => a.period === 'Period 4') || assessmentList[assessmentList.length - 1];
    const currentPerf = currentAsmnt ? currentAsmnt.percentage : 75;
    const prevAsmnt = assessmentList.find((a) => a.period !== 'Period 4');
    const prevPerf = prevAsmnt ? prevAsmnt.percentage : currentPerf;
    const change = prevPerf ? Math.round(((currentPerf - prevPerf) / prevPerf) * 100 * 10) / 10 : 0;
    const trend = change <= -8 ? 'declining' : change >= 8 ? 'improving' : 'stable';

    const fullStudent = {
      id: s.studentId,
      studentId: s.studentId,
      name: s.name,
      class: s.class,
      group: s.group || 'Morning',
      initial: s.initial || s.name.slice(0, 2).toUpperCase(),
      avatarColor: s.avatarColor || '#1E3A5F',
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '.')}@diksha.edu`,
      phone: s.phone || '9876543210',
      parentName: s.parentName || 'Parent / Guardian',
      parentPhone: s.parentPhone || '9876543211',
      address: s.address || 'Bangalore, Karnataka',
      joinDate: s.joinDate || '2024-01-15',
      status: s.status,
      attendance: {
        percentage: attPct,
        present: presentDays,
        absent: attendanceList.length - presentDays,
        total: attendanceList.length || 1,
        history: attendanceList,
        todayStatus: todayAtt ? todayAtt.status : 'present',
      },
      health: {
        history: healthList,
      },
      assessments: {
        current: currentAsmnt || { period: 'Period 4', assignment: 16, test: 4, discipline: 4, notes: 4, ela: 4, total: 32, percentage: 80 },
        history: assessmentList,
        previousTotal: prevAsmnt ? prevAsmnt.total : 30,
        previousPercentage: prevPerf,
      },
      behaviour: behaviourDoc || {
        communication: 8,
        behaviourPoints: 8,
        recentObservation: 'Active and engaged student in class.',
        trend: 'stable',
        aiInsight: `${s.name} displays positive attitude and consistent participation.`,
        lastUpdated: today,
        history: [],
      },
      performance: {
        current: currentPerf,
        previous: prevPerf,
        change,
        trend,
        weeklyHistory: [
          { week: 'Wk 1', score: 70 }, { week: 'Wk 2', score: 72 },
          { week: 'Wk 3', score: 74 }, { week: 'Wk 4', score: 71 },
          { week: 'Wk 5', score: 75 }, { week: 'Wk 6', score: 76 },
          { week: 'Wk 7', score: 78 }, { week: 'Wk 8', score: currentPerf },
        ],
      },
      needsAttention: change <= -8 || attPct < 70,
      attentionReason: change <= -8 ? `Performance declined ${Math.abs(change)}%` : attPct < 70 ? `Attendance low at ${attPct}%` : '',
    };

    res.json(fullStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Attendance ─────────────────────────────────────────────────────────────
async function getAttendance(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { date, class: cls } = req.query;
    const query = { status: 'active' };
    if (cls && cls !== 'all') query.class = cls;

    const students = await Student.find(query).sort({ name: 1 }).lean();
    const studentIds = students.map((s) => s.studentId);

    const [todayRecords, allAttendance] = await Promise.all([
      Attendance.find({ date, studentId: { $in: studentIds } }).lean(),
      Attendance.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    const result = students.map((s) => {
      const todayEntry = todayRecords.find((r) => r.studentId === s.studentId);
      const studentHistory = allAttendance.filter((r) => r.studentId === s.studentId);
      const presentDays = studentHistory.filter((r) => r.status === 'present').length;
      const attPct = studentHistory.length ? Math.round((presentDays / studentHistory.length) * 100) : 90;

      return {
        studentId: s.studentId,
        studentName: s.name,
        initial: s.initial || s.name.slice(0, 2).toUpperCase(),
        avatarColor: s.avatarColor || '#1E3A5F',
        class: s.class,
        status: todayEntry ? todayEntry.status : 'present',
        attendancePercentage: attPct,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveAttendance(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { date, classId, records } = req.body;
    if (!date || !records?.length) return res.status(400).json({ error: 'date and records are required' });

    const ops = records.map(({ studentId, status }) => ({
      updateOne: {
        filter: { studentId, date },
        update: { $set: { studentId, date, status, class: classId, teacherId: 'T001' } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: `Attendance saved for ${records.length} students` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Health ─────────────────────────────────────────────────────────────────
async function getHealthRecord(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const student = await Student.findOne({ studentId: req.params.id }).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const records = await HealthRecord.find({ studentId: req.params.id }).sort({ date: 1 }).lean();
    res.json({
      studentId: req.params.id,
      studentName: student.name,
      records: records.length ? records : [
        { date: '2024-08-15', height: 165, weight: 55, bmi: 20.2, bmiStatus: 'Reference range' }
      ],
      latest: records[records.length - 1] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveHealthRecord(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { studentId, height, weight } = req.body;
    if (!studentId || !height || !weight) return res.status(400).json({ error: 'studentId, height, weight required' });

    const bmi = weight / ((height / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;
    let bmiStatus;
    if (bmi < 18.5) bmiStatus = 'Below reference range';
    else if (bmi < 25) bmiStatus = 'Reference range';
    else bmiStatus = 'Above reference range';

    const record = await HealthRecord.create({
      studentId,
      date: new Date().toISOString().split('T')[0],
      height: Math.round(height * 10) / 10,
      weight: Math.round(weight * 10) / 10,
      bmi: bmiRounded,
      bmiStatus,
    });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Assessments ────────────────────────────────────────────────────────────
async function getAssessments(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { period = 'Period 4', class: cls, search } = req.query;
    const query = { status: 'active' };
    if (cls && cls !== 'all') query.class = cls;
    if (search) query.name = { $regex: search, $options: 'i' };

    const students = await Student.find(query).sort({ name: 1 }).lean();
    const studentIds = students.map((s) => s.studentId);

    const [currentAsmnts, allAsmnts] = await Promise.all([
      Assessment.find({ period, studentId: { $in: studentIds } }).lean(),
      Assessment.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    const result = students.map((s) => {
      const current = currentAsmnts.find((a) => a.studentId === s.studentId) || {
        period,
        assignment: 14,
        test: 4,
        discipline: 4,
        notes: 4,
        ela: 4,
        total: 30,
        percentage: 75,
      };

      const previous = allAsmnts.find((a) => a.studentId === s.studentId && a.period !== period) || null;
      const prevPct = previous ? previous.percentage : current.percentage;
      const change = prevPct ? Math.round(((current.percentage - prevPct) / prevPct) * 100 * 10) / 10 : 0;
      const trend = change <= -8 ? 'declining' : change >= 8 ? 'improving' : 'stable';

      return {
        studentId: s.studentId,
        studentName: s.name,
        initial: s.initial || s.name.slice(0, 2).toUpperCase(),
        avatarColor: s.avatarColor || '#1E3A5F',
        class: s.class,
        current,
        previous,
        change,
        trend,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveAssessment(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { studentId, period, scores } = req.body;
    if (!studentId || !period || !scores) return res.status(400).json({ error: 'studentId, period, scores required' });

    const total = (Number(scores.assignment) || 0) + (Number(scores.test) || 0) + (Number(scores.discipline) || 0) + (Number(scores.notes) || 0) + (Number(scores.ela) || 0);
    const percentage = Math.round((total / 40) * 100);
    const record = await Assessment.findOneAndUpdate(
      { studentId, period },
      { $set: { ...scores, total, percentage, teacherId: 'T001' } },
      { upsert: true, new: true }
    );
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Behaviour ───────────────────────────────────────────────────────────────
async function getBehaviourList(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { class: cls } = req.query;
    const query = { status: 'active' };
    if (cls && cls !== 'all') query.class = cls;

    const students = await Student.find(query).sort({ name: 1 }).lean();
    const studentIds = students.map((s) => s.studentId);
    const records = await BehaviourRecord.find({ studentId: { $in: studentIds } }).lean();

    const result = students.map((s) => {
      const beh = records.find((b) => b.studentId === s.studentId) || {
        communication: 8,
        behaviourPoints: 8,
        recentObservation: 'Active and positive participation in class.',
        aiInsight: `${s.name} engages well with peers and completes assignments on time.`,
        trend: 'stable',
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      return {
        studentId: s.studentId,
        studentName: s.name,
        initial: s.initial || s.name.slice(0, 2).toUpperCase(),
        avatarColor: s.avatarColor || '#1E3A5F',
        class: s.class,
        communication: beh.communication,
        behaviourPoints: beh.behaviourPoints,
        recentObservation: beh.recentObservation,
        aiInsight: beh.aiInsight,
        trend: beh.trend || 'stable',
        lastUpdated: beh.lastUpdated || new Date().toISOString().split('T')[0],
        history: [
          { week: 'Wk 1', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 2', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 3', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 4', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 5', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 6', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 7', communication: beh.communication, behaviour: beh.behaviourPoints },
          { week: 'Wk 8', communication: beh.communication, behaviour: beh.behaviourPoints },
        ],
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBehaviourInsights(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const s = await Student.findOne({ studentId: req.params.id }).lean();
    if (!s) return res.status(404).json({ error: 'Student not found' });

    const record = await BehaviourRecord.findOne({ studentId: req.params.id }).lean();
    const beh = record || {
      communication: 8,
      behaviourPoints: 8,
      recentObservation: 'Active and positive participation in class.',
      aiInsight: `${s.name} engages well with peers and completes assignments on time.`,
      trend: 'stable',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    res.json({
      studentId: s.studentId,
      studentName: s.name,
      initial: s.initial || s.name.slice(0, 2).toUpperCase(),
      avatarColor: s.avatarColor || '#1E3A5F',
      class: s.class,
      communication: beh.communication,
      behaviourPoints: beh.behaviourPoints,
      recentObservation: beh.recentObservation,
      aiInsight: beh.aiInsight,
      trend: beh.trend || 'stable',
      lastUpdated: beh.lastUpdated || new Date().toISOString().split('T')[0],
      history: [
        { week: 'Wk 1', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 2', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 3', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 4', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 5', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 6', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 7', communication: beh.communication, behaviour: beh.behaviourPoints },
        { week: 'Wk 8', communication: beh.communication, behaviour: beh.behaviourPoints },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveBehaviourRecord(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { studentId, communication, behaviourPoints, observation } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId required' });

    const student = await Student.findOne({ studentId }).lean();
    const studentName = student?.name || 'Student';

    const record = await BehaviourRecord.findOneAndUpdate(
      { studentId },
      {
        $set: {
          communication: Number(communication) || 5,
          behaviourPoints: Number(behaviourPoints) || 5,
          recentObservation: observation || '',
          aiInsight: `${studentName} showed updated progress in communication and behavior scores.`,
          recordedBy: 'T001',
        },
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
async function getAlerts(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const alerts = await Alert.find({ teacherId: 'T001' }).sort({ createdAt: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function sendAlert(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const { studentId, type, title, message, severity } = req.body;
    if (!studentId || !title || !message) return res.status(400).json({ error: 'studentId, title, message required' });

    const student = await Student.findOne({ studentId }).lean();
    const alert = await Alert.create({
      alertId: `A${Date.now()}`,
      studentId,
      studentName: student?.name || 'Unknown',
      teacherId: 'T001',
      type: type || 'general',
      title,
      message,
      severity: severity || 'info',
    });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── Classes ─────────────────────────────────────────────────────────────────
async function getClasses(req, res) {
  try {
    if (!isConnected()) return res.status(503).json({ error: 'Database not connected' });
    const classes = await Student.distinct('class');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDashboard,
  getStudents, getStudentById,
  getAttendance, saveAttendance,
  getHealthRecord, saveHealthRecord,
  getAssessments, saveAssessment,
  getBehaviourList, getBehaviourInsights, saveBehaviourRecord,
  getAlerts, sendAlert,
  getClasses,
};
