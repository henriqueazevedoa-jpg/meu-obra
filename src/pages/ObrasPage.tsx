import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockObras, statusObraLabels, formatDate } from '@/data/mockData';
import { Search, Plus, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
  planejamento: 'bg-muted text-muted-foreground border-0',
  em_andamento: 'bg-success/10 text-success border-0',
  pausada: 'bg-warning/10 text-warning border-0',
  concluida: 'bg-primary/10 text-primary border-0',
};

export default function ObrasPage() {
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const obras = mockObras
    .filter(o => user?.obraIds.includes(o.id) || user?.role === 'gestor')
    .filter(o => !search || o.nome.toLowerCase().includes(search.toLowerCase()) || o.codigo.toLowerCase().includes(search.toLowerCase()))
    .filter(o => !statusFilter || o.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Obras</h1>
          <p className="text-muted-foreground text-sm">{obras.length} obra(s) encontrada(s)</p>
        </div>
        {hasPermission('obras:create') && (
          <Button><Plus className="h-4 w-4 mr-1" /> Nova Obra</Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar obra..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'em_andamento', 'planejamento', 'pausada', 'concluida'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-accent'
              }`}
            >
              {s ? statusObraLabels[s] : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {obras.map(obra => (
          <Link key={obra.id} to={`/obras/${obra.id}`}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">{obra.codigo}</p>
                    <h3 className="text-base font-semibold text-foreground">{obra.nome}</h3>
                  </div>
                  <Badge variant="secondary" className={statusColors[obra.status]}>
                    {statusObraLabels[obra.status]}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">{obra.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(obra.dataInicio)} → {formatDate(obra.dataPrevisaoTermino)}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Andamento</span>
                    <span className="font-medium text-foreground">{obra.percentualAndamento}%</span>
                  </div>
                  <Progress value={obra.percentualAndamento} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
