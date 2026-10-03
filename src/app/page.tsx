import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Scale,
  Award,
} from "lucide-react";
import { getAllTournaments } from "@/lib/queries/tournaments";
import { getCurrentUser } from "@/lib/auth";
import { TournamentShowcase } from "@/components/tournament/tournament-showcase";
import { ClubCrest } from "@/lib/club-crests";

export const dynamic = "force-dynamic";

const GAMES_CATALOG = [
  {
    name: "EA SPORTS FC 26",
    sub: "PS5 · Xbox Series · PC Crossplay",
    cover: "https://api.arena17.com/uploads/jogos/39.jpg",
    tag: "MAIS JOGADO",
  },
  {
    name: "eFootball 2026",
    sub: "Dream Team & Autenticidade",
    cover: "https://api.arena17.com/uploads/jogos/38.jpg",
    tag: "KONAMI OFICIAL",
  },
  {
    name: "EA SPORTS FC 25",
    sub: "Ligas Clássicas & Pro Clubs",
    cover: "https://api.arena17.com/uploads/jogos/37.jpg",
    tag: "LEGACY",
  },
  {
    name: "eFootball 2025",
    sub: "Copas e Divisões Online",
    cover: "https://api.arena17.com/uploads/jogos/36.jpg",
    tag: "LEGACY",
  },
];

export default async function HomePage() {
  const [{ tournaments }, currentUser] = await Promise.all([
    getAllTournaments(),
    getCurrentUser(),
  ]);

  const totalPrizePool = tournaments.reduce(
    (acc, t) => acc + (t.prizePoolBrl || 0),
    0
  );
  const featuredTournament = tournaments[0] ?? null;

  return (
    <div className="space-y-14 pb-12">
      {/* Hero Section — Kinetic Control Plane com Escudo Oficial + Preview de Confronto */}
      <section className="relative border-b border-[#222c40] kinetic-grid-bg py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-strike-arena.png"
                  alt="Strike Arena Escudo Oficial"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-[0_0_20px_rgba(255,220,43,0.2)]"
                />
                <h1 className="text-3xl sm:text-5xl font-bold text-[#f4f6fb] tracking-tight leading-[1.08]">
                  A Arena Oficial de{" "}
                  <span className="text-[#ffdc2b]">EA FC & eFootball</span>.
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#b6c0d4] leading-relaxed max-w-2xl">
                Escolha o escudo do seu clube, dispute ligas de pontos corridos,
                grupos + mata-mata ou torneios relâmpago com Freguesômetro
                (Head-to-Head), Ranking Fair Play e homologação por print.
              </p>
            </div>

            {/* Card Destaque da Temporada */}
            <div className="lg:col-span-5 bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222c40] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffdc2b]">
                  {featuredTournament
                    ? "Campeonato em Destaque"
                    : "Temporada Oficial · Inscrições Abertas"}
                </span>
                {featuredTournament && (
                  <span className="px-2 py-0.5 rounded-full bg-[#15a34a]/20 text-[#4ade80] text-[10px] font-bold">
                    PRÊMIO R$ {featuredTournament.prizePoolBrl}
                  </span>
                )}
              </div>

              {featuredTournament ? (
                <>
                  <div className="py-2 space-y-2">
                    <h3 className="text-lg font-bold text-[#f4f6fb]">
                      {featuredTournament.name}
                    </h3>
                    <p className="text-xs text-[#b6c0d4]">
                      Inscritos:{" "}
                      <strong className="text-[#ffdc2b]">
                        {featuredTournament.currentParticipants} /{" "}
                        {featuredTournament.maxParticipants}
                      </strong>{" "}
                      · Organizador:{" "}
                      <strong>{featuredTournament.organizerNickname}</strong>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#192131] flex items-center justify-between text-xs">
                    <span className="text-[#78849e]">
                      Vagas abertas para clubes oficiais
                    </span>
                    <Link
                      href={`/tournaments/${featuredTournament.slug}`}
                      className="text-[#ffdc2b] font-bold hover:underline"
                    >
                      Acessar Campeonato →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
                    <div className="flex flex-col items-center text-center gap-2">
                      <ClubCrest clubName="Real Madrid" size="lg" />
                      <p className="text-xs font-bold text-[#f4f6fb]">
                        Escolha seu Clube
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-[4px] bg-[#090c12] border border-[#ffdc2b]/50 text-xs font-bold text-[#ffdc2b]">
                      VS
                    </div>

                    <div className="flex flex-col items-center text-center gap-2">
                      <ClubCrest clubName="Manchester City" size="lg" />
                      <p className="text-xs font-bold text-[#f4f6fb]">
                        Monte seu Elenco
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#192131] flex items-center justify-between text-xs">
                    <span className="text-[#78849e]">
                      Cadastre sua conta e crie ou entre na liga
                    </span>
                    <Link
                      href={currentUser ? "/organizer" : "/auth"}
                      className="text-[#ffdc2b] font-bold hover:underline"
                    >
                      {currentUser ? "Criar Campeonato →" : "Criar Conta →"}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Módulos da Master Liga Online (Economia Fechada em Striker Coins & Gestão de Clubes) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
            <Link
              href="/auctions"
              className="group p-4 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b]/50 transition-all flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[2px] bg-[#dc2626]/20 text-[#f87171]">
                  LEILÕES & BOLA PRETA
                </span>
                <h3 className="text-sm font-bold text-[#f4f6fb] mt-2 group-hover:text-[#ffdc2b]">
                  Leilões Agendados, Ao Vivo & Anti-Sniper
                </h3>
                <p className="text-xs text-[#78849e] mt-1">
                  Calendário de craques Bola Preta, lances de 5 em 5 Striker Coins com
                  Escrow e +2 min Anti-Sniper.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#78849e] group-hover:text-[#ffdc2b] shrink-0 mt-1" />
            </Link>

            <Link
              href="/players"
              className="group p-4 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b]/50 transition-all flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[2px] bg-black text-[#ffdc2b] border border-[#ffdc2b]/40">
                  DATABASE GLOBAL
                </span>
                <h3 className="text-sm font-bold text-[#f4f6fb] mt-2 group-hover:text-[#ffdc2b]">
                  Catálogo de Jogadores & Filtros OVR
                </h3>
                <p className="text-xs text-[#78849e] mt-1">
                  Todos os atletas oficiais com filtro Bola Preta, posição,
                  busca e ordenação A-Z / Overall.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#78849e] group-hover:text-[#ffdc2b] shrink-0 mt-1" />
            </Link>

            <Link
              href="/store/strike-coins"
              className="group p-4 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b]/50 transition-all flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[2px] bg-[#ffdc2b]/20 text-[#ffdc2b]">
                  MOEDA OFICIAL
                </span>
                <h3 className="text-sm font-bold text-[#f4f6fb] mt-2 group-hover:text-[#ffdc2b]">
                  Loja de Striker Coins & Pacotes Promocionais
                </h3>
                <p className="text-xs text-[#78849e] mt-1">
                  Pacotes de 200 (R$ 10), 300 (R$ 20), 500 (R$ 30) e 1.000 Striker Coins (R$ 50)
                  com crédito instantâneo.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#78849e] group-hover:text-[#ffdc2b] shrink-0 mt-1" />
            </Link>

            <Link
              href="/freguesometro"
              className="group p-4 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] hover:border-[#ffdc2b]/50 transition-all flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[2px] bg-[#15a34a]/20 text-[#4ade80]">
                  RIVALIDADES & CONFRONTOS
                </span>
                <h3 className="text-sm font-bold text-[#f4f6fb] mt-2 group-hover:text-[#ffdc2b]">
                  Freguesômetro H2H & Partidas com Bônus
                </h3>
                <p className="text-xs text-[#78849e] mt-1">
                  Confronto histórico direto entre treinadores, registro de
                  artilheiros e bônus em Striker Coins.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#78849e] group-hover:text-[#ffdc2b] shrink-0 mt-1" />
            </Link>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {[
              {
                label: "Torneios Ativos",
                value: `${tournaments.length}`,
                sub: "EA FC 26 & eFootball",
              },
              {
                label: "Premiação em Disputa",
                value: `R$ ${totalPrizePool}`,
                sub: "Checkout Oficial Stripe",
              },
              {
                label: "Database de Atletas",
                value: "999 Craques",
                sub: "166 Clubes & Escudos Oficiais",
              },
              {
                label: "Índice Fair Play",
                value: "100%",
                sub: "Anti-W.O. e Auditoria",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 tabular-nums"
              >
                <span className="text-[11px] uppercase tracking-wider text-[#78849e] block">
                  {kpi.label}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1">
                  {kpi.value}
                </p>
                <span className="text-[11px] text-[#ffdc2b]">{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Jogos Mais Disputados (Capas Oficiais extraídas do Arena17) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            Modalidades Oficiais
          </span>
          <h2 className="text-xl font-bold text-[#f4f6fb] mt-0.5">
            Jogos Mais Disputados na Plataforma
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES_CATALOG.map((g) => (
            <Link
              key={g.name}
              href={
                featuredTournament
                  ? `/tournaments/${featuredTournament.slug}`
                  : "/organizer"
              }
              className="group bg-[#111622] border border-[#222c40] hover:border-[#ffdc2b] rounded-[4px] p-3.5 flex items-center gap-3.5 transition-colors"
            >
              <div className="w-14 h-20 rounded-[4px] overflow-hidden border border-[#222c40] bg-[#090c12] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover}
                  alt={g.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <span className="inline-block px-1.5 py-0.5 rounded-[2px] bg-[#161d2c] text-[9px] font-bold text-[#ffdc2b]">
                  {g.tag}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#f4f6fb] truncate">
                  {g.name}
                </h3>
                <p className="text-[11px] text-[#78849e] leading-snug">
                  {g.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrine de Torneios com Filtros e Brasões */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
              Vitrine de Competições
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-0.5">
              Torneios, Ligas e Copas Relâmpago
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#78849e]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Dados sincronizados em tempo real</span>
          </div>
        </div>

        <TournamentShowcase tournaments={tournaments} />
      </section>

      {/* Recursos Exclusivos (Inspirados no Arena Virtual & Arena17) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            Ecossistema Completo de Futebol Virtual
          </span>
          <h2 className="text-xl font-bold text-[#f4f6fb] mt-0.5">
            Tudo o que sua Liga Precisa em um Só Painel
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Shield,
              title: "Escolha de Escudos Oficiais",
              desc: "Jogue com os brasões de Real Madrid, Manchester City, Barcelona, PSG, Flamengo, Palmeiras e mais.",
            },
            {
              icon: Scale,
              title: "Freguesômetro (Head-to-Head)",
              desc: "Compare qualquer dupla de jogadores da liga para ver quem tem mais vitórias, gols e saldo.",
            },
            {
              icon: Zap,
              title: "Torneios Relâmpago & Sorteio",
              desc: "Crie copas rápidas mata-mata para jogar na mesma noite ou ligas com grupos e cruzamento olímpico.",
            },
            {
              icon: Award,
              title: "Índice Fair Play & Anti-W.O.",
              desc: "Reputação automática por comparecimento, chat de partida auditado e homologação com print.",
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-2.5"
              >
                <div className="w-9 h-9 rounded-[4px] bg-[#161d2c] border border-[#222c40] flex items-center justify-center text-[#ffdc2b]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#f4f6fb]">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#78849e] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
