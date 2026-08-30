import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthResponse } from '../types';
import { API_BASE_URL } from '../config/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `${API_BASE_URL}/api`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mahasetu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mahasetu_token');
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            const userData: UserProfile = await res.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem('mahasetu_token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to validate session:', err);
          localStorage.removeItem('mahasetu_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      const data: AuthResponse | any = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem('mahasetu_token', data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Connection to security gateway failed. Please ensure backend is running.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (registerData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data: AuthResponse | any = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem('mahasetu_token', data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Registration failed. Please verify input.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Registration failed due to network error.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mahasetu_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      error,
      clearError
    }}>
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
