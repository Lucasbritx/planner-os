# Weekly OS — Design da Integração Supabase

## Objetivo

Substituir o estado exclusivamente em memória do Weekly OS por autenticação e persistência no Supabase, preservando a experiência atual e a separação entre interface e acesso a dados.

A entrega inclui:

- cadastro público por e-mail e senha;
- login com e-mail e senha;
- login com Google;
- acesso imediato no cadastro por e-mail, sem confirmação;
- sessão SSR baseada em cookies;
- rotas privadas;
- persistência de todas as entidades do planner;
- isolamento por usuário com Row Level Security;
- criação automática de perfil, preferências padrão e semana atual vazia;
- migrations versionadas;
- documentação da configuração externa.

O acesso ao Google Calendar não faz parte desta entrega. Ele será solicitado posteriormente por consentimento progressivo e escopos próprios.

## Decisões confirmadas

- A arquitetura usa SSR com `@supabase/ssr`.
- E-mail/senha e Google OAuth estarão disponíveis.
- Cadastro será público.
- Confirmação de e-mail ficará desativada no painel Supabase.
- Contas novas começam com uma semana atual vazia.
- O primeiro dia da semana padrão será domingo.
- O fuso padrão será `America/Sao_Paulo`.
- Mocks não serão inseridos em contas reais.
- Google Calendar será uma conexão separada.
- URL e chave publishable ficarão em variáveis públicas do Next.js.
- Chaves `service_role` não serão usadas pelo cliente.

## Configuração

Variáveis locais:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

O arquivo `.env.example` contém apenas os nomes. `.env.local` não será versionado.

O Supabase Dashboard deverá ter:

- cadastro por e-mail habilitado;
- confirmação de e-mail desabilitada;
- provider Google habilitado;
- Site URL e Redirect URLs para desenvolvimento e produção.

O Google Cloud deverá ter:

- projeto OAuth;
- tela de consentimento;
- Client ID e Client Secret de aplicação web;
- origem local e de produção;
- callback URL fornecida pelo Supabase.

Nesta etapa, o provider Google usará somente `openid`, perfil e e-mail.

## Arquitetura da aplicação

### Clientes Supabase

Serão criados módulos separados:

- cliente browser para eventos iniciados no navegador;
- cliente server para Server Components, Route Handlers e Server Actions;
- atualização de cookies no `proxy.ts`, conforme o modelo SSR atual do Next.js e Supabase.

Nenhum módulo server-only poderá ser importado por Client Components.

### Autenticação

Rotas públicas:

- `/login`;
- `/signup`;
- `/auth/callback`;
- página de erro de autenticação.

Rotas privadas:

- dashboard;
- calendário;
- estudos;
- livros;
- POCs;
- treinos;
- revisão.

Fluxos:

- e-mail/senha usa `signInWithPassword`;
- cadastro usa `signUp`;
- Google usa `signInWithOAuth` com PKCE e callback;
- callback troca o código pela sessão e redireciona ao dashboard;
- logout invalida a sessão e volta ao login.

Redirecionamentos `next` aceitarão somente caminhos relativos para impedir open redirects.

### Dados

O `PlannerProvider` deixará de inicializar pelos mocks. Ele receberá um snapshot carregado no servidor e executará mutações através de um `SupabasePlannerRepository`.

O repositório será responsável por:

- converter snake_case do banco para camelCase do domínio;
- criar, atualizar e remover registros;
- carregar todos os dados do usuário;
- obter ou criar a semana correspondente;
- normalizar erros do Supabase.

A interface não chamará `supabase.from(...)` diretamente.

Atualização otimista será usada apenas em ações reversíveis e simples, como marcar um item concluído. Formulários aguardarão confirmação do banco antes de fechar.

## Schema

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `name text`
- `email text`
- `locale text not null default 'pt-BR'`
- `timezone text not null default 'America/Sao_Paulo'`
- `week_starts_on smallint not null default 0`
- `theme text not null default 'system'`
- timestamps

Constraints limitarão locale, primeiro dia e tema aos valores aceitos.

### `weeks`

- `id uuid primary key`
- `user_id uuid not null`
- `start_date date not null`
- `end_date date not null`
- `title text not null`
- `status text not null`
- timestamps

Haverá unicidade por usuário e início da semana.

### `weekly_goals`

- `id uuid primary key`
- `user_id uuid not null`
- `week_id uuid not null`
- título, categoria, status e prioridade
- timestamps

### `timeboxes`

- `id uuid primary key`
- `user_id uuid not null`
- `week_id uuid not null`
- título, data, horários, categoria
- timestamps

Uma constraint garante `end_time > start_time`.

### `study_items`

- `id uuid primary key`
- `user_id uuid not null`
- `week_id uuid nullable`
- título, tópico, tipo, minutos estimados/concluídos, status
- `checklist jsonb not null default '[]'`
- timestamps

Minutos não poderão ser negativos.

### `books`

- `id uuid primary key`
- `user_id uuid not null`
- título, autor, páginas totais/atuais, meta semanal, status
- timestamps

`current_page` ficará entre zero e `total_pages`.

### `reading_logs`

- `id uuid primary key`
- `user_id uuid not null`
- `book_id uuid not null`
- `week_id uuid nullable`
- data e páginas lidas
- timestamps

### `pocs`

- `id uuid primary key`
- `user_id uuid not null`
- título, descrição, objetivo, URL do repositório e status
- `stack text[] not null default '{}'`
- `scope_checklist jsonb not null default '[]'`
- `ai_evaluation text nullable`
- timestamps

### `workouts`

- `id uuid primary key`
- `user_id uuid not null`
- `week_id uuid not null`
- tipo, data planejada, duração, distância, intensidade e status
- timestamps

Valores numéricos não poderão ser negativos.

### `weekly_reviews`

- `id uuid primary key`
- `user_id uuid not null`
- `week_id uuid not null unique`
- textos da revisão e quatro notas
- timestamps

Notas ficarão entre 1 e 10.

### Credenciais futuras

Uma tabela privada para conexões externas será criada somente quando Google Calendar for implementado. Tokens OAuth não ficarão em tabelas diretamente acessíveis pelo cliente.

## Integridade e ownership

Todas as tabelas de dados terão `user_id`.

Chaves estrangeiras compostas ou triggers garantirão que registros relacionados pertençam ao mesmo usuário. Não será suficiente confiar apenas no valor enviado pelo cliente.

Entidades semanais serão removidas em cascata ao excluir uma semana. Livros removerão seus registros de leitura em cascata.

Campos `updated_at` serão atualizados por trigger.

## RLS

RLS será habilitada em todas as tabelas públicas.

Políticas de `select`, `insert`, `update` e `delete` usarão:

```sql
(select auth.uid()) = user_id
```

Para inserts, `with check` também exigirá ownership.

`profiles.id` usará `auth.uid()` diretamente.

As colunas usadas pelas policies terão índices.

## Bootstrap de novo usuário

Um trigger após inserção em `auth.users` criará:

- perfil com nome e e-mail do metadata;
- preferências padrão;
- semana atual vazia, iniciada no domingo em `America/Sao_Paulo`.

O trigger será `security definer`, terá `search_path` fixo e permissões mínimas.

O repositório também terá uma operação idempotente de garantia da semana atual, usada caso preferências mudem ou o usuário avance para uma nova semana.

## Interface

### Login e cadastro

As telas terão:

- e-mail;
- senha;
- confirmação de senha no cadastro;
- botão Google;
- links entre login e cadastro;
- mensagens claras de erro;
- estado de envio;
- layout coerente com o design atual.

### App autenticado

A sidebar mostrará nome/e-mail do usuário e ação de logout.

Estados necessários:

- carregamento inicial;
- erro de rede com tentativa novamente;
- semana vazia com ações de criação;
- salvamento em andamento;
- erro de mutação com rollback quando houver atualização otimista.

## Testes

### TypeScript e unidade

- mapeamento banco ↔ domínio;
- cálculo de semana conforme preferência;
- normalização de erros;
- validação de redirecionamento relativo.

### Componentes

- login por senha;
- cadastro;
- início do Google OAuth;
- logout;
- estados de erro e carregamento.

### Repositório

- leitura de snapshot;
- create/update/delete;
- semana criada idempotentemente;
- filtros sempre incluem usuário implicitamente por RLS.

### Banco

Testes SQL validarão:

- usuário A não lê dados de B;
- usuário A não atualiza ou remove dados de B;
- usuário não cria registro com ownership de outro;
- constraints de notas, páginas, minutos e horários;
- bootstrap do usuário.

### Verificação final

- testes;
- lint;
- typecheck;
- build;
- login e cadastro por e-mail;
- login Google após configuração externa;
- persistência após recarregar;
- logout;
- inspeção desktop/mobile.

## Documentação

O README explicará:

- criação do projeto Supabase;
- variáveis;
- aplicação de migrations;
- desativação da confirmação de e-mail;
- configuração Google;
- URLs de callback;
- execução local;
- solução de problemas.

O tracker marcará cada item da integração e manterá Google Calendar como fase separada.

## Critérios de aceite

- Usuário cria conta e entra imediatamente por e-mail/senha.
- Usuário entra com Google após configurar o provider.
- Rotas privadas não abrem sem sessão.
- Conta nova possui perfil, preferências e semana vazia.
- CRUD persiste após recarregar.
- Dados de usuários diferentes permanecem isolados.
- Logout funciona.
- Migrations são reproduzíveis.
- Nenhuma chave privilegiada é exposta.
- Testes, lint, tipos e build passam.
