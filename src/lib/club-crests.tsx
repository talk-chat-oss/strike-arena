import React from "react";

export interface ClubVisual {
  name: string;
  shortName: string;
  crestUrl: string;
  primaryColor: string;
  secondaryColor: string;
  country: string;
}

/**
 * Catálogo oficial de Brasões / Escudos de Clubes (inspirado em Arena17 & Arena Virtual)
 * Usa SVGs oficiais de alta definição + fallback em escudo vetorial estilizado.
 */
export const CLUB_CRESTS: Record<string, ClubVisual> = {
  "Real Madrid": {
    name: "Real Madrid",
    shortName: "RMA",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    primaryColor: "#FEBE10",
    secondaryColor: "#00529F",
    country: "ESP",
  },
  "Manchester City": {
    name: "Manchester City",
    shortName: "MCI",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    primaryColor: "#6CABDD",
    secondaryColor: "#1C2C5B",
    country: "ENG",
  },
  "FC Barcelona": {
    name: "FC Barcelona",
    shortName: "BAR",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    primaryColor: "#A50044",
    secondaryColor: "#004D98",
    country: "ESP",
  },
  "Bayern München": {
    name: "Bayern München",
    shortName: "BAY",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    primaryColor: "#DC052D",
    secondaryColor: "#0066B2",
    country: "GER",
  },
  Arsenal: {
    name: "Arsenal",
    shortName: "ARS",
    crestUrl: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    primaryColor: "#EF0107",
    secondaryColor: "#063672",
    country: "ENG",
  },
  Liverpool: {
    name: "Liverpool",
    shortName: "LIV",
    crestUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    primaryColor: "#C8102E",
    secondaryColor: "#00B2A9",
    country: "ENG",
  },
  "Paris Saint-Germain": {
    name: "Paris Saint-Germain",
    shortName: "PSG",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    primaryColor: "#004170",
    secondaryColor: "#DA291C",
    country: "FRA",
  },
  "Inter de Milão": {
    name: "Inter de Milão",
    shortName: "INT",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    primaryColor: "#010E80",
    secondaryColor: "#000000",
    country: "ITA",
  },
  Flamengo: {
    name: "Flamengo",
    shortName: "FLA",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg",
    primaryColor: "#C52613",
    secondaryColor: "#000000",
    country: "BRA",
  },
  Palmeiras: {
    name: "Palmeiras",
    shortName: "PAL",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
    primaryColor: "#006437",
    secondaryColor: "#FFFFFF",
    country: "BRA",
  },
  Corinthians: {
    name: "Corinthians",
    shortName: "COR",
    crestUrl:
      "https://upload.wikimedia.org/wikipedia/en/5/5a/Sport_Club_Corinthians_Paulista_crest.svg",
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    country: "BRA",
  },
  Chelsea: {
    name: "Chelsea",
    shortName: "CHE",
    crestUrl: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    primaryColor: "#034694",
    secondaryColor: "#DBA111",
    country: "ENG",
  },
};

export const GAME_COVERS = {
  ea_fc: {
    title: "EA SPORTS FC 26",
    coverUrl: "https://api.arena17.com/uploads/jogos/39.jpg",
    badgeColor: "#ffdc2b",
  },
  efootball: {
    title: "eFootball 2026",
    coverUrl: "https://api.arena17.com/uploads/jogos/38.jpg",
    badgeColor: "#38bdf8",
  },
};

export function getClubVisual(clubName?: string | null): ClubVisual {
  if (!clubName) {
    return {
      name: "A Definir",
      shortName: "TBD",
      crestUrl: "",
      primaryColor: "#133865",
      secondaryColor: "#FFDC2B",
      country: "INT",
    };
  }

  if (CLUB_CRESTS[clubName]) {
    return CLUB_CRESTS[clubName];
  }

  const found = Object.values(CLUB_CRESTS).find(
    (c) =>
      clubName.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(clubName.toLowerCase())
  );
  if (found) return found;

  return {
    name: clubName,
    shortName: clubName.slice(0, 3).toUpperCase(),
    crestUrl: "",
    primaryColor: "#133865",
    secondaryColor: "#FFDC2B",
    country: "CLB",
  };
}

export function ClubCrest({
  clubName,
  size = "md",
}: {
  clubName?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const visual = getClubVisual(clubName);
  const dims =
    size === "sm"
      ? "w-6 h-6 text-[9px]"
      : size === "lg"
      ? "w-10 h-10 text-xs"
      : "w-8 h-8 text-[10px]";

  if (visual.crestUrl) {
    return (
      <span
        title={visual.name}
        className={`${dims} rounded-[4px] bg-[#090c12] border border-[#222c40] p-1 inline-flex items-center justify-center shrink-0 overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.crestUrl}
          alt={visual.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      title={visual.name}
      style={{
        borderColor: visual.secondaryColor,
        backgroundColor: visual.primaryColor,
      }}
      className={`${dims} rounded-[4px] border font-bold text-[#f4f6fb] inline-flex items-center justify-center shrink-0 uppercase tracking-tighter`}
    >
      {visual.shortName}
    </span>
  );
}
