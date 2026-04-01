import type { OrcamentoObra } from '@/contexts/OrcamentoContext';

/**
 * Rich seed data for 3 obras in different stages.
 * Obra 1 (ob1) – Em andamento ~45%: orçamento detalhado com subitens, datas de cronograma parciais.
 * Obra 2 (ob2) – Planejamento: orçamento estimado sem datas reais.
 * Obra 3 (ob3) – Concluída 100%: tudo preenchido com datas reais e 100% progresso.
 */

function sub(id: string, codigo: string, descricao: string, unidade: string, qtd: number, preco: number) {
  return { id, codigo, descricao, unidade, quantidade: qtd, precoUnitario: preco, precoTotal: qtd * preco };
}

export function createSeedOrcamentos(): OrcamentoObra[] {
  return [
    // ═══════════════════════════════════════════
    // OBRA 1 – Residencial Vila Nova (em andamento)
    // ═══════════════════════════════════════════
    {
      obraId: 'ob1',
      categorias: [
        {
          id: 'ob1-cat1', codigo: 'CAT-001', nome: 'Serviços Preliminares', precoTotal: 12800, usaComposicoes: true,
          dataInicioPrevista: '2024-03-15', dataFimPrevista: '2024-04-05',
          dataInicioReal: '2024-03-15', dataFimReal: '2024-04-03',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Carlos Mendes',
          composicoes: [
            {
              id: 'ob1-c1-1', codigo: 'COMP-001-01', descricao: 'Limpeza e preparo do terreno', unidade: 'm²', quantidade: 320, precoUnitario: 15, precoTotal: 4800,
              subitens: [
                sub('ob1-s1-1-1', 'SUB-001-01-01', 'Remoção de entulho e vegetação', 'm²', 320, 8),
                sub('ob1-s1-1-2', 'SUB-001-01-02', 'Nivelamento do terreno', 'm²', 320, 7),
              ],
              usaSubitens: true, pesoCronograma: 30, concluida: true,
              dataInicioPrevista: '2024-03-15', dataFimPrevista: '2024-03-22', dataInicioReal: '2024-03-15', dataFimReal: '2024-03-21',
            },
            {
              id: 'ob1-c1-2', codigo: 'COMP-001-02', descricao: 'Tapume e instalações provisórias', unidade: 'vb', quantidade: 1, precoUnitario: 5200, precoTotal: 5200,
              subitens: [
                sub('ob1-s1-2-1', 'SUB-001-02-01', 'Tapume em compensado h=2,20m', 'm', 45, 65),
                sub('ob1-s1-2-2', 'SUB-001-02-02', 'Barracão de obra', 'vb', 1, 1800),
                sub('ob1-s1-2-3', 'SUB-001-02-03', 'Instalação elétrica provisória', 'vb', 1, 475),
              ],
              usaSubitens: true, pesoCronograma: 40, concluida: true,
              dataInicioPrevista: '2024-03-18', dataFimPrevista: '2024-03-30', dataInicioReal: '2024-03-18', dataFimReal: '2024-03-29',
            },
            {
              id: 'ob1-c1-3', codigo: 'COMP-001-03', descricao: 'Locação da obra', unidade: 'vb', quantidade: 1, precoUnitario: 2800, precoTotal: 2800,
              subitens: [], usaSubitens: false, pesoCronograma: 30, concluida: true,
              dataInicioPrevista: '2024-03-25', dataFimPrevista: '2024-04-05', dataInicioReal: '2024-03-25', dataFimReal: '2024-04-03',
            },
          ],
        },
        {
          id: 'ob1-cat2', codigo: 'CAT-002', nome: 'Fundação', precoTotal: 52000, usaComposicoes: true,
          dataInicioPrevista: '2024-04-08', dataFimPrevista: '2024-05-20',
          dataInicioReal: '2024-04-08', dataFimReal: '2024-05-25',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Carlos Mendes',
          observacoesCronograma: 'Atrasou 5 dias por necessidade de reforço em 2 blocos',
          composicoes: [
            {
              id: 'ob1-c2-1', codigo: 'COMP-002-01', descricao: 'Escavação e preparo', unidade: 'm³', quantidade: 85, precoUnitario: 120, precoTotal: 10200,
              subitens: [
                sub('ob1-s2-1-1', 'SUB-002-01-01', 'Escavação mecânica', 'm³', 85, 75),
                sub('ob1-s2-1-2', 'SUB-002-01-02', 'Regularização e compactação do fundo', 'm³', 85, 45),
              ],
              usaSubitens: true, pesoCronograma: 25, concluida: true,
              dataInicioPrevista: '2024-04-08', dataFimPrevista: '2024-04-18', dataInicioReal: '2024-04-08', dataFimReal: '2024-04-17',
            },
            {
              id: 'ob1-c2-2', codigo: 'COMP-002-02', descricao: 'Estacas tipo hélice contínua', unidade: 'm', quantidade: 180, precoUnitario: 130, precoTotal: 23400,
              subitens: [], usaSubitens: false, pesoCronograma: 45, concluida: true,
              dataInicioPrevista: '2024-04-15', dataFimPrevista: '2024-05-05', dataInicioReal: '2024-04-15', dataFimReal: '2024-05-08',
            },
            {
              id: 'ob1-c2-3', codigo: 'COMP-002-03', descricao: 'Blocos e vigas baldrames', unidade: 'm³', quantidade: 22, precoUnitario: 836.36, precoTotal: 18400,
              subitens: [
                sub('ob1-s2-3-1', 'SUB-002-03-01', 'Formas de madeira', 'm²', 95, 55),
                sub('ob1-s2-3-2', 'SUB-002-03-02', 'Armação CA-50/CA-60', 'kg', 1800, 4.5),
                sub('ob1-s2-3-3', 'SUB-002-03-03', 'Concreto usinado fck 30MPa', 'm³', 22, 185),
              ],
              usaSubitens: true, pesoCronograma: 30, concluida: true,
              dataInicioPrevista: '2024-05-01', dataFimPrevista: '2024-05-20', dataInicioReal: '2024-05-03', dataFimReal: '2024-05-25',
            },
          ],
        },
        {
          id: 'ob1-cat3', codigo: 'CAT-003', nome: 'Estrutura', precoTotal: 98000, usaComposicoes: true,
          dataInicioPrevista: '2024-05-21', dataFimPrevista: '2024-09-15',
          dataInicioReal: '2024-05-27', dataFimReal: undefined,
          statusCronograma: 'em_andamento', percentualCronograma: 65, responsavel: 'Carlos Mendes',
          composicoes: [
            {
              id: 'ob1-c3-1', codigo: 'COMP-003-01', descricao: 'Pilares - concreto armado', unidade: 'vb', quantidade: 1, precoUnitario: 28000, precoTotal: 28000,
              subitens: [
                sub('ob1-s3-1-1', 'SUB-003-01-01', 'Formas de pilares', 'm²', 210, 48),
                sub('ob1-s3-1-2', 'SUB-003-01-02', 'Armação de pilares', 'kg', 2800, 4.8),
                sub('ob1-s3-1-3', 'SUB-003-01-03', 'Concretagem de pilares fck 30', 'm³', 18, 420),
              ],
              usaSubitens: true, pesoCronograma: 30, concluida: true,
              dataInicioPrevista: '2024-05-21', dataFimPrevista: '2024-07-10', dataInicioReal: '2024-05-27', dataFimReal: '2024-07-15',
            },
            {
              id: 'ob1-c3-2', codigo: 'COMP-003-02', descricao: 'Vigas - concreto armado', unidade: 'vb', quantidade: 1, precoUnitario: 32000, precoTotal: 32000,
              subitens: [
                sub('ob1-s3-2-1', 'SUB-003-02-01', 'Formas de vigas', 'm²', 280, 45),
                sub('ob1-s3-2-2', 'SUB-003-02-02', 'Armação de vigas', 'kg', 3200, 4.7),
                sub('ob1-s3-2-3', 'SUB-003-02-03', 'Concretagem de vigas fck 30', 'm³', 24, 415),
              ],
              usaSubitens: true, pesoCronograma: 35, concluida: true,
              dataInicioPrevista: '2024-06-15', dataFimPrevista: '2024-08-10', dataInicioReal: '2024-06-20', dataFimReal: '2024-08-12',
            },
            {
              id: 'ob1-c3-3', codigo: 'COMP-003-03', descricao: 'Lajes - concreto armado', unidade: 'vb', quantidade: 1, precoUnitario: 38000, precoTotal: 38000,
              subitens: [
                sub('ob1-s3-3-1', 'SUB-003-03-01', 'Formas e escoramentos de laje', 'm²', 350, 38),
                sub('ob1-s3-3-2', 'SUB-003-03-02', 'Armação de laje e tela', 'kg', 2900, 5.1),
                sub('ob1-s3-3-3', 'SUB-003-03-03', 'Concretagem de laje fck 25', 'm³', 32, 390),
              ],
              usaSubitens: true, pesoCronograma: 35, concluida: false,
              dataInicioPrevista: '2024-07-15', dataFimPrevista: '2024-09-15', dataInicioReal: '2024-07-20',
            },
          ],
        },
        {
          id: 'ob1-cat4', codigo: 'CAT-004', nome: 'Alvenaria', precoTotal: 38500, usaComposicoes: true,
          dataInicioPrevista: '2024-08-01', dataFimPrevista: '2024-11-15',
          dataInicioReal: '2024-08-05',
          statusCronograma: 'em_andamento', percentualCronograma: 30, responsavel: 'José Silva',
          composicoes: [
            {
              id: 'ob1-c4-1', codigo: 'COMP-004-01', descricao: 'Alvenaria de vedação - blocos cerâmicos', unidade: 'm²', quantidade: 420, precoUnitario: 75, precoTotal: 31500,
              subitens: [
                sub('ob1-s4-1-1', 'SUB-004-01-01', 'Blocos cerâmicos 9x19x19', 'un', 5040, 1.2),
                sub('ob1-s4-1-2', 'SUB-004-01-02', 'Argamassa de assentamento', 'm³', 6.3, 380),
                sub('ob1-s4-1-3', 'SUB-004-01-03', 'Mão de obra pedreiro', 'm²', 420, 42),
              ],
              usaSubitens: true, pesoCronograma: 80, concluida: false,
              dataInicioPrevista: '2024-08-01', dataFimPrevista: '2024-11-01', dataInicioReal: '2024-08-05',
            },
            {
              id: 'ob1-c4-2', codigo: 'COMP-004-02', descricao: 'Vergas e contravergas', unidade: 'vb', quantidade: 1, precoUnitario: 7000, precoTotal: 7000,
              subitens: [], usaSubitens: false, pesoCronograma: 20, concluida: false,
              dataInicioPrevista: '2024-09-01', dataFimPrevista: '2024-11-15',
            },
          ],
        },
        {
          id: 'ob1-cat5', codigo: 'CAT-005', nome: 'Cobertura', precoTotal: 35000, usaComposicoes: true,
          dataInicioPrevista: '2024-10-01', dataFimPrevista: '2024-11-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            {
              id: 'ob1-c5-1', codigo: 'COMP-005-01', descricao: 'Estrutura de madeira para telhado', unidade: 'm²', quantidade: 140, precoUnitario: 120, precoTotal: 16800,
              subitens: [], usaSubitens: false, pesoCronograma: 50,
              dataInicioPrevista: '2024-10-01', dataFimPrevista: '2024-10-30',
            },
            {
              id: 'ob1-c5-2', codigo: 'COMP-005-02', descricao: 'Telhas e cumeeira', unidade: 'm²', quantidade: 155, precoUnitario: 85, precoTotal: 13175,
              subitens: [], usaSubitens: false, pesoCronograma: 35,
              dataInicioPrevista: '2024-10-25', dataFimPrevista: '2024-11-20',
            },
            {
              id: 'ob1-c5-3', codigo: 'COMP-005-03', descricao: 'Calhas e rufos', unidade: 'm', quantidade: 62, precoUnitario: 81, precoTotal: 5025,
              subitens: [], usaSubitens: false, pesoCronograma: 15,
              dataInicioPrevista: '2024-11-15', dataFimPrevista: '2024-11-30',
            },
          ],
        },
        {
          id: 'ob1-cat6', codigo: 'CAT-006', nome: 'Instalações Elétricas', precoTotal: 32000, usaComposicoes: true,
          dataInicioPrevista: '2024-07-15', dataFimPrevista: '2025-01-15',
          dataInicioReal: '2024-07-20',
          statusCronograma: 'em_andamento', percentualCronograma: 20, responsavel: 'José Silva',
          composicoes: [
            {
              id: 'ob1-c6-1', codigo: 'COMP-006-01', descricao: 'Eletrodutos e caixas', unidade: 'vb', quantidade: 1, precoUnitario: 8500, precoTotal: 8500,
              subitens: [], usaSubitens: false, pesoCronograma: 25, concluida: false,
              dataInicioPrevista: '2024-07-15', dataFimPrevista: '2024-10-30', dataInicioReal: '2024-07-20',
            },
            {
              id: 'ob1-c6-2', codigo: 'COMP-006-02', descricao: 'Fiação e cabeamento', unidade: 'vb', quantidade: 1, precoUnitario: 12000, precoTotal: 12000,
              subitens: [], usaSubitens: false, pesoCronograma: 35,
              dataInicioPrevista: '2024-10-01', dataFimPrevista: '2024-12-15',
            },
            {
              id: 'ob1-c6-3', codigo: 'COMP-006-03', descricao: 'Quadro e disjuntores', unidade: 'vb', quantidade: 1, precoUnitario: 6500, precoTotal: 6500,
              subitens: [], usaSubitens: false, pesoCronograma: 20,
              dataInicioPrevista: '2024-12-01', dataFimPrevista: '2025-01-10',
            },
            {
              id: 'ob1-c6-4', codigo: 'COMP-006-04', descricao: 'Iluminação e tomadas', unidade: 'vb', quantidade: 1, precoUnitario: 5000, precoTotal: 5000,
              subitens: [], usaSubitens: false, pesoCronograma: 20,
              dataInicioPrevista: '2024-12-15', dataFimPrevista: '2025-01-15',
            },
          ],
        },
        {
          id: 'ob1-cat7', codigo: 'CAT-007', nome: 'Instalações Hidráulicas', precoTotal: 26000, usaComposicoes: true,
          dataInicioPrevista: '2024-07-15', dataFimPrevista: '2025-01-15',
          dataInicioReal: '2024-07-25',
          statusCronograma: 'em_andamento', percentualCronograma: 15, responsavel: 'José Silva',
          composicoes: [
            {
              id: 'ob1-c7-1', codigo: 'COMP-007-01', descricao: 'Água fria - tubulação e conexões', unidade: 'vb', quantidade: 1, precoUnitario: 9000, precoTotal: 9000,
              subitens: [], usaSubitens: false, pesoCronograma: 35,
              dataInicioPrevista: '2024-07-15', dataFimPrevista: '2024-11-30', dataInicioReal: '2024-07-25',
            },
            {
              id: 'ob1-c7-2', codigo: 'COMP-007-02', descricao: 'Esgoto - tubulação e caixas', unidade: 'vb', quantidade: 1, precoUnitario: 8500, precoTotal: 8500,
              subitens: [], usaSubitens: false, pesoCronograma: 35,
              dataInicioPrevista: '2024-07-15', dataFimPrevista: '2024-11-30', dataInicioReal: '2024-07-25',
            },
            {
              id: 'ob1-c7-3', codigo: 'COMP-007-03', descricao: 'Água quente - tubulação PPR', unidade: 'vb', quantidade: 1, precoUnitario: 5500, precoTotal: 5500,
              subitens: [], usaSubitens: false, pesoCronograma: 20,
              dataInicioPrevista: '2024-10-01', dataFimPrevista: '2024-12-30',
            },
            {
              id: 'ob1-c7-4', codigo: 'COMP-007-04', descricao: 'Pluvial', unidade: 'vb', quantidade: 1, precoUnitario: 3000, precoTotal: 3000,
              subitens: [], usaSubitens: false, pesoCronograma: 10,
              dataInicioPrevista: '2024-11-15', dataFimPrevista: '2025-01-15',
            },
          ],
        },
        {
          id: 'ob1-cat8', codigo: 'CAT-008', nome: 'Revestimentos', precoTotal: 42000, usaComposicoes: true,
          dataInicioPrevista: '2024-12-01', dataFimPrevista: '2025-01-31',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob1-c8-1', codigo: 'COMP-008-01', descricao: 'Chapisco e emboço interno', unidade: 'm²', quantidade: 580, precoUnitario: 38, precoTotal: 22040, subitens: [], usaSubitens: false, pesoCronograma: 50, dataInicioPrevista: '2024-12-01', dataFimPrevista: '2025-01-10' },
            { id: 'ob1-c8-2', codigo: 'COMP-008-02', descricao: 'Revestimento cerâmico (banheiros e cozinha)', unidade: 'm²', quantidade: 120, precoUnitario: 95, precoTotal: 11400, subitens: [], usaSubitens: false, pesoCronograma: 30, dataInicioPrevista: '2025-01-05', dataFimPrevista: '2025-01-25' },
            { id: 'ob1-c8-3', codigo: 'COMP-008-03', descricao: 'Reboco externo', unidade: 'm²', quantidade: 310, precoUnitario: 27.6, precoTotal: 8560, subitens: [], usaSubitens: false, pesoCronograma: 20, dataInicioPrevista: '2025-01-10', dataFimPrevista: '2025-01-31' },
          ],
        },
        {
          id: 'ob1-cat9', codigo: 'CAT-009', nome: 'Pisos', precoTotal: 28000, usaComposicoes: true,
          dataInicioPrevista: '2025-01-15', dataFimPrevista: '2025-02-10',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob1-c9-1', codigo: 'COMP-009-01', descricao: 'Contrapiso', unidade: 'm²', quantidade: 280, precoUnitario: 35, precoTotal: 9800, subitens: [], usaSubitens: false, pesoCronograma: 35, dataInicioPrevista: '2025-01-15', dataFimPrevista: '2025-01-25' },
            { id: 'ob1-c9-2', codigo: 'COMP-009-02', descricao: 'Porcelanato 60x60', unidade: 'm²', quantidade: 220, precoUnitario: 82.7, precoTotal: 18200, subitens: [], usaSubitens: false, pesoCronograma: 65, dataInicioPrevista: '2025-01-25', dataFimPrevista: '2025-02-10' },
          ],
        },
        {
          id: 'ob1-cat10', codigo: 'CAT-010', nome: 'Pintura', precoTotal: 22000, usaComposicoes: true,
          dataInicioPrevista: '2025-02-01', dataFimPrevista: '2025-02-20',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'José Silva',
          composicoes: [
            { id: 'ob1-c10-1', codigo: 'COMP-010-01', descricao: 'Massa corrida e lixamento', unidade: 'm²', quantidade: 580, precoUnitario: 18, precoTotal: 10440, subitens: [], usaSubitens: false, pesoCronograma: 40, dataInicioPrevista: '2025-02-01', dataFimPrevista: '2025-02-10' },
            { id: 'ob1-c10-2', codigo: 'COMP-010-02', descricao: 'Pintura acrílica interna e externa', unidade: 'm²', quantidade: 650, precoUnitario: 17.8, precoTotal: 11560, subitens: [], usaSubitens: false, pesoCronograma: 60, dataInicioPrevista: '2025-02-10', dataFimPrevista: '2025-02-20' },
          ],
        },
        {
          id: 'ob1-cat11', codigo: 'CAT-011', nome: 'Esquadrias', precoTotal: 18000, usaComposicoes: true,
          dataInicioPrevista: '2025-01-20', dataFimPrevista: '2025-02-15',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob1-c11-1', codigo: 'COMP-011-01', descricao: 'Janelas de alumínio', unidade: 'un', quantidade: 14, precoUnitario: 850, precoTotal: 11900, subitens: [], usaSubitens: false, pesoCronograma: 60, dataInicioPrevista: '2025-01-20', dataFimPrevista: '2025-02-05' },
            { id: 'ob1-c11-2', codigo: 'COMP-011-02', descricao: 'Portas internas e externas', unidade: 'un', quantidade: 12, precoUnitario: 508.3, precoTotal: 6100, subitens: [], usaSubitens: false, pesoCronograma: 40, dataInicioPrevista: '2025-02-01', dataFimPrevista: '2025-02-15' },
          ],
        },
        {
          id: 'ob1-cat12', codigo: 'CAT-012', nome: 'Louças e Metais', precoTotal: 9500, usaComposicoes: true,
          dataInicioPrevista: '2025-02-10', dataFimPrevista: '2025-02-22',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'José Silva',
          composicoes: [
            { id: 'ob1-c12-1', codigo: 'COMP-012-01', descricao: 'Vasos, pias e tanques', unidade: 'vb', quantidade: 1, precoUnitario: 6200, precoTotal: 6200, subitens: [], usaSubitens: false, pesoCronograma: 60, dataInicioPrevista: '2025-02-10', dataFimPrevista: '2025-02-18' },
            { id: 'ob1-c12-2', codigo: 'COMP-012-02', descricao: 'Torneiras, registros e acessórios', unidade: 'vb', quantidade: 1, precoUnitario: 3300, precoTotal: 3300, subitens: [], usaSubitens: false, pesoCronograma: 40, dataInicioPrevista: '2025-02-15', dataFimPrevista: '2025-02-22' },
          ],
        },
        {
          id: 'ob1-cat13', codigo: 'CAT-013', nome: 'Limpeza Final', precoTotal: 4500, usaComposicoes: true,
          dataInicioPrevista: '2025-02-22', dataFimPrevista: '2025-02-28',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob1-c13-1', codigo: 'COMP-013-01', descricao: 'Limpeza grossa e fina', unidade: 'vb', quantidade: 1, precoUnitario: 3200, precoTotal: 3200, subitens: [], usaSubitens: false, pesoCronograma: 70, dataInicioPrevista: '2025-02-22', dataFimPrevista: '2025-02-26' },
            { id: 'ob1-c13-2', codigo: 'COMP-013-02', descricao: 'Remoção de entulho final', unidade: 'vb', quantidade: 1, precoUnitario: 1300, precoTotal: 1300, subitens: [], usaSubitens: false, pesoCronograma: 30, dataInicioPrevista: '2025-02-26', dataFimPrevista: '2025-02-28' },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════
    // OBRA 2 – Edifício Comercial (planejamento)
    // ═══════════════════════════════════════════
    {
      obraId: 'ob2',
      categorias: [
        {
          id: 'ob2-cat1', codigo: 'CAT-001', nome: 'Serviços Preliminares', precoTotal: 48000, usaComposicoes: true,
          dataInicioPrevista: '2025-01-10', dataFimPrevista: '2025-02-15',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob2-c1-1', codigo: 'COMP-001-01', descricao: 'Demolição de construção existente', unidade: 'm³', quantidade: 180, precoUnitario: 85, precoTotal: 15300, subitens: [], usaSubitens: false, pesoCronograma: 35, dataInicioPrevista: '2025-01-10', dataFimPrevista: '2025-01-25' },
            { id: 'ob2-c1-2', codigo: 'COMP-001-02', descricao: 'Canteiro de obras e tapume', unidade: 'vb', quantidade: 1, precoUnitario: 18500, precoTotal: 18500, subitens: [], usaSubitens: false, pesoCronograma: 40, dataInicioPrevista: '2025-01-15', dataFimPrevista: '2025-02-05' },
            { id: 'ob2-c1-3', codigo: 'COMP-001-03', descricao: 'Sondagem e levantamento topográfico', unidade: 'vb', quantidade: 1, precoUnitario: 14200, precoTotal: 14200, subitens: [], usaSubitens: false, pesoCronograma: 25, dataInicioPrevista: '2025-01-20', dataFimPrevista: '2025-02-15' },
          ],
        },
        {
          id: 'ob2-cat2', codigo: 'CAT-002', nome: 'Fundação', precoTotal: 320000, usaComposicoes: true,
          dataInicioPrevista: '2025-02-15', dataFimPrevista: '2025-05-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob2-c2-1', codigo: 'COMP-002-01', descricao: 'Contenção e escavação subsolos', unidade: 'vb', quantidade: 1, precoUnitario: 145000, precoTotal: 145000, subitens: [], usaSubitens: false, pesoCronograma: 45, dataInicioPrevista: '2025-02-15', dataFimPrevista: '2025-04-15' },
            { id: 'ob2-c2-2', codigo: 'COMP-002-02', descricao: 'Estacas e blocos de fundação', unidade: 'vb', quantidade: 1, precoUnitario: 175000, precoTotal: 175000, subitens: [], usaSubitens: false, pesoCronograma: 55, dataInicioPrevista: '2025-03-15', dataFimPrevista: '2025-05-30' },
          ],
        },
        {
          id: 'ob2-cat3', codigo: 'CAT-003', nome: 'Estrutura', precoTotal: 850000, usaComposicoes: true,
          dataInicioPrevista: '2025-05-01', dataFimPrevista: '2025-12-31',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0, responsavel: 'Carlos Mendes',
          composicoes: [
            { id: 'ob2-c3-1', codigo: 'COMP-003-01', descricao: 'Estrutura de concreto armado - subsolos', unidade: 'vb', quantidade: 1, precoUnitario: 280000, precoTotal: 280000, subitens: [], usaSubitens: false, pesoCronograma: 30, dataInicioPrevista: '2025-05-01', dataFimPrevista: '2025-07-31' },
            { id: 'ob2-c3-2', codigo: 'COMP-003-02', descricao: 'Estrutura de concreto armado - pavimentos tipo', unidade: 'vb', quantidade: 1, precoUnitario: 420000, precoTotal: 420000, subitens: [], usaSubitens: false, pesoCronograma: 50, dataInicioPrevista: '2025-07-01', dataFimPrevista: '2025-11-30' },
            { id: 'ob2-c3-3', codigo: 'COMP-003-03', descricao: 'Estrutura cobertura e reservatórios', unidade: 'vb', quantidade: 1, precoUnitario: 150000, precoTotal: 150000, subitens: [], usaSubitens: false, pesoCronograma: 20, dataInicioPrevista: '2025-11-01', dataFimPrevista: '2025-12-31' },
          ],
        },
        {
          id: 'ob2-cat4', codigo: 'CAT-004', nome: 'Alvenaria', precoTotal: 210000, usaComposicoes: true,
          dataInicioPrevista: '2025-09-01', dataFimPrevista: '2026-02-28',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c4-1', codigo: 'COMP-004-01', descricao: 'Alvenaria de vedação em bloco', unidade: 'm²', quantidade: 2800, precoUnitario: 75, precoTotal: 210000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2025-09-01', dataFimPrevista: '2026-02-28' },
          ],
        },
        {
          id: 'ob2-cat5', codigo: 'CAT-006', nome: 'Instalações Elétricas', precoTotal: 185000, usaComposicoes: true,
          dataInicioPrevista: '2025-10-01', dataFimPrevista: '2026-04-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c5-1', codigo: 'COMP-006-01', descricao: 'Instalações elétricas gerais', unidade: 'vb', quantidade: 1, precoUnitario: 185000, precoTotal: 185000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2025-10-01', dataFimPrevista: '2026-04-30' },
          ],
        },
        {
          id: 'ob2-cat6', codigo: 'CAT-007', nome: 'Instalações Hidráulicas', precoTotal: 120000, usaComposicoes: true,
          dataInicioPrevista: '2025-10-01', dataFimPrevista: '2026-04-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c6-1', codigo: 'COMP-007-01', descricao: 'Instalações hidrossanitárias completas', unidade: 'vb', quantidade: 1, precoUnitario: 120000, precoTotal: 120000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2025-10-01', dataFimPrevista: '2026-04-30' },
          ],
        },
        {
          id: 'ob2-cat7', codigo: 'CAT-008', nome: 'Revestimentos', precoTotal: 280000, usaComposicoes: true,
          dataInicioPrevista: '2026-01-15', dataFimPrevista: '2026-04-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c7-1', codigo: 'COMP-008-01', descricao: 'Revestimentos internos e fachada', unidade: 'vb', quantidade: 1, precoUnitario: 280000, precoTotal: 280000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2026-01-15', dataFimPrevista: '2026-04-30' },
          ],
        },
        {
          id: 'ob2-cat8', codigo: 'CAT-010', nome: 'Pintura', precoTotal: 95000, usaComposicoes: true,
          dataInicioPrevista: '2026-04-01', dataFimPrevista: '2026-05-31',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c8-1', codigo: 'COMP-010-01', descricao: 'Pintura geral interna e externa', unidade: 'vb', quantidade: 1, precoUnitario: 95000, precoTotal: 95000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2026-04-01', dataFimPrevista: '2026-05-31' },
          ],
        },
        {
          id: 'ob2-cat9', codigo: 'CAT-013', nome: 'Limpeza Final', precoTotal: 15000, usaComposicoes: true,
          dataInicioPrevista: '2026-06-01', dataFimPrevista: '2026-06-30',
          statusCronograma: 'nao_iniciada', percentualCronograma: 0,
          composicoes: [
            { id: 'ob2-c9-1', codigo: 'COMP-013-01', descricao: 'Limpeza geral e entrega', unidade: 'vb', quantidade: 1, precoUnitario: 15000, precoTotal: 15000, subitens: [], usaSubitens: false, pesoCronograma: 100, dataInicioPrevista: '2026-06-01', dataFimPrevista: '2026-06-30' },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════
    // OBRA 3 – Clínica concluída (100%)
    // ═══════════════════════════════════════════
    {
      obraId: 'ob3',
      categorias: [
        {
          id: 'ob3-cat1', codigo: 'CAT-001', nome: 'Serviços Preliminares', precoTotal: 6800, usaComposicoes: true,
          dataInicioPrevista: '2023-06-01', dataFimPrevista: '2023-06-15',
          dataInicioReal: '2023-06-01', dataFimReal: '2023-06-14',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c1-1', codigo: 'COMP-001-01', descricao: 'Proteção de áreas existentes', unidade: 'vb', quantidade: 1, precoUnitario: 3200, precoTotal: 3200, subitens: [], usaSubitens: false, pesoCronograma: 50, concluida: true, dataInicioPrevista: '2023-06-01', dataFimPrevista: '2023-06-08', dataInicioReal: '2023-06-01', dataFimReal: '2023-06-07' },
            { id: 'ob3-c1-2', codigo: 'COMP-001-02', descricao: 'Demolição de divisórias e forros existentes', unidade: 'vb', quantidade: 1, precoUnitario: 3600, precoTotal: 3600, subitens: [], usaSubitens: false, pesoCronograma: 50, concluida: true, dataInicioPrevista: '2023-06-05', dataFimPrevista: '2023-06-15', dataInicioReal: '2023-06-05', dataFimReal: '2023-06-14' },
          ],
        },
        {
          id: 'ob3-cat2', codigo: 'CAT-006', nome: 'Instalações Elétricas', precoTotal: 18500, usaComposicoes: true,
          dataInicioPrevista: '2023-06-15', dataFimPrevista: '2023-08-15',
          dataInicioReal: '2023-06-16', dataFimReal: '2023-08-10',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c2-1', codigo: 'COMP-006-01', descricao: 'Nova rede elétrica e quadro de distribuição', unidade: 'vb', quantidade: 1, precoUnitario: 12500, precoTotal: 12500, subitens: [], usaSubitens: false, pesoCronograma: 65, concluida: true, dataInicioPrevista: '2023-06-15', dataFimPrevista: '2023-07-30', dataInicioReal: '2023-06-16', dataFimReal: '2023-07-28' },
            { id: 'ob3-c2-2', codigo: 'COMP-006-02', descricao: 'Iluminação LED e pontos de dados', unidade: 'vb', quantidade: 1, precoUnitario: 6000, precoTotal: 6000, subitens: [], usaSubitens: false, pesoCronograma: 35, concluida: true, dataInicioPrevista: '2023-07-15', dataFimPrevista: '2023-08-15', dataInicioReal: '2023-07-18', dataFimReal: '2023-08-10' },
          ],
        },
        {
          id: 'ob3-cat3', codigo: 'CAT-007', nome: 'Instalações Hidráulicas', precoTotal: 14200, usaComposicoes: true,
          dataInicioPrevista: '2023-06-15', dataFimPrevista: '2023-08-15',
          dataInicioReal: '2023-06-16', dataFimReal: '2023-08-12',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c3-1', codigo: 'COMP-007-01', descricao: 'Água fria e esgoto - consultórios e banheiros', unidade: 'vb', quantidade: 1, precoUnitario: 14200, precoTotal: 14200, subitens: [], usaSubitens: false, pesoCronograma: 100, concluida: true, dataInicioPrevista: '2023-06-15', dataFimPrevista: '2023-08-15', dataInicioReal: '2023-06-16', dataFimReal: '2023-08-12' },
          ],
        },
        {
          id: 'ob3-cat4', codigo: 'CAT-004', nome: 'Alvenaria', precoTotal: 12000, usaComposicoes: true,
          dataInicioPrevista: '2023-07-01', dataFimPrevista: '2023-08-30',
          dataInicioReal: '2023-07-03', dataFimReal: '2023-08-25',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c4-1', codigo: 'COMP-004-01', descricao: 'Novas divisórias em drywall e alvenaria', unidade: 'm²', quantidade: 185, precoUnitario: 64.9, precoTotal: 12000, subitens: [], usaSubitens: false, pesoCronograma: 100, concluida: true, dataInicioPrevista: '2023-07-01', dataFimPrevista: '2023-08-30', dataInicioReal: '2023-07-03', dataFimReal: '2023-08-25' },
          ],
        },
        {
          id: 'ob3-cat5', codigo: 'CAT-008', nome: 'Revestimentos', precoTotal: 28000, usaComposicoes: true,
          dataInicioPrevista: '2023-08-20', dataFimPrevista: '2023-10-15',
          dataInicioReal: '2023-08-22', dataFimReal: '2023-10-12',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c5-1', codigo: 'COMP-008-01', descricao: 'Revestimento cerâmico - áreas molhadas', unidade: 'm²', quantidade: 95, precoUnitario: 115, precoTotal: 10925, subitens: [], usaSubitens: false, pesoCronograma: 40, concluida: true, dataInicioPrevista: '2023-08-20', dataFimPrevista: '2023-09-15', dataInicioReal: '2023-08-22', dataFimReal: '2023-09-14' },
            { id: 'ob3-c5-2', codigo: 'COMP-008-02', descricao: 'Forro de gesso e sancas', unidade: 'm²', quantidade: 420, precoUnitario: 40.7, precoTotal: 17075, subitens: [], usaSubitens: false, pesoCronograma: 60, concluida: true, dataInicioPrevista: '2023-09-01', dataFimPrevista: '2023-10-15', dataInicioReal: '2023-09-03', dataFimReal: '2023-10-12' },
          ],
        },
        {
          id: 'ob3-cat6', codigo: 'CAT-009', nome: 'Pisos', precoTotal: 22500, usaComposicoes: true,
          dataInicioPrevista: '2023-09-15', dataFimPrevista: '2023-10-30',
          dataInicioReal: '2023-09-18', dataFimReal: '2023-10-28',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c6-1', codigo: 'COMP-009-01', descricao: 'Porcelanato técnico 80x80 polido', unidade: 'm²', quantidade: 350, precoUnitario: 64.3, precoTotal: 22500, subitens: [], usaSubitens: false, pesoCronograma: 100, concluida: true, dataInicioPrevista: '2023-09-15', dataFimPrevista: '2023-10-30', dataInicioReal: '2023-09-18', dataFimReal: '2023-10-28' },
          ],
        },
        {
          id: 'ob3-cat7', codigo: 'CAT-010', nome: 'Pintura', precoTotal: 15800, usaComposicoes: true,
          dataInicioPrevista: '2023-10-20', dataFimPrevista: '2023-11-20',
          dataInicioReal: '2023-10-22', dataFimReal: '2023-11-18',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c7-1', codigo: 'COMP-010-01', descricao: 'Pintura acrílica acetinada - paredes e teto', unidade: 'm²', quantidade: 680, precoUnitario: 16.5, precoTotal: 11220, subitens: [], usaSubitens: false, pesoCronograma: 70, concluida: true, dataInicioPrevista: '2023-10-20', dataFimPrevista: '2023-11-10', dataInicioReal: '2023-10-22', dataFimReal: '2023-11-08' },
            { id: 'ob3-c7-2', codigo: 'COMP-010-02', descricao: 'Pintura epóxi - áreas molhadas', unidade: 'm²', quantidade: 76, precoUnitario: 60.3, precoTotal: 4580, subitens: [], usaSubitens: false, pesoCronograma: 30, concluida: true, dataInicioPrevista: '2023-11-05', dataFimPrevista: '2023-11-20', dataInicioReal: '2023-11-06', dataFimReal: '2023-11-18' },
          ],
        },
        {
          id: 'ob3-cat8', codigo: 'CAT-011', nome: 'Esquadrias', precoTotal: 16000, usaComposicoes: true,
          dataInicioPrevista: '2023-11-01', dataFimPrevista: '2023-11-30',
          dataInicioReal: '2023-11-02', dataFimReal: '2023-11-28',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c8-1', codigo: 'COMP-011-01', descricao: 'Portas de consultórios com isolamento acústico', unidade: 'un', quantidade: 8, precoUnitario: 1250, precoTotal: 10000, subitens: [], usaSubitens: false, pesoCronograma: 60, concluida: true, dataInicioPrevista: '2023-11-01', dataFimPrevista: '2023-11-20', dataInicioReal: '2023-11-02', dataFimReal: '2023-11-18' },
            { id: 'ob3-c8-2', codigo: 'COMP-011-02', descricao: 'Vidros e divisórias de recepção', unidade: 'vb', quantidade: 1, precoUnitario: 6000, precoTotal: 6000, subitens: [], usaSubitens: false, pesoCronograma: 40, concluida: true, dataInicioPrevista: '2023-11-10', dataFimPrevista: '2023-11-30', dataInicioReal: '2023-11-12', dataFimReal: '2023-11-28' },
          ],
        },
        {
          id: 'ob3-cat9', codigo: 'CAT-012', nome: 'Louças e Metais', precoTotal: 8500, usaComposicoes: true,
          dataInicioPrevista: '2023-11-20', dataFimPrevista: '2023-12-10',
          dataInicioReal: '2023-11-22', dataFimReal: '2023-12-08',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c9-1', codigo: 'COMP-012-01', descricao: 'Louças e metais sanitários', unidade: 'vb', quantidade: 1, precoUnitario: 8500, precoTotal: 8500, subitens: [], usaSubitens: false, pesoCronograma: 100, concluida: true, dataInicioPrevista: '2023-11-20', dataFimPrevista: '2023-12-10', dataInicioReal: '2023-11-22', dataFimReal: '2023-12-08' },
          ],
        },
        {
          id: 'ob3-cat10', codigo: 'CAT-013', nome: 'Limpeza Final', precoTotal: 3500, usaComposicoes: true,
          dataInicioPrevista: '2023-12-10', dataFimPrevista: '2023-12-20',
          dataInicioReal: '2023-12-11', dataFimReal: '2023-12-18',
          statusCronograma: 'concluida', percentualCronograma: 100, responsavel: 'Ricardo Ferreira',
          composicoes: [
            { id: 'ob3-c10-1', codigo: 'COMP-013-01', descricao: 'Limpeza final e entrega ao cliente', unidade: 'vb', quantidade: 1, precoUnitario: 3500, precoTotal: 3500, subitens: [], usaSubitens: false, pesoCronograma: 100, concluida: true, dataInicioPrevista: '2023-12-10', dataFimPrevista: '2023-12-20', dataInicioReal: '2023-12-11', dataFimReal: '2023-12-18' },
          ],
        },
      ],
    },
  ];
}
