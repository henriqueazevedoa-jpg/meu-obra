import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, HardHat, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminCompany {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  status: string;
  plan_id: string | null;
  plan_nome?: string;
  plan_slug?: string;
  obra_count: number;
  gestor_count: number;
  funcionario_count: number;
  cliente_count: number;
}

interface AdminPlan {
  id: string;
  slug: string;
  nome_comercial: string;
}

const statusLabels: Record<string, string> = {
  ativo: 'Ativo', inativo: 'Inativo', suspenso: 'Suspenso', teste: 'Teste',
};
const statusColors: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800', inativo: 'bg-gray-100 text-gray-800',
  suspenso: 'bg-red-100 text-red-800', teste: 'bg-blue-100 text-blue-800',
};

export default function AdminPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [{ data: companiesData }, { data: plansData }] = await Promise.all([
      supabase.from('companies').select('*'),
      supabase.from('plans').select('id, slug, nome_comercial'),
    ]);

    if (plansData) setPlans(plansData as unknown as AdminPlan[]);

    if (companiesData) {
      const enriched: AdminCompany[] = [];
      for (const c of companiesData as any[]) {
        // Get counts via separate queries
        const [{ count: obraCount }, { count: gestorCount }, { count: funcCount }, { count: clienteCount }] = await Promise.all([
          supabase.from('obras').select('*', { count: 'exact', head: true }).eq('company_id', c.id),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('company_id', c.id).eq('role', 'gestor'),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('company_id', c.id).eq('role', 'funcionario'),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('company_id', c.id).eq('role', 'cliente'),
        ]);

        const matchPlan = plansData?.find((p: any) => p.id === c.plan_id) as any;
        enriched.push({
          ...c,
          plan_nome: matchPlan?.nome_comercial || '—',
          plan_slug: matchPlan?.slug || '',
          obra_count: obraCount || 0,
          gestor_count: gestorCount || 0,
          funcionario_count: funcCount || 0,
          cliente_count: clienteCount || 0,
        });
      }
      setCompanies(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateCompanyPlan = async (companyId: string, planId: string) => {
    await supabase.from('companies').update({ plan_id: planId } as any).eq('id', companyId);
    toast({ title: 'Plano atualizado' });
    fetchData();
  };

  const updateCompanyStatus = async (companyId: string, status: string) => {
    await supabase.from('companies').update({ status } as any).eq('id', companyId);
    toast({ title: 'Status atualizado' });
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Administração da Plataforma</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Building2 className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{companies.length}</p>
          <p className="text-xs text-muted-foreground">Empresas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <HardHat className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{companies.reduce((s, c) => s + c.obra_count, 0)}</p>
          <p className="text-xs text-muted-foreground">Obras Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{companies.reduce((s, c) => s + c.gestor_count + c.funcionario_count + c.cliente_count, 0)}</p>
          <p className="text-xs text-muted-foreground">Usuários Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{plans.length}</p>
          <p className="text-xs text-muted-foreground">Planos</p>
        </CardContent></Card>
      </div>

      {/* Companies list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Empresas Cadastradas</h2>
        {companies.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{c.nome}</h3>
                    <Badge className={statusColors[c.status] || ''}>{statusLabels[c.status] || c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.email} {c.cnpj ? `· ${c.cnpj}` : ''}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{c.obra_count} obras</span>
                    <span>{c.gestor_count} gestores</span>
                    <span>{c.funcionario_count} funcionários</span>
                    <span>{c.cliente_count} clientes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={c.plan_id || ''} onValueChange={v => updateCompanyPlan(c.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Plano" /></SelectTrigger>
                    <SelectContent>
                      {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.nome_comercial}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={c.status} onValueChange={v => updateCompanyStatus(c.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {companies.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma empresa cadastrada.</p>}
      </div>
    </div>
  );
}
