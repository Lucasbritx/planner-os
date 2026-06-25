# Weekly OS

Planner pessoal centrado na semana para reunir calendário, objetivos, estudos, leitura, POCs, treinos e revisão semanal.

## Stack

Next.js 16 com App Router, React 19, TypeScript, Tailwind CSS 4, componentes no padrão shadcn/ui, Radix UI e dados mockados em memória.

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

## Arquitetura

- `src/app`: rotas do App Router.
- `src/components/planner-app.tsx`: shell e módulos de interface do MVP.
- `src/lib/store.tsx`: estado em memória e operações CRUD.
- `src/lib/types.ts`: contratos das entidades.
- `src/data/mock-data.ts`: dados iniciais.
- `src/lib/workout-suggestions.ts`: sugestões locais explicáveis.

Os dados são restaurados ao recarregar a página. Esta é uma decisão intencional: Supabase será a próxima camada de persistência.

## Onde editar os mocks

Edite [`src/data/mock-data.ts`](src/data/mock-data.ts). A interface não importa os mocks diretamente; ela consome o `PlannerProvider`.

## Próximos passos — Supabase

1. Criar projeto, migrations e enums.
2. Modelar tabelas com `user_id` e relacionamentos.
3. Configurar Auth e RLS.
4. Criar um `SupabasePlannerRepository`.
5. Trocar a composição de dados do provider, mantendo as páginas.
6. Migrar os mocks para seeds.

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
- [ ] Persistência e autenticação Supabase
- [ ] Google Calendar
- [ ] GitHub
- [ ] Garmin
- [ ] Internacionalização completa
