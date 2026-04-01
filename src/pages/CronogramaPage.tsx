import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCronograma, mockObras, formatDate, statusEtapaLabels } from '@/data/mockData';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  nao_iniciada: 'bg-muted text-muted-foreground border-0',
  em_andamento: 'bg-primary/10 text-primary border-0',
  concluida: 'bg-success/10 text-success border-0',
  atrasada: 'bg-destructive/10 text-destructive border-0',
};

const statusIcons: Record<string, React.ReactNode> = {
  nao_iniciada: <Clock className="h-4 w-4 text-muted-foreground" />,
  em_andamento: <CalendarDays className="h-4 w-4 text-primary" />,
  concluida: <CheckCircle2 className="h-4 w-4 text-success" />,
  atrasada: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

export default function CronogramaPage() {
  const obra = mockObras[0];
  const etapas = mockCronograma.filter(e => e.obraId === obra.id);
  const concluidas = etapas.filter(e => e.status === 'concluida').length;
  const atrasadas = etapas.filter(e => e.status === 'atrasada').length;
  const progressoGeral = Math.round(etapas.reduce((s, e) => s + e.percentual, 0) / etapas.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cronograma</h1>
        <p className="text-muted-foreground text-sm">{obra.nome}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Progresso Geral</p>
            <p className="text-2xl font-bold text-foreground">{progressoGeral}%</p>
            <Progress value={progressoGeral} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold text-success">{concluidas}/{etapas.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Atrasadas</p>
            <p className={`text-2xl font-bold ${atrasadas > 0 ? 'text-destructive' : 'text-foreground'}`}>{atrasadas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Etapas da Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {etapas.map((etapa, index) => (
              <div key={etapa.id} className="flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    etapa.status === 'concluida' ? 'bg-success/10' :
                    etapa.status === 'atrasada' ? 'bg-destructive/10' :
                    etapa.status === 'em_andamento' ? 'bg-primary/10' :
                    'bg-muted'
                  }`}>
                    {statusIcons[etapa.status]}
                  </div>
                  {index < etapas.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{etapa.nome}</h3>
                    <Badge variant="secondary" className={statusColors[etapa.status]}>
                      {statusEtapaLabels[etapa.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>Previsto: {formatDate(etapa.dataInicioPrevista)} → {formatDate(etapa.dataFimPrevista)}</span>
                    {etapa.dataInicioReal && (
                      <span>Real: {formatDate(etapa.dataInicioReal)}{etapa.dataFimReal ? ` → ${formatDate(etapa.dataFimReal)}` : ' → ...'}</span>
                    )}
                  </div>
                  {etapa.responsavel && <p className="text-xs text-muted-foreground mt-1">Resp: {etapa.responsavel}</p>}
                  {etapa.observacoes && <p className="text-xs text-muted-foreground mt-1 italic">{etapa.observacoes}</p>}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-foreground">{etapa.percentual}%</span>
                    </div>
                    <Progress value={etapa.percentual} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
