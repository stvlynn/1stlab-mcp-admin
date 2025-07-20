import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      return {
        isAuthenticated: true,
        loginTime: new Date(parsed.loginTime)
      };
    }
    return {
      isAuthenticated: false,
      loginTime: null
    };
  });

  const login = (password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === adminPassword) {
      const authData = {
        isAuthenticated: true,
        loginTime: new Date()
      };
      setUser(authData);
      localStorage.setItem('adminAuth', JSON.stringify(authData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      loginTime: null
    });
    localStorage.removeItem('adminAuth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};