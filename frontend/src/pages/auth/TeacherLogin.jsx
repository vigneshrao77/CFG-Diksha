import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function TeacherLogin() {
  const [email, setEmail] = useState('anika.reddy@diksha.edu');
  const [password, setPassword] = useState('teacher123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, quickDemoLogin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/teacher';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast('success', `Welcome back, ${user.name}!`, 'Signed In');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await quickDemoLogin();
      showToast('success', `Signed in as Demo Teacher (${user.name})`, 'Demo Access');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed.');
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
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,169,59,0.15) 0%, rgba(242,169,59,0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--white)',
        borderRadius: 'var(--radius-modal)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        animation: 'modalIn 0.3s ease',
      }}>
        {/* Top brand header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--ink-indigo) 0%, var(--ink-indigo-mid) 100%)',
          padding: 'var(--sp-8) var(--sp-6)',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--marigold)',
            margin: '0 auto var(--sp-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 4px 14px rgba(242,169,59,0.4)',
          }}>
            📚
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 4,
          }}>
            Diksha Foundation
          </h1>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Teacher Workspace Portal
          </p>
        </div>

        {/* Login form */}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div className="form-group">
              <label htmlFor="teacher-email" className="form-label">
                Teacher Email
              </label>
              <input
                id="teacher-email"
                type="email"
                className="form-input"
                placeholder="name@diksha.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="teacher-password" className="form-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11,
                    color: 'var(--ink-indigo)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="teacher-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
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
              {loading ? 'Authenticating…' : 'Sign In as Teacher'}
            </button>
          </form>

          {/* Quick Demo Login Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: 'var(--sp-5) 0 var(--sp-4)',
            gap: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--slate-200)' }} />
            <span style={{ fontSize: 11, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Or quick test
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--slate-200)' }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleQuickDemo}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 13,
              justifyContent: 'center',
              borderStyle: 'dashed',
              background: 'var(--marigold-light)',
              borderColor: 'var(--marigold)',
              color: '#92610d',
              fontWeight: 700,
            }}
          >
            ⚡ 1-Click Demo Login (Ms. Anika Reddy)
          </button>

          <div style={{
            marginTop: 'var(--sp-5)',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--slate-400)',
          }}>
            Demo credentials: <strong>anika.reddy@diksha.edu</strong> / <strong>teacher123</strong>
          </div>

          <div style={{
            marginTop: 'var(--sp-4)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--slate-500)',
            borderTop: '1px solid var(--slate-100)',
            paddingTop: 'var(--sp-4)',
          }}>
            New teacher?{' '}
            <Link to="/register" style={{ color: 'var(--ink-indigo)', fontWeight: 700, textDecoration: 'underline' }}>
              Register account here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
