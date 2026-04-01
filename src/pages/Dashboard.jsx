import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

function computeStrength(pwd = '') {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score >= 5) return 'STRONG';
  if (score >= 3) return 'MEDIUM';
  return 'WEAK';
}

export default function Dashboard({ itemsForStats, setItemsForStats }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const vault = await api('/password');
        setItems(vault);
        if (setItemsForStats) setItemsForStats(vault);
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

    const riskyIds = new Set([
      ...usable
        .filter((it) => computeStrength(it.password) === 'WEAK')
        .map((it) => it.id),
      ...reused.map((it) => it.id),
    ]);

    const risky = usable.filter((it) => riskyIds.has(it.id));

    return { total: items.length, strong, medium, weak, reused, risky };
  }, [items]);

  const health = total
    ? Math.round(((strong * 100) + (medium * 60) + (weak * 20)) / total)
    : 0;

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Security Report</h1>
          <span>Analyzing your vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Security Report</h1>
        <span>Based on {total} credentials</span>
      </div>

      <section className="stats-grid">
        <div className="stat-card cyan">
          <div className="stat-label">Total</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Strong</div>
          <div className="stat-value">{strong}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Medium</div>
          <div className="stat-value">{medium}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Weak</div>
          <div className="stat-value">{weak}</div>
        </div>
      </section>

      <section className="health-card">
        <div className="health-title">Overall Security Score</div>
        {total ? (
          <>
            <div className="progress">
              <span style={{ width: `${health}%` }} />
            </div>
            <div className="health-value">{health}%</div>
          </>
        ) : (
          <div className="muted">No entries in vault yet.</div>
        )}
      </section>

      <section className="report-section">
        <div className="section-title">
          Reused Passwords <span>{reused.length} found</span>
        </div>
        {reused.length ? (
          <div className="list">
            {reused.map((it) => (
              <div key={it.id} className="list-item">
                <div className="item-main">
                  <div className="item-title">{it.website}</div>
                  <div className="item-sub">{it.site_username}</div>
                </div>
                <span className="tag red">Reused</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-card">✓ No reused passwords detected.</div>
        )}
      </section>

      <section className="report-section">
        <div className="section-title">
          Risky Entries <span>{risky.length} found</span>
        </div>
        {risky.length ? (
          <div className="list">
            {risky.map((it) => {
              const lvl = computeStrength(it.password);
              return (
                <div key={it.id} className="list-item">
                  <div className="item-main">
                    <div className="item-title">{it.website}</div>
                    <div className="item-sub">{it.site_username}</div>
                  </div>
                  <span className={`tag ${lvl === 'WEAK' ? 'red' : 'orange'}`}>
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-card">✓ No risky entries found.</div>
        )}
      </section>
    </div>
  );
}