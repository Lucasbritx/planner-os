# Weekly OS Project Tracker

Última atualização: 26 de junho de 2026.

## Estado atual

MVP funcional com integração Supabase preparada no código. Falta aplicar a migration no projeto Supabase real e validar o fluxo autenticado ponta a ponta.

## Critérios de sucesso do MVP

- [x] Dashboard semanal como central de execução
- [x] Sidebar e navegação responsiva
- [x] Calendário semanal com criação manual
- [x] Progresso de estudos e leitura
- [x] Repositório de POCs com checklist
- [x] Planejamento e registro de treinos
- [x] Sugestões locais transparentes
- [x] Revisão semanal
- [x] Dark mode
- [x] Teste unitário, lint, tipos e build
- [x] Auth/persistência Supabase preparados no código

## Concluído

- [x] Arquitetura inicial e tipos
- [x] Mocks isolados
- [x] Estado por sessão
- [x] Páginas principais
- [x] README e plano de integrações
- [x] Schema Supabase inicial
- [x] RLS por usuário
- [x] Auth e proxy de sessão
- [x] Repository Supabase e mappers
- [x] Provider conectado a snapshot server-side e Route Handlers

## Em andamento

- [ ] Aplicar migration no Supabase real
- [ ] Validar signup/login/logout no navegador
- [ ] Validar persistência após reload com usuário real
- [ ] Validar uso diário e ajustar densidade da interface
- [ ] Expandir formulários de criação/edição de todos os módulos

## Backlog pós-MVP

- [ ] Filtros e busca
- [ ] Histórico entre semanas
- [ ] Visões diária e mensal avançadas
- [ ] Notificações
- [ ] Avaliação de POCs por IA

## Integrações

### Supabase

- [x] Schema e migrations
- [x] Auth
- [x] RLS
- [x] Repository Supabase
- [ ] Migration aplicada no projeto remoto
- [ ] Google OAuth configurado no provider externo
- [ ] Seeds

Guia de aplicação futura: `docs/supabase-migration-guide.md`.

### Google Calendar

- [ ] OAuth
- [ ] Leitura e seleção de calendários
- [ ] Sincronização incremental
- [ ] Conflitos

### GitHub

- [ ] OAuth/GitHub App
- [ ] Repositórios vinculados
- [ ] Issues, PRs e atividade

### Garmin

- [ ] Validar acesso oficial
- [ ] Importar atividades
- [ ] Conciliar planejado x realizado

## Decisões registradas

- Semana configurável; domingo é o padrão.
- Interface começa em português com caminho para inglês.
- MVP não usa `localStorage`.
- Supabase é a próxima etapa.
- Supabase agora é a camada de persistência planejada; mocks ficam como fallback/desenvolvimento.
- Sugestões de treino usam regras locais e não substituem orientação profissional.

## Riscos e perguntas abertas

- Disponibilidade e termos da integração Garmin.
- Estratégia de conflitos do Google Calendar.
- Granularidade ideal dos registros de leitura.
- Como tratar rollback visual de mutações otimistas em caso de erro de rede/RLS.

## Changelog

- 2026-06-25 — MVP inicial preparado.
- 2026-06-26 — Integração Supabase preparada: schema, RLS, Auth, SSR clients, repository e persistência via Route Handlers.
