import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { login as apiLogin } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Decode token on initial load
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.userId,
          role: decoded.role,
          name: decoded.name || decoded.email || 'User',
        });
      } catch (err) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      if (res?.token && res?.user) {
        // Immediately set user and token from backend response
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, message: res?.message || 'Login failed' };
    } catch (err) {
      console.error('Login error', err);
      return { ok: false, message: 'Login failed due to server error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
