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
  const [obraId, setObraId] = useState(obras[0]?.id || '');
  const obra = obras.find(o => o.id === obraId) || obras[0];
  const materiais = getMateriaisByObra(obra.id);
  const movimentacoes = getMovimentacoesByObra(obra.id);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movTipo, setMovTipo] = useState<'entrada' | 'saida'>('entrada');
  const [newMov, setNewMov] = useState({ materialId: '', quantidade: '', origemDestino: '', observacoes: '' });

  // Cadastro dialog
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [newMat, setNewMat] = useState({ nome: '', unidade: '', categoria: '', estoqueMinimo: '' });

  // Inline edit for estoque mínimo
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estoque / Materiais</h1>
          <div className="mt-1">
            <Select value={obraId} onValueChange={setObraId}>
              <SelectTrigger className="w-[280px] h-8 text-sm">
                <SelectValue placeholder="Selecionar obra..." />
              </SelectTrigger>
              <SelectContent>
                {obras.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.codigo} - {o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {canMovimentar && (
          <div className="flex flex-wrap gap-2">
            {/* Cadastrar Material */}
            <Dialog open={cadastroOpen} onOpenChange={setCadastroOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Cadastrar Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nome do Material *</label>
                    <Input placeholder="Ex: Cimento CP-II 50kg" value={newMat.nome} onChange={e => setNewMat({ ...newMat, nome: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Unidade *</label>
                      <Select value={newMat.unidade} onValueChange={v => setNewMat({ ...newMat, unidade: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {['un', 'kg', 'm', 'm²', 'm³', 'saco', 'barra', 'rolo', 'lata', 'l', 't', 'pç', 'cx'].map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Categoria *</label>
                      <Select value={newMat.categoria} onValueChange={v => setNewMat({ ...newMat, categoria: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                        <SelectContent>
                          {categoriasEstoque.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Estoque Mínimo</label>
                    <Input type="number" placeholder="0" value={newMat.estoqueMinimo} onChange={e => setNewMat({ ...newMat, estoqueMinimo: e.target.value })} />
                  </div>
                  <Button onClick={handleCadastrar} className="w-full" disabled={!newMat.nome.trim() || !newMat.unidade || !newMat.categoria}>
                    Cadastrar Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Movimentação */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setMovTipo('entrada')} variant="outline" size="sm">
                  <ArrowDownCircle className="h-4 w-4 mr-1" /> Entrada
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button onClick={() => setMovTipo('saida')} size="sm">
                  <ArrowUpCircle className="h-4 w-4 mr-1" /> Saída
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar {movTipo === 'entrada' ? 'Entrada' : 'Saída'} de Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Material</label>
                    <Select value={newMov.materialId} onValueChange={v => setNewMov({ ...newMov, materialId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                      <SelectContent>
                        {materiais.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nome} ({m.estoqueAtual} {m.unidade})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Quantidade</label>
                    <Input type="number" placeholder="0" value={newMov.quantidade} onChange={e => setNewMov({ ...newMov, quantidade: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{movTipo === 'entrada' ? 'Origem' : 'Destino'}</label>
                    <Input placeholder={movTipo === 'entrada' ? 'Fornecedor / Origem' : 'Uso / Destino'} value={newMov.origemDestino} onChange={e => setNewMov({ ...newMov, origemDestino: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Observações</label>
                    <Textarea placeholder="Observações..." rows={2} value={newMov.observacoes} onChange={e => setNewMov({ ...newMov, observacoes: e.target.value })} />
                  </div>
                  <Button onClick={handleMovimentar} className="w-full" disabled={!newMov.materialId || !newMov.quantidade}>
                    Registrar {movTipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-primary/30 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total de Itens</p>
            <p className="text-2xl font-bold text-foreground">{materiais.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-warning/30 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Estoque Baixo</p>
            <p className={`text-2xl font-bold ${materiaisBaixo.length > 0 ? 'text-warning' : 'text-foreground'}`}>{materiaisBaixo.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <ArrowDownCircle className="h-6 w-6 text-success/30 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Movimentações</p>
            <p className="text-2xl font-bold text-foreground">{movimentacoes.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materiais">
        <TabsList>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="materiais" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">Material</th>
                  <th className="text-left p-2 text-muted-foreground font-medium hidden md:table-cell">Categoria</th>
                  <th className="text-center p-2 text-muted-foreground font-medium">Estoque</th>
                  <th className="text-center p-2 text-muted-foreground font-medium hidden md:table-cell">Mínimo</th>
                  <th className="text-center p-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-2">
                      <p className="font-medium text-foreground">{m.nome}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{m.categoria}</p>
                    </td>
                    <td className="p-2 text-muted-foreground hidden md:table-cell">{m.categoria}</td>
                    <td className="p-2 text-center font-semibold text-foreground">{m.estoqueAtual} {m.unidade}</td>
                    <td className="p-2 text-center text-muted-foreground hidden md:table-cell">
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
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-4 space-y-3">
          {movimentacoes.map(mov => (
            <div key={mov.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
              {mov.tipo === 'entrada' ? (
                <ArrowDownCircle className="h-5 w-5 text-success shrink-0" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-warning shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{mov.materialNome}</p>
                <p className="text-xs text-muted-foreground">{formatDate(mov.data)} · {mov.origemDestino} · por {mov.responsavel}</p>
              </div>
              <Badge variant="secondary" className={mov.tipo === 'entrada' ? 'bg-success/10 text-success border-0' : 'bg-warning/10 text-warning border-0'}>
                {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
