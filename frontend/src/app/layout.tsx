import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JehFashion - Moda Feminina e Masculina",
  description: "Descubra as últimas tendências em moda. Roupas, acessórios e calçados para todos os estilos.",
  keywords: ["moda", "fashion", "roupas", "acessórios", "calçados", "feminino", "masculino"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
