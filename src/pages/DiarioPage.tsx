import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { mockDiario, formatDate, statusDiarioLabels, climaLabels, DiarioRegistro, DiarioServico, DiarioMaterialUsado } from '@/data/mockData';
import { Plus, Users, CheckCircle2, Clock, XCircle, Trash2, Link2, Package } from 'lucide-react';

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
  const obra = obras[0];
  const [registros, setRegistros] = useState<DiarioRegistro[]>(mockDiario.filter(d => d.obraId === obra.id));
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [clima, setClima] = useState<DiarioRegistro['clima']>('sol');
  const [trabalhadores, setTrabalhadores] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [problemas, setProblemas] = useState('');
  const [servicos, setServicos] = useState<DiarioServico[]>([]);
  const [materiaisUsados, setMateriaisUsados] = useState<DiarioMaterialUsado[]>([]);

  const orcamento = getOrcamento(obra.id);
  const categorias = orcamento?.categorias || [];
  const materiaisObra = getMateriaisByObra(obra.id);

  const visibleRegistros = user?.role === 'cliente'
    ? registros.filter(r => r.status === 'aprovado')
    : registros;
  const sortedRegistros = [...visibleRegistros].sort((a, b) => b.data.localeCompare(a.data));

  // --- Helpers for etapa progress ---
  const getEtapaPercentual = (categoriaId: string, composicaoId?: string): number => {
    const cat = categorias.find(c => c.id === categoriaId);
    if (!cat) return 0;
    if (composicaoId) {
      const comp = cat.composicoes.find(c => c.id === composicaoId);
      return comp?.concluida ? 100 : (comp?.pesoCronograma || 0);
    }
    return cat.percentualCronograma || 0;
  };

  // Compute accumulated % for a category from all approved registros
  const getAccumulatedPercent = (categoriaId: string, composicaoId?: string): number => {
    let total = 0;
    for (const reg of registros) {
      for (const svc of reg.servicos) {
        if (composicaoId) {
          if (svc.composicaoId === composicaoId) total += (svc.percentualAdicionado || 0);
        } else {
          if (svc.categoriaId === categoriaId && !svc.composicaoId) total += (svc.percentualAdicionado || 0);
        }
      }
    }
    return Math.min(100, total);
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
    setClima('sol');
    setTrabalhadores('');
    setObservacoes('');
    setProblemas('');
    setServicos([]);
    setMateriaisUsados([]);
  };

  const handleSubmit = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const descGeral = servicos.map(s => s.descricao).filter(Boolean).join('. ') || 'Sem serviços detalhados';

    const novo: DiarioRegistro = {
      id: `d${Date.now()}`,
      obraId: obra.id,
      data: hoje,
      usuario: user?.name || '',
      usuarioId: user?.id || '',
      clima,
      trabalhadores: parseInt(trabalhadores) || 0,
      servicosExecutados: descGeral,
      servicos: servicos.filter(s => s.descricao.trim()),
      materiaisUtilizados: materiaisUsados.filter(m => m.materialId && m.quantidade > 0),
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

                // Start real date if first time
                if (!comp.dataInicioReal) {
                  comp.dataInicioReal = hoje;
                }
                // Complete if reaches 100%
                if (accum >= 100) {
                  comp.concluida = true;
                  comp.dataFimReal = hoje;
                }
              }
            }

            // Update category status
            const totalAccum = getAccumulatedPercent(svc.categoriaId) + (svc.composicaoId ? 0 : svc.percentualAdicionado);
            if (!cat.dataInicioReal) {
              cat.dataInicioReal = hoje;
              cat.statusCronograma = 'em_andamento';
            }

            // Recalculate category percentage
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

  // Helper to get flat list of all compositions with category info
  const getAllComposicoes = () => {
    const result: { catId: string; catNome: string; comp: OrcamentoComposicao }[] = [];
    for (const cat of categorias) {
      for (const comp of cat.composicoes) {
        result.push({ catId: cat.id, catNome: cat.nome, comp });
      }
    }
    return result;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diário de Obra</h1>
          <p className="text-muted-foreground text-sm">{obra.nome}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo Registro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Registro do Diário</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Clima</label>
                    <Select value={clima} onValueChange={v => setClima(v as DiarioRegistro['clima'])}>
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
                    <Input type="number" placeholder="0" value={trabalhadores} onChange={e => setTrabalhadores(e.target.value)} />
                  </div>
                </div>

                {/* === SERVIÇOS EXECUTADOS === */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Serviços Executados</label>
                    <Button type="button" variant="outline" size="sm" onClick={addServico}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Serviço
                    </Button>
                  </div>

                  {servicos.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.</p>
                  )}

                  {servicos.map((svc, idx) => {
                    const linkedCat = svc.categoriaId ? categorias.find(c => c.id === svc.categoriaId) : null;
                    const accum = svc.categoriaId ? getAccumulatedPercent(svc.categoriaId, svc.composicaoId) : 0;

                    return (
                      <div key={svc.id} className="border border-border rounded-lg p-3 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Descrição do serviço executado..."
                              value={svc.descricao}
                              onChange={e => updateServico(idx, { descricao: e.target.value })}
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeServico(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        {/* Link to etapa */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Link2 className="h-3.5 w-3.5" />
                            <span>Vincular a etapa (opcional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={svc.categoriaId || '_none'}
                              onValueChange={v => updateServico(idx, {
                                categoriaId: v === '_none' ? undefined : v,
                                composicaoId: undefined,
                                percentualAdicionado: undefined,
                              })}
                            >
                              <SelectTrigger className="text-xs h-8">
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
                                <SelectTrigger className="text-xs h-8">
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
                                <span className="text-muted-foreground">Progresso acumulado da etapa</span>
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
                                  className="h-7 text-xs w-20"
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
                      <Package className="h-4 w-4" /> Materiais Utilizados
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Material
                    </Button>
                  </div>

                  {materiaisUsados.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhum material adicionado. (Opcional)</p>
                  )}

                  {materiaisUsados.map((matU, idx) => {
                    const matInfo = materiaisObra.find(m => m.id === matU.materialId);
                    return (
                      <div key={matU.id} className="flex items-center gap-2 border border-border rounded-lg p-2">
                        <div className="flex-1">
                          <Select value={matU.materialId || '_none'} onValueChange={v => v !== '_none' && updateMaterial(idx, v)}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Selecionar material..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Selecionar...</SelectItem>
                              {materiaisObra.map(m => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.nome} (estoque: {m.estoqueAtual} {m.unidade})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={matInfo?.estoqueAtual}
                            className="h-8 text-xs w-20"
                            placeholder="Qtd"
                            value={matU.quantidade || ''}
                            onChange={e => updateMaterialQty(idx, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-muted-foreground w-10">{matU.unidade}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeMaterial(idx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Observações e Problemas */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Observações</label>
                  <Textarea placeholder="Observações gerais..." rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Problemas Ocorridos</label>
                  <Textarea placeholder="Relate problemas, se houver..." rows={2} value={problemas} onChange={e => setProblemas(e.target.value)} />
                </div>

                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">📷 Área para anexar fotos</p>
                  <p className="text-xs text-muted-foreground">(Upload será habilitado em breve)</p>
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={servicos.filter(s => s.descricao.trim()).length === 0}>
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

                {/* Serviços individuais */}
                {registro.servicos && registro.servicos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Serviços Executados</p>
                    <div className="space-y-1">
                      {registro.servicos.map(svc => {
                        const linkedCat = svc.categoriaId ? categorias.find(c => c.id === svc.categoriaId) : null;
                        const linkedComp = svc.composicaoId && linkedCat ? linkedCat.composicoes.find(c => c.id === svc.composicaoId) : null;
                        return (
                          <div key={svc.id} className="flex items-center gap-2 text-sm">
                            <span className="text-foreground">• {svc.descricao}</span>
                            {linkedCat && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
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

                {/* Fallback to old text field */}
                {(!registro.servicos || registro.servicos.length === 0) && registro.servicosExecutados && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Serviços Executados</p>
                    <p className="text-sm text-foreground">{registro.servicosExecutados}</p>
                  </div>
                )}

                {/* Materiais utilizados */}
                {registro.materiaisUtilizados && registro.materiaisUtilizados.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Materiais Utilizados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {registro.materiaisUtilizados.map(mat => (
                        <Badge key={mat.id} variant="secondary" className="text-xs">
                          {mat.materialNome}: {mat.quantidade} {mat.unidade}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
