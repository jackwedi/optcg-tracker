export interface Tournament {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  playedLeaderId?: string;
  matches: Match[];
}

export interface Match {
  id: string;
  tournamentId: string;
  opponentLeaderId: string;
  won: boolean;
  wonCoinFlip: boolean;
  startingPosition: "1st" | "2nd";
  createdAt: string;
}
