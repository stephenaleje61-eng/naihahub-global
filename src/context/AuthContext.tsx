import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

export type CurrencyCode = 'NGN' | 'USD' | 'GBP';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  quickLogin: (account: 'admin' | 'chidi' | 'amina' | 'folake') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1 / 1550,
  GBP: 1 / 1980,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('naijahub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('naijahub_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid, clearing');
        localStorage.removeItem('naijahub_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('naijahub_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('naijahub_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('naijahub_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const quickLogin = async (account: 'admin' | 'chidi' | 'amina' | 'folake') => {
    const creds = {
      admin: { email: 'admin@naijahub.ng', pass: 'Admin@123456' },
      chidi: { email: 'chidi@africatech.ng', pass: 'Password@123' },
      amina: { email: 'amina@bellafashion.ng', pass: 'Password@123' },
      folake: { email: 'folake@naijagrow.com', pass: 'Password@123' },
    }[account];

    await login(creds.email, creds.pass);
  };

  const formatPrice = (amount: number, fromCurrency = 'NGN'): string => {
    if (fromCurrency !== 'NGN') {
      return `${fromCurrency} ${amount.toLocaleString()}`;
    }

    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    } else if (currency === 'USD') {
      const converted = Math.round(amount * EXCHANGE_RATES.USD);
      return `$${converted.toLocaleString()}`;
    } else if (currency === 'GBP') {
      const converted = Math.round(amount * EXCHANGE_RATES.GBP);
      return `£${converted.toLocaleString()}`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        currency,
        setCurrency,
        formatPrice,
        login,
        register,
        logout,
        updateProfile,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
