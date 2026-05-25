'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

function decodeJwtExp(token: string): number | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return true;
  return exp * 1000 < Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        clearSession();
        return false;
      }

      const data = (await res.json()) as { access_token: string };
      localStorage.setItem('access_token', data.access_token);

      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored) as User);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession]);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        if (!isTokenExpired(accessToken)) {
          setUser(JSON.parse(storedUser) as User);
        } else {
          const refreshed = await tryRefresh();
          if (!refreshed) setShowAuthModal(true);
        }
      } else {
        setShowAuthModal(true);
      }
      setLoading(false);
    };

    initAuth();
  }, [tryRefresh]);

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = await res.json() as {
      success?: boolean;
      message?: string;
      access_token?: string;
      refresh_token?: string;
      user?: {
        id: number;
        email: string;
        username: string;
        role: string;
      };
    };

    if (!res.ok) {
      throw new Error(data.message ?? 'Invalid email or password');
    }

    const newUser: User = {
      id: String(data.user!.id),
      email: data.user!.email,
      username: data.user!.username,
      name: data.user!.username,
      role: data.user!.role,
    };

    localStorage.setItem('access_token', data.access_token!);
    localStorage.setItem('refresh_token', data.refresh_token!);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setShowAuthModal(false);

    toast({
      title: `Welcome, ${newUser.username}!`,
      description: `Signed in as ${newUser.role}`,
      className: 'bg-green-50 border-green-200 text-green-900',
    });
  };

  const signOut = () => {
    clearSession();
    setShowAuthModal(true);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, isSignedIn: !!user, signIn, signOut, loading, showAuthModal, setShowAuthModal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
}
