# Supabase Migration Guide — Weekly OS

Este guia deixa a migração preparada para ser aplicada futuramente no projeto Supabase real.

Projeto Supabase alvo:

- Project ref: `ngiymudusqrfsumqxoji`
- Project URL: `https://ngiymudusqrfsumqxoji.supabase.co`

> A publishable key deve ficar apenas em `.env.local`. Não commitar secrets.

## 1. Configurar variáveis locais

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ngiymudusqrfsumqxoji.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

O `.gitignore` já ignora `.env.local`.

## 2. Aplicar migration pelo Dashboard

Use este caminho se quiser aplicar manualmente:

1. Abra o Supabase Dashboard.
2. Selecione o projeto `ngiymudusqrfsumqxoji`.
3. Vá em SQL Editor.
4. Abra no projeto local:
   - `supabase/migrations/20260625000100_initial_planner_schema.sql`
5. Cole o conteúdo no SQL Editor.
6. Execute o SQL.

O script cria:

- `profiles`
- `weeks`
- `weekly_goals`
- `timeboxes`
- `study_items`
- `books`
- `reading_logs`
- `pocs`
- `workouts`
- `weekly_reviews`
- constraints, índices, triggers e RLS por usuário
- trigger `handle_new_user()` para criar perfil e semana atual automaticamente

## 3. Aplicar migration via Supabase CLI

Use este caminho se a CLI estiver autenticada:

```bash
supabase link --project-ref ngiymudusqrfsumqxoji
supabase db push
```

Se a CLI pedir login:

```bash
supabase login
```

## 4. Configurar Auth

No Supabase Dashboard:

1. Vá em Authentication → Providers.
2. Habilite Email.
3. Para o MVP, deixe confirmação de e-mail desativada se quiser acesso imediato.
4. Habilite Google somente quando o OAuth Client estiver criado no Google Cloud.

Redirect URLs locais:

```text
http://localhost:3000/auth/callback
```

Quando houver produção, adicionar também:

```text
https://SEU-DOMINIO/auth/callback
```

## 5. Google OAuth

No Google Cloud Console:

1. Crie ou selecione um projeto.
2. Configure OAuth consent screen.
3. Crie um OAuth Client ID do tipo Web application.
4. Adicione redirect autorizado do Supabase:
   - veja o callback informado no provider Google dentro do Supabase Dashboard.
5. Copie Client ID e Client Secret para o provider Google do Supabase.

O app já chama Google OAuth com escopos básicos:

```text
openid email profile
```

Google Calendar fica para uma etapa futura com consentimento progressivo.

## 6. Verificação depois de aplicar

Depois de aplicar a migration:

```bash
npm install
npm run dev
```

Validar no navegador:

1. Acessar `/dashboard` sem sessão deve redirecionar para `/login`.
2. Criar conta em `/signup`.
3. Confirmar que o usuário entra no app.
4. Verificar que uma semana atual foi criada automaticamente.
5. Criar/editar um objetivo, estudo, livro, POC, treino ou revisão.
6. Recarregar a página e confirmar que os dados persistiram.
7. Fazer logout em `/auth/signout` quando houver botão/UI conectada.

Checks técnicos:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 7. Testes SQL opcionais

Existe um arquivo com cobertura pgTAP:

```text
supabase/tests/rls_and_constraints.sql
```

Ele cobre:

- criação de usuário com bootstrap de perfil/semana
- início da semana no domingo
- isolamento por RLS
- constraints de livros, treinos, reviews e checklists

Use em ambiente local/CI com pgTAP habilitado.

## 8. Próximos passos após migração

- Criar seed/import inicial opcional dos dados mockados.
- Adicionar botão de logout no shell do app.
- Melhorar rollback visual de mutações otimistas.
- Configurar Google OAuth.
- Planejar integração Google Calendar com consentimento separado.
