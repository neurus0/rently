import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

type Auth = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<Auth | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('rently-token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch {
      localStorage.removeItem('rently-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const accept = (r: { user: User; token: string }) => {
    localStorage.setItem('rently-token', r.token);
    setUser(r.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    accept(res);
  };

  const signup = async (data: Record<string, unknown>) => {
    const res = await api<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    accept(res);
  };

  const logout = () => {
    localStorage.removeItem('rently-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const x = useContext(AuthContext);
  if (!x) throw new Error('AuthProvider is missing');
  return x;
};
