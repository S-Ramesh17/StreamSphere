import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('ss_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      initSocket(token);
    } catch {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('ss_token', data.token);
    localStorage.setItem('ss_user', JSON.stringify(data.user));
    setUser(data.user);
    initSocket(data.token);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('ss_token', data.token);
    localStorage.setItem('ss_user', JSON.stringify(data.user));
    setUser(data.user);
    initSocket(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isCreator: user?.role === 'creator' || user?.role === 'admin',
      isSubscriber: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
