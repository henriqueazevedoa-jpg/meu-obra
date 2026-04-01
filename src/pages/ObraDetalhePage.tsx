import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, statusObraLabels } from '@/data/mockData';
import { useObras } from '@/contexts/ObrasContext';
import { useOrcamento } from '@/contexts/OrcamentoContext';
import { ArrowLeft, MapPin, Calendar, User, FileText, ClipboardList } from 'lucide-react';

const statusEtapaLabelsLocal: Record<string, string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
};

export default function ObraDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getObra } = useObras();
  const { getOrcamento } = useOrcamento();
  const obra = id ? getObra(id) : undefined;
  if (!obra) return <div className="p-8 text-center text-muted-foreground">Obra não encontrada</div>;

  const orcamento = getOrcamento(obra.id);
  const categorias = orcamento?.categorias ?? [];

  const totalPrevisto = categorias.reduce((s, c) => s + c.precoTotal, 0);
  const etapasComDatas = categorias.filter(c => c.dataInicioPrevista || c.dataInicioReal);
  const progressoGeral = categorias.length > 0
    ? Math.round(categorias.reduce((s, c) => s + (c.percentualCronograma ?? 0), 0) / categorias.length)
    : obra.percentualAndamento;

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
        <div className="flex items-center gap-2 self-start">
          <Badge variant="secondary" className="bg-success/10 text-success border-0">
            {statusObraLabels[obra.status]}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => navigate(`/orcamento?obra=${obra.id}`)}>
            <FileText className="h-4 w-4 mr-1" /> Orçamento
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/cronograma?obra=${obra.id}`)}>
            <ClipboardList className="h-4 w-4 mr-1" /> Cronograma
          </Button>
        </div>
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
            <span className="font-bold text-foreground">{progressoGeral}%</span>
          </div>
          <Progress value={progressoGeral} className="h-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div><p className="text-xs text-muted-foreground">Previsto</p><p className="font-semibold text-foreground">{formatCurrency(totalPrevisto)}</p></div>
            <div><p className="text-xs text-muted-foreground">Categorias</p><p className="font-semibold text-foreground">{categorias.length}</p></div>
            <div><p className="text-xs text-muted-foreground">Etapas c/ Datas</p><p className="font-semibold text-foreground">{etapasComDatas.length}</p></div>
            <div><p className="text-xs text-muted-foreground">Composições</p><p className="font-semibold text-foreground">{categorias.reduce((s, c) => s + c.composicoes.length, 0)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cronograma">
        <TabsList>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
        </TabsList>

        <TabsContent value="cronograma" className="mt-4 space-y-2">
          {categorias.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma etapa cadastrada. Acesse o Orçamento para criar categorias.</p>}
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{cat.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.dataInicioPrevista ? formatDate(cat.dataInicioPrevista) : '—'} → {cat.dataFimPrevista ? formatDate(cat.dataFimPrevista) : '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">{cat.percentualCronograma ?? 0}%</span>
                <Badge variant="secondary" className={
                  cat.statusCronograma === 'concluida' ? 'bg-success/10 text-success border-0' :
                  cat.statusCronograma === 'atrasada' ? 'bg-destructive/10 text-destructive border-0' :
                  cat.statusCronograma === 'em_andamento' ? 'bg-primary/10 text-primary border-0' :
                  'bg-muted text-muted-foreground border-0'
                }>{statusEtapaLabelsLocal[cat.statusCronograma ?? 'nao_iniciada']}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="orcamento" className="mt-4">
          {categorias.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria no orçamento.</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium">Código</th>
                <th className="text-left p-2 text-muted-foreground font-medium">Categoria</th>
                <th className="text-right p-2 text-muted-foreground font-medium">Composições</th>
                <th className="text-right p-2 text-muted-foreground font-medium">Total Previsto</th>
              </tr></thead>
              <tbody>
                {categorias.map(cat => (
                  <tr key={cat.id} className="border-b border-border">
                    <td className="p-2 text-muted-foreground font-mono text-xs">{cat.codigo}</td>
                    <td className="p-2 text-foreground">{cat.nome}</td>
                    <td className="p-2 text-right text-foreground">{cat.composicoes.length}</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(cat.precoTotal)}</td>
                  </tr>
                ))}
                {categorias.length > 0 && (
                  <tr className="font-bold">
                    <td className="p-2" colSpan={3}>Total</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(totalPrevisto)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
