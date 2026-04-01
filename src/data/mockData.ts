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

export interface DiarioRegistro {
  id: string;
  obraId: string;
  data: string;
  usuario: string;
  usuarioId: string;
  clima: 'sol' | 'nublado' | 'chuva' | 'chuvoso_forte';
  trabalhadores: number;
  servicosExecutados: string;
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

// Mock Users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos Mendes', email: 'gestor@teste.com', role: 'gestor', obraIds: ['ob1', 'ob2'] },
  { id: 'u2', name: 'José Silva', email: 'funcionario@teste.com', role: 'funcionario', obraIds: ['ob1'] },
  { id: 'u3', name: 'Maria Oliveira', email: 'cliente@teste.com', role: 'cliente', obraIds: ['ob1'] },
];

// Mock Obras
export const mockObras: Obra[] = [
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
    percentualAndamento: 42,
    descricao: 'Construção de residência unifamiliar com 3 pavimentos, área total de 280m².',
  },
  {
    id: 'ob2',
    nome: 'Reforma Comercial Centro',
    codigo: 'OBR-2024-002',
    cliente: 'Pedro Santos',
    endereco: 'Av. Paulista, 1200 - Sala 305, São Paulo/SP',
    status: 'planejamento',
    dataInicio: '2024-08-01',
    dataPrevisaoTermino: '2024-12-20',
    responsavel: 'Carlos Mendes',
    percentualAndamento: 0,
    descricao: 'Reforma completa de sala comercial de 120m² com novo layout e instalações.',
  },
];

// Mock Orcamento Items
export const mockOrcamentoItens: OrcamentoItem[] = [
  { id: 'orc1', obraId: 'ob1', categoria: 'Serviços Preliminares', descricao: 'Limpeza do terreno e tapume', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 8500, custoTotalPrevisto: 8500, custoRealizado: 8200, observacoes: 'Concluído', status: 'concluido' },
  { id: 'orc2', obraId: 'ob1', categoria: 'Fundação', descricao: 'Estacas e blocos de fundação', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 45000, custoTotalPrevisto: 45000, custoRealizado: 47500, observacoes: 'Custo acima do previsto por necessidade de reforço', status: 'concluido' },
  { id: 'orc3', obraId: 'ob1', categoria: 'Estrutura', descricao: 'Concreto armado - pilares, vigas e lajes', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 85000, custoTotalPrevisto: 85000, custoRealizado: 62000, observacoes: 'Em execução - 2º pavimento', status: 'em_execucao' },
  { id: 'orc4', obraId: 'ob1', categoria: 'Alvenaria', descricao: 'Alvenaria de vedação e divisórias', unidade: 'm²', quantidade: 380, custoUnitarioPrevisto: 95, custoTotalPrevisto: 36100, custoRealizado: 12000, observacoes: 'Iniciado no térreo', status: 'em_execucao' },
  { id: 'orc5', obraId: 'ob1', categoria: 'Cobertura', descricao: 'Estrutura de madeira e telhas', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 32000, custoTotalPrevisto: 32000, custoRealizado: 0, observacoes: '', status: 'pendente' },
  { id: 'orc6', obraId: 'ob1', categoria: 'Instalações Elétricas', descricao: 'Tubulação, fiação e quadro elétrico', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 28000, custoTotalPrevisto: 28000, custoRealizado: 5000, observacoes: 'Tubulação do térreo concluída', status: 'em_execucao' },
  { id: 'orc7', obraId: 'ob1', categoria: 'Instalações Hidráulicas', descricao: 'Tubulação água e esgoto', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 22000, custoTotalPrevisto: 22000, custoRealizado: 3500, observacoes: 'Iniciado', status: 'em_execucao' },
  { id: 'orc8', obraId: 'ob1', categoria: 'Acabamentos', descricao: 'Revestimentos, pisos e louças', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 65000, custoTotalPrevisto: 65000, custoRealizado: 0, observacoes: '', status: 'pendente' },
  { id: 'orc9', obraId: 'ob1', categoria: 'Pintura', descricao: 'Pintura interna e externa', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 18000, custoTotalPrevisto: 18000, custoRealizado: 0, observacoes: '', status: 'pendente' },
  { id: 'orc10', obraId: 'ob1', categoria: 'Limpeza Final', descricao: 'Limpeza e entrega', unidade: 'vb', quantidade: 1, custoUnitarioPrevisto: 3500, custoTotalPrevisto: 3500, custoRealizado: 0, observacoes: '', status: 'pendente' },
];

// Mock Cronograma
export const mockCronograma: CronogramaEtapa[] = [
  { id: 'cr1', obraId: 'ob1', nome: 'Serviços Preliminares', dataInicioPrevista: '2024-03-15', dataFimPrevista: '2024-03-30', dataInicioReal: '2024-03-15', dataFimReal: '2024-03-28', status: 'concluida', percentual: 100, responsavel: 'Carlos Mendes', observacoes: 'Concluído dentro do prazo' },
  { id: 'cr2', obraId: 'ob1', nome: 'Fundação', dataInicioPrevista: '2024-04-01', dataFimPrevista: '2024-05-15', dataInicioReal: '2024-04-01', dataFimReal: '2024-05-20', status: 'concluida', percentual: 100, responsavel: 'Carlos Mendes', observacoes: 'Atrasou 5 dias por reforço extra' },
  { id: 'cr3', obraId: 'ob1', nome: 'Estrutura', dataInicioPrevista: '2024-05-16', dataFimPrevista: '2024-08-30', dataInicioReal: '2024-05-22', dataFimReal: null, status: 'em_andamento', percentual: 65, responsavel: 'Carlos Mendes', observacoes: '2º pavimento em execução' },
  { id: 'cr4', obraId: 'ob1', nome: 'Alvenaria', dataInicioPrevista: '2024-07-15', dataFimPrevista: '2024-10-15', dataInicioReal: '2024-08-01', dataFimReal: null, status: 'em_andamento', percentual: 30, responsavel: 'José Silva', observacoes: 'Térreo em andamento' },
  { id: 'cr5', obraId: 'ob1', nome: 'Cobertura', dataInicioPrevista: '2024-09-01', dataFimPrevista: '2024-10-30', dataInicioReal: null, dataFimReal: null, status: 'nao_iniciada', percentual: 0, responsavel: 'Carlos Mendes', observacoes: '' },
  { id: 'cr6', obraId: 'ob1', nome: 'Instalações Elétricas', dataInicioPrevista: '2024-07-01', dataFimPrevista: '2024-12-15', dataInicioReal: '2024-07-15', dataFimReal: null, status: 'em_andamento', percentual: 20, responsavel: 'José Silva', observacoes: 'Tubulação do térreo' },
  { id: 'cr7', obraId: 'ob1', nome: 'Instalações Hidráulicas', dataInicioPrevista: '2024-07-01', dataFimPrevista: '2024-12-15', dataInicioReal: '2024-07-20', dataFimReal: null, status: 'em_andamento', percentual: 15, responsavel: 'José Silva', observacoes: '' },
  { id: 'cr8', obraId: 'ob1', nome: 'Acabamentos', dataInicioPrevista: '2024-11-01', dataFimPrevista: '2025-01-31', dataInicioReal: null, dataFimReal: null, status: 'nao_iniciada', percentual: 0, responsavel: 'Carlos Mendes', observacoes: '' },
  { id: 'cr9', obraId: 'ob1', nome: 'Pintura', dataInicioPrevista: '2025-01-15', dataFimPrevista: '2025-02-15', dataInicioReal: null, dataFimReal: null, status: 'nao_iniciada', percentual: 0, responsavel: 'José Silva', observacoes: '' },
  { id: 'cr10', obraId: 'ob1', nome: 'Limpeza Final', dataInicioPrevista: '2025-02-16', dataFimPrevista: '2025-02-28', dataInicioReal: null, dataFimReal: null, status: 'nao_iniciada', percentual: 0, responsavel: 'Carlos Mendes', observacoes: '' },
];

// Mock Diário de Obra
export const mockDiario: DiarioRegistro[] = [
  { id: 'd1', obraId: 'ob1', data: '2024-08-12', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 8, servicosExecutados: 'Concretagem das vigas do 2º pavimento. Montagem de formas para laje.', observacoes: 'Entrega de concreto usinado pela manhã. Bomba funcionou sem problemas.', problemas: '', fotos: [], status: 'aprovado' },
  { id: 'd2', obraId: 'ob1', data: '2024-08-11', usuario: 'José Silva', usuarioId: 'u2', clima: 'nublado', trabalhadores: 6, servicosExecutados: 'Armação dos pilares do 2º pavimento. Preparação das formas de vigas.', observacoes: 'Aço chegou com 1 dia de atraso.', problemas: 'Atraso na entrega do aço', fotos: [], status: 'aprovado' },
  { id: 'd3', obraId: 'ob1', data: '2024-08-10', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 7, servicosExecutados: 'Alvenaria do térreo - parede sala e quartos. Passagem de eletrodutos no térreo.', observacoes: '', problemas: '', fotos: [], status: 'aprovado' },
  { id: 'd4', obraId: 'ob1', data: '2024-08-13', usuario: 'José Silva', usuarioId: 'u2', clima: 'chuva', trabalhadores: 4, servicosExecutados: 'Serviços internos - passagem de tubulação hidráulica no térreo.', observacoes: 'Chuva forte pela manhã impediu trabalho externo. Equipe trabalhou em serviços internos.', problemas: 'Chuva forte interrompeu serviços externos', fotos: [], status: 'pendente' },
  { id: 'd5', obraId: 'ob1', data: '2024-08-09', usuario: 'José Silva', usuarioId: 'u2', clima: 'sol', trabalhadores: 8, servicosExecutados: 'Desforma da laje do 1º pavimento. Início da alvenaria no térreo.', observacoes: 'Laje apresentou boa qualidade. Sem fissuras aparentes.', problemas: '', fotos: [], status: 'aprovado' },
];

// Mock Materiais
export const mockMateriais: Material[] = [
  { id: 'm1', obraId: 'ob1', nome: 'Cimento CP-II 50kg', categoria: 'Cimento', unidade: 'saco', estoqueAtual: 45, estoqueMinimo: 20, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm2', obraId: 'ob1', nome: 'Areia média', categoria: 'Agregados', unidade: 'm³', estoqueAtual: 8, estoqueMinimo: 5, localizacao: 'Pátio', observacoes: '' },
  { id: 'm3', obraId: 'ob1', nome: 'Brita 1', categoria: 'Agregados', unidade: 'm³', estoqueAtual: 3, estoqueMinimo: 5, localizacao: 'Pátio', observacoes: 'Estoque baixo - solicitar reposição' },
  { id: 'm4', obraId: 'ob1', nome: 'Aço CA-50 10mm', categoria: 'Aço', unidade: 'barra', estoqueAtual: 120, estoqueMinimo: 50, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm5', obraId: 'ob1', nome: 'Tijolo cerâmico 9x19x19', categoria: 'Alvenaria', unidade: 'un', estoqueAtual: 2500, estoqueMinimo: 1000, localizacao: 'Pátio', observacoes: '' },
  { id: 'm6', obraId: 'ob1', nome: 'Tubo PVC 100mm', categoria: 'Hidráulica', unidade: 'barra', estoqueAtual: 8, estoqueMinimo: 10, localizacao: 'Almoxarifado', observacoes: 'Estoque baixo' },
  { id: 'm7', obraId: 'ob1', nome: 'Eletroduto 3/4"', categoria: 'Elétrica', unidade: 'barra', estoqueAtual: 35, estoqueMinimo: 15, localizacao: 'Almoxarifado', observacoes: '' },
  { id: 'm8', obraId: 'ob1', nome: 'Fio 2,5mm²', categoria: 'Elétrica', unidade: 'rolo', estoqueAtual: 4, estoqueMinimo: 3, localizacao: 'Almoxarifado', observacoes: '' },
];

// Mock Movimentações
export const mockMovimentacoes: MovimentacaoEstoque[] = [
  { id: 'mv1', obraId: 'ob1', materialId: 'm1', materialNome: 'Cimento CP-II 50kg', tipo: 'entrada', data: '2024-08-12', quantidade: 30, origemDestino: 'Depósito Central', responsavel: 'José Silva', observacoes: 'NF 4523' },
  { id: 'mv2', obraId: 'ob1', materialId: 'm4', materialNome: 'Aço CA-50 10mm', tipo: 'entrada', data: '2024-08-11', quantidade: 80, origemDestino: 'Gerdau', responsavel: 'José Silva', observacoes: 'Entrega com 1 dia de atraso' },
  { id: 'mv3', obraId: 'ob1', materialId: 'm1', materialNome: 'Cimento CP-II 50kg', tipo: 'saida', data: '2024-08-12', quantidade: 15, origemDestino: 'Concretagem vigas 2º pav', responsavel: 'José Silva', observacoes: '' },
  { id: 'mv4', obraId: 'ob1', materialId: 'm5', materialNome: 'Tijolo cerâmico 9x19x19', tipo: 'saida', data: '2024-08-10', quantidade: 400, origemDestino: 'Alvenaria térreo', responsavel: 'José Silva', observacoes: '' },
  { id: 'mv5', obraId: 'ob1', materialId: 'm3', materialNome: 'Brita 1', tipo: 'saida', data: '2024-08-12', quantidade: 4, origemDestino: 'Concretagem vigas', responsavel: 'José Silva', observacoes: '' },
];

// Helper: format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Helper: format date
export const formatDate = (date: string) => {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
};

// Helper: status labels
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
