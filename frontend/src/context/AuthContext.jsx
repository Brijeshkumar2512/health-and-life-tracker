import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('health_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check user session
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('health_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('health_token', receivedToken);
    localStorage.setItem('health_user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('health_token', receivedToken);
    localStorage.setItem('health_user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('health_token');
    localStorage.removeItem('health_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/user/profile', profileData);
    setUser((prev) => ({ ...prev, ...res.data }));
    return res.data;
  };

  const updateGoals = async (goalsData) => {
    const res = await api.put('/user/goals', { goals: goalsData });
    setUser((prev) => ({ ...prev, ...res.data }));
    return res.data;
  };

  const seedDemo = async () => {
    const res = await api.post('/analytics/seed');
    // Refresh user info
    const meRes = await api.get('/auth/me');
    setUser(meRes.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateGoals,
        seedDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
