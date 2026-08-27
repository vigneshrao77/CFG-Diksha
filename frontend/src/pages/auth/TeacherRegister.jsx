import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const AVAILABLE_CLASSES = ['Class A', 'Class B', 'Class C', 'Class D'];

export default function TeacherRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subject: 'Primary Education',
    classes: ['Class A'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleClassToggle = (cls) => {
    setFormData((prev) => {
      const exists = prev.classes.includes(cls);
      const updated = exists
        ? prev.classes.filter((c) => c !== cls)
        : [...prev.classes, cls];
      return { ...prev, classes: updated.length ? updated : [cls] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        classes: formData.classes,
        subject: formData.subject,
      });
      showToast('success', `Account created! Welcome to Diksha, ${user.name}.`, 'Teacher Registered');
      navigate('/teacher', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #2E4E73 0%, var(--ink-indigo) 40%, #0F1D30 100%)',
      padding: 'var(--sp-6)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,169,59,0.12) 0%, rgba(242,169,59,0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'var(--white)',
        borderRadius: 'var(--radius-modal)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        animation: 'modalIn 0.3s ease',
      }}>
        {/* Brand header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--ink-indigo) 0%, var(--ink-indigo-mid) 100%)',
          padding: 'var(--sp-6)',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--marigold)',
            margin: '0 auto var(--sp-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 12px rgba(242,169,59,0.4)',
          }}>
            ✍️
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 2,
          }}>
            Register New Teacher
          </h1>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Diksha Foundation Portal
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: 'var(--sp-6)' }}>
          {error && (
            <div style={{
              background: 'var(--kumkum-red-light)',
              border: '1px solid var(--kumkum-red)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--kumkum-red)',
              marginBottom: 'var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="e.g. Ms. Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address *
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="priya.sharma@diksha.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              <div className="form-group">
                <label htmlFor="reg-subject" className="form-label">
                  Subject / Area
                </label>
                <select
                  id="reg-subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Primary Education">Primary Education</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English & ELA">English & ELA</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="reg-pass" className="form-label">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', fontSize: 10, color: 'var(--ink-indigo)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-pass" className="form-label">
                Confirm Password *
              </label>
              <input
                id="reg-confirm-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            {/* Assigned Classes */}
            <div className="form-group">
              <div className="form-label" style={{ marginBottom: 4 }}>
                Assigned Classes
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AVAILABLE_CLASSES.map((cls) => {
                  const selected = formData.classes.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleClassToggle(cls)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-btn)',
                        border: `1px solid ${selected ? 'var(--ink-indigo)' : 'var(--slate-200)'}`,
                        background: selected ? 'var(--ink-indigo-light)' : 'var(--white)',
                        color: selected ? 'var(--ink-indigo)' : 'var(--slate-600)',
                        fontSize: 12,
                        fontWeight: selected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      aria-pressed={selected}
                    >
                      {selected ? `✓ ${cls}` : cls}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 15,
                justifyContent: 'center',
                marginTop: 'var(--sp-2)',
              }}
            >
              {loading ? 'Creating Account…' : 'Register & Access Portal'}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{
            marginTop: 'var(--sp-5)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--slate-500)',
            borderTop: '1px solid var(--slate-100)',
            paddingTop: 'var(--sp-4)',
          }}>
            Already have a teacher account?{' '}
            <Link to="/login" style={{ color: 'var(--ink-indigo)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
