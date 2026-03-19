import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function NavBar({ user, setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      navigate('/login');
    } catch {}
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand">VaultX</Link>
      <div className="spacer" />
      {user ? (
        <>
          <Link to="/vault">Vault</Link>
          <Link to="/add">Add</Link>
          <Link to="/generator">Generator</Link>
          <button className="linklike" onClick={handleLogout}>Sign out</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
