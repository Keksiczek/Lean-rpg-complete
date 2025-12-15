import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player } from '../types';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Player | null;
  login: (token: string, user: Player) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const playerData = await gameService.fetchPlayerProfile();
          setUser(playerData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: Player) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    try {
        const updatedUser = await gameService.fetchPlayerProfile();
        setUser(updatedUser);
    } catch (e) {
        console.error("Failed to refresh user data", e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, refreshUser }}>
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