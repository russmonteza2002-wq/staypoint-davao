/**
 * Central Authentication Context Provider (AuthContext)
 * 
 * Manages admin authentication state, JWT tokens, user profiles,
 * login routines, and logout routines across the React application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { AuthService } from '../services/authService';

// AuthContext Interface definition
interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create React Context for Auth State
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Wrapper Component
 * Wraps top-level routes to provide auth state to any child component.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Currently authenticated admin user object
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  
  // JWT Bearer Token stored in browser localStorage
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  
  // Application initial authentication loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing stored token on app load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        // Query backend profile endpoint using stored token
        const res = await AuthService.getProfile();
        setAdmin(res.data);
      } catch (error) {
        // If token is invalid or expired, purge session state
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  /**
   * Performs Admin Login
   * Sends credentials to backend API, receives JWT token, and saves session.
   */
  const login = async (email: string, password: string) => {
    const res = await AuthService.login({ email, password });
    localStorage.setItem('admin_token', res.data.token);
    setToken(res.data.token);
    setAdmin(res.data.admin);
  };

  /**
   * Performs Admin Logout
   * Clears stored JWT token and resets internal user state.
   */
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      // Continue clearing local state even if logout request fails
    }
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook for consuming Auth Context
 * Throws a clear developer error if called outside an AuthProvider wrapper.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
