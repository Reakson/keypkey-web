import React, { useState } from 'react';

export default function Generator() {
  const [len, setLen] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [out, setOut] = useState('');
  const [copied, setCopied] = useState(false);

  function generate() {
    const sets = [];
    if (lower) sets.push('abcdefghijklmnopqrstuvwxyz');
    if (upper) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (digits) sets.push('0123456789');
    if (symbols) sets.push('!@#$%^&*()-_=+[]{};:,.?');
    if (!sets.length) return;
    const all = sets.join('');
    let pwd = sets.map(s => s[Math.floor(Math.random() * s.length)]).join('');
    for (let i = pwd.length; i < len; i++) pwd += all[Math.floor(Math.random() * all.length)];
    setOut(pwd.split('').sort(() => Math.random() - 0.5).join(''));
    setCopied(false);
  }

  async function copy() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const OPTIONS = [
    { label: 'Uppercase (A–Z)',  checked: upper,   set: setUpper },
    { label: 'Lowercase (a–z)',  checked: lower,   set: setLower },
    { label: 'Numbers (0–9)',    checked: digits,  set: setDigits },
    { label: 'Symbols (!@#$)',   checked: symbols, set: setSymbols },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Password Generator</h1>
        <span className="page-subtitle">Cryptographically random</span>
      </div>

      <div className="form-box" style={{ maxWidth: 520 }}>
        {/* Output */}
        <div className="generator-output">
          {out || <span style={{ color: 'var(--muted-2)', fontSize: '1rem' }}>Click Generate to create a password</span>}
        </div>

        {/* Length slider */}
        <div className="slider-row" style={{ marginTop: '1.1rem' }}>
          <span className="slider-label">Length</span>
          <input
            type="range"
            min="8"
            max="64"
            value={len}
            onChange={e => setLen(+e.target.value)}
          />
          <span className="slider-value">{len}</span>
        </div>

        {/* Character options */}
        <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: '.9rem', marginTop: '.4rem' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.2em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '.5rem' }}>
            Character Sets
          </div>
          <div className="gen-option-grid">
            {OPTIONS.map(({ label, checked, set }) => (
              <label key={label} className="gen-option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => set(e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="row" style={{ marginTop: '1rem', gap: '.6rem' }}>
          <button className="btn" onClick={generate} type="button" style={{ flex: 2 }}>
            ⚡ Generate
          </button>
          <button
            className={`btn secondary ${copied ? 'primary' : ''}`}
            onClick={copy}
            type="button"
            style={{ flex: 1 }}
            disabled={!out}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
