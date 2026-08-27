/**
 * StudentSelector — Dropdown to pick a student from the list
 * Props: students, selectedId, onSelect, placeholder, disabled
 */
export default function StudentSelector({ students = [], selectedId, onSelect, placeholder = 'Select a student', disabled = false }) {
  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor="student-selector" className="form-label" style={{ marginBottom: 4, display: 'block' }}>
        Student
      </label>
      <select
        id="student-selector"
        className="form-select"
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        disabled={disabled}
        aria-label="Select student"
        style={{ maxWidth: 320 }}
      >
        <option value="">{placeholder}</option>
        {students.map((s) => (
          <option key={s.id || s.studentId} value={s.id || s.studentId}>
            {s.name || s.studentName} — {s.class}
          </option>
        ))}
      </select>
    </div>
  );
}
