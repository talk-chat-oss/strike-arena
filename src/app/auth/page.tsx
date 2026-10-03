import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-strike-arena.png"
          alt="Strike Arena Logo Oficial"
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
        />
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            Identidade & Gamertags · Strike Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f4f6fb] tracking-tight">
            Cadastro de Jogador e Autenticação
          </h1>
          <p className="text-xs sm:text-sm text-[#b6c0d4] max-w-2xl">
            Vincule sua PSN ID, Xbox Gamertag, EA ID ou Konami ID para disputar
            campeonatos de EA FC 26 e eFootball com tabela e chaveamento
            automatizados.
          </p>
        </div>
      </div>

      <AuthForm currentUser={currentUser} />
    </div>
  );
}
