import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getStoredUser, getToken } from './api/client';
import AuthLanding from './pages/AuthLanding';
import Vault from './pages/Vault';
import AddPassword from './pages/AddPassword';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import Shell from './components/Shell';

function Private({ user, children }) {
  const loc = useLocation();
  if (!user && !getToken()) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [itemsForStats, setItemsForStats] = useState([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<AuthLanding setUser={setUser} initialMode="login" />} />
      <Route path="/register" element={<AuthLanding setUser={setUser} initialMode="register" />} />

      <Route path="/" element={<Navigate to="/vault" />} />
      <Route
        path="/vault"
        element={
          <Private user={user}>
            <Shell user={user} setUser={setUser} itemsForStats={itemsForStats}>
              <Vault setItemsForStats={setItemsForStats} />
            </Shell>
          </Private>
        }
      />
      <Route
        path="/add"
        element={
          <Private user={user}>
            <Shell user={user} setUser={setUser} itemsForStats={itemsForStats}>
              <AddPassword />
            </Shell>
          </Private>
        }
      />
      <Route
        path="/generator"
        element={
          <Private user={user}>
            <Shell user={user} setUser={setUser} itemsForStats={itemsForStats}>
              <Generator />
            </Shell>
          </Private>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Private user={user}>
            <Shell user={user} setUser={setUser} itemsForStats={itemsForStats}>
              <Dashboard itemsForStats={itemsForStats} setItemsForStats={setItemsForStats} />
            </Shell>
          </Private>
        }
      />
      <Route path="*" element={<Navigate to="/vault" />} />
    </Routes>
  );
}