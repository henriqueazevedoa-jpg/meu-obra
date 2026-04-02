import React, { createContext, useContext, useState, useCallback } from 'react';
import { Material, MovimentacaoEstoque, mockMateriais, mockMovimentacoes } from '@/data/mockData';

interface EstoqueContextType {
  materiais: Material[];
  movimentacoes: MovimentacaoEstoque[];
  getMateriaisByObra: (obraId: string) => Material[];
  getMovimentacoesByObra: (obraId: string) => MovimentacaoEstoque[];
  registrarMovimentacao: (mov: MovimentacaoEstoque) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
}

const EstoqueContext = createContext<EstoqueContextType | null>(null);

export function EstoqueProvider({ children }: { children: React.ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>(mockMateriais);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(mockMovimentacoes);

  const getMateriaisByObra = useCallback((obraId: string) => {
    return materiais.filter(m => m.obraId === obraId);
  }, [materiais]);

  const getMovimentacoesByObra = useCallback((obraId: string) => {
    return movimentacoes.filter(m => m.obraId === obraId);
  }, [movimentacoes]);

  const registrarMovimentacao = useCallback((mov: MovimentacaoEstoque) => {
    setMovimentacoes(prev => [mov, ...prev]);
    setMateriais(prev => prev.map(m => {
      if (m.id === mov.materialId) {
        return {
          ...m,
          estoqueAtual: mov.tipo === 'entrada'
            ? m.estoqueAtual + mov.quantidade
            : Math.max(0, m.estoqueAtual - mov.quantidade),
        };
      }
      return m;
    }));
  }, []);

  const addMaterial = useCallback((material: Material) => {
    setMateriais(prev => [...prev, material]);
  }, []);

  return (
    <EstoqueContext.Provider value={{
      materiais, movimentacoes, getMateriaisByObra, getMovimentacoesByObra,
      registrarMovimentacao, addMaterial,
    }}>
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const ctx = useContext(EstoqueContext);
  if (!ctx) throw new Error('useEstoque must be used within EstoqueProvider');
  return ctx;
}
