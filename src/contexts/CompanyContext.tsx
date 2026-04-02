import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Plan {
  id: string;
  slug: string;
  nome_comercial: string;
  descricao: string;
  limite_obras: number;
  limite_gestores: number;
  limite_funcionarios: number;
  limite_clientes: number;
  ilimitado: boolean;
  ativo: boolean;
  features: Record<string, any>;
}

export interface Company {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  plan_id: string | null;
  status: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  ciclo: string;
  data_inicio: string;
  data_vencimento: string | null;
  valor_base: number;
  moeda: string;
  trial_start: string | null;
  trial_end: string | null;
}

interface PlanLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
  reason?: string;
}

interface CompanyContextType {
  company: Company | null;
  plan: Plan | null;
  subscription: Subscription | null;
  plans: Plan[];
  loading: boolean;
  needsOnboarding: boolean;
  checkLimit: (resource: 'obras' | 'gestores' | 'funcionarios' | 'clientes') => Promise<PlanLimitResult>;
  refreshCompany: () => Promise<void>;
  createCompany: (data: { nome: string; cnpj?: string; email?: string; telefone?: string; planSlug: string }) => Promise<string | null>;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchPlans = useCallback(async () => {
    const { data } = await supabase.from('plans').select('*').eq('ativo', true).order('limite_obras');
    if (data) setPlans(data as unknown as Plan[]);
  }, []);

  const fetchCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setPlan(null);
      setSubscription(null);
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }

    // Get user's company_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) {
      // Check if user is platform admin - they don't need a company
      if (user.role === 'admin') {
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }
      setNeedsOnboarding(true);
      setLoading(false);
      return;
    }

    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();

    if (companyData) {
      setCompany(companyData as unknown as Company);
      setNeedsOnboarding(false);

      // Fetch plan
      if (companyData.plan_id) {
        const { data: planData } = await supabase
          .from('plans')
          .select('*')
          .eq('id', companyData.plan_id)
          .single();
        if (planData) setPlan(planData as unknown as Plan);
      }

      // Fetch active subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyData.id)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (subData) setSubscription(subData as unknown as Subscription);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCompany]);

  const checkLimit = useCallback(async (resource: 'obras' | 'gestores' | 'funcionarios' | 'clientes'): Promise<PlanLimitResult> => {
    if (!company) return { allowed: false, current: 0, limit: 0, plan: '', reason: 'Sem empresa vinculada' };

    const { data, error } = await supabase.rpc('check_plan_limit', {
      _company_id: company.id,
      _resource: resource,
    });

    if (error || !data) return { allowed: false, current: 0, limit: 0, plan: '', reason: 'Erro ao verificar limite' };
    return data as unknown as PlanLimitResult;
  }, [company]);

  const createCompany = useCallback(async (input: { nome: string; cnpj?: string; email?: string; telefone?: string; planSlug: string }) => {
    if (!user) return null;

    // Get plan
    const targetPlan = plans.find(p => p.slug === input.planSlug);
    if (!targetPlan) return null;

    // Create company
    const { data: newCompany, error } = await supabase.from('companies').insert({
      nome: input.nome,
      cnpj: input.cnpj || '',
      email: input.email || user.email,
      telefone: input.telefone || '',
      plan_id: targetPlan.id,
      status: 'ativo',
    } as any).select().single();

    if (error || !newCompany) return null;

    const companyId = (newCompany as any).id;

    // Create subscription
    await supabase.from('subscriptions').insert({
      company_id: companyId,
      plan_id: targetPlan.id,
      status: 'trial',
      ciclo: 'mensal',
      trial_start: new Date().toISOString().split('T')[0],
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    } as any);

    // Link user to company
    await supabase.from('profiles').update({ company_id: companyId } as any).eq('user_id', user.id);
    await supabase.from('user_roles').update({ company_id: companyId } as any).eq('user_id', user.id);

    await fetchCompany();
    return companyId;
  }, [user, plans, fetchCompany]);

  return (
    <CompanyContext.Provider value={{
      company, plan, subscription, plans, loading, needsOnboarding,
      checkLimit, refreshCompany: fetchCompany, createCompany,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
