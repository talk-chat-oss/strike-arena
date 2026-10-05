"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, CheckCircle2, AlertCircle } from "lucide-react";
import {
  updateUserRoleAction,
  type UserRoleItem,
} from "@/app/actions/tournament-engine-actions";
import { SPOOKY_SUPER_ADMIN_ID } from "@/db/mock-data";

interface RoleManagementPanelProps {
  initialUsers: UserRoleItem[];
}

const ROLE_BADGE: Record<
  UserRoleItem["role"],
  { label: string; className: string }
> = {
  super_admin: {
    label: "ADM Geral",
    className: "bg-[#ffdc2b]/15 border-[#ffdc2b]/50 text-[#ffdc2b]",
  },
  organizer: {
    label: "Organizador",
    className: "bg-[#15a34a]/15 border-[#15a34a]/50 text-[#4ade80]",
  },
  player: {
    label: "Jogador",
    className: "bg-[#161d2c] border-[#222c40] text-[#b6c0d4]",
  },
};

export function RoleManagementPanel({
  initialUsers,
}: RoleManagementPanelProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRoleItem[]>(initialUsers);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChangeRole(
    userId: string,
    newRole: "player" | "organizer" | "super_admin"
  ) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateUserRoleAction({
        targetUserId: userId,
        newRole,
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setFeedback({
          type: "success",
          text: res.message ?? "Cargo atualizado!",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error ?? "Erro ao atualizar cargo.",
        });
      }
    });
  }

  return (
    <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-5">
      <div className="border-b border-[#222c40] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            Hierarquia & Permissões da Plataforma
          </span>
          <h2 className="text-lg font-bold text-[#f4f6fb]">
            Gestão de Cargos (ADMs, Organizadores & Jogadores)
          </h2>
        </div>
        <Shield className="w-4 h-4 text-[#ffdc2b]" />
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-[4px] text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
              : "bg-[#be123c]/20 border-[#be123c]/50 text-[#fb7185]"
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

      <div className="space-y-2.5">
        {users.map((u) => {
          const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.player;
          const isImmutableSuperAdmin = u.id === SPOOKY_SUPER_ADMIN_ID;

          return (
            <div
              key={u.id}
              className="p-3.5 rounded-[4px] bg-[#090c12] border border-[#222c40] flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#161d2c] border border-[#222c40] flex items-center justify-center text-xs font-bold text-[#ffdc2b]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f4f6fb]">
                      {u.nickname}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-[2px] border text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78849e]">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label={`Cargo de ${u.nickname}`}
                  disabled={isPending || isImmutableSuperAdmin}
                  value={u.role}
                  onChange={(e) =>
                    handleChangeRole(
                      u.id,
                      e.target.value as "player" | "organizer" | "super_admin"
                    )
                  }
                  className="min-h-9 px-3 py-1.5 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs font-semibold text-[#f4f6fb] disabled:opacity-60"
                >
                  <option value="super_admin">ADM Geral (Super-Admin)</option>
                  <option value="organizer">Organizador / Arbitragem</option>
                  <option value="player">Jogador</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
