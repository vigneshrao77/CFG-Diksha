/**
 * teacherService.js
 * All teacher-facing API calls.
 *
 * Strategy:
 *  1. Calls the backend REST API (Express + MongoDB) at /api/teacher/*
 *  2. If the API call fails (network error, backend not running), falls back
 *     to the mock data layer transparently.
 *
 * This ensures the UI is always demonstrable even without a running backend.
 * When a real backend is live, swap VITE_API_URL in .env and the same
 * service functions work without any component changes.
 *
 * Performance Decline Threshold: >= 8% drop from previous period → "Declining"
 */

import axios from 'axios';
import {
  MOCK_STUDENTS,
  CLASS_PERFORMANCE_TREND_WEEKLY,
  CLASS_PERFORMANCE_TREND_MONTHLY,
  TODAY_ATTENDANCE,
  AVG_PERFORMANCE,
  STUDENTS_NEEDING_ATTENTION,
  RECENT_ACTIVITY,
  MOCK_ALERTS,
  TEACHER_PROFILE,
} from '../data/mockData';

// ─── Config ─────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DECLINE_THRESHOLD = 0.08; // 8% decline = "needs attention"

/** Simulate a small async delay for realistic UX even with mock data */
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// In-memory mutable stores so saves persist within a session
let _students = JSON.parse(JSON.stringify(MOCK_STUDENTS));
let _alerts = [...MOCK_ALERTS];
let _attendanceOverrides = {}; // { "YYYY-MM-DD:studentId": "present"|"absent" }
let _healthOverrides = {}; // { studentId: [records] }
let _assessmentOverrides = {}; // { "studentId:period": assessment }
let _behaviourOverrides = {}; // { studentId: partial }

// ─── Utility ─────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await axios({ url, timeout: 5000, ...options });
  return res.data;
}

function calcDecline(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function performanceTrend(change) {
  if (change <= -DECLINE_THRESHOLD * 100) return 'declining';
  if (change >= DECLINE_THRESHOLD * 100) return 'improving';
  return 'stable';
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export async function getTeacherDashboard(params = {}) {
  try {
    const data = await apiFetch('/teacher/dashboard', { params });
    return {
      teacher: data.teacher || TEACHER_PROFILE,
      stats: data.stats || { totalStudents: 0, todayAttendance: { count: 0, percentage: 0 }, avgPerformance: 0, studentsNeedingAttention: 0 },
      classes: data.classes || ['Class A', 'Class B', 'Class C'],
      performanceTrendWeekly: data.performanceTrendWeekly || CLASS_PERFORMANCE_TREND_WEEKLY,
      performanceTrendMonthly: data.performanceTrendMonthly || CLASS_PERFORMANCE_TREND_MONTHLY,
      attendanceOverview: data.attendanceOverview || {
        present: data.stats?.todayAttendance?.count || 0,
        absent: (data.stats?.totalStudents || 0) - (data.stats?.todayAttendance?.count || 0),
        total: data.stats?.totalStudents || 0,
        percentage: data.stats?.todayAttendance?.percentage || 0,
      },
      studentsNeedingAttention: data.studentsNeedingAttention || [],
      recentActivity: data.recentActivity || RECENT_ACTIVITY,
    };
  } catch {
    await delay();
    let students = [..._students];
    if (params.class && params.class !== 'all') {
      students = students.filter((s) => s.class === params.class);
    }
    const presentCount = students.filter((s) => s.attendance.todayStatus === 'present').length;
    const avgPerf = students.length ? Math.round(students.reduce((s, st) => s + st.performance.current, 0) / students.length) : 74;
    const needsAttn = students.filter((s) => s.needsAttention);
    return {
      teacher: TEACHER_PROFILE,
      stats: {
        totalStudents: students.length,
        todayAttendance: {
          count: presentCount,
          percentage: students.length ? Math.round((presentCount / students.length) * 100) : 0,
        },
        avgPerformance: avgPerf,
        studentsNeedingAttention: needsAttn.length,
      },
      classes: ['Class A', 'Class B', 'Class C'],
      performanceTrendWeekly: CLASS_PERFORMANCE_TREND_WEEKLY,
      performanceTrendMonthly: CLASS_PERFORMANCE_TREND_MONTHLY,
      attendanceOverview: {
        present: presentCount,
        absent: students.length - presentCount,
        total: students.length,
        percentage: students.length ? Math.round((presentCount / students.length) * 100) : 0,
      },
      studentsNeedingAttention: needsAttn.map((s) => ({
        id: s.id,
        name: s.name,
        class: s.class,
        initial: s.initial,
        avatarColor: s.avatarColor,
        currentScore: s.performance.current,
        previousScore: s.performance.previous,
        change: s.performance.change,
        trend: s.performance.trend,
        reason: s.attentionReason,
      })),
      recentActivity: RECENT_ACTIVITY,
    };
  }
}

// ─── Students ────────────────────────────────────────────────────────────────
export async function getStudents(filters = {}) {
  try {
    const data = await apiFetch('/teacher/students', { params: filters });
    return data;
  } catch {
    await delay();
    let list = [..._students];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (filters.class && filters.class !== 'all') {
      list = list.filter((s) => s.class === filters.class);
    }
    if (filters.performance) {
      if (filters.performance === 'high') list = list.filter((s) => s.performance.current >= 80);
      if (filters.performance === 'medium') list = list.filter((s) => s.performance.current >= 60 && s.performance.current < 80);
      if (filters.performance === 'low') list = list.filter((s) => s.performance.current < 60);
    }
    if (filters.attendance) {
      if (filters.attendance === 'high') list = list.filter((s) => s.attendance.percentage >= 85);
      if (filters.attendance === 'low') list = list.filter((s) => s.attendance.percentage < 75);
    }
    if (filters.status === 'attention') {
      list = list.filter((s) => s.needsAttention);
    }

    return list.map((s) => ({
      id: s.id,
      name: s.name,
      class: s.class,
      group: s.group,
      initial: s.initial,
      avatarColor: s.avatarColor,
      attendance: { percentage: s.attendance.percentage, todayStatus: s.attendance.todayStatus },
      performance: { current: s.performance.current, trend: s.performance.trend, change: s.performance.change },
      behaviour: { communication: s.behaviour.communication, behaviourPoints: s.behaviour.behaviourPoints },
      health: { bmi: s.health.history[s.health.history.length - 1]?.bmi || null, bmiStatus: s.health.history[s.health.history.length - 1]?.bmiStatus || 'N/A' },
      status: s.status,
      needsAttention: s.needsAttention,
    }));
  }
}

export async function getStudentById(id) {
  try {
    const data = await apiFetch(`/teacher/students/${id}`);
    return data;
  } catch {
    await delay(200);
    return _students.find((s) => s.id === id) || null;
  }
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export async function getAttendance(date, classId = 'all') {
  try {
    const data = await apiFetch('/teacher/attendance', { params: { date, class: classId } });
    return data;
  } catch {
    await delay();
    let list = [..._students];
    if (classId && classId !== 'all') list = list.filter((s) => s.class === classId);

    return list.map((s) => {
      const key = `${date}:${s.id}`;
      const overrideStatus = _attendanceOverrides[key];
      const histEntry = s.attendance.history.find((h) => h.date === date);
      const status = overrideStatus || histEntry?.status || (s.attendance.todayStatus === 'present' ? 'present' : 'absent');
      return {
        studentId: s.id,
        studentName: s.name,
        initial: s.initial,
        avatarColor: s.avatarColor,
        class: s.class,
        status,
        attendancePercentage: s.attendance.percentage,
      };
    });
  }
}

export async function saveAttendance({ date, classId, records }) {
  try {
    const data = await apiFetch('/teacher/attendance', { method: 'post', data: { date, classId, records } });
    return data;
  } catch {
    await delay(400);
    // Persist in session overrides
    records.forEach(({ studentId, status }) => {
      const key = `${date}:${studentId}`;
      _attendanceOverrides[key] = status;
      // Update student's today status if date is today
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        const st = _students.find((s) => s.id === studentId);
        if (st) st.attendance.todayStatus = status;
      }
    });
    return { success: true, message: 'Attendance saved successfully' };
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function getHealthRecord(studentId) {
  try {
    const data = await apiFetch(`/teacher/health/${studentId}`);
    return data;
  } catch {
    await delay(200);
    const st = _students.find((s) => s.id === studentId);
    if (!st) return null;
    const records = _healthOverrides[studentId] || st.health.history;
    return {
      studentId,
      studentName: st.name,
      records,
      latest: records[records.length - 1] || null,
    };
  }
}

export async function saveHealthRecord({ studentId, height, weight }) {
  try {
    const data = await apiFetch('/teacher/health', { method: 'post', data: { studentId, height, weight } });
    return data;
  } catch {
    await delay(400);
    const bmi = weight / ((height / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;
    let bmiStatus;
    if (bmi < 18.5) bmiStatus = 'Below reference range';
    else if (bmi < 25) bmiStatus = 'Reference range';
    else bmiStatus = 'Above reference range';

    const record = {
      date: new Date().toISOString().split('T')[0],
      height: Math.round(height * 10) / 10,
      weight: Math.round(weight * 10) / 10,
      bmi: bmiRounded,
      bmiStatus,
    };

    const st = _students.find((s) => s.id === studentId);
    if (st) {
      if (!_healthOverrides[studentId]) {
        _healthOverrides[studentId] = [...st.health.history];
      }
      _healthOverrides[studentId].push(record);
    }
    return { success: true, record };
  }
}

// ─── Assessments ─────────────────────────────────────────────────────────────
export async function getAssessments(filters = {}) {
  try {
    const data = await apiFetch('/teacher/assessments', { params: filters });
    return data;
  } catch {
    await delay();
    let list = [..._students];
    if (filters.class && filters.class !== 'all') {
      list = list.filter((s) => s.class === filters.class);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    const period = filters.period || 'Period 4';

    return list.map((s) => {
      const key = `${s.id}:${period}`;
      const override = _assessmentOverrides[key];
      let current = override || (period === s.assessments.current.period ? s.assessments.current : s.assessments.history.find((h) => h.period === period));
      if (!current) current = { period, assignment: 0, test: 0, discipline: 0, notes: 0, ela: 0, total: 0, percentage: 0 };
      const previous = s.assessments.history.find((h) => h.period !== period) || null;
      const change = previous ? calcDecline(current.percentage, previous.percentage) : 0;
      return {
        studentId: s.id,
        studentName: s.name,
        initial: s.initial,
        avatarColor: s.avatarColor,
        class: s.class,
        current,
        previous,
        change: Math.round(change * 10) / 10,
        trend: performanceTrend(change),
      };
    });
  }
}

export async function saveAssessment({ studentId, period, scores }) {
  try {
    const data = await apiFetch('/teacher/assessments', { method: 'post', data: { studentId, period, scores } });
    return data;
  } catch {
    await delay(400);
    const total = scores.assignment + scores.test + scores.discipline + scores.notes + scores.ela;
    const percentage = Math.round((total / 40) * 100);
    const record = { period, ...scores, total, percentage };
    const key = `${studentId}:${period}`;
    _assessmentOverrides[key] = record;

    // Update student performance
    const st = _students.find((s) => s.id === studentId);
    if (st) {
      const prevPerf = st.performance.current;
      st.performance.previous = prevPerf;
      st.performance.current = percentage;
      const change = calcDecline(percentage, prevPerf);
      st.performance.change = Math.round(change * 10) / 10;
      st.performance.trend = performanceTrend(change);
      st.needsAttention = change <= -DECLINE_THRESHOLD * 100;
      if (st.needsAttention) st.attentionReason = `Performance declined ${Math.abs(Math.round(change))}% from previous`;
    }
    return { success: true, record };
  }
}

// ─── Behaviour ────────────────────────────────────────────────────────────────
export async function getBehaviourInsights(studentId) {
  try {
    const data = await apiFetch(`/teacher/behaviour/${studentId}`);
    return data;
  } catch {
    await delay(200);
    const st = _students.find((s) => s.id === studentId);
    if (!st) return null;
    const override = _behaviourOverrides[studentId];
    return {
      studentId,
      studentName: st.name,
      initial: st.initial,
      avatarColor: st.avatarColor,
      ...(override ? { ...st.behaviour, ...override } : st.behaviour),
    };
  }
}

export async function getBehaviourList(filters = {}) {
  try {
    const data = await apiFetch('/teacher/behaviour', { params: filters });
    return data;
  } catch {
    await delay();
    let list = [..._students];
    if (filters.class && filters.class !== 'all') {
      list = list.filter((s) => s.class === filters.class);
    }
    return list.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      initial: s.initial,
      avatarColor: s.avatarColor,
      class: s.class,
      ...(_behaviourOverrides[s.id] ? { ...s.behaviour, ..._behaviourOverrides[s.id] } : s.behaviour),
    }));
  }
}

export async function saveBehaviourRecord({ studentId, communication, behaviourPoints, observation }) {
  try {
    const data = await apiFetch('/teacher/behaviour', { method: 'post', data: { studentId, communication, behaviourPoints, observation } });
    return data;
  } catch {
    await delay(400);
    _behaviourOverrides[studentId] = {
      communication,
      behaviourPoints,
      recentObservation: observation,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    return { success: true };
  }
}

// ─── Performance Trend ───────────────────────────────────────────────────────
export async function getPerformanceTrend(studentId, period = 'weekly') {
  try {
    const data = await apiFetch(`/teacher/performance/${studentId}`, { params: { period } });
    return data;
  } catch {
    await delay(200);
    const st = _students.find((s) => s.id === studentId);
    if (!st) return null;
    return {
      studentId,
      period,
      history: period === 'monthly' ? CLASS_PERFORMANCE_TREND_MONTHLY : st.performance.weeklyHistory,
      current: st.performance.current,
      previous: st.performance.previous,
      change: st.performance.change,
      trend: st.performance.trend,
    };
  }
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export async function getTeacherAlerts() {
  try {
    const data = await apiFetch('/teacher/alerts');
    return data;
  } catch {
    await delay();
    return [..._alerts];
  }
}

export async function sendStudentAlert({ studentId, type, title, message, severity = 'info' }) {
  try {
    const data = await apiFetch('/teacher/alerts', {
      method: 'post',
      data: { studentId, type, title, message, severity },
    });
    return data;
  } catch {
    await delay(500);
    const st = _students.find((s) => s.id === studentId);
    const alert = {
      id: `A${Date.now()}`,
      studentId,
      studentName: st?.name || 'Unknown',
      teacherId: 'T001',
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      severity,
    };
    _alerts = [alert, ..._alerts];
    // Also add to student's notifications array
    if (st) st.notifications = [alert, ...(st.notifications || [])];
    return { success: true, alert };
  }
}

// ─── Classes list (for filters) ──────────────────────────────────────────────
export async function getClasses() {
  try {
    const data = await apiFetch('/teacher/classes');
    return data;
  } catch {
    return [...new Set(_students.map((s) => s.class))];
  }
}
