import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginTeacher } from '../services/authService';
import { TEACHER_PROFILE } from '../data/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'diksha_teacher_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    const data = await registerTeacher(formData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginTeacher({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.user;
  }, []);

  const quickDemoLogin = useCallback(async () => {
    return login(TEACHER_PROFILE.email, 'password123');
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        register,
        login,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const DEFAULT_AUTH = {
  user: TEACHER_PROFILE,
  token: 'demo-token',
  isAuthenticated: true,
  loading: false,
  login: async () => TEACHER_PROFILE,
  quickDemoLogin: async () => TEACHER_PROFILE,
  logout: () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx || DEFAULT_AUTH;
}
