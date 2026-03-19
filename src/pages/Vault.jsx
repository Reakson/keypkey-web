import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function firstLetter(s) {
  return (s?.trim()?.[0] || '?').toUpperCase();
}

function badgeOf(pwd) {
  if (!pwd) return null;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  const sets = [/[a-z]/.test(pwd), /[A-Z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  if (sets >= 2) s++;
  if (sets >= 3) s++;
  return ['WEAK', 'WEAK', 'MEDIUM', 'STRONG', 'STRONG'][s];
}

function strengthClass(badge) {
  if (badge === 'STRONG') return 'strong';
  if (badge === 'MEDIUM') return 'medium';
  if (badge === 'WEAK') return 'weak';
  return '';
}

export default function Vault({ setItemsForStats }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(null);
  const [visible, setVisible] = useState({});

  async function load() {
    const data = await api('/password');
    setItems(data);
    setItemsForStats?.(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.website?.toLowerCase().includes(q) || it.site_username?.toLowerCase().includes(q)
    );
  }, [items, query]);

  function toggleVisible(id) {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
  }

  async function copyPassword(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      alert('Copy failed — please copy manually');
    }
  }

  async function del(id) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    await api(`/password/${id}`, { method: 'DELETE' });
    const copy = items.filter((x) => x.id !== id);
    setItems(copy);
    setItemsForStats?.(copy);
    setVisible((v) => {
      const next = { ...v };
      delete next[id];
      return next;
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Vault</h1>
        <span className="page-subtitle">Encrypted credentials</span>
      </div>

      <div className="search">
        <input placeholder="Search by website or username…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty">
          {query ? `No results for "${query}"` : 'Your vault is empty. Add your first password to get started.'}
        </div>
      ) : (
        <div className="list">
          {filtered.map((it) => {
            const badge = badgeOf(it.password);
            const isShown = !!visible[it.id];
            const wasCopied = copied === it.id;

            return (
              <div className={`item ${badge ? strengthClass(badge) : ''}`} key={it.id}>
                <div className="avatar">{firstLetter(it.website)}</div>

                <div className="item-meta">
                  <div className="item-title">
                    {it.website}
                    {badge && <span className={`badge ${badge}`}>{badge}</span>}
                  </div>
                  <div className="item-sub">
                    {it.site_username}
                    <span className="item-password" style={{ marginLeft: '.75rem' }}>
                      ·{' '}
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal-d)' }}>
                        {isShown ? it.password : '••••••••'}
                      </code>
                    </span>
                  </div>
                </div>

                <div className="actions">
                  <button className={`btn-small ${isShown ? 'active' : ''}`} onClick={() => toggleVisible(it.id)}>
                    {isShown ? 'Hide' : 'Show'}
                  </button>

                  <button className={`btn-small ${wasCopied ? 'copied' : ''}`} onClick={() => copyPassword(it.password, it.id)}>
                    {wasCopied ? '✓ Copied' : 'Copy'}
                  </button>

                  <button
                    className="btn-small primary"
                    onClick={() =>
                      navigate('/add', {
                        state: {
                          id: it.id,
                          website: it.website,
                          username: it.site_username,
                          password: it.password,
                        },
                      })
                    }
                  >
                    Edit
                  </button>

                  <button className="btn-small danger" onClick={() => del(it.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}