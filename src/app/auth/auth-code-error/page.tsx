import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Weekly OS
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Não consegui concluir o login
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          O link de autenticação expirou ou foi recusado. Tente entrar de novo.
        </p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          href="/login"
        >
          Voltar para login
        </Link>
      </div>
    </main>
  );
}
