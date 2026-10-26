import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [activeInstitutionId, setActiveInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [alertCount, setAlertCount] = useState(1);

  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        if (currentUser.institutionId) {
          setActiveInstitutionId(currentUser.institutionId);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // Fetch institutions list once authenticated
  useEffect(() => {
    if (user) {
      api.getInstitutions()
        .then((insts) => {
          setInstitutions(insts || []);
          if (!activeInstitutionId && insts && insts.length > 0) {
            setActiveInstitutionId(user.institutionId || insts[0].id);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const login = async (email, pass) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.institutionId) {
        setActiveInstitutionId(res.user.institutionId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setActiveInstitutionId('');
  };

  const quickDemoLogin = async (email, pass) => {
    await login(email, pass);
  };

  const isAicteAdmin = user?.role === 'AICTE_ADMIN';
  const isInstitutionAdmin = user?.role === 'INSTITUTION_ADMIN';
  const isVerifier = user?.role === 'VERIFIER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickDemoLogin,
        isAicteAdmin,
        isInstitutionAdmin,
        isVerifier,
        activeInstitutionId,
        setActiveInstitutionId,
        institutions,
        alertCount,
        setAlertCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
