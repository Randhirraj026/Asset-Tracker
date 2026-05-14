import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface AuthContextValue {
  token: string | null;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const saved = localStorage.getItem('asset_user') || sessionStorage.getItem('asset_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem('asset_user');
    sessionStorage.removeItem('asset_user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('asset_token') || sessionStorage.getItem('asset_token'));
  const [user, setUser] = useState<AuthContextValue['user']>(readStoredUser);

  async function login(email: string, password: string, remember: boolean) {
    try {
      const response = await authService.login({ email, password });
      const { token: accessToken, admin } = response.data.data;
      const profile = {
        name: admin.username,
        email: admin.email,
        role: admin.role
      };
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('asset_token', accessToken);
      storage.setItem('asset_user', JSON.stringify(profile));
      setToken(accessToken);
      setUser(profile);
      toast.success('Signed in successfully');
    } catch (error) {
      toast.error('Invalid admin email or password');
      throw error;
    }
  }

  function logout() {
    authService.logout().catch(() => undefined);
    localStorage.removeItem('asset_token');
    localStorage.removeItem('asset_user');
    sessionStorage.removeItem('asset_token');
    sessionStorage.removeItem('asset_user');
    setToken(null);
    setUser(null);
    toast.success('Signed out');
  }

  const value = useMemo(() => ({ token, user, login, logout, isAuthenticated: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
