"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  LogIn,
  ShieldCheck,
  Gamepad2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  registerUserAction,
  loginUserAction,
  logoutAction,
} from "@/app/actions/auth-actions";
import type { SessionUser } from "@/lib/auth";
import { CLUB_CRESTS } from "@/lib/club-crests";

interface AuthFormProps {
  currentUser: SessionUser | null;
}

const POPULAR_CLUBS = Object.keys(CLUB_CRESTS);

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
  const [clubName, setClubName] = useState(POPULAR_CLUBS[0] ?? "Real Madrid");
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
        clubName,
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
      router.push("/dashboard");
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
      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      setFeedback({
        type: "success",
        text: "Você saiu da conta.",
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
                Novo Competidor Oficial
              </span>
              <h2 className="text-lg font-bold text-[#f4f6fb] mt-0.5">
                Cadastre seu Perfil, Clube e Gamertags
              </h2>
              <p className="text-xs text-[#78849e] mt-1">
                Sua conta já cria automaticamente seu Clube na Master Liga e
                libera inscrição em torneios, check-in e envio de resultados.
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
                  Escudo / Clube Inicial *
                </label>
                <select
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                >
                  {POPULAR_CLUBS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
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
                  ? "Criando sua conta..."
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
                Informe seu Nickname ou E-mail cadastrado para acessar seu clube
                e campeonatos.
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
                  placeholder="Seu Nickname ou E-mail"
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

      {/* Coluna Lateral (5 cols): Status da Sessão & Segurança */}
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
              {currentUser ? "AUTENTICADO" : "NÃO AUTENTICADO"}
            </span>
          </div>

          {currentUser ? (
            <div className="p-3.5 rounded-[4px] bg-[#090c12] border border-[#222c40] space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#f4f6fb]">
                  {currentUser.nickname}
                </p>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-bold uppercase">
                  {currentUser.role === "super_admin"
                    ? "ADMIN"
                    : currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#78849e]">{currentUser.email}</p>
              <div className="pt-2 flex items-center justify-between border-t border-[#192131]">
                <span className="text-[11px] text-[#b6c0d4]">
                  {currentUser.psnId
                    ? `PSN: ${currentUser.psnId}`
                    : currentUser.eaId
                    ? `EA: ${currentUser.eaId}`
                    : "Conta Oficial"}
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
              Crie sua conta ou faça login ao lado para registrar seu clube,
              disputar torneios e participar dos leilões oficiais da temporada.
            </p>
          )}
        </div>

        {/* Informações de Conta Oficial */}
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ffdc2b]" />
            <h3 className="text-sm font-bold text-[#f4f6fb]">
              Ambiente Oficial de Competição
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-[#9aa5b8]">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
              <span>
                Cadastro único vinculado ao seu clube na Master Liga Online e
                nos torneios da plataforma.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
              <span>
                Economia fechada em Escudos com auditoria completa de lances,
                multas rescisórias e premiações por partida.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
