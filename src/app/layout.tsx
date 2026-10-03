import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Strike Arena — Plataforma de Torneios & Master Liga Online",
  description:
    "Gerenciamento profissional de campeonatos, Master Liga Online com economia em Escudos, Leilões com Anti-Sniper e Freguesômetro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#090c12] text-[#b6c0d4] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#222c40] bg-[#090c12] py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78849e]">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-strike-arena.png"
                alt="Strike Arena Logo Oficial"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-semibold text-[#f4f6fb]">
                STRIKE ARENA
              </span>
              <span>· Plataforma Oficial de Ligas & Master Liga Online</span>
            </div>
            <div>
              © 2026 Strike Arena · EA Sports FC & eFootball Competitive Hub
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
