import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  mockObras, mockOrcamentoItens, mockCronograma, mockDiario,
  mockMateriais, formatCurrency, formatDate, statusEtapaLabels,
  climaLabels
} from '@/data/mockData';
import { TrendingUp, AlertTriangle, CheckCircle2, Package, BookOpen } from 'lucide-react';

export default function RelatoriosPage() {
  const obra = mockObras[0];
  const itens = mockOrcamentoItens.filter(i => i.obraId === obra.id);
  const totalPrevisto = itens.reduce((s, i) => s + i.custoTotalPrevisto, 0);
  const totalRealizado = itens.reduce((s, i) => s + i.custoRealizado, 0);
  const etapas = mockCronograma.filter(e => e.obraId === obra.id);
  const concluidas = etapas.filter(e => e.status === 'concluida').length;
  const atrasadas = etapas.filter(e => e.status === 'atrasada').length;
  const registros = mockDiario.filter(d => d.obraId === obra.id && d.status === 'aprovado');
  const materiaisBaixo = mockMateriais.filter(m => m.obraId === obra.id && m.estoqueAtual < m.estoqueMinimo);
  const progressoGeral = Math.round(etapas.reduce((s, e) => s + e.percentual, 0) / etapas.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Visão consolidada — {obra.nome}</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Andamento Geral</p>
            <p className="text-2xl font-bold text-foreground">{obra.percentualAndamento}%</p>
            <Progress value={obra.percentualAndamento} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cronograma</p>
            <p className="text-2xl font-bold text-foreground">{progressoGeral}%</p>
            <p className="text-xs text-muted-foreground">{concluidas}/{etapas.length} etapas concluídas</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Custo Previsto</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalPrevisto)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Custo Realizado</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalRealizado)}</p>
            <p className={`text-xs font-medium ${totalRealizado <= totalPrevisto ? 'text-success' : 'text-destructive'}`}>
              {totalRealizado <= totalPrevisto ? 'Dentro do orçamento' : 'Acima do orçamento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts section */}
      {(atrasadas > 0 || materiaisBaixo.length > 0) && (
        <Card className="shadow-card border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atrasadas > 0 && (
              <p className="text-sm text-foreground">📅 {atrasadas} etapa(s) atrasada(s) no cronograma</p>
            )}
            {materiaisBaixo.map(m => (
              <p key={m.id} className="text-sm text-foreground">📦 {m.nome} — estoque em {m.estoqueAtual} {m.unidade} (mínimo: {m.estoqueMinimo})</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cost by category */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Custos por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...new Set(itens.map(i => i.categoria))].map(cat => {
              const catItens = itens.filter(i => i.categoria === cat);
              const prev = catItens.reduce((s, i) => s + i.custoTotalPrevisto, 0);
              const real = catItens.reduce((s, i) => s + i.custoRealizado, 0);
              const pct = prev > 0 ? Math.round((real / prev) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-4">
                  <span className="text-sm text-foreground w-48 shrink-0">{cat}</span>
                  <div className="flex-1">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right">{formatCurrency(real)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Últimos Registros do Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {registros.slice(0, 5).map(r => (
            <div key={r.id} className="border-b border-border pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">{formatDate(r.data)}</p>
                <span className="text-xs">{climaLabels[r.clima]}</span>
                <span className="text-xs text-muted-foreground">· {r.trabalhadores} trab.</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.servicosExecutados}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Etapas status */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status das Etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {etapas.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  {e.status === 'concluida' ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                   e.status === 'atrasada' ? <AlertTriangle className="h-4 w-4 text-destructive" /> :
                   <TrendingUp className="h-4 w-4 text-primary" />}
                  <span className="text-sm text-foreground">{e.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{e.percentual}%</span>
                  <Badge variant="secondary" className={
                    e.status === 'concluida' ? 'bg-success/10 text-success border-0' :
                    e.status === 'atrasada' ? 'bg-destructive/10 text-destructive border-0' :
                    e.status === 'em_andamento' ? 'bg-primary/10 text-primary border-0' :
                    'bg-muted text-muted-foreground border-0'
                  }>{statusEtapaLabels[e.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
