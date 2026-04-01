import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const rolePermissions: Record<UserRole, string[]> = {
  gestor: [
    'dashboard:full', 'obras:create', 'obras:edit', 'obras:view',
    'orcamento:edit', 'orcamento:view', 'cronograma:edit', 'cronograma:view',
    'diario:view', 'diario:approve', 'diario:create',
    'estoque:view', 'estoque:edit', 'estoque:movimentar',
    'relatorios:view', 'usuarios:manage',
  ],
  funcionario: [
    'dashboard:operacional', 'obras:view',
    'cronograma:view',
    'diario:create', 'diario:view_own',
    'estoque:view', 'estoque:movimentar',
  ],
  cliente: [
    'dashboard:resumo', 'obras:view',
    'orcamento:view_resumo', 'cronograma:view',
    'diario:view_aprovados',
    'relatorios:view_resumo',
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('obrasUser');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((email: string, password: string) => {
    if (password !== '123456') return false;
    const found = mockUsers.find(u => u.email === email);
    if (!found) return false;
    setUser(found);
    localStorage.setItem('obrasUser', JSON.stringify(found));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('obrasUser');
  }, []);

  const hasPermission = useCallback((action: string) => {
    if (!user) return false;
    return rolePermissions[user.role].includes(action);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
