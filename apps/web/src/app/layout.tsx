import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevYear Recap",
  description: "Conecte seus repositórios e gere sua autoavaliação em minutos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
