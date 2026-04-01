import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockDiario, mockObras, formatDate, statusDiarioLabels, climaLabels, DiarioRegistro } from '@/data/mockData';
import { Plus, Calendar, Users, Cloud, CheckCircle2, Clock, XCircle } from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  pendente: <Clock className="h-4 w-4 text-warning" />,
  aprovado: <CheckCircle2 className="h-4 w-4 text-success" />,
  rejeitado: <XCircle className="h-4 w-4 text-destructive" />,
};

export default function DiarioPage() {
  const { user, hasPermission } = useAuth();
  const obra = mockObras[0];
  const [registros, setRegistros] = useState<DiarioRegistro[]>(mockDiario.filter(d => d.obraId === obra.id));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRegistro, setNewRegistro] = useState({
    clima: 'sol' as DiarioRegistro['clima'],
    trabalhadores: '',
    servicosExecutados: '',
    observacoes: '',
    problemas: '',
  });

  const visibleRegistros = user?.role === 'cliente'
    ? registros.filter(r => r.status === 'aprovado')
    : registros;

  const sortedRegistros = [...visibleRegistros].sort((a, b) => b.data.localeCompare(a.data));

  const handleSubmit = () => {
    const novo: DiarioRegistro = {
      id: `d${Date.now()}`,
      obraId: obra.id,
      data: new Date().toISOString().split('T')[0],
      usuario: user?.name || '',
      usuarioId: user?.id || '',
      clima: newRegistro.clima,
      trabalhadores: parseInt(newRegistro.trabalhadores) || 0,
      servicosExecutados: newRegistro.servicosExecutados,
      observacoes: newRegistro.observacoes,
      problemas: newRegistro.problemas,
      fotos: [],
      status: 'pendente',
    };
    setRegistros([novo, ...registros]);
    setDialogOpen(false);
    setNewRegistro({ clima: 'sol', trabalhadores: '', servicosExecutados: '', observacoes: '', problemas: '' });
  };

  const handleApprove = (id: string) => {
    setRegistros(registros.map(r => r.id === id ? { ...r, status: 'aprovado' as const } : r));
  };

  const canCreate = hasPermission('diario:create');
  const canApprove = hasPermission('diario:approve');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diário de Obra</h1>
          <p className="text-muted-foreground text-sm">{obra.nome}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo Registro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Registro do Diário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Clima</label>
                    <Select value={newRegistro.clima} onValueChange={v => setNewRegistro({ ...newRegistro, clima: v as DiarioRegistro['clima'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sol">☀️ Sol</SelectItem>
                        <SelectItem value="nublado">⛅ Nublado</SelectItem>
                        <SelectItem value="chuva">🌧️ Chuva</SelectItem>
                        <SelectItem value="chuvoso_forte">⛈️ Chuva Forte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Trabalhadores</label>
                    <Input type="number" placeholder="0" value={newRegistro.trabalhadores} onChange={e => setNewRegistro({ ...newRegistro, trabalhadores: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Serviços Executados *</label>
                  <Textarea placeholder="Descreva os serviços realizados no dia..." rows={3} value={newRegistro.servicosExecutados} onChange={e => setNewRegistro({ ...newRegistro, servicosExecutados: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Observações</label>
                  <Textarea placeholder="Observações gerais..." rows={2} value={newRegistro.observacoes} onChange={e => setNewRegistro({ ...newRegistro, observacoes: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Problemas Ocorridos</label>
                  <Textarea placeholder="Relate problemas, se houver..." rows={2} value={newRegistro.problemas} onChange={e => setNewRegistro({ ...newRegistro, problemas: e.target.value })} />
                </div>
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">📷 Área para anexar fotos</p>
                  <p className="text-xs text-muted-foreground">(Upload será habilitado em breve)</p>
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={!newRegistro.servicosExecutados.trim()}>
                  Salvar Registro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedRegistros.map(registro => (
          <Card key={registro.id} className="shadow-card">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  {statusIcons[registro.status]}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{formatDate(registro.data)}</p>
                      <span className="text-sm">{climaLabels[registro.clima]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">por {registro.usuario}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={
                    registro.status === 'aprovado' ? 'bg-success/10 text-success border-0' :
                    registro.status === 'rejeitado' ? 'bg-destructive/10 text-destructive border-0' :
                    'bg-warning/10 text-warning border-0'
                  }>
                    {statusDiarioLabels[registro.status]}
                  </Badge>
                  {canApprove && registro.status === 'pendente' && (
                    <Button size="sm" variant="outline" onClick={() => handleApprove(registro.id)}>
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {registro.trabalhadores} trabalhadores</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Serviços Executados</p>
                  <p className="text-sm text-foreground">{registro.servicosExecutados}</p>
                </div>
                {registro.observacoes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                    <p className="text-sm text-muted-foreground">{registro.observacoes}</p>
                  </div>
                )}
                {registro.problemas && (
                  <div className="bg-destructive/5 rounded-md p-2">
                    <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">⚠ Problemas</p>
                    <p className="text-sm text-destructive">{registro.problemas}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
