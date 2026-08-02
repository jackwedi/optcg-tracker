export const MAX_CREW_MEMBERS = 10;
export const ROUNDS_REQUIRED_TO_UNLOCK_CREWS = 10;
export const MAX_CREW_NAME_LENGTH = 40;

export interface Crew {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface CrewLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  wins: number;
  totalRounds: number;
  isCurrentUser: boolean;
}

export interface CrewLeaderboard {
  crewId: string;
  entries: CrewLeaderboardEntry[];
}

export interface CrewEligibility {
  eligible: boolean;
  totalRounds: number;
  roundsRequired: number;
}

export type CrewActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
