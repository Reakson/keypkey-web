import React from 'react';

function computeScore(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  const sets = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd)
  ].filter(Boolean).length;
  if (sets >= 2) s++;
  if (sets >= 3) s++;
  return Math.min(4, s);
}

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const COLORS = ['#EF4444', '#F59E0B', '#D97706', '#16A34A', '#15803D'];

export default function StrengthMeter({ value = '' }) {
  if (!value) return null;
  const score = computeScore(value);
  const pct = ((score + 1) / 5) * 100;

  return (
    <div className="meter">
      <div className="meter-bar">
        <div
          className="meter-fill"
          style={{ width: `${pct}%`, background: COLORS[score] }}
        />
      </div>
      <span className="meter-label" style={{ color: COLORS[score] }}>
        {LABELS[score]}
      </span>
    </div>
  );
}
