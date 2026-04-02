
# Plano de Evolução para SaaS Multiempresa

## Fase 1 — Modelagem de Dados (Migração SQL)

Criar as seguintes tabelas novas no banco:

### `plans` — Planos do sistema
- `id`, `slug` (start/pro/enterprise), `nome_comercial`, `descricao`, `limite_obras`, `limite_gestores`, `limite_funcionarios`, `limite_clientes`, `ilimitado` (boolean), `ativo`, `created_at`, `updated_at`
- Seed com os 3 planos: Start, Pro, Enterprise

### `companies` — Empresas
- `id`, `nome`, `cnpj`, `email`, `telefone`, `plan_id`, `status` (ativo/inativo/suspenso/teste), `created_at`, `updated_at`

### `subscriptions` — Assinaturas
- `id`, `company_id`, `plan_id`, `status` (trial/active/overdue/canceled/suspended), `ciclo` (mensal/anual), `data_inicio`, `data_vencimento`, `valor_base`, `moeda`, `gateway_id`, `trial_start`, `trial_end`, `observacoes`, `created_at`, `updated_at`

### `subscription_extras` — Extras futuros
- `id`, `subscription_id`, `tipo` (usuario_extra/obra_extra/modulo_premium), `descricao`, `quantidade`, `valor_unitario`, `created_at`

### Alterações em tabelas existentes:
- `profiles` → adicionar `company_id`, `status` (ativo/inativo)
- `obras` → adicionar `company_id`
- `user_roles` → adicionar `company_id`
- Adicionar role `admin` ao enum `app_role`

### RLS — Row Level Security
- Todas as tabelas filtradas por `company_id` do usuário autenticado
- Função `get_user_company_id()` SECURITY DEFINER para consultas RLS
- Função `is_platform_admin()` para admin global
- Admin global pode ver/editar tudo

## Fase 2 — Lógica de Limites (Backend)

- Criar função SQL `check_plan_limit(company_id, resource_type)` que retorna se o limite foi atingido
- Edge function `check-limits` para validação antes de criar obra/usuário
- Ou validação client-side consultando contagens + plano

## Fase 3 — Código Frontend

### Contexto `CompanyContext`
- Carregar empresa do usuário logado
- Expor plano atual, limites e contagens
- Hook `usePlanLimits()` para checar limites antes de ações

### Onboarding
- Após signup, fluxo de criar/vincular empresa
- Escolha de plano
- Criação do primeiro gestor

### Controle de acesso
- Validar limites ao criar obra, convidar usuário
- Mensagens amigáveis de limite atingido
- Sugestão de upgrade

### Área Admin Global
- Página `/admin` protegida por role `admin`
- Listar empresas, planos, assinaturas
- Alterar plano, suspender empresa
- Ver uso atual (obras, usuários por role)

## Fase 4 — Migração de Dados Existentes
- Criar empresa padrão para dados existentes
- Vincular obras e usuários existentes à empresa
- Seed de dados de teste com a nova estrutura

## Ordem de execução
1. Migração SQL (tabelas + RLS + seeds)
2. Atualizar contextos e hooks
3. Onboarding e fluxo de empresa
4. Controle de limites no frontend
5. Área admin global
6. Migração dos dados existentes
7. Atualizar seed-users edge function
