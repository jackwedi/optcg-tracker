import type { TournamentType } from "@/models/tournament";

export const MAX_CREW_MEMBERS = 10;
export const ROUNDS_REQUIRED_TO_UNLOCK_CREWS = 10;
export const MAX_CREW_NAME_LENGTH = 40;

export interface Crew {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface CrewMemberRound {
  tournamentType: TournamentType;
  won: boolean;
}

export interface CrewLeaderboardEntry {
  userId: string;
  displayName: string;
  isCurrentUser: boolean;
  rounds: CrewMemberRound[];
}

export interface CrewLeaderboard {
  crewId: string;
  entries: CrewLeaderboardEntry[];
  totalWins: number;
}

export interface CrewEligibility {
  eligible: boolean;
  totalRounds: number;
  roundsRequired: number;
}

export type CrewActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface CrewRankTier {
  rank: number;
  name: string;
  emoji: string;
  minWins: number;
  maxWins: number | null;
  estimatedTime: string;
  description: string;
}

export const CREW_RANK_TIERS: CrewRankTier[] = [
  {
    rank: 1,
    name: "Rookie Crew",
    emoji: "⚓",
    minWins: 0,
    maxWins: 75,
    estimatedTime: "~1 Month",
    description: "The crew forms and begins to win local matches.",
  },
  {
    rank: 2,
    name: "Supernova Crew",
    emoji: "☄️",
    minWins: 76,
    maxWins: 250,
    estimatedTime: "~3 Months",
    description: "Multiple members are making waves simultaneously.",
  },
  {
    rank: 3,
    name: "Worst Generation",
    emoji: "🏴‍☠️",
    minWins: 251,
    maxWins: 500,
    estimatedTime: "~6 Months",
    description: "The fleet is now a recognized threat to the meta.",
  },
  {
    rank: 4,
    name: "Yonko Crew",
    emoji: "👑",
    minWins: 501,
    maxWins: 900,
    estimatedTime: "~12 Months",
    description: "Total dominance; a massive empire of wins.",
  },
  {
    rank: 5,
    name: "Pirate King Crew",
    emoji: "🏆",
    minWins: 901,
    maxWins: null,
    estimatedTime: "1 Year +",
    description: "The ultimate crew to conquer the entire system.",
  },
];

export interface CrewRankProgress {
  totalWins: number;
  currentTier: CrewRankTier;
  nextTier: CrewRankTier | null;
  winsToNextTier: number;
  progressToNextTier: number;
}

export function getCrewRankProgress(totalWins: number): CrewRankProgress {
  const safeWins = Math.max(0, totalWins);

  let currentTier = CREW_RANK_TIERS[0];
  for (const tier of CREW_RANK_TIERS) {
    if (safeWins >= tier.minWins) currentTier = tier;
  }

  const nextTier =
    CREW_RANK_TIERS.find((tier) => tier.rank === currentTier.rank + 1) ??
    null;

  const winsToNextTier = nextTier
    ? Math.max(0, nextTier.minWins - safeWins)
    : 0;

  const progressToNextTier = nextTier
    ? Math.min(
        100,
        ((safeWins - currentTier.minWins) /
          (nextTier.minWins - currentTier.minWins)) *
          100,
      )
    : 100;

  return {
    totalWins: safeWins,
    currentTier,
    nextTier,
    winsToNextTier,
    progressToNextTier,
  };
}
