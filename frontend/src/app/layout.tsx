import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "JehFashion - Moda Masculina",
  description: "Peças exclusivas, moda masculina de grife e muito estilo.",
  keywords: ["moda", "fashion", "roupas", "masculino", "acessórios", "streetwear"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} ${inter.className} bg-black text-white`}>
        <Header />
        <main className="min-h-screen bg-black pt-[101px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
