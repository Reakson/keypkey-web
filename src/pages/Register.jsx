import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import StrengthMeter from '../components/StrengthMeter';

export default function Register({ setUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (pwd !== confirm) { setErr('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await api('/auth/register', { method: 'POST', body: { username, email, password: pwd } });
      setUser(user);
      navigate('/vault');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand-title">VaultX</div>
        <div className="brand-sub">Secure Password Manager</div>

        <div className="auth-divider">Create your vault</div>

        <form className="form" onSubmit={submit}>
          {err && <div className="alert error">{err}</div>}

          <div className="label">Email Address</div>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />

          <div className="label">Username</div>
          <input
            className="input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            maxLength={64}
          />

          <div className="label">Master Password</div>
          <input
            className="input"
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Choose a strong master password"
            required
          />
          <StrengthMeter value={pwd} />

          <div className="label">Confirm Password</div>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
          />

          <div style={{ marginTop: '1.4rem' }}>
            <button className="btn" disabled={loading}>
              {loading ? 'Creating vault…' : '→ Create Account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: 13 }}>
          <small>Already have an account? </small>
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--ink)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
