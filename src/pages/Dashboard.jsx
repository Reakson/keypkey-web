import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function computeStrength(pwd) {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  const sets = [/[a-z]/.test(pwd), /[A-Z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  if (sets >= 2) s++;
  if (sets >= 3) s++;
  return ['WEAK', 'WEAK', 'MEDIUM', 'STRONG', 'STRONG'][s];
}

function firstLetter(s) {
  return (s?.trim()?.[0] || '?').toUpperCase();
}

export default function Dashboard({ setItemsForStats }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const vault = await api('/password');
        setItems(vault);
        setItemsForStats?.(vault);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [setItemsForStats]);

  const { total, strong, medium, weak, reused, risky } = useMemo(() => {
    let strong = 0;
    let medium = 0;
    let weak = 0;

    const usable = items.filter((it) => it.password);

    usable.forEach((it) => {
      const lvl = computeStrength(it.password);
      if (lvl === 'STRONG') strong++;
      else if (lvl === 'MEDIUM') medium++;
      else weak++;
    });

    const pwdCount = {};
    usable.forEach((it) => {
      pwdCount[it.password] = (pwdCount[it.password] || 0) + 1;
    });

    const reusedPwds = new Set(
      Object.keys(pwdCount).filter((p) => pwdCount[p] > 1)
    );

    const reused = usable.filter((it) => reusedPwds.has(it.password));

    const risky = usable.filter((it) => computeStrength(it.password) === 'WEAK');

    return { total: items.length, strong, medium, weak, reused, risky };
  }, [items]);

  const score = total === 0 ? null : Math.round((strong / total) * 100);
  const scoreColor =
    score === null
      ? 'var(--muted)'
      : score >= 70
        ? 'var(--success)'
        : score >= 40
          ? 'var(--gold)'
          : 'var(--danger)';
  const scoreLabel = score === null ? '—' : score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Security Report</h1>
        </div>
        <div className="card" style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '2rem' }}>
          Analysing your vault…
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Security Report</h1>
        <span className="page-subtitle">Based on {total} credential{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="summary-grid">
        {[
          { label: 'Total', value: total, cls: '' },
          { label: 'Strong', value: strong, cls: 'strong-card' },
          { label: 'Medium', value: medium, cls: 'medium-card' },
          { label: 'Weak', value: weak, cls: 'weak-card' },
        ].map(({ label, value, cls }) => (
          <div className={`summary-card ${cls}`} key={label}>
            <div className="stat-title">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="stat-title" style={{ marginBottom: '.6rem' }}>Overall Security Score</div>
        {score === null ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No entries in vault yet.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: scoreColor, minWidth: 64 }}>
              {score}%
            </div>
            <div style={{ flex: 1 }}>
              <div className="score-bar-wrap" style={{ height: 10, marginBottom: '.35rem' }}>
                <div
                  className="score-bar-fill"
                  style={{ width: `${score}%`, background: scoreColor }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {strong} strong · {medium} medium · {weak} weak
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: scoreColor, minWidth: 40 }}>
              {scoreLabel}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <div className="page-header" style={{ marginBottom: '.6rem' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Reused Passwords
          </h2>
          <span className="page-subtitle">{reused.length} found</span>
        </div>
        {reused.length === 0 ? (
          <div className="card empty">✓ No reused passwords detected.</div>
        ) : (
          <div className="list">
            {reused.map((it) => (
              <div className="item medium" key={it.id}>
                <div className="avatar">{firstLetter(it.website)}</div>
                <div className="item-meta">
                  <div className="item-title">{it.website}</div>
                  <div className="item-sub">{it.site_username}</div>
                </div>
                <span className="badge REUSED">Reused</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="page-header" style={{ marginBottom: '.6rem' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Risky Entries
          </h2>
          <span className="page-subtitle">{risky.length} found</span>
        </div>
        {risky.length === 0 ? (
          <div className="card empty">✓ No risky entries found.</div>
        ) : (
          <div className="list">
            {risky.map((it) => {
              const lvl = computeStrength(it.password);
              return (
                <div className={`item ${lvl === 'WEAK' ? 'weak' : 'medium'}`} key={it.id}>
                  <div className="avatar">{firstLetter(it.website)}</div>
                  <div className="item-meta">
                    <div className="item-title">{it.website}</div>
                    <div className="item-sub">{it.site_username}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                    {lvl === 'WEAK' && <span className="badge WEAK">Weak</span>}
                    <button
                      className="btn-small primary"
                      onClick={() =>
                        navigate('/add', {
                          state: {
                            id: it.id,
                            website: it.website,
                            username: it.site_username,
                          },
                        })
                      }
                    >
                      Fix →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}