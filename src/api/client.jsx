const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'keypkey_token';
const USER_KEY = 'keypkey_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  const upperMethod = method.toUpperCase();

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const authToken = token || getToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: upperMethod,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}