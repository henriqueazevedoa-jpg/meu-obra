import React, { createContext, useContext, useState, useCallback } from 'react';
import { Obra, mockObras } from '@/data/mockData';

interface ObrasContextType {
  obras: Obra[];
  addObra: (obra: Obra) => void;
  updateObra: (id: string, data: Partial<Obra>) => void;
  deleteObra: (id: string) => void;
  getObra: (id: string) => Obra | undefined;
  generateCodigo: () => string;
  getResponsaveis: () => string[];
}

const ObrasContext = createContext<ObrasContextType | null>(null);

export function ObrasProvider({ children }: { children: React.ReactNode }) {
  const [obras, setObras] = useState<Obra[]>(mockObras);

  const addObra = useCallback((obra: Obra) => {
    setObras(prev => [...prev, obra]);
  }, []);

  const updateObra = useCallback((id: string, data: Partial<Obra>) => {
    setObras(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  }, []);

  const deleteObra = useCallback((id: string) => {
    setObras(prev => prev.filter(o => o.id !== id));
  }, []);

  const getObra = useCallback((id: string) => {
    return obras.find(o => o.id === id);
  }, [obras]);

  const generateCodigo = useCallback(() => {
    const year = new Date().getFullYear();
    const existing = obras
      .map(o => {
        const match = o.codigo.match(/^OBR-(\d{4})-(\d{3})$/);
        if (match && parseInt(match[1]) === year) return parseInt(match[2]);
        return 0;
      })
      .filter(n => n > 0);
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    return `OBR-${year}-${String(next).padStart(3, '0')}`;
  }, [obras]);

  const getResponsaveis = useCallback(() => {
    const set = new Set(obras.map(o => o.responsavel).filter(Boolean));
    return Array.from(set);
  }, [obras]);

  return (
    <ObrasContext.Provider value={{ obras, addObra, updateObra, deleteObra, getObra, generateCodigo, getResponsaveis }}>
      {children}
    </ObrasContext.Provider>
  );
}

export function useObras() {
  const ctx = useContext(ObrasContext);
  if (!ctx) throw new Error('useObras must be used within ObrasProvider');
  return ctx;
}
