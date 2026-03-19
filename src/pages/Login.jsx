import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const user = await api('/auth/login', { method: 'POST', body: { email, password } });
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

        <div className="auth-divider">Sign in to your vault</div>

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

          <div className="label">Master Password</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your master password"
            required
          />

          <div style={{ marginTop: '1.4rem' }}>
            <button className="btn" disabled={loading}>
              {loading ? 'Unlocking…' : '→ Unlock Vault'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: 13 }}>
          <small>No account yet? </small>
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--ink)' }}>Create one</Link>
        </div>

        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
          <small style={{ fontSize: 11, letterSpacing: '.05em', color: 'var(--muted-2)' }}>
            🔒 AES-256 encrypted · Zero-knowledge
          </small>
        </div>
      </div>
    </div>
  );
}
