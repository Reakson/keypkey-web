import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import StrengthMeter from '../components/StrengthMeter';

export default function AddPassword() {
  const { state } = useLocation();
  const editId = state?.id || null;

  const [website, setWebsite] = useState(state?.website || '');
  const [username, setUsername] = useState(state?.username || state?.site_username || '');
  const [password, setPassword] = useState(state?.password || '');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function generate() {
    const sets = ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', '!@#$%^&*()-_=+[]{};:,.?'];
    const all = sets.join('');
    let out = sets.map((s) => s[Math.floor(Math.random() * s.length)]).join('');
    for (let i = out.length; i < 16; i++) out += all[Math.floor(Math.random() * all.length)];
    setPassword(out.split('').sort(() => Math.random() - 0.5).join(''));
    setShowPwd(true);
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const payload = { website, site_username: username, password };
      if (editId) {
        await api(`/password/${editId}`, { method: 'PUT', body: payload });
        setMsg('Entry updated successfully.');
        setMsgType('success');
      } else {
        await api('/password/add', { method: 'POST', body: payload });
        setWebsite('');
        setUsername('');
        setPassword('');
        setMsg('Password saved successfully.');
        setMsgType('success');
      }
    } catch (e) {
      setMsg(e.message);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{editId ? 'Update Credential' : 'Add Credential'}</h1>
        <span className="page-subtitle">Stored securely in your vault</span>
      </div>

      <div className="form-box">
        {msg && <div className={`alert ${msgType}`}>{msg}</div>}

        <form onSubmit={submit}>
          <div className="label">Website / Service</div>
          <input
            className="input"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. github.com"
            required
          />

          <div className="label">Username / Email</div>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username or email"
            required
          />

          <div className="label">Password</div>
          <div className="row" style={{ gap: '.5rem' }}>
            <input
              className="input"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or generate a password"
              required
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-small" onClick={() => setShowPwd((v) => !v)} style={{ flexShrink: 0 }}>
              {showPwd ? 'Hide' : 'Show'}
            </button>
            <button type="button" className="btn-small primary" onClick={generate} style={{ flexShrink: 0 }}>
              Generate
            </button>
          </div>
          <StrengthMeter value={password} />

          <div style={{ marginTop: '1.4rem' }}>
            <button className="btn" disabled={loading}>
              🔒 {loading ? 'Saving…' : editId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}