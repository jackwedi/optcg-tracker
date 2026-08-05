export const TOURNAMENT_TYPES = ["Local", "Treasure Cup", "Regional"] as const;

export type TournamentType = (typeof TOURNAMENT_TYPES)[number];
export const DEFAULT_TOURNAMENT_TYPE: TournamentType = "Local";

export function getTournamentTypeIcon(type: string): string {
  switch (type) {
    case "Local":
      return "🏠";
    case "Regional":
      return "🏆";
    case "Treasure Cup":
      return "🏅";
    default:
      return "🏷️";
  }
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  playedLeaderId?: string;
  tournamentType: TournamentType;
  metaId?: string;
  rounds: Round[];
}

export interface Round {
  id: string;
  tournamentId: string;
  opponentLeaderId: string;
  won: boolean;
  wonCoinFlip: boolean;
  startingPosition: "1st" | "2nd";
  createdAt: string;
}
