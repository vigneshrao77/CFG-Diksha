/**
 * DIKSHA FOUNDATION — Admin Service
 * All functions call the Express/MongoDB backend at VITE_API_BASE_URL.
 * No static mock data is used here — all data is dynamic from the database.
 */

const BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
  return json.data;
}

// ── DASHBOARD ────────────────────────────────────────────────────────
export async function getDashboardMetrics() {
  return api('/admin/dashboard');
}

// ── SCHOOLS ──────────────────────────────────────────────────────────
export async function getSchools(filters = {}) {
  const params = new URLSearchParams();
  if (filters.area && filters.area !== 'all') params.set('area', filters.area);
  if (filters.type && filters.type !== 'all') params.set('type', filters.type);
  return api(`/admin/schools?${params}`);
}

export async function getSchoolById(id) {
  return api(`/admin/schools/${id}`);
}

export async function compareSchools(ids = []) {
  return api('/admin/schools/compare', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function getAreas() {
  return api('/admin/schools/areas');
}

// ── PROGRAMS ─────────────────────────────────────────────────────────
export async function getPrograms(filters = {}) {
  const params = new URLSearchParams();
  if (filters.centre && filters.centre !== 'all') params.set('centre', filters.centre);
  return api(`/admin/programs?${params}`);
}

export async function getProgramById(id) {
  return api(`/admin/programs/${id}`);
}

// ── ANALYTICS ────────────────────────────────────────────────────────
export async function getAttendanceTrend(dateRange = 'monthly') {
  const period = dateRange === 'annual' ? 'annual' : 'monthly';
  const records = await api(`/admin/analytics?type=attendance&period=${period}`);
  // Return array of data objects for chart consumption
  return records.map(r => r.data);
}

export async function getSELAnalytics() {
  const records = await api('/admin/analytics?type=sel');
  // Return the payload of the first SEL record (competencies + trend)
  return records[0]?.data || { competencies: [], trend: [] };
}

export async function getAcademicAnalytics() {
  const records = await api('/admin/analytics?type=academic');
  return records[0]?.data || { baselineVsEndline: [], subjectBreakdown: [] };
}

export async function getHealthAnalytics() {
  const records = await api('/admin/analytics?type=health');
  return records[0]?.data || { screeningCoverage: [], bmiDistribution: [], dietarySupport: [] };
}

// ── COMPARISONS ──────────────────────────────────────────────────────
export async function getComparisonData() {
  const result = await api('/admin/comparisons');
  return result; // { schools, metrics }
}

// ── TEACHERS ─────────────────────────────────────────────────────────
export async function getTeachers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.centre && filters.centre !== 'all') params.set('centre', filters.centre);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  return api(`/admin/teachers?${params}`);
}

export async function addTeacher(data) {
  return api('/admin/teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function removeTeacher(id) {
  return api(`/admin/teachers/${id}`, { method: 'DELETE' });
}

export async function updateTeacher(id, data) {
  return api(`/admin/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── REPORTS ──────────────────────────────────────────────────────────
export async function getReportData(filters = {}) {
  const params = new URLSearchParams();
  if (filters.centre)    params.set('centre',  filters.centre);
  if (filters.program)   params.set('program', filters.program);
  if (filters.dateRange) params.set('period',  filters.dateRange === 'annual' ? 'annual' : 'monthly');
  return api(`/admin/reports?${params}`);
}
