import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fk_token'));
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('fk_session_id'));
  const [loading, setLoading] = useState(false);

  const login = (userData, authToken, authSessionId) => {
    setUser(userData);
    setToken(authToken);
    setSessionId(authSessionId || null);
    localStorage.setItem('fk_user', JSON.stringify(userData));
    localStorage.setItem('fk_token', authToken);
    if (authSessionId) localStorage.setItem('fk_session_id', authSessionId);
  };

  const clearLocalSession = () => {
    setUser(null);
    setToken(null);
    setSessionId(null);
    localStorage.removeItem('fk_user');
    localStorage.removeItem('fk_token');
    localStorage.removeItem('fk_session_id');
  };

  const logout = async ({ mode = 'current', sessionIds = [] } = {}) => {
    try {
      if (token) {
        await api.post('/auth/logout', { mode, sessionIds });
      }
    } catch {
      // Clear local state even if server logout fails.
    } finally {
      clearLocalSession();
    }
  };

  const listSessions = async () => {
    const { data } = await api.get('/auth/sessions');
    return data;
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.user);
      localStorage.setItem('fk_user', JSON.stringify(data.user));
    } catch { clearLocalSession(); }
  };

  return (
    <AuthContext.Provider value={{ user, token, sessionId, loading, setLoading, login, logout, listSessions, refreshUser, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
