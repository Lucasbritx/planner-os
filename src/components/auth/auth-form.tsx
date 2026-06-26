"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const copy = {
  login: {
    title: "Entrar no Weekly OS",
    description: "Continue sua execução semanal com calendário, estudos, leitura, POCs e treinos no mesmo lugar.",
    submit: "Entrar com e-mail",
    switchText: "Ainda não tem conta?",
    switchHref: "/signup",
    switchLabel: "Criar conta",
  },
  signup: {
    title: "Criar sua conta",
    description: "Comece com uma semana vazia, domingo como início, e evolua para Supabase, Google Calendar e Garmin.",
    submit: "Criar conta",
    switchText: "Já tem conta?",
    switchHref: "/login",
    switchLabel: "Entrar",
  },
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const labels = copy[mode];

  const nextPath = useMemo(
    () => getSafeRedirectPath(searchParams.get("next")),
    [searchParams],
  );

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const supabase = createSupabaseBrowserClient();

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não conferem.");
      setIsSubmitting(false);
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            },
          });

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        scopes: "openid email profile",
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm shadow-slate-200/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Weekly OS
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          {labels.title}
        </h1>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          {labels.description}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            E-mail
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Senha
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>

        {mode === "signup" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Confirmar senha
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <button
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : labels.submit}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        ou
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <button
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        Continuar com Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {labels.switchText}{" "}
        <Link
          className="font-semibold text-slate-950 underline-offset-4 hover:underline dark:text-slate-50"
          href={`${labels.switchHref}?next=${encodeURIComponent(nextPath)}`}
        >
          {labels.switchLabel}
        </Link>
      </p>
    </div>
  );
}
