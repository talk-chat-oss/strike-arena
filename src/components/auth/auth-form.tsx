"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  LogIn,
  ShieldCheck,
  Gamepad2,
  Zap,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  registerUserAction,
  loginUserAction,
  quickSwitchDemoAccountAction,
  logoutAction,
} from "@/app/actions/auth-actions";
import type { SessionUser } from "@/lib/auth";

interface AuthFormProps {
  currentUser: SessionUser | null;
}

export function AuthForm({ currentUser }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">(
    currentUser ? "login" : "register"
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Register fields
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"player" | "organizer">(
    "player"
  );
  const [psnId, setPsnId] = useState("");
  const [xboxGamertag, setXboxGamertag] = useState("");
  const [eaId, setEaId] = useState("");
  const [konamiId, setKonamiId] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await registerUserAction({
        nickname,
        email,
        password,
        accountType,
        psnId,
        xboxGamertag,
        eaId,
        konamiId,
        discordHandle,
      });

      if (!res.ok) {
        setFeedback({ type: "error", text: res.error ?? "Erro no cadastro." });
        return;
      }

      setFeedback({
        type: "success",
        text: res.message ?? "Conta criada com sucesso!",
      });
      router.push("/tournaments/strike-cup-eafc26-elite");
      router.refresh();
    });
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await loginUserAction({
        identifier,
        password: loginPassword,
      });

      if (!res.ok) {
        setFeedback({ type: "error", text: res.error ?? "Erro no login." });
        return;
      }

      setFeedback({
        type: "success",
        text: res.message ?? "Login realizado!",
      });
      router.push("/tournaments/strike-cup-eafc26-elite");
      router.refresh();
    });
  }

  function handleQuickDemo(preset: "spooky" | "vinijr" | "lucaspro") {
    setFeedback(null);
    startTransition(async () => {
      const res = await quickSwitchDemoAccountAction(preset);
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Sessão ativa como ${res.nickname} (${res.role.toUpperCase()})! Redirecionando...`,
        });
        router.push(
          preset === "spooky"
            ? "/organizer"
            : "/tournaments/strike-cup-eafc26-elite"
        );
        router.refresh();
      }
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      setFeedback({
        type: "success",
        text: "Você saiu da conta. Modo Visitante ativo.",
      });
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Coluna Principal (7 cols): Cadastro e Login Real */}
      <div className="lg:col-span-7 bg-[#111622] border border-[#222c40] rounded-[4px] p-6 sm:p-8 space-y-6">
        {/* Seletor de Abas (Cadastro / Login) */}
        <div className="flex items-center gap-2 border-b border-[#222c40] pb-4">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setFeedback(null);
            }}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              mode === "register"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Conta de Jogador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setFeedback(null);
            }}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar com Conta Existente</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-[4px] border text-xs flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
                : "bg-[#be123c]/15 border-[#be123c]/40 text-[#fb7185]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {mode === "register" ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                Novo Competidor · PostgreSQL Live
              </span>
              <h2 className="text-lg font-bold text-[#f4f6fb] mt-0.5">
                Cadastre seu Perfil e Gamertags
              </h2>
              <p className="text-xs text-[#78849e] mt-1">
                Sua conta é gravada na hora no banco dedicado e já libera
                inscrição em torneios, check-in e envio de placares.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Nickname Oficial *
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: CraqueFC_99"
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Perfil na Plataforma
                </label>
                <select
                  value={accountType}
                  onChange={(e) =>
                    setAccountType(e.target.value as "player" | "organizer")
                  }
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                >
                  <option value="player">Jogador / Competidor</option>
                  <option value="organizer">Organizador de Torneios</option>
                </select>
              </div>
            </div>

            {/* Gamertags / IDs de Jogo */}
            <div className="pt-3 border-t border-[#192131] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f6fb]">
                <Gamepad2 className="w-4 h-4 text-[#ffdc2b]" />
                <span>IDs de Console & Crossplay (Opcional)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#78849e] mb-1">
                    PSN ID (PlayStation 5)
                  </label>
                  <input
                    type="text"
                    value={psnId}
                    onChange={(e) => setPsnId(e.target.value)}
                    placeholder="Ex: Craque_PS5"
                    className="w-full h-9 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#78849e] mb-1">
                    EA ID (EA SPORTS FC 26)
                  </label>
                  <input
                    type="text"
                    value={eaId}
                    onChange={(e) => setEaId(e.target.value)}
                    placeholder="Ex: Craque_EAFC"
                    className="w-full h-9 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#78849e] mb-1">
                    Xbox Gamertag
                  </label>
                  <input
                    type="text"
                    value={xboxGamertag}
                    onChange={(e) => setXboxGamertag(e.target.value)}
                    placeholder="Ex: CraqueXbox"
                    className="w-full h-9 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#78849e] mb-1">
                    Discord / Konami ID (eFootball)
                  </label>
                  <input
                    type="text"
                    value={discordHandle || konamiId}
                    onChange={(e) => {
                      setDiscordHandle(e.target.value);
                      setKonamiId(e.target.value);
                    }}
                    placeholder="Ex: craque#0001"
                    className="w-full h-9 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] disabled:opacity-50 text-[#0e1312] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {isPending
                  ? "Registrando no PostgreSQL..."
                  : "Concluir Cadastro e Entrar na Arena"}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                Acesso de Competidor / Organizador
              </span>
              <h2 className="text-lg font-bold text-[#f4f6fb] mt-0.5">
                Entrar na Strike Arena
              </h2>
              <p className="text-xs text-[#78849e] mt-1">
                Use seu Nickname ou E-mail cadastrado. (Dica: contas demo
                aceitam a senha <code className="text-[#ffdc2b]">strike123</code>
                ).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Nickname ou E-mail
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: ViniJr_FC ou SPOOKY"
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] disabled:opacity-50 text-[#0e1312] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isPending ? "Autenticando..." : "Entrar na Conta"}</span>
            </button>
          </form>
        )}
      </div>

      {/* Coluna Lateral (5 cols): Sessão Atual + Troca Rápida 1-Click para Avaliação */}
      <div className="lg:col-span-5 space-y-5">
        {/* Status da Sessão Atual */}
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#78849e] font-semibold">
              Status da Sua Sessão
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                currentUser
                  ? "bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/40"
                  : "bg-[#1d2639] text-[#b6c0d4]"
              }`}
            >
              {currentUser ? "AUTENTICADO" : "VISITANTE"}
            </span>
          </div>

          {currentUser ? (
            <div className="p-3.5 rounded-[4px] bg-[#090c12] border border-[#222c40] space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#f4f6fb]">
                  {currentUser.nickname}
                </p>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-bold uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#78849e]">{currentUser.email}</p>
              <div className="pt-2 flex items-center justify-between border-t border-[#192131]">
                <span className="text-[11px] text-[#b6c0d4]">
                  {currentUser.psnId
                    ? `PSN: ${currentUser.psnId}`
                    : currentUser.eaId
                    ? `EA: ${currentUser.eaId}`
                    : "ID vinculado"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs text-[#fb7185] hover:underline cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#b6c0d4] leading-relaxed">
              Você está navegando como <strong>Visitante</strong>. Crie uma
              conta ao lado para se inscrever em torneios ou use um dos perfis
              de teste rápido abaixo.
            </p>
          )}
        </div>

        {/* Simulador Rápido de Perfis (Para Avaliação do Colega) */}
        <div className="bg-[#111622] border border-[#ffdc2b]/40 rounded-[4px] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ffdc2b]" />
            <h3 className="text-sm font-bold text-[#f4f6fb]">
              Acesso Rápido (1-Clique para Teste/Avaliação)
            </h3>
          </div>

          <p className="text-xs text-[#b6c0d4] leading-relaxed">
            Para testar rapidamente as diferentes permissões da plataforma sem
            preencher formulário, escolha um perfil abaixo:
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickDemo("vinijr")}
              className="w-full p-3 rounded-[4px] bg-[#090c12] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b] text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-[#f4f6fb]">
                  Entrar como Jogador: ViniJr_FC
                </p>
                <p className="text-[11px] text-[#78849e]">
                  Real Madrid · Líder do Grupo A · Testar Match Hub e Check-in
                </p>
              </div>
              <span className="px-2 py-1 rounded-[2px] bg-[#161d2c] text-[#ffdc2b] text-[10px] font-bold">
                PLAYER
              </span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickDemo("lucaspro")}
              className="w-full p-3 rounded-[4px] bg-[#090c12] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b] text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-[#f4f6fb]">
                  Entrar como Jogador: LucasPro_10
                </p>
                <p className="text-[11px] text-[#78849e]">
                  Arsenal · Líder do Grupo B · Partida pendente de confirmação
                </p>
              </div>
              <span className="px-2 py-1 rounded-[2px] bg-[#161d2c] text-[#ffdc2b] text-[10px] font-bold">
                PLAYER
              </span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleQuickDemo("spooky")}
              className="w-full p-3 rounded-[4px] bg-[#133865]/30 hover:bg-[#133865]/50 border border-[#1c4d8a] hover:border-[#ffdc2b] text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-[#f4f6fb] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffdc2b]" />
                  <span>Entrar como Super-Admin: SPOOKY</span>
                </p>
                <p className="text-[11px] text-[#b6c0d4]">
                  Acesso Root · Criar Torneios, Homologar Prints e Aplicar W.O.
                </p>
              </div>
              <span className="px-2 py-1 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-bold">
                ROOT
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
