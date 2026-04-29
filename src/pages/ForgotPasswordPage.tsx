import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your email and we'll send you a reset link</p>

        {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ marginBottom: 20, color: 'var(--neutral-600)' }}>
              If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
