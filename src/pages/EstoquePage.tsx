import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEstoque } from '@/contexts/EstoqueContext';
import { useObras } from '@/contexts/ObrasContext';
import { useObraSelection } from '@/contexts/ObraSelectionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/data/mockData';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Search, Plus, Check, X } from 'lucide-react';

const categoriasEstoque = [
  'Cimento', 'Agregados', 'Aço', 'Alvenaria', 'Hidráulica', 'Elétrica',
  'Pintura', 'Madeira', 'Impermeabilização', 'Ferragens', 'EPI', 'Outros',
];

export default function EstoquePage() {
  const { user, hasPermission } = useAuth();
  const { obras } = useObras();
  const { getMateriaisByObra, getMovimentacoesByObra, registrarMovimentacao, addMaterial, updateMaterial } = useEstoque();
  const { selectedObraId: obraId, setSelectedObraId: setObraId } = useObraSelection();
  const obra = obras.find(o => o.id === obraId) || obras[0];
  const materiais = getMateriaisByObra(obra.id);
  const movimentacoes = getMovimentacoesByObra(obra.id);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movTipo, setMovTipo] = useState<'entrada' | 'saida'>('entrada');
  const [newMov, setNewMov] = useState({ materialId: '', quantidade: '', origemDestino: '', observacoes: '' });

  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [newMat, setNewMat] = useState({ nome: '', unidade: '', categoria: '', estoqueMinimo: '' });

  const [editingMinId, setEditingMinId] = useState<string | null>(null);
  const [editingMinValue, setEditingMinValue] = useState('');

  const materiaisBaixo = materiais.filter(m => m.estoqueAtual < m.estoqueMinimo);
  const filtered = materiais.filter(m => !search || m.nome.toLowerCase().includes(search.toLowerCase()));

  const canMovimentar = hasPermission('estoque:movimentar');

  const handleMovimentar = () => {
    const material = materiais.find(m => m.id === newMov.materialId);
    if (!material) return;
    const qty = parseInt(newMov.quantidade) || 0;

    registrarMovimentacao({
      id: `mv${Date.now()}`,
      obraId: obra.id,
      materialId: material.id,
      materialNome: material.nome,
      tipo: movTipo,
      data: new Date().toISOString().split('T')[0],
      quantidade: qty,
      origemDestino: newMov.origemDestino,
      responsavel: user?.name || '',
      observacoes: newMov.observacoes,
    });
    setDialogOpen(false);
    setNewMov({ materialId: '', quantidade: '', origemDestino: '', observacoes: '' });
  };

  const handleCadastrar = () => {
    addMaterial({
      id: `m${Date.now()}`,
      obraId: obra.id,
      nome: newMat.nome,
      categoria: newMat.categoria,
      unidade: newMat.unidade,
      estoqueAtual: 0,
      estoqueMinimo: parseInt(newMat.estoqueMinimo) || 0,
      localizacao: '',
      observacoes: '',
    });
    setCadastroOpen(false);
    setNewMat({ nome: '', unidade: '', categoria: '', estoqueMinimo: '' });
  };

  const handleSaveMin = (id: string) => {
    updateMaterial(id, { estoqueMinimo: parseInt(editingMinValue) || 0 });
    setEditingMinId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Estoque</h1>
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
        {canMovimentar && (
          <div className="flex gap-1.5 shrink-0">
            <Dialog open={cadastroOpen} onOpenChange={setCadastroOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2 sm:px-3">
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Cadastrar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Cadastrar Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nome do Material *</label>
                    <Input placeholder="Ex: Cimento CP-II 50kg" className="h-10" value={newMat.nome} onChange={e => setNewMat({ ...newMat, nome: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Unidade *</label>
                      <Select value={newMat.unidade} onValueChange={v => setNewMat({ ...newMat, unidade: v })}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {['un', 'kg', 'm', 'm²', 'm³', 'saco', 'barra', 'rolo', 'lata', 'l', 't', 'pç', 'cx'].map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Categoria *</label>
                      <Select value={newMat.categoria} onValueChange={v => setNewMat({ ...newMat, categoria: v })}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {categoriasEstoque.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Estoque Mínimo</label>
                    <Input type="number" placeholder="0" className="h-10" value={newMat.estoqueMinimo} onChange={e => setNewMat({ ...newMat, estoqueMinimo: e.target.value })} />
                  </div>
                  <Button onClick={handleCadastrar} className="w-full h-11" disabled={!newMat.nome.trim() || !newMat.unidade || !newMat.categoria}>
                    Cadastrar Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setMovTipo('entrada')} variant="outline" size="sm" className="h-9 px-2 sm:px-3">
                  <ArrowDownCircle className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Entrada</span>
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button onClick={() => setMovTipo('saida')} size="sm" className="h-9 px-2 sm:px-3">
                  <ArrowUpCircle className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Saída</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Registrar {movTipo === 'entrada' ? 'Entrada' : 'Saída'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Material</label>
                    <Select value={newMov.materialId} onValueChange={v => setNewMov({ ...newMov, materialId: v })}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                      <SelectContent>
                        {materiais.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nome} ({m.estoqueAtual} {m.unidade})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Quantidade</label>
                    <Input type="number" placeholder="0" className="h-10" value={newMov.quantidade} onChange={e => setNewMov({ ...newMov, quantidade: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{movTipo === 'entrada' ? 'Origem' : 'Destino'}</label>
                    <Input placeholder={movTipo === 'entrada' ? 'Fornecedor / Origem' : 'Uso / Destino'} className="h-10" value={newMov.origemDestino} onChange={e => setNewMov({ ...newMov, origemDestino: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Observações</label>
                    <Textarea placeholder="Observações..." rows={2} value={newMov.observacoes} onChange={e => setNewMov({ ...newMov, observacoes: e.target.value })} />
                  </div>
                  <Button onClick={handleMovimentar} className="w-full h-11" disabled={!newMov.materialId || !newMov.quantidade}>
                    Registrar {movTipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Summary cards - compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="shadow-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary/30 mx-auto mb-1" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">Itens</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{materiais.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-warning/30 mx-auto mb-1" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">Estoque Baixo</p>
            <p className={`text-lg sm:text-2xl font-bold ${materiaisBaixo.length > 0 ? 'text-warning' : 'text-foreground'}`}>{materiaisBaixo.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <ArrowDownCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success/30 mx-auto mb-1" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">Movimentações</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{movimentacoes.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materiais">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="materiais" className="flex-1 sm:flex-initial">Materiais</TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex-1 sm:flex-initial">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="materiais" className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>

          {/* Mobile: card-based list; Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">Material</th>
                  <th className="text-left p-2 text-muted-foreground font-medium">Categoria</th>
                  <th className="text-center p-2 text-muted-foreground font-medium">Estoque</th>
                  <th className="text-center p-2 text-muted-foreground font-medium">Mínimo</th>
                  <th className="text-center p-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-2 font-medium text-foreground">{m.nome}</td>
                    <td className="p-2 text-muted-foreground">{m.categoria}</td>
                    <td className="p-2 text-center font-semibold text-foreground">{m.estoqueAtual} {m.unidade}</td>
                    <td className="p-2 text-center text-muted-foreground">
                      {editingMinId === m.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="number"
                            className="h-7 w-16 text-xs text-center"
                            value={editingMinValue}
                            onChange={e => setEditingMinValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveMin(m.id); if (e.key === 'Escape') setEditingMinId(null); }}
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSaveMin(m.id)}>
                            <Check className="h-3.5 w-3.5 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingMinId(null)}>
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-foreground hover:underline"
                          onClick={() => { setEditingMinId(m.id); setEditingMinValue(String(m.estoqueMinimo)); }}
                          title="Clique para editar"
                        >
                          {m.estoqueMinimo} {m.unidade}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {m.estoqueAtual < m.estoqueMinimo ? (
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">Baixo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-success/10 text-success border-0">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden space-y-2">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">{m.categoria}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{m.estoqueAtual} <span className="text-xs font-normal text-muted-foreground">{m.unidade}</span></p>
                  {editingMinId === m.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number"
                        className="h-7 w-14 text-xs text-center"
                        value={editingMinValue}
                        onChange={e => setEditingMinValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveMin(m.id); if (e.key === 'Escape') setEditingMinId(null); }}
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSaveMin(m.id)}>
                        <Check className="h-3 w-3 text-success" />
                      </Button>
                    </div>
                  ) : (
                    <p
                      className="text-[10px] text-muted-foreground cursor-pointer"
                      onClick={() => { setEditingMinId(m.id); setEditingMinValue(String(m.estoqueMinimo)); }}
                    >
                      mín: {m.estoqueMinimo}
                    </p>
                  )}
                </div>
                {m.estoqueAtual < m.estoqueMinimo ? (
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 text-[10px] shrink-0">Baixo</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-success/10 text-success border-0 text-[10px] shrink-0">OK</Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-3 space-y-2">
          {movimentacoes.map(mov => (
            <div key={mov.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-card rounded-lg border border-border">
              {mov.tipo === 'entrada' ? (
                <ArrowDownCircle className="h-5 w-5 text-success shrink-0" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-warning shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{mov.materialNome}</p>
                <p className="text-xs text-muted-foreground truncate">{formatDate(mov.data)} · {mov.origemDestino}</p>
              </div>
              <Badge variant="secondary" className={`shrink-0 text-xs ${mov.tipo === 'entrada' ? 'bg-success/10 text-success border-0' : 'bg-warning/10 text-warning border-0'}`}>
                {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
