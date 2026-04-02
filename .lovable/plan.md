

## Plano: Adicionar visualização Gantt na aba Cronograma da página de detalhe da obra

### O que será feito
Na página de resumo da obra (`ObraDetalhePage.tsx`), dentro da aba "Cronograma", adicionar um toggle (Lista / Gantt) para alternar entre a visualização atual em lista e um gráfico de Gantt embutido.

### Alterações

**Arquivo: `src/pages/ObraDetalhePage.tsx`**

1. Adicionar estado `cronogramaView` (`'lista' | 'gantt'`) com `useState`
2. Importar `ToggleGroup`/`ToggleGroupItem` de `@/components/ui/toggle-group`, ícones `List` e `BarChart3` do Lucide, e utilitários de data (`parseISO`, `differenceInDays`, `format`, `isBefore`) do `date-fns` com locale `ptBR`
3. Importar `cn` de `@/lib/utils`
4. Na `TabsContent` de cronograma, antes da listagem, inserir o toggle de visualização
5. Renderizar condicionalmente: se `lista`, manter o código atual; se `gantt`, renderizar um mini Gantt inline (reutilizando a mesma lógica já existente em `CronogramaPage.tsx` — barras previsto/real com marcadores de mês)

O Gantt será implementado diretamente no componente (sem extrair para arquivo separado) dado que é uma versão simplificada read-only. Usa a mesma lógica de cálculo de barras e status da `CronogramaPage`.

### Detalhes técnicos
- O `computeStatus` será definido localmente (mesmo cálculo simples: verifica datas reais vs previstas)
- Barras: previsto (azul claro, topo) e real (verde/vermelho/azul, abaixo)
- Marcadores de mês no cabeçalho
- Legenda com cores ao final
- Responsivo: nomes das categorias com `w-[180px]` truncado, área do gráfico com scroll horizontal

