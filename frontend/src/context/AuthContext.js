import { createContext, useContext, useState, useEffect } from 'react';
import API from '../hooks/useApi';

const Ctx = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cp_token');
    if (!token) { setReady(true); return; }
    API.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem('cp_token'))
      .finally(() => setReady(true));
  }, []);

  const login = (token, user) => {
    localStorage.setItem('cp_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('cp_token');
    setUser(null);
  };

  const refresh = () =>
    API.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {});

  return <Ctx.Provider value={{ user, ready, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
