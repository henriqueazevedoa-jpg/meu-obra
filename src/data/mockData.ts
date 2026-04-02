export type UserRole = 'gestor' | 'funcionario' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  obraIds: string[];
}

export interface Obra {
  id: string;
  nome: string;
  codigo: string;
  cliente: string;
  endereco: string;
  status: 'planejamento' | 'em_andamento' | 'pausada' | 'concluida';
  dataInicio: string;
  dataPrevisaoTermino: string;
  responsavel: string;
  percentualAndamento: number;
  descricao: string;
}

export interface OrcamentoItem {
  id: string;
  obraId: string;
  categoria: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  custoUnitarioPrevisto: number;
  custoTotalPrevisto: number;
  custoRealizado: number;
  observacoes: string;
  status: 'pendente' | 'em_execucao' | 'concluido';
}

export interface CronogramaEtapa {
  id: string;
  obraId: string;
  nome: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  dataInicioReal: string | null;
  dataFimReal: string | null;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada';
  percentual: number;
  responsavel: string;
  observacoes: string;
}

export interface DiarioServico {
  id: string;
  descricao: string;
  categoriaId?: string; // linked to OrcamentoCategoria
  composicaoId?: string; // linked to OrcamentoComposicao
  percentualAdicionado?: number; // % added to that etapa
}

export interface DiarioMaterialUsado {
  id: string;
  materialId: string;
  materialNome: string;
  unidade: string;
  quantidade: number;
}

export interface DiarioRegistro {
  id: string;
  obraId: string;
  data: string;
  usuario: string;
  usuarioId: string;
  clima: 'sol' | 'nublado' | 'chuva' | 'chuvoso_forte';
  trabalhadores: number;
  servicosExecutados: string;
  servicos: DiarioServico[];
  materiaisUtilizados: DiarioMaterialUsado[];
  observacoes: string;
  problemas: string;
  fotos: string[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

export interface Material {
  id: string;
  obraId: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  localizacao: string;
  observacoes: string;
}

export interface MovimentacaoEstoque {
  id: string;
  obraId: string;
  materialId: string;
  materialNome: string;
  tipo: 'entrada' | 'saida';
  data: string;
  quantidade: number;
  origemDestino: string;
  responsavel: string;
  observacoes: string;
}

// ── Mock Users ──
export const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos Mendes', email: 'gestor@teste.com', role: 'gestor', obraIds: ['ob1', 'ob2', 'ob3'] },
  { id: 'u2', name: 'José Silva', email: 'funcionario@teste.com', role: 'funcionario', obraIds: ['ob1', 'ob3'] },
  { id: 'u3', name: 'Maria Oliveira', email: 'cliente@teste.com', role: 'cliente', obraIds: ['ob1'] },
];

// ── Mock Obras (3 situações distintas) ──
export const mockObras: Obra[] = [
  // Obra 1 – Em andamento, ~45% concluída
  {
    id: 'ob1',
    nome: 'Residencial Vila Nova',
    codigo: 'OBR-2024-001',
    cliente: 'Maria Oliveira',
    endereco: 'Rua das Palmeiras, 450 - Vila Nova, São Paulo/SP',
    status: 'em_andamento',
    dataInicio: '2024-03-15',
    dataPrevisaoTermino: '2025-02-28',
    responsavel: 'Carlos Mendes',
    percentualAndamento: 45,
    descricao: 'Construção de residência unifamiliar com 3 pavimentos, área total de 280m². Projeto inclui piscina e área gourmet.',
  },
  // Obra 2 – Planejamento, 0%
  {
    id: 'ob2',
    nome: 'Edifício Comercial Centro',
    codigo: 'OBR-2024-002',
    cliente: 'Pedro Santos',
    endereco: 'Av. Paulista, 1200 - Bela Vista, São Paulo/SP',
    status: 'planejamento',
    dataInicio: '2025-01-10',
    dataPrevisaoTermino: '2026-06-30',
    responsavel: 'Carlos Mendes',
    percentualAndamento: 0,
    descricao: 'Construção de edifício comercial de 6 pavimentos com 24 salas, 2 subsolos de garagem e área comum com auditório. Área total de 3.200m².',
  },
  // Obra 3 – Concluída, 100%
  {
    id: 'ob3',
    nome: 'Reforma Clínica Saúde Total',
    codigo: 'OBR-2023-003',
    cliente: 'Dr. André Martins',
    endereco: 'Rua Augusta, 890 - Consolação, São Paulo/SP',
    status: 'concluida',
    dataInicio: '2023-06-01',
    dataPrevisaoTermino: '2023-12-20',
    responsavel: 'Ricardo Ferreira',
    percentualAndamento: 100,
    descricao: 'Reforma completa de clínica médica com 8 consultórios, recepção, sala de espera e área administrativa. Área de 420m².',
  },
];

// ── Mock Orcamento Items (legacy, usado pelo seed) ──
export const mockOrcamentoItens: OrcamentoItem[] = [];

// ── Mock Cronograma (legacy) ──
export const mockCronograma: CronogramaEtapa[] = [];

// ── Mock Diário de Obra ──
export const mockDiario: DiarioRegistro[] = [
  // Obra 1 – registros recentes
  { id: 'd1', obraId: 'ob1', data: '2024-08-14', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 9, servicosExecutados: 'Concretagem da laje do 2º pavimento. Cura com manta úmida iniciada.', observacoes: 'Concreto usinado fck 30MPa. Bomba lança operou normalmente.', problemas: '', fotos: [], status: 'aprovado' },
  { id: 'd2', obraId: 'ob1', data: '2024-08-13', usuario: 'José Silva', usuarioId: 'u2', clima: 'chuva', trabalhadores: 4, servicosExecutados: 'Serviços internos - passagem de tubulação hidráulica no térreo. Instalação de caixas elétricas 4x2.', observacoes: 'Chuva forte pela manhã impediu trabalho externo.', problemas: 'Chuva forte interrompeu serviços externos por 3 horas', fotos: [], status: 'pendente' },
  { id: 'd3', obraId: 'ob1', data: '2024-08-12', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 8, servicosExecutados: 'Montagem de formas para laje do 2º pavimento. Armação de ferragem da laje.', observacoes: 'Entrega de 80 barras de aço CA-50 12,5mm.', problemas: '', fotos: [], status: 'aprovado' },
  { id: 'd4', obraId: 'ob1', data: '2024-08-11', usuario: 'José Silva', usuarioId: 'u2', clima: 'nublado', trabalhadores: 6, servicosExecutados: 'Armação dos pilares do 2º pavimento. Alvenaria do térreo - parede dos quartos.', observacoes: 'Aço CA-50 10mm chegou com 1 dia de atraso.', problemas: 'Atraso na entrega do aço pelo fornecedor', fotos: [], status: 'aprovado' },
  { id: 'd5', obraId: 'ob1', data: '2024-08-10', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 7, servicosExecutados: 'Desforma das vigas do 1º pavimento. Início da montagem de formas dos pilares do 2º pav.', observacoes: 'Vigas apresentaram boa qualidade. Sem fissuras aparentes.', problemas: '', fotos: [], status: 'aprovado' },
  // Obra 3 – registros finais da reforma concluída
  { id: 'd6', obraId: 'ob3', data: '2023-12-18', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 5, servicosExecutados: 'Limpeza final de toda a clínica. Instalação de placas de sinalização. Vistoria final.', observacoes: 'Obra entregue ao cliente conforme projeto. Todas as pendências resolvidas.', problemas: '', fotos: [], status: 'aprovado' },
  { id: 'd7', obraId: 'ob3', data: '2023-12-17', usuario: 'José Silva', usuarioId: 'u2', clima: 'nublado', trabalhadores: 6, servicosExecutados: 'Pintura de retoques finais. Instalação de louças e metais dos banheiros restantes.', observacoes: 'Últimos ajustes antes da entrega.', problemas: '', fotos: [], status: 'aprovado' },
];

// ── Mock Materiais ──
export const mockMateriais: Material[] = [
  // Obra 1
  { id: 'm1', obraId: 'ob1', nome: 'Cimento CP-II 50kg', categoria: 'Cimento', unidade: 'saco', estoqueAtual: 45, estoqueMinimo: 20, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm2', obraId: 'ob1', nome: 'Areia média', categoria: 'Agregados', unidade: 'm³', estoqueAtual: 8, estoqueMinimo: 5, localizacao: 'Pátio', observacoes: '' },
  { id: 'm3', obraId: 'ob1', nome: 'Brita 1', categoria: 'Agregados', unidade: 'm³', estoqueAtual: 3, estoqueMinimo: 5, localizacao: 'Pátio', observacoes: 'Estoque baixo - solicitar reposição' },
  { id: 'm4', obraId: 'ob1', nome: 'Aço CA-50 10mm', categoria: 'Aço', unidade: 'barra', estoqueAtual: 120, estoqueMinimo: 50, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm5', obraId: 'ob1', nome: 'Tijolo cerâmico 9x19x19', categoria: 'Alvenaria', unidade: 'un', estoqueAtual: 2500, estoqueMinimo: 1000, localizacao: 'Pátio', observacoes: '' },
  { id: 'm6', obraId: 'ob1', nome: 'Tubo PVC 100mm esgoto', categoria: 'Hidráulica', unidade: 'barra', estoqueAtual: 8, estoqueMinimo: 10, localizacao: 'Almoxarifado', observacoes: 'Estoque baixo' },
  { id: 'm7', obraId: 'ob1', nome: 'Eletroduto 3/4"', categoria: 'Elétrica', unidade: 'barra', estoqueAtual: 35, estoqueMinimo: 15, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm8', obraId: 'ob1', nome: 'Fio 2,5mm² azul', categoria: 'Elétrica', unidade: 'rolo', estoqueAtual: 4, estoqueMinimo: 3, localizacao: 'Almoxarifado', observacoes: '' },
  // Obra 2 – ainda sem materiais (planejamento)
  // Obra 3 – materiais restantes pós-obra
  { id: 'm9', obraId: 'ob3', nome: 'Tinta acrílica branca 18L', categoria: 'Pintura', unidade: 'lata', estoqueAtual: 2, estoqueMinimo: 0, localizacao: 'Depósito', observacoes: 'Sobra da obra' },
  { id: 'm10', obraId: 'ob3', nome: 'Massa corrida PVA 25kg', categoria: 'Pintura', unidade: 'lata', estoqueAtual: 1, estoqueMinimo: 0, localizacao: 'Depósito', observacoes: 'Sobra da obra' },
];

// ── Mock Movimentações ──
export const mockMovimentacoes: MovimentacaoEstoque[] = [
  { id: 'mv1', obraId: 'ob1', materialId: 'm1', materialNome: 'Cimento CP-II 50kg', tipo: 'entrada', data: '2024-08-12', quantidade: 30, origemDestino: 'Depósito Central', responsavel: 'José Silva', observacoes: 'NF 4523' },
  { id: 'mv2', obraId: 'ob1', materialId: 'm4', materialNome: 'Aço CA-50 10mm', tipo: 'entrada', data: '2024-08-11', quantidade: 80, origemDestino: 'Gerdau Distribuidora', responsavel: 'José Silva', observacoes: 'Entrega com 1 dia de atraso. NF 7891' },
  { id: 'mv3', obraId: 'ob1', materialId: 'm1', materialNome: 'Cimento CP-II 50kg', tipo: 'saida', data: '2024-08-14', quantidade: 18, origemDestino: 'Concretagem laje 2º pav', responsavel: 'José Silva', observacoes: '' },
  { id: 'mv4', obraId: 'ob1', materialId: 'm5', materialNome: 'Tijolo cerâmico 9x19x19', tipo: 'saida', data: '2024-08-11', quantidade: 400, origemDestino: 'Alvenaria térreo', responsavel: 'José Silva', observacoes: '' },
  { id: 'mv5', obraId: 'ob1', materialId: 'm3', materialNome: 'Brita 1', tipo: 'saida', data: '2024-08-14', quantidade: 4, origemDestino: 'Concretagem laje 2º pav', responsavel: 'José Silva', observacoes: '' },
  { id: 'mv6', obraId: 'ob3', materialId: 'm9', materialNome: 'Tinta acrílica branca 18L', tipo: 'entrada', data: '2023-11-20', quantidade: 8, origemDestino: 'Tintas MC', responsavel: 'Ricardo Ferreira', observacoes: 'NF 2201' },
  { id: 'mv7', obraId: 'ob3', materialId: 'm9', materialNome: 'Tinta acrílica branca 18L', tipo: 'saida', data: '2023-12-15', quantidade: 6, origemDestino: 'Pintura geral da clínica', responsavel: 'Ricardo Ferreira', observacoes: '' },
];

// ── Helpers ──
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (date: string) => {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
};

export const statusObraLabels: Record<string, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
};

export const statusEtapaLabels: Record<string, string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
};

export const statusDiarioLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

export const climaLabels: Record<string, string> = {
  sol: '☀️ Sol',
  nublado: '⛅ Nublado',
  chuva: '🌧️ Chuva',
  chuvoso_forte: '⛈️ Chuva Forte',
};
