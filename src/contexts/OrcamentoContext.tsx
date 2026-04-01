import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockOrcamentoItens } from '@/data/mockData';

// --- Types ---
export interface OrcamentoSubitem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number | null;
  precoUnitario: number | null;
  precoTotal: number;
}

export interface OrcamentoComposicao {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number | null;
  precoUnitario: number | null;
  precoTotal: number;
  subitens: OrcamentoSubitem[];
  usaSubitens: boolean;
}

export interface OrcamentoCategoria {
  id: string;
  codigo: string;
  nome: string;
  precoTotal: number;
  usaComposicoes: boolean;
  composicoes: OrcamentoComposicao[];
}

export interface OrcamentoObra {
  obraId: string;
  categorias: OrcamentoCategoria[];
}

// Catálogo global de categorias já usadas
export interface CategoriaTemplate {
  codigo: string;
  nome: string;
}

// Default suggested categories for construction
const defaultCategorias: CategoriaTemplate[] = [
  { codigo: 'CAT-001', nome: 'Serviços Preliminares' },
  { codigo: 'CAT-002', nome: 'Fundação' },
  { codigo: 'CAT-003', nome: 'Estrutura' },
  { codigo: 'CAT-004', nome: 'Alvenaria' },
  { codigo: 'CAT-005', nome: 'Cobertura' },
  { codigo: 'CAT-006', nome: 'Instalações Elétricas' },
  { codigo: 'CAT-007', nome: 'Instalações Hidráulicas' },
  { codigo: 'CAT-008', nome: 'Revestimentos' },
  { codigo: 'CAT-009', nome: 'Pisos' },
  { codigo: 'CAT-010', nome: 'Pintura' },
  { codigo: 'CAT-011', nome: 'Esquadrias' },
  { codigo: 'CAT-012', nome: 'Louças e Metais' },
  { codigo: 'CAT-013', nome: 'Limpeza Final' },
];

// Seed from mock data
function seedFromMock(): OrcamentoObra[] {
  const byObra = new Map<string, OrcamentoCategoria[]>();
  for (const item of mockOrcamentoItens) {
    if (!byObra.has(item.obraId)) byObra.set(item.obraId, []);
    const cats = byObra.get(item.obraId)!;
    let cat = cats.find(c => c.nome === item.categoria);
    if (!cat) {
      const tpl = defaultCategorias.find(t => t.nome === item.categoria);
      cat = {
        id: `cat-${item.id}`,
        codigo: tpl?.codigo || `CAT-${String(cats.length + 1).padStart(3, '0')}`,
        nome: item.categoria,
        precoTotal: 0,
        usaComposicoes: true,
        composicoes: [],
      };
      cats.push(cat);
    }
    cat.composicoes.push({
      id: item.id,
      codigo: item.id.toUpperCase(),
      descricao: item.descricao,
      unidade: item.unidade,
      quantidade: item.quantidade,
      precoUnitario: item.custoUnitarioPrevisto,
      precoTotal: item.custoTotalPrevisto,
      subitens: [],
      usaSubitens: false,
    });
    cat.precoTotal = cat.composicoes.reduce((s, c) => s + c.precoTotal, 0);
  }
  return Array.from(byObra.entries()).map(([obraId, categorias]) => ({ obraId, categorias }));
}

interface OrcamentoContextType {
  orcamentos: OrcamentoObra[];
  getOrcamento: (obraId: string) => OrcamentoObra | undefined;
  saveOrcamento: (orc: OrcamentoObra) => void;
  catalogoCategorias: CategoriaTemplate[];
  addCategoriaToCatalogo: (cat: CategoriaTemplate) => void;
  generateCategoriaCodigo: () => string;
  getUnidadesUsadas: () => string[];
}

const OrcamentoContext = createContext<OrcamentoContextType | null>(null);

export function OrcamentoProvider({ children }: { children: React.ReactNode }) {
  const [orcamentos, setOrcamentos] = useState<OrcamentoObra[]>(seedFromMock);
  const [catalogoCategorias, setCatalogo] = useState<CategoriaTemplate[]>(defaultCategorias);

  const getOrcamento = useCallback((obraId: string) => {
    return orcamentos.find(o => o.obraId === obraId);
  }, [orcamentos]);

  const saveOrcamento = useCallback((orc: OrcamentoObra) => {
    setOrcamentos(prev => {
      const idx = prev.findIndex(o => o.obraId === orc.obraId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = orc;
        return next;
      }
      return [...prev, orc];
    });
    // Add any new categories to catalog
    for (const cat of orc.categorias) {
      setCatalogo(prev => {
        if (prev.some(c => c.codigo === cat.codigo)) return prev;
        return [...prev, { codigo: cat.codigo, nome: cat.nome }];
      });
    }
  }, []);

  const addCategoriaToCatalogo = useCallback((cat: CategoriaTemplate) => {
    setCatalogo(prev => {
      if (prev.some(c => c.codigo === cat.codigo)) return prev;
      return [...prev, cat];
    });
  }, []);

  const generateCategoriaCodigo = useCallback(() => {
    const nums = catalogoCategorias
      .map(c => { const m = c.codigo.match(/^CAT-(\d+)$/); return m ? parseInt(m[1]) : 0; })
      .filter(n => n > 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `CAT-${String(next).padStart(3, '0')}`;
  }, [catalogoCategorias]);

  const getUnidadesUsadas = useCallback(() => {
    const set = new Set<string>();
    set.add('vb'); set.add('m²'); set.add('m³'); set.add('m'); set.add('un'); set.add('kg');
    set.add('saco'); set.add('barra'); set.add('rolo'); set.add('l'); set.add('t');
    for (const orc of orcamentos) {
      for (const cat of orc.categorias) {
        for (const comp of cat.composicoes) {
          if (comp.unidade) set.add(comp.unidade);
          for (const sub of comp.subitens) {
            if (sub.unidade) set.add(sub.unidade);
          }
        }
      }
    }
    return Array.from(set).sort();
  }, [orcamentos]);

  return (
    <OrcamentoContext.Provider value={{ orcamentos, getOrcamento, saveOrcamento, catalogoCategorias, addCategoriaToCatalogo, generateCategoriaCodigo, getUnidadesUsadas }}>
      {children}
    </OrcamentoContext.Provider>
  );
}

export function useOrcamento() {
  const ctx = useContext(OrcamentoContext);
  if (!ctx) throw new Error('useOrcamento must be used within OrcamentoProvider');
  return ctx;
}
