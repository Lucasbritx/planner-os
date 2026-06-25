import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekly OS",
  description: "Seu hub pessoal de execução semanal"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body><ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider></body>
    </html>
  );
}
