import React, { useState } from 'react';
import { api, setSession } from '../api/client';
import { useNavigate } from 'react-router-dom';
import StrengthMeter from '../components/StrengthMeter';

export default function AuthLanding({ setUser, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);

  const isLogin = mode === 'login';

  function switchMode(m) {
    setMode(m);
    setErr('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password: loginPwd },
      });

      const user = { email: loginEmail };
      setSession({ token: data.token, user });
      setUser(user);
      navigate('/vault');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (regPwd !== regConfirm) {
      setErr('Passwords do not match');
      return;
    }

    if (!recoveryPhrase.trim()) {
      setErr('Recovery phrase is required');
      return;
    }

    if (recoveryPhrase.trim().length < 6) {
      setErr('Recovery phrase should be at least 6 characters');
      return;
    }

    setErr('');
    setLoading(true);

    try {
      await api('/auth/register', {
        method: 'POST',
        body: {
          username: regUsername,
          email: regEmail,
          password: regPwd,
          recovery_phrase: recoveryPhrase.trim(),
        },
      });

      const data = await api('/auth/login', {
        method: 'POST',
        body: { email: regEmail, password: regPwd },
      });

      const user = { username: regUsername, email: regEmail };
      setSession({ token: data.token, user });
      setUser(user);
      navigate('/vault');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="kk-wrap">
        <div className="kk-left">
          <VaultBg />
          <div className="kk-left-inner">
            <div className="kk-logo">
              <KeypKeyIcon size={52} />
              <div className="kk-logo-name">
                Keyp<span>Key</span>
              </div>
            </div>

            <div className="kk-tagline">
              Your passwords, secured with
              <br />
              military-grade encryption.
            </div>

            <div className="kk-feats">
              {FEATURES.map((f) => (
                <div key={f} className="kk-feat">
                  <div className="kk-feat-icon">
                    <div className="kk-check" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <div className="kk-badge">
              <LockIcon />
              AES-256 · Zero-knowledge · End-to-end encrypted
            </div>
          </div>
        </div>

        <div className="kk-right">
          <div className="kk-form-wrap">
            <div className="kk-tabs">
              <button className={`kk-tab ${isLogin ? 'on' : 'off'}`} onClick={() => switchMode('login')}>
                Sign in
              </button>
              <button className={`kk-tab ${!isLogin ? 'on' : 'off'}`} onClick={() => switchMode('register')}>
                Create account
              </button>
            </div>

            {err && <div className="kk-alert">{err}</div>}

            {isLogin ? (
              <>
                <div className="kk-form-title">Welcome to KeypKey</div>
                <div className="kk-form-sub">Sign in to access your encrypted vault.</div>

                <form onSubmit={handleLogin}>
                  <div className="kk-lbl">Email address</div>
                  <input
                    className="kk-inp"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />

                  <div className="kk-lbl">Master password</div>
                  <input
                    className="kk-inp"
                    type="password"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    placeholder="Your master password"
                    required
                  />

                  <button className="kk-btn" disabled={loading}>
                    {loading ? 'Unlocking…' : 'Unlock vault →'}
                  </button>
                </form>

                <div className="kk-divider">or</div>

                <div className="kk-foot">
                  Don't have an account? <button onClick={() => switchMode('register')}>Create one free</button>
                </div>
              </>
            ) : (
              <>
                <div className="kk-form-title">Create your vault</div>
                <div className="kk-form-sub">Set up once, secured forever.</div>

                <form onSubmit={handleRegister}>
                  <div className="kk-lbl">Email address</div>
                  <input
                    className="kk-inp"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />

                  <div className="kk-lbl">Username</div>
                  <input
                    className="kk-inp"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />

                  <div className="kk-lbl">Master password</div>
                  <input
                    className="kk-inp"
                    type="password"
                    value={regPwd}
                    onChange={(e) => setRegPwd(e.target.value)}
                    placeholder="Choose a strong password"
                    required
                  />
                  <StrengthMeter value={regPwd} />

                  <div className="kk-lbl">Confirm password</div>
                  <input
                    className="kk-inp"
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                  />

                  <div className="kk-lbl-row">
                    <div className="kk-lbl" style={{ margin: 0 }}>
                      Recovery phrase
                    </div>
                    <button
                      type="button"
                      className="kk-help-btn"
                      onClick={() => setShowRecoveryHelp((v) => !v)}
                    >
                      {showRecoveryHelp ? 'Hide help' : 'What is this?'}
                    </button>
                  </div>

                  {showRecoveryHelp && (
                    <div className="kk-help-box">
                      This phrase can help verify your identity or recover access later, depending on your backend
                      recovery flow. Keep it private and store it somewhere safe.
                    </div>
                  )}

                  <input
                    className="kk-inp"
                    type="text"
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    placeholder="Enter a memorable secret phrase"
                    required
                  />

                  <div className="kk-recovery-note">
                    Example: <span>Blue Mango River 204</span>
                  </div>

                  <button className="kk-btn" disabled={loading}>
                    {loading ? 'Creating vault…' : 'Create account →'}
                  </button>
                </form>

                <div className="kk-foot" style={{ marginTop: '.9rem' }}>
                  Already have an account? <button onClick={() => switchMode('login')}>Sign in</button>
                </div>
              </>
            )}

            <div className="kk-sec">
              <strong>AES-256</strong> encrypted &nbsp;·&nbsp;
              <strong>Zero-knowledge</strong> &nbsp;·&nbsp;
              Never stored in plain text
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KeypKeyIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.18)" />
      <rect width="48" height="48" rx="12" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <circle cx="19" cy="20" r="8" fill="none" stroke="white" strokeWidth="2.5" />
      <circle cx="19" cy="20" r="3.5" fill="white" />
      <line x1="25" y1="24" x2="38" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="29.5" x2="34.5" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="32.5" x2="38.5" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: 5, opacity: 0.7 }}
    >
      <rect x="1.5" y="5.5" width="9" height="6" rx="1.5" stroke="#A5F3FC" strokeWidth="1.2" />
      <path d="M3.5 5.5V3.5a2.5 2.5 0 015 0v2" stroke="#A5F3FC" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function VaultBg() {
  const bolts = [0, 60, 120, 180, 240, 300].map((a) => {
    const r = (a * Math.PI) / 180;
    return { cx: Math.round(113 * Math.cos(r)), cy: Math.round(113 * Math.sin(r)) };
  });

  return (
    <svg
      viewBox="0 0 500 700"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <rect width="500" height="700" fill="#0E7490" />
      <pattern id="kkdots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.09)" />
      </pattern>
      <rect width="500" height="700" fill="url(#kkdots)" />
      <circle cx="440" cy="70" r="210" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="50" />
      <circle cx="440" cy="70" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="28" />
      <g transform="translate(250,380)">
        <circle r="158" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <circle r="128" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle r="96" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle r="56" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle r="18" fill="rgba(255,255,255,0.15)" />
        {[0, 90, 180, 270].map((a) => {
          const r2 = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={Math.round(56 * Math.cos(r2))}
              y1={Math.round(56 * Math.sin(r2))}
              x2={Math.round(128 * Math.cos(r2))}
              y2={Math.round(128 * Math.sin(r2))}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.5"
            />
          );
        })}
        {[45, 135, 225, 315].map((a) => {
          const r2 = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={Math.round(56 * Math.cos(r2))}
              y1={Math.round(56 * Math.sin(r2))}
              x2={Math.round(128 * Math.cos(r2))}
              y2={Math.round(128 * Math.sin(r2))}
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
          );
        })}
        {bolts.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r="7" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        ))}
        <rect
          x="-27"
          y="-11"
          width="54"
          height="22"
          rx="11"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

const FEATURES = [
  'Zero-knowledge architecture',
  'AES-256 encryption at rest',
  'Password strength analysis',
  'Secure credential vault',
];

const CSS = `
:root{
  --kk-teal:#0E7490;
  --kk-teal-2:#155E75;
  --kk-teal-3:#0F172A;
  --kk-cyan:#A5F3FC;
  --kk-paper:#F8FAFC;
  --kk-ink:#0F172A;
  --kk-sub:#475569;
  --kk-line:#E2E8F0;
  --kk-shadow:0 20px 50px rgba(2,8,23,.10);
}
*{box-sizing:border-box}
body{margin:0;background:var(--kk-paper);font-family:Inter,system-ui,Arial,sans-serif;color:var(--kk-ink)}
.kk-wrap{min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr}
.kk-left{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:40px}
.kk-left-inner{position:relative;z-index:2;max-width:430px;color:#fff}
.kk-logo{display:flex;align-items:center;gap:14px;margin-bottom:28px}
.kk-logo-name{font-size:2rem;font-weight:800;letter-spacing:-.02em}
.kk-logo-name span{color:var(--kk-cyan)}
.kk-tagline{font-size:2.05rem;line-height:1.15;font-weight:800;letter-spacing:-.03em;margin-bottom:22px}
.kk-feats{display:grid;gap:12px;margin-bottom:20px}
.kk-feat{display:flex;align-items:center;gap:12px;font-size:1rem;font-weight:500}
.kk-feat-icon{width:22px;height:22px;border-radius:999px;background:rgba(255,255,255,.14);display:grid;place-items:center;border:1px solid rgba(255,255,255,.18)}
.kk-check{width:8px;height:8px;border-radius:999px;background:var(--kk-cyan)}
.kk-badge{display:inline-flex;align-items:center;padding:9px 12px;border-radius:999px;background:rgba(2,6,23,.18);border:1px solid rgba(255,255,255,.16);font-size:.85rem;color:#E6FAFF}
.kk-right{display:flex;align-items:center;justify-content:center;padding:40px;background:linear-gradient(180deg,#fff 0%, #F8FAFC 100%)}
.kk-form-wrap{width:100%;max-width:430px;background:#fff;border:1px solid var(--kk-line);border-radius:24px;box-shadow:var(--kk-shadow);padding:28px}
.kk-tabs{display:flex;background:#F1F5F9;border-radius:14px;padding:4px;margin-bottom:18px}
.kk-tab{flex:1;border:0;background:transparent;padding:12px 14px;border-radius:10px;font-weight:700;cursor:pointer}
.kk-tab.on{background:#fff;box-shadow:0 4px 14px rgba(2,8,23,.06)}
.kk-tab.off{color:#64748B}
.kk-form-title{font-size:1.65rem;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
.kk-form-sub{font-size:.96rem;color:var(--kk-sub);margin-bottom:18px}
.kk-lbl{font-size:.82rem;font-weight:700;color:#334155;margin:12px 0 7px}
.kk-lbl-row{display:flex;align-items:center;justify-content:space-between;margin:12px 0 7px;gap:12px}
.kk-help-btn{background:none;border:0;padding:0;color:#0891B2;font-size:.8rem;font-weight:700;cursor:pointer}
.kk-help-box{margin-bottom:10px;padding:11px 12px;border-radius:12px;background:#ECFEFF;border:1px solid #A5F3FC;color:#155E75;font-size:.86rem;line-height:1.45}
.kk-recovery-note{margin-top:7px;font-size:.8rem;color:#64748B}
.kk-recovery-note span{font-weight:700;color:#334155}
.kk-inp{width:100%;padding:14px 15px;border-radius:14px;border:1px solid var(--kk-line);outline:none;font-size:.98rem;background:#fff}
.kk-inp:focus{border-color:#67E8F9;box-shadow:0 0 0 4px rgba(103,232,249,.18)}
.kk-btn{width:100%;margin-top:16px;padding:14px 16px;border:0;border-radius:14px;background:linear-gradient(180deg,#0891B2 0%, #0E7490 100%);color:#fff;font-weight:800;cursor:pointer}
.kk-btn:disabled{opacity:.7;cursor:not-allowed}
.kk-alert{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;padding:12px 14px;border-radius:14px;margin-bottom:12px;font-size:.92rem}
.kk-divider{display:flex;align-items:center;justify-content:center;color:#94A3B8;font-size:.85rem;margin:14px 0}
.kk-foot{font-size:.92rem;color:var(--kk-sub);text-align:center}
.kk-foot button{background:none;border:0;padding:0;color:#0891B2;font-weight:700;cursor:pointer}
.kk-sec{margin-top:18px;text-align:center;font-size:.8rem;color:#64748B}
@media (max-width: 980px){
  .kk-wrap{grid-template-columns:1fr}
  .kk-left{min-height:340px}
}
`;