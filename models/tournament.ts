export interface Tournament {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  matches: Match[];
}

export interface Match {
  id: string;
  tournamentId: string;
  opponentDeck: string;
  won: boolean;
  wonCoinFlip: boolean;
  createdAt: string;
}
