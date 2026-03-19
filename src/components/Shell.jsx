import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession } from '../api/client';

function computeStrength(pwd) {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  const sets = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  if (sets >= 2) s++;
  if (sets >= 3) s++;
  return ['WEAK', 'WEAK', 'MEDIUM', 'STRONG', 'STRONG'][s];
}

const NAV_ITEMS = [
  { to: '/vault', icon: '🗄', label: 'My Vault' },
  { to: '/add', icon: '＋', label: 'Add Password' },
  { to: '/generator', icon: '⚡', label: 'Generator' },
  { to: '/dashboard', icon: '🛡', label: 'Security Report' },
];

export default function Shell({ user, setUser, children, itemsForStats = [] }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = itemsForStats.length;
    let strong = 0,
      medium = 0,
      weak = 0;
    itemsForStats.forEach((it) => {
      const pwd = it.password || it.revealed;
      if (!pwd) return;
      const lvl = computeStrength(pwd);
      if (lvl === 'STRONG') strong++;
      else if (lvl === 'MEDIUM') medium++;
      else weak++;
    });
    return { total, strong, medium, weak };
  }, [itemsForStats]);

  function logout() {
    clearSession();
    setUser?.(null);
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="11" fill="#0891B2" />
            <rect width="48" height="48" rx="11" fill="none" stroke="#A5F3FC" strokeWidth="1.5" />
            <circle cx="19" cy="20" r="8" stroke="white" strokeWidth="2.5" />
            <circle cx="19" cy="20" r="3.5" fill="white" />
            <line x1="25" y1="24" x2="38" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="29.5" x2="34.5" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="32.5" x2="38.5" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="topbar-brand">KeypKey</div>
        </div>
        <div className="right">
          <span className="pill secure">● Encrypted</span>
          {user?.email && (
            <span
              className="pill"
              style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user.email}
            </span>
          )}
          <button className="btn-small" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="side-section">
          <div className="side-title">Navigation</div>
          <nav className="nav-col">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}>
                <span className="navlink-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {user?.username && (
          <div
            className="side-section"
            style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--line-2)' }}
          >
            <div className="side-title">Signed in as</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', padding: '0 .5rem' }}>
              {user.username}
            </div>
          </div>
        )}
      </aside>

      <main className="main">{children}</main>

      <aside className="stats">
        <div className="stats-title">Vault Overview</div>
        <div className="stat-box">
          <div className="stat-title">Total Entries</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Strong</div>
          <div className="stat-value strong">{stats.strong}</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Medium</div>
          <div className="stat-value medium">{stats.medium}</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Weak</div>
          <div className="stat-value weak">{stats.weak}</div>
        </div>

        {stats.total > 0 && (
          <div className="stat-box" style={{ marginTop: '.8rem' }}>
            <div className="stat-title" style={{ marginBottom: '.5rem' }}>
              Health Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div className="score-bar-wrap">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${Math.round((stats.strong / stats.total) * 100)}%`,
                    background:
                      stats.strong / stats.total >= 0.7
                        ? 'var(--success)'
                        : stats.strong / stats.total >= 0.4
                        ? 'var(--gold)'
                        : 'var(--danger)',
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
                {Math.round((stats.strong / stats.total) * 100)}%
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}