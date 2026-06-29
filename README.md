# Weekly OS

Planner pessoal centrado na semana para reunir calendário, objetivos, estudos, leitura, POCs, treinos e revisão semanal.

## Stack

Next.js 16 com App Router, React 19, TypeScript, Tailwind CSS 4, componentes no padrão shadcn/ui, Radix UI e Supabase para Auth/persistência.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Verificações:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Configuração Supabase

Crie um `.env.local` local, sem commitar:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

O projeto já possui:

- Auth por e-mail/senha e Google OAuth preparado.
- Clients Supabase para browser/server.
- Proxy de sessão para proteger as rotas do planner.
- Migration inicial em `supabase/migrations/20260625000100_initial_planner_schema.sql`.
- RLS por usuário em todas as tabelas públicas do planner.
- Repository Supabase com mappers entre banco e modelo da UI.

Guia detalhado: [`docs/supabase-migration-guide.md`](docs/supabase-migration-guide.md).

Para aplicar o schema no projeto real:

1. Abra o Supabase Dashboard do projeto.
2. Vá em SQL Editor.
3. Cole e execute o conteúdo de `supabase/migrations/20260625000100_initial_planner_schema.sql`.
4. Opcionalmente, execute `supabase/tests/rls_and_constraints.sql` em ambiente local/CI com pgTAP habilitado.

Alternativa via CLI, se você estiver autenticado:

```bash
supabase link --project-ref ngiymudusqrfsumqxoji
supabase db push
```

No painel de Auth:

- Desative confirmação de e-mail se quiser acesso imediato no MVP.
- Configure Google Provider com Client ID/Secret.
- Adicione redirect/callback URLs:
  - `http://localhost:3000/auth/callback`
  - URL de produção futura + `/auth/callback`

## Arquitetura

- `src/app`: rotas do App Router.
- `src/components/planner-app.tsx`: shell e módulos de interface do MVP.
- `src/lib/store.tsx`: estado client-side com snapshot inicial e mutações otimistas.
- `src/lib/planner/supabase-repository.ts`: data access Supabase/RLS.
- `src/lib/planner/mappers.ts`: mapeamento snake_case ↔ camelCase.
- `src/lib/supabase`: clients, env e tipos do banco.
- `src/lib/types.ts`: contratos das entidades.
- `src/data/mock-data.ts`: dados iniciais.
- `src/lib/workout-suggestions.ts`: sugestões locais explicáveis.

Com Supabase configurado e migration aplicada, os dados passam a ser carregados no servidor e persistidos via Route Handlers.

## Onde editar os mocks

Edite [`src/data/mock-data.ts`](src/data/mock-data.ts). A interface não importa os mocks diretamente; ela consome o `PlannerProvider`.

## Próximos passos — Supabase

1. Aplicar a migration no projeto real.
2. Testar signup/login/logout com e-mail e senha.
3. Configurar Google OAuth no Supabase e Google Cloud.
4. Ajustar seed/import inicial para criar dados reais do usuário.
5. Refinar rollback visual quando uma mutação falhar.

## Google Calendar

Adicionar OAuth, selecionar calendários, mapear eventos externos para timeboxes e armazenar IDs externos para sincronização incremental e resolução de conflitos.

## GitHub

Vincular a conta por OAuth/GitHub App, associar repositórios às POCs e exibir atividade, issues e pull requests relevantes para a semana.

## Garmin

Validar disponibilidade da API oficial para conta pessoal, importar atividades concluídas e conciliá-las com treinos planejados. Sugestões continuarão organizacionais, não médicas.

## Roadmap

- [x] MVP visual e navegação
- [x] CRUD essencial em memória
- [x] Dashboard, calendário, estudos, livros, POCs, treinos e revisão
- [x] Dark mode e layout responsivo
- [x] Persistência e autenticação Supabase preparadas no código
- [ ] Migration aplicada e validada no projeto Supabase real
- [ ] Google Calendar
- [ ] GitHub
- [ ] Garmin
- [ ] Internacionalização completa
