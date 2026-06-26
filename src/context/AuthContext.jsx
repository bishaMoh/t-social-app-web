import { createContext, useContext, useEffect, useState } from 'react';
import { auth, users } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    users
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await auth.login(credentials);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  }

  async function register(payload) {
    await auth.register(payload);
    return login({ username: payload.username, password: payload.password });
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  async function refreshUser() {
    const data = await users.me();
    setUser(data);
    return data;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
