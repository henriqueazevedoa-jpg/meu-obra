import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockOrcamentoItens, mockObras, formatCurrency } from '@/data/mockData';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pendente: 'bg-muted text-muted-foreground border-0',
  em_execucao: 'bg-primary/10 text-primary border-0',
  concluido: 'bg-success/10 text-success border-0',
};

export default function OrcamentoPage() {
  const { user } = useAuth();
  const obra = mockObras[0];
  const itens = mockOrcamentoItens.filter(i => i.obraId === obra.id);
  const totalPrevisto = itens.reduce((s, i) => s + i.custoTotalPrevisto, 0);
  const totalRealizado = itens.reduce((s, i) => s + i.custoRealizado, 0);
  const diferenca = totalPrevisto - totalRealizado;
  const percentual = Math.round((totalRealizado / totalPrevisto) * 100);

  // Group by category
  const categorias = [...new Set(itens.map(i => i.categoria))];
  const porCategoria = categorias.map(cat => {
    const items = itens.filter(i => i.categoria === cat);
    const prev = items.reduce((s, i) => s + i.custoTotalPrevisto, 0);
    const real = items.reduce((s, i) => s + i.custoRealizado, 0);
    return { categoria: cat, previsto: prev, realizado: real, desvio: real - prev };
  });

  const isCliente = user?.role === 'cliente';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orçamento</h1>
        <p className="text-muted-foreground text-sm">{obra.nome}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Previsto</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalPrevisto)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Realizado</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalRealizado)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Saldo</p>
            <p className={`text-xl font-bold ${diferenca >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(diferenca)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Consumido</p>
            <div className="space-y-1">
              <p className="text-xl font-bold text-foreground">{percentual}%</p>
              <Progress value={percentual} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By category */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Previsto × Realizado por Etapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {porCategoria.map(cat => (
            <div key={cat.categoria} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{cat.categoria}</span>
                <div className="flex items-center gap-2">
                  {cat.desvio > 0 && <TrendingUp className="h-3.5 w-3.5 text-destructive" />}
                  {cat.desvio < 0 && <TrendingDown className="h-3.5 w-3.5 text-success" />}
                  <span className={`text-xs font-medium ${cat.desvio > 0 ? 'text-destructive' : cat.desvio < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                    {cat.desvio > 0 ? '+' : ''}{formatCurrency(cat.desvio)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Prev: {formatCurrency(cat.previsto)}</span>
                <span>·</span>
                <span>Real: {formatCurrency(cat.realizado)}</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: '100%' }} />
                <div className={`absolute inset-y-0 left-0 rounded-full ${cat.desvio > 0 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${Math.min((cat.realizado / cat.previsto) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed table (not for client summary) */}
      {!isCliente && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-muted-foreground font-medium">Categoria</th>
                    <th className="text-left p-2 text-muted-foreground font-medium hidden md:table-cell">Descrição</th>
                    <th className="text-right p-2 text-muted-foreground font-medium">Previsto</th>
                    <th className="text-right p-2 text-muted-foreground font-medium">Realizado</th>
                    <th className="text-center p-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(item => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-2 text-foreground font-medium">{item.categoria}</td>
                      <td className="p-2 text-muted-foreground hidden md:table-cell">{item.descricao}</td>
                      <td className="p-2 text-right text-foreground">{formatCurrency(item.custoTotalPrevisto)}</td>
                      <td className="p-2 text-right text-foreground">{formatCurrency(item.custoRealizado)}</td>
                      <td className="p-2 text-center">
                        <Badge variant="secondary" className={statusColors[item.status]}>
                          {item.status === 'em_execucao' ? 'Em Execução' : item.status === 'concluido' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="p-2 text-foreground" colSpan={2}>Total</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(totalPrevisto)}</td>
                    <td className="p-2 text-right text-foreground">{formatCurrency(totalRealizado)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
