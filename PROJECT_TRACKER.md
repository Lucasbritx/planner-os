# Weekly OS Project Tracker

Última atualização: 25 de junho de 2026.

## Estado atual

MVP funcional em memória, pronto para validação local e para receber Supabase.

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

## Concluído

- [x] Arquitetura inicial e tipos
- [x] Mocks isolados
- [x] Estado por sessão
- [x] Páginas principais
- [x] README e plano de integrações

## Em andamento

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

- [ ] Schema e migrations
- [ ] Auth
- [ ] RLS
- [ ] Repository Supabase
- [ ] Seeds

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
- Sugestões de treino usam regras locais e não substituem orientação profissional.

## Riscos e perguntas abertas

- Disponibilidade e termos da integração Garmin.
- Estratégia de conflitos do Google Calendar.
- Granularidade ideal dos registros de leitura.

## Changelog

- 2026-06-25 — MVP inicial preparado.
