import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useObraSelection } from '@/contexts/ObraSelectionContext';
import { useOrcamento, OrcamentoCategoria, OrcamentoComposicao } from '@/contexts/OrcamentoContext';
import { useEstoque } from '@/contexts/EstoqueContext';
import { useObras } from '@/contexts/ObrasContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { mockDiario, formatDate, statusDiarioLabels, climaLabels, DiarioRegistro, DiarioServico, DiarioMaterialUsado } from '@/data/mockData';
import { Plus, Users, CheckCircle2, Clock, XCircle, Trash2, Link2, Package, Pencil, CalendarIcon, Filter, ChevronDown } from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  pendente: <Clock className="h-4 w-4 text-warning" />,
  aprovado: <CheckCircle2 className="h-4 w-4 text-success" />,
  rejeitado: <XCircle className="h-4 w-4 text-destructive" />,
};

export default function DiarioPage() {
  const { user, hasPermission } = useAuth();
  const { obras } = useObras();
  const { orcamentos, getOrcamento, saveOrcamento } = useOrcamento();
  const { getMateriaisByObra, registrarMovimentacao } = useEstoque();
  const { selectedObraId: obraId, setSelectedObraId: setObraId } = useObraSelection();
  const obra = obras.find(o => o.id === obraId) || obras[0];
  const [registros, setRegistros] = useState<DiarioRegistro[]>(mockDiario);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Form state
  const [dataRegistro, setDataRegistro] = useState<Date>(new Date());
  const [clima, setClima] = useState<DiarioRegistro['clima']>('sol');
  const [trabalhadores, setTrabalhadores] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [problemas, setProblemas] = useState('');
  const [servicos, setServicos] = useState<DiarioServico[]>([]);
  const [materiaisUsados, setMateriaisUsados] = useState<DiarioMaterialUsado[]>([]);

  const orcamento = getOrcamento(obra.id);
  const categorias = orcamento?.categorias || [];
  const materiaisObra = getMateriaisByObra(obra.id);

  // Filters
  const [filterEtapa, setFilterEtapa] = useState('_all');
  const [filterMaterial, setFilterMaterial] = useState('_all');
  const [filterStatus, setFilterStatus] = useState('_all');
  const [filterProblemas, setFilterProblemas] = useState('_all');

  const hasActiveFilters = filterEtapa !== '_all' || filterMaterial !== '_all' || filterStatus !== '_all' || filterProblemas !== '_all';

  const obraRegistros = registros.filter(r => r.obraId === obra.id);
  const visibleRegistros = user?.role === 'cliente'
    ? obraRegistros.filter(r => r.status === 'aprovado')
    : obraRegistros;

  const filteredRegistros = visibleRegistros.filter(r => {
    if (filterStatus !== '_all' && r.status !== filterStatus) return false;
    if (filterProblemas === 'com' && !r.problemas) return false;
    if (filterProblemas === 'sem' && r.problemas) return false;
    if (filterEtapa !== '_all') {
      const hasEtapa = r.servicos?.some(s => s.categoriaId === filterEtapa || s.composicaoId === filterEtapa);
      if (!hasEtapa) return false;
    }
    if (filterMaterial !== '_all') {
      const hasMat = r.materiaisUtilizados?.some(m => m.materialId === filterMaterial);
      if (!hasMat) return false;
    }
    return true;
  });

  const sortedRegistros = [...filteredRegistros].sort((a, b) => b.data.localeCompare(a.data));

  // --- Helpers for etapa progress ---
  const getAccumulatedPercent = (categoriaId: string, composicaoId?: string): number => {
    const cat = categorias.find(c => c.id === categoriaId);
    if (!cat) return 0;

    let baseline = 0;
    if (composicaoId) {
      const comp = cat.composicoes.find(c => c.id === composicaoId);
      if (comp?.concluida) return 100;
    } else {
      baseline = cat.percentualCronograma || 0;
    }

    let fromDiario = 0;
    for (const reg of registros) {
      for (const svc of reg.servicos) {
        if (composicaoId) {
          if (svc.composicaoId === composicaoId) fromDiario += (svc.percentualAdicionado || 0);
        } else {
          if (svc.categoriaId === categoriaId && !svc.composicaoId) fromDiario += (svc.percentualAdicionado || 0);
        }
      }
    }
    return Math.min(100, baseline + fromDiario);
  };

  // --- Servico handlers ---
  const addServico = () => {
    setServicos([...servicos, { id: `svc-${Date.now()}-${servicos.length}`, descricao: '' }]);
  };

  const updateServico = (idx: number, updates: Partial<DiarioServico>) => {
    setServicos(servicos.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const removeServico = (idx: number) => {
    setServicos(servicos.filter((_, i) => i !== idx));
  };

  // --- Material handlers ---
  const addMaterial = () => {
    setMateriaisUsados([...materiaisUsados, { id: `mat-${Date.now()}`, materialId: '', materialNome: '', unidade: '', quantidade: 0 }]);
  };

  const updateMaterial = (idx: number, materialId: string) => {
    const mat = materiaisObra.find(m => m.id === materialId);
    if (!mat) return;
    setMateriaisUsados(materiaisUsados.map((m, i) => i === idx ? { ...m, materialId: mat.id, materialNome: mat.nome, unidade: mat.unidade, quantidade: 0 } : m));
  };

  const updateMaterialQty = (idx: number, qty: number) => {
    setMateriaisUsados(materiaisUsados.map((m, i) => i === idx ? { ...m, quantidade: qty } : m));
  };

  const removeMaterial = (idx: number) => {
    setMateriaisUsados(materiaisUsados.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setDataRegistro(new Date());
    setClima('sol');
    setTrabalhadores('');
    setObservacoes('');
    setProblemas('');
    setServicos([]);
    setMateriaisUsados([]);
    setEditingId(null);
  };

  const loadRegistroForEdit = (registro: DiarioRegistro) => {
    setEditingId(registro.id);
    setDataRegistro(parseISO(registro.data));
    setClima(registro.clima);
    setTrabalhadores(String(registro.trabalhadores));
    setObservacoes(registro.observacoes);
    setProblemas(registro.problemas);
    setServicos(registro.servicos?.length ? [...registro.servicos] : [{ id: `svc-${Date.now()}`, descricao: registro.servicosExecutados }]);
    setMateriaisUsados(registro.materiaisUtilizados ? [...registro.materiaisUtilizados] : []);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const hoje = format(dataRegistro, 'yyyy-MM-dd');
    const descGeral = servicos.map(s => s.descricao).filter(Boolean).join('. ') || 'Sem serviços detalhados';
    const filteredServicos = servicos.filter(s => s.descricao.trim());
    const filteredMateriais = materiaisUsados.filter(m => m.materialId && m.quantidade > 0);

    if (editingId) {
      const oldRegistro = registros.find(r => r.id === editingId);
      
      if (oldRegistro) {
        for (const oldMat of oldRegistro.materiaisUtilizados) {
          registrarMovimentacao({
            id: `mv${Date.now()}-rev-${oldMat.materialId}`,
            obraId: obra.id,
            materialId: oldMat.materialId,
            materialNome: oldMat.materialNome,
            tipo: 'entrada',
            data: hoje,
            quantidade: oldMat.quantidade,
            origemDestino: `Estorno - Edição Diário ${formatDate(oldRegistro.data)}`,
            responsavel: user?.name || '',
            observacoes: 'Estorno automático por edição de registro',
          });
        }
      }

      for (const matUsado of filteredMateriais) {
        registrarMovimentacao({
          id: `mv${Date.now()}-${matUsado.materialId}`,
          obraId: obra.id,
          materialId: matUsado.materialId,
          materialNome: matUsado.materialNome,
          tipo: 'saida',
          data: hoje,
          quantidade: matUsado.quantidade,
          origemDestino: `Diário de Obra - ${oldRegistro ? formatDate(oldRegistro.data) : hoje}`,
          responsavel: user?.name || '',
          observacoes: 'Registro automático via Diário de Obra (edição)',
        });
      }

      setRegistros(registros.map(r => r.id === editingId ? {
        ...r,
        data: hoje,
        clima,
        trabalhadores: parseInt(trabalhadores) || 0,
        servicosExecutados: descGeral,
        servicos: filteredServicos,
        materiaisUtilizados: filteredMateriais,
        observacoes,
        problemas,
      } : r));

      setDialogOpen(false);
      resetForm();
      return;
    }

    // --- CREATE MODE ---
    const novo: DiarioRegistro = {
      id: `d${Date.now()}`,
      obraId: obra.id,
      data: hoje,
      usuario: user?.name || '',
      usuarioId: user?.id || '',
      clima,
      trabalhadores: parseInt(trabalhadores) || 0,
      servicosExecutados: descGeral,
      servicos: filteredServicos,
      materiaisUtilizados: filteredMateriais,
      observacoes,
      problemas,
      fotos: [],
      status: 'pendente',
    };

    // Update cronograma based on service links
    if (orcamento) {
      const updatedCategorias = [...orcamento.categorias.map(c => ({ ...c, composicoes: c.composicoes.map(comp => ({ ...comp })) }))];

      for (const svc of novo.servicos) {
        if (svc.categoriaId && svc.percentualAdicionado) {
          const catIdx = updatedCategorias.findIndex(c => c.id === svc.categoriaId);
          if (catIdx >= 0) {
            const cat = updatedCategorias[catIdx];

            if (svc.composicaoId) {
              const compIdx = cat.composicoes.findIndex(c => c.id === svc.composicaoId);
              if (compIdx >= 0) {
                const comp = cat.composicoes[compIdx];
                const accum = getAccumulatedPercent(svc.categoriaId, svc.composicaoId) + svc.percentualAdicionado;

                if (!comp.dataInicioReal) {
                  comp.dataInicioReal = hoje;
                }
                if (accum >= 100) {
                  comp.concluida = true;
                  comp.dataFimReal = hoje;
                }
              }
            }

            const totalAccum = getAccumulatedPercent(svc.categoriaId) + (svc.composicaoId ? 0 : svc.percentualAdicionado);
            if (!cat.dataInicioReal) {
              cat.dataInicioReal = hoje;
              cat.statusCronograma = 'em_andamento';
            }

            const catPercent = cat.composicoes.length > 0
              ? cat.composicoes.reduce((sum, comp) => {
                  const compAccum = getAccumulatedPercent(cat.id, comp.id) +
                    (novo.servicos.find(s => s.composicaoId === comp.id)?.percentualAdicionado || 0);
                  const weight = comp.pesoCronograma || (100 / cat.composicoes.length);
                  return sum + (Math.min(100, compAccum) / 100) * weight;
                }, 0)
              : totalAccum;

            cat.percentualCronograma = Math.min(100, catPercent);

            if (cat.percentualCronograma >= 100) {
              cat.statusCronograma = 'concluida';
              cat.dataFimReal = hoje;
            }
          }
        }
      }

      saveOrcamento({ ...orcamento, categorias: updatedCategorias });
    }

    // Register stock movements
    for (const matUsado of novo.materiaisUtilizados) {
      registrarMovimentacao({
        id: `mv${Date.now()}-${matUsado.materialId}`,
        obraId: obra.id,
        materialId: matUsado.materialId,
        materialNome: matUsado.materialNome,
        tipo: 'saida',
        data: hoje,
        quantidade: matUsado.quantidade,
        origemDestino: `Diário de Obra - ${hoje}`,
        responsavel: user?.name || '',
        observacoes: `Registro automático via Diário de Obra`,
      });
    }

    setRegistros([novo, ...registros]);
    setDialogOpen(false);
    resetForm();
  };

  const handleApprove = (id: string) => {
    setRegistros(registros.map(r => r.id === id ? { ...r, status: 'aprovado' as const } : r));
  };

  const canCreate = hasPermission('diario:create');
  const canApprove = hasPermission('diario:approve');

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header - compact on mobile */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Diário de Obra</h1>
          <Select value={obraId} onValueChange={setObraId}>
            <SelectTrigger className="w-full sm:w-[280px] h-8 text-xs sm:text-sm mt-1">
              <SelectValue placeholder="Selecionar obra..." />
            </SelectTrigger>
            <SelectContent>
              {obras.map(o => (
                <SelectItem key={o.id} value={o.id}>{o.codigo} - {o.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0 h-9 sm:h-10">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Novo Registro</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{editingId ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Basic info - stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !dataRegistro && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(dataRegistro, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataRegistro}
                          onSelect={(d) => d && setDataRegistro(d)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-2 sm:contents gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-foreground">Clima</label>
                      <Select value={clima} onValueChange={v => setClima(v as DiarioRegistro['clima'])}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sol">☀️ Sol</SelectItem>
                          <SelectItem value="nublado">⛅ Nublado</SelectItem>
                          <SelectItem value="chuva">🌧️ Chuva</SelectItem>
                          <SelectItem value="chuvoso_forte">⛈️ Forte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-foreground">Trabalhadores</label>
                      <Input type="number" placeholder="0" className="h-10" value={trabalhadores} onChange={e => setTrabalhadores(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* === SERVIÇOS EXECUTADOS === */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Serviços Executados</label>
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={addServico}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>

                  {servicos.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhum serviço adicionado.</p>
                  )}

                  {servicos.map((svc, idx) => {
                    const linkedCat = svc.categoriaId ? categorias.find(c => c.id === svc.categoriaId) : null;
                    const accum = svc.categoriaId ? getAccumulatedPercent(svc.categoriaId, svc.composicaoId) : 0;

                    return (
                      <div key={svc.id} className="border border-border rounded-lg p-3 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Descrição do serviço..."
                              value={svc.descricao}
                              onChange={e => updateServico(idx, { descricao: e.target.value })}
                              className="h-10"
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={() => removeServico(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        {/* Link to etapa */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Link2 className="h-3.5 w-3.5" />
                            <span>Vincular a etapa (opcional)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Select
                              value={svc.categoriaId || '_none'}
                              onValueChange={v => updateServico(idx, {
                                categoriaId: v === '_none' ? undefined : v,
                                composicaoId: undefined,
                                percentualAdicionado: undefined,
                              })}
                            >
                              <SelectTrigger className="text-xs h-9">
                                <SelectValue placeholder="Categoria..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_none">Sem vínculo</SelectItem>
                                {categorias.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {svc.categoriaId && linkedCat && linkedCat.composicoes.length > 0 && (
                              <Select
                                value={svc.composicaoId || '_cat_only'}
                                onValueChange={v => updateServico(idx, {
                                  composicaoId: v === '_cat_only' ? undefined : v,
                                })}
                              >
                                <SelectTrigger className="text-xs h-9">
                                  <SelectValue placeholder="Composição..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_cat_only">Categoria geral</SelectItem>
                                  {linkedCat.composicoes.map(comp => (
                                    <SelectItem key={comp.id} value={comp.id}>{comp.descricao}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          {svc.categoriaId && (
                            <div className="bg-muted/50 rounded-md p-2 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progresso acumulado</span>
                                <span className="font-semibold text-foreground">{accum.toFixed(1)}%</span>
                              </div>
                              <Progress value={accum} className="h-2" />
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-muted-foreground whitespace-nowrap">% a adicionar:</label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100 - accum}
                                  step={0.5}
                                  className="h-9 text-xs w-20"
                                  placeholder="0"
                                  value={svc.percentualAdicionado || ''}
                                  onChange={e => updateServico(idx, { percentualAdicionado: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* === MATERIAIS UTILIZADOS === */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Package className="h-4 w-4" /> Materiais
                    </label>
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={addMaterial}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>

                  {materiaisUsados.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhum material adicionado. (Opcional)</p>
                  )}

                  {materiaisUsados.map((matU, idx) => {
                    const matInfo = materiaisObra.find(m => m.id === matU.materialId);
                    return (
                      <div key={matU.id} className="border border-border rounded-lg p-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Select value={matU.materialId || '_none'} onValueChange={v => v !== '_none' && updateMaterial(idx, v)}>
                              <SelectTrigger className="text-xs h-9">
                                <SelectValue placeholder="Selecionar material..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_none">Selecionar...</SelectItem>
                                {materiaisObra.map(m => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.nome} ({m.estoqueAtual} {m.unidade})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeMaterial(idx)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                          <label className="text-xs text-muted-foreground">Qtd:</label>
                          <Input
                            type="number"
                            min={0}
                            max={matInfo?.estoqueAtual}
                            className="h-9 text-xs w-24"
                            placeholder="0"
                            value={matU.quantidade || ''}
                            onChange={e => updateMaterialQty(idx, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-muted-foreground">{matU.unidade}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Observações e Problemas */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Observações</label>
                  <Textarea placeholder="Observações gerais..." rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Problemas Ocorridos</label>
                  <Textarea placeholder="Relate problemas, se houver..." rows={2} value={problemas} onChange={e => setProblemas(e.target.value)} />
                </div>

                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">📷 Área para anexar fotos</p>
                  <p className="text-xs text-muted-foreground">(Upload será habilitado em breve)</p>
                </div>

                <Button onClick={handleSubmit} className="w-full h-11 text-sm" disabled={servicos.filter(s => s.descricao.trim()).length === 0}>
                  {editingId ? 'Salvar Alterações' : 'Salvar Registro'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters - collapsible on mobile */}
      <div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:hidden h-9 justify-between"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <span className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Ativo</Badge>}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", filtersOpen && "rotate-180")} />
        </Button>

        <Card className={cn("shadow-card mt-2 sm:mt-0", !filtersOpen && "hidden sm:block")}>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filtros:</span>
              <Select value={filterEtapa} onValueChange={setFilterEtapa}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Etapa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todas etapas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Material..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todos materiais</SelectItem>
                  {materiaisObra.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todos status</SelectItem>
                  <SelectItem value="aprovado">✅ Aprovado</SelectItem>
                  <SelectItem value="pendente">⏳ Pendente</SelectItem>
                  <SelectItem value="rejeitado">❌ Reprovado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterProblemas} onValueChange={setFilterProblemas}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Problemas..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todos</SelectItem>
                  <SelectItem value="com">Com problemas</SelectItem>
                  <SelectItem value="sem">Sem problemas</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-9 text-xs col-span-2 sm:col-span-1" onClick={() => { setFilterEtapa('_all'); setFilterMaterial('_all'); setFilterStatus('_all'); setFilterProblemas('_all'); }}>
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline - cards otimizados para mobile */}
      <div className="space-y-3">
        {sortedRegistros.map(registro => (
          <Card key={registro.id} className="shadow-card">
            <CardContent className="p-3 sm:p-5">
              {/* Header do registro */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {statusIcons[registro.status]}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{formatDate(registro.data)}</p>
                      <span className="text-sm">{climaLabels[registro.clima]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">por {registro.usuario}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className={cn(
                    "text-[10px] px-1.5",
                    registro.status === 'aprovado' ? 'bg-success/10 text-success border-0' :
                    registro.status === 'rejeitado' ? 'bg-destructive/10 text-destructive border-0' :
                    'bg-warning/10 text-warning border-0'
                  )}>
                    {statusDiarioLabels[registro.status]}
                  </Badge>
                </div>
              </div>

              {/* Actions row - compact */}
              <div className="flex items-center gap-1 mb-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                  <Users className="h-3 w-3" /> {registro.trabalhadores}
                </span>
                {(user?.role === 'gestor' || (canCreate && registro.status !== 'aprovado')) && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => loadRegistroForEdit(registro)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                )}
                {canApprove && registro.status === 'pendente' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleApprove(registro.id)}>
                    Aprovar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {/* Serviços individuais */}
                {registro.servicos && registro.servicos.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Serviços</p>
                    <div className="space-y-1">
                      {registro.servicos.map(svc => {
                        const linkedCat = svc.categoriaId ? categorias.find(c => c.id === svc.categoriaId) : null;
                        const linkedComp = svc.composicaoId && linkedCat ? linkedCat.composicoes.find(c => c.id === svc.composicaoId) : null;
                        return (
                          <div key={svc.id} className="flex flex-wrap items-center gap-1 text-sm">
                            <span className="text-foreground">• {svc.descricao}</span>
                            {linkedCat && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {linkedComp ? linkedComp.descricao : linkedCat.nome}
                                {svc.percentualAdicionado ? ` +${svc.percentualAdicionado}%` : ''}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(!registro.servicos || registro.servicos.length === 0) && registro.servicosExecutados && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Serviços</p>
                    <p className="text-sm text-foreground">{registro.servicosExecutados}</p>
                  </div>
                )}

                {/* Materiais utilizados */}
                {registro.materiaisUtilizados && registro.materiaisUtilizados.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Materiais
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {registro.materiaisUtilizados.map(mat => (
                        <Badge key={mat.id} variant="secondary" className="text-[10px]">
                          {mat.materialNome}: {mat.quantidade} {mat.unidade}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {registro.observacoes && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{registro.observacoes}</p>
                  </div>
                )}
                {registro.problemas && (
                  <div className="bg-destructive/5 rounded-md p-2">
                    <p className="text-[10px] font-medium text-destructive uppercase tracking-wider mb-1">⚠ Problemas</p>
                    <p className="text-xs sm:text-sm text-destructive">{registro.problemas}</p>
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
