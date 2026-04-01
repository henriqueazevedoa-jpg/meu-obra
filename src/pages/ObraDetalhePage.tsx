import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockOrcamentoItens, mockCronograma, mockDiario, mockMateriais, formatCurrency, formatDate, statusObraLabels, statusEtapaLabels } from '@/data/mockData';
import { useObras } from '@/contexts/ObrasContext';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';

export default function ObraDetalhePage() {
  const { id } = useParams();
  const { getObra } = useObras();
  const obra = id ? getObra(id) : undefined;
  if (!obra) return <div className="p-8 text-center text-muted-foreground">Obra não encontrada</div>;

  const totalPrevisto = mockOrcamentoItens.filter(i => i.obraId === obra.id).reduce((s, i) => s + i.custoTotalPrevisto, 0);
  const totalRealizado = mockOrcamentoItens.filter(i => i.obraId === obra.id).reduce((s, i) => s + i.custoRealizado, 0);
  const etapas = mockCronograma.filter(e => e.obraId === obra.id);
  const registros = mockDiario.filter(d => d.obraId === obra.id);
  const materiais = mockMateriais.filter(m => m.obraId === obra.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/obras" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para obras
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{obra.codigo}</p>
          <h1 className="text-2xl font-bold text-foreground">{obra.nome}</h1>
        </div>
        <Badge variant="secondary" className="bg-success/10 text-success border-0 self-start">
          {statusObraLabels[obra.status]}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {obra.endereco}</div>
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(obra.dataInicio)} → {formatDate(obra.dataPrevisaoTermino)}</div>
        <div className="flex items-center gap-2"><User className="h-4 w-4" /> {obra.responsavel}</div>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-bold text-foreground">{obra.percentualAndamento}%</span>
          </div>
          <Progress value={obra.percentualAndamento} className="h-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div><p className="text-xs text-muted-foreground">Previsto</p><p className="font-semibold text-foreground">{formatCurrency(totalPrevisto)}</p></div>
            <div><p className="text-xs text-muted-foreground">Realizado</p><p className="font-semibold text-foreground">{formatCurrency(totalRealizado)}</p></div>
            <div><p className="text-xs text-muted-foreground">Etapas</p><p className="font-semibold text-foreground">{etapas.length}</p></div>
            <div><p className="text-xs text-muted-foreground">Materiais</p><p className="font-semibold text-foreground">{materiais.length}</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cronograma">
        <TabsList>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
          <TabsTrigger value="diario">Diário</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>
        <TabsContent value="cronograma" className="mt-4 space-y-2">
          {etapas.map(e => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{e.nome}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.dataInicioPrevista)} → {formatDate(e.dataFimPrevista)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">{e.percentual}%</span>
                <Badge variant="secondary" className={
                  e.status === 'concluida' ? 'bg-success/10 text-success border-0' :
                  e.status === 'atrasada' ? 'bg-destructive/10 text-destructive border-0' :
                  e.status === 'em_andamento' ? 'bg-primary/10 text-primary border-0' :
                  'bg-muted text-muted-foreground border-0'
                }>{statusEtapaLabels[e.status]}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="orcamento" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium">Categoria</th>
                <th className="text-right p-2 text-muted-foreground font-medium">Previsto</th>
                <th className="text-right p-2 text-muted-foreground font-medium">Realizado</th>
              </tr></thead>
              <tbody>
                {mockOrcamentoItens.filter(i => i.obraId === obra.id).map(item => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="p-2 text-foreground">{item.categoria}</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(item.custoTotalPrevisto)}</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(item.custoRealizado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="diario" className="mt-4 space-y-2">
          {registros.slice(0, 5).map(d => (
            <Card key={d.id} className="shadow-card">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-foreground">{formatDate(d.data)}</p>
                  <Badge variant="secondary" className={d.status === 'aprovado' ? 'bg-success/10 text-success border-0' : 'bg-warning/10 text-warning border-0'}>{d.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{d.servicosExecutados}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="materiais" className="mt-4 space-y-2">
          {materiais.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{m.nome}</p>
                <p className="text-xs text-muted-foreground">{m.categoria} · {m.unidade}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${m.estoqueAtual < m.estoqueMinimo ? 'text-destructive' : 'text-foreground'}`}>{m.estoqueAtual} {m.unidade}</p>
                {m.estoqueAtual < m.estoqueMinimo && <p className="text-xs text-destructive">Estoque baixo</p>}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
