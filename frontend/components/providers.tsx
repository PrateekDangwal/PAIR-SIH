'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/lib/types';
import {
  getStoredUser,
  mockLogin,
  mockSignup,
  mockLogout,
} from '@/lib/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const authValue: AuthContextType = {
    user,
    isLoading,
    login: (credentials) => {
      const newUser = mockLogin(credentials.email, credentials.name);
      setUser(newUser);
    },
    signup: (data) => {
      const newUser = mockSignup(data.name, data.email, data.password);
      setUser(newUser);
    },
    logout: () => {
      mockLogout();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
