/**
 * StudentDashboard — Stub page maintained by the Student team.
 * Teacher alerts sent via teacherService.sendStudentAlert() will appear here.
 * See backend GET /api/student/notifications for the data contract.
 */
export default function StudentDashboard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#475569' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Student Module</h1>
        <p style={{ fontSize: 15, color: '#94a3b8' }}>This module is maintained by the Student team.</p>
      </div>
    </div>
  );
}
