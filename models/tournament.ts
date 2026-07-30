export const TOURNAMENT_TYPES = ["Local", "Regional", "Treasure Cup"] as const;

export type TournamentType = (typeof TOURNAMENT_TYPES)[number];
export const DEFAULT_TOURNAMENT_TYPE: TournamentType = "Local";

export interface Tournament {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  playedLeaderId?: string;
  tournamentType: TournamentType;
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
