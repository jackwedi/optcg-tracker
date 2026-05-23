import { Tournament, Match } from "@/models/tournament";

// In-memory storage for development
// Using globalThis to ensure persistence across module reloads

const store = globalThis as unknown as {
  __tournaments__?: Tournament[];
};

const getStorage = () => {
  if (!store.__tournaments__) {
    store.__tournaments__ = [];
  }
  return store.__tournaments__ as Tournament[];
};

export function getTournaments(): Tournament[] {
  return getStorage();
}

export function getTournamentById(id: string): Tournament | undefined {
  return getStorage().find((t) => t.id === id);
}

export function createTournament(name: string, date: string): Tournament {
  const storage = getStorage();
  const tournament: Tournament = {
    id: Date.now().toString(),
    name,
    date,
    createdAt: new Date().toISOString(),
    matches: [],
  };
  storage.push(tournament);
  return tournament;
}

export function updateTournament(
  id: string,
  name: string,
  date: string,
): Tournament | undefined {
  const storage = getStorage();
  const tournament = storage.find((t) => t.id === id);
  if (tournament) {
    tournament.name = name;
    tournament.date = date;
  }
  return tournament;
}

export function deleteTournament(id: string): boolean {
  const storage = getStorage();
  const index = storage.findIndex((t) => t.id === id);
  if (index !== -1) {
    storage.splice(index, 1);
    return true;
  }
  return false;
}

export function addMatch(
  tournamentId: string,
  opponentDeck: string,
  won: boolean,
  wonCoinFlip: boolean,
): Match | undefined {
  const storage = getStorage();
  const tournament = storage.find((t) => t.id === tournamentId);
  if (!tournament) return undefined;

  const match: Match = {
    id: Date.now().toString(),
    tournamentId,
    opponentDeck,
    won,
    wonCoinFlip,
    createdAt: new Date().toISOString(),
  };

  tournament.matches.push(match);
  return match;
}

export function deleteMatch(tournamentId: string, matchId: string): boolean {
  const storage = getStorage();
  const tournament = storage.find((t) => t.id === tournamentId);
  if (!tournament) return false;

  const index = tournament.matches.findIndex((m) => m.id === matchId);
  if (index !== -1) {
    tournament.matches.splice(index, 1);
    return true;
  }
  return false;
}

export function getTournamentStats(tournamentId: string) {
  const storage = getStorage();
  const tournament = storage.find((t) => t.id === tournamentId);
  if (!tournament) return null;

  const totalMatches = tournament.matches.length;
  const wins = tournament.matches.filter((m) => m.won).length;
  const coinFlipWins = tournament.matches.filter((m) => m.wonCoinFlip).length;
  const winRate =
    totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

  return {
    totalMatches,
    wins,
    losses: totalMatches - wins,
    coinFlipWins,
    winRate,
  };
}
