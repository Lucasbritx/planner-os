export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.28),_transparent_32rem),linear-gradient(180deg,_#f8fafc,_#eef2f7)] px-4 py-10 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.35),_transparent_32rem),linear-gradient(180deg,_#020617,_#0f172a)] dark:text-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
