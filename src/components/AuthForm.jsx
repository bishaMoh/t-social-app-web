import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({ username: form.username, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === 'register' ? 'Join T Social' : 'Welcome back'}</h1>
        <p className="muted">
          {mode === 'register'
            ? 'Create an account to post tees and follow people.'
            : 'Log in to see your feed.'}
        </p>

        <form onSubmit={handleSubmit} className="stack">
          {mode === 'register' && (
            <label>
              Name
              <input value={form.name} onChange={update('name')} required />
            </label>
          )}
          <label>
            Username
            <input value={form.username} onChange={update('username')} required autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'register' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'register' ? (
            <>
              Already have an account? <Link to="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/register">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
