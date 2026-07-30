import { cookies } from "next/headers";
import {
  DEFAULT_TOURNAMENT_TYPE,
  TOURNAMENT_TYPES,
  type Round,
  type Tournament,
  type TournamentType,
} from "@/models/tournament";
import { getCurrentUserId } from "@/lib/auth";
import { BYE_LEADER_ID } from "@/lib/leaders";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";

interface TournamentRow {
  id: string;
  name: string;
  date: string;
  created_at: string;
  played_leader_id: string | null;
  tournament_type?: string | null;
}

interface RoundRow {
  id: string;
  tournament_id: string;
  opponent_leader_id: string | null;
  won: boolean;
  won_coin_flip: boolean;
  starting_position: "1st" | "2nd";
  created_at: string;
}

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "PGRST205"
  );
}

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42703"
  );
}

const TOURNAMENT_SELECT_WITH_TYPES =
  "id,name,date,created_at,played_leader_id,tournament_type";
const TOURNAMENT_SELECT_BASE = "id,name,date,created_at,played_leader_id";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
}

function mapRoundRow(row: RoundRow): Round {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    opponentLeaderId: row.opponent_leader_id ?? BYE_LEADER_ID,
    won: row.won,
    wonCoinFlip: row.won_coin_flip,
    startingPosition: row.starting_position,
    createdAt: row.created_at,
  };
}

function mapTournamentRow(row: TournamentRow, rounds: Round[]): Tournament {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    createdAt: row.created_at,
    playedLeaderId: row.played_leader_id ?? undefined,
    tournamentType: sanitizeTournamentType(row.tournament_type),
    rounds,
  };
}

function sanitizeTournamentType(value: unknown): TournamentType {
  if (typeof value !== "string") {
    return DEFAULT_TOURNAMENT_TYPE;
  }

  if (TOURNAMENT_TYPES.includes(value as TournamentType)) {
    return value as TournamentType;
  }

  return DEFAULT_TOURNAMENT_TYPE;
}

export async function getTournaments(): Promise<Tournament[]> {
  const supabase = await getSupabaseClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT_WITH_TYPES)
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnError(error)) {
      const { data: fallbackTournaments, error: fallbackError } = await supabase
        .from("tournaments")
        .select(TOURNAMENT_SELECT_BASE)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (fallbackError) {
        if (isMissingTableError(fallbackError)) {
          return [];
        }
        throw fallbackError;
      }

      if (!fallbackTournaments || fallbackTournaments.length === 0) {
        return [];
      }

      const tournamentIds = fallbackTournaments.map((t) => t.id);
      const { data: rounds, error: roundsError } = await supabase
        .from("rounds")
        .select(
          "id,tournament_id,opponent_leader_id,won,won_coin_flip,starting_position,created_at",
        )
        .in("tournament_id", tournamentIds)
        .order("created_at", { ascending: true });

      if (roundsError) {
        if (isMissingTableError(roundsError)) {
          return (fallbackTournaments as TournamentRow[]).map((row) =>
            mapTournamentRow(row, []),
          );
        }
        throw roundsError;
      }

      const roundsByTournament = new Map<string, Round[]>();
      for (const row of (rounds ?? []) as RoundRow[]) {
        const mapped = mapRoundRow(row);
        const existing = roundsByTournament.get(mapped.tournamentId);
        if (existing) {
          existing.push(mapped);
        } else {
          roundsByTournament.set(mapped.tournamentId, [mapped]);
        }
      }

      return (fallbackTournaments as TournamentRow[]).map((row) =>
        mapTournamentRow(row, roundsByTournament.get(row.id) ?? []),
      );
    }

    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }

  if (!tournaments || tournaments.length === 0) {
    return [];
  }

  const tournamentIds = tournaments.map((t) => t.id);
  const { data: rounds, error: roundsError } = await supabase
    .from("rounds")
    .select(
      "id,tournament_id,opponent_leader_id,won,won_coin_flip,starting_position,created_at",
    )
    .in("tournament_id", tournamentIds)
    .order("created_at", { ascending: true });

  if (roundsError) {
    if (isMissingTableError(roundsError)) {
      return (tournaments as TournamentRow[]).map((row) =>
        mapTournamentRow(row, []),
      );
    }
    throw roundsError;
  }

  const roundsByTournament = new Map<string, Round[]>();
  for (const row of (rounds ?? []) as RoundRow[]) {
    const mapped = mapRoundRow(row);
    const existing = roundsByTournament.get(mapped.tournamentId);
    if (existing) {
      existing.push(mapped);
    } else {
      roundsByTournament.set(mapped.tournamentId, [mapped]);
    }
  }

  return (tournaments as TournamentRow[]).map((row) =>
    mapTournamentRow(row, roundsByTournament.get(row.id) ?? []),
  );
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | undefined> {
  const supabase = await getSupabaseClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return undefined;
  }

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT_WITH_TYPES)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      const { data: fallbackTournament, error: fallbackError } = await supabase
        .from("tournaments")
        .select(TOURNAMENT_SELECT_BASE)
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (fallbackError) {
        if (isMissingTableError(fallbackError)) {
          return undefined;
        }
        throw fallbackError;
      }

      if (!fallbackTournament) {
        return undefined;
      }

      const { data: rounds, error: roundsError } = await supabase
        .from("rounds")
        .select(
          "id,tournament_id,opponent_leader_id,won,won_coin_flip,starting_position,created_at",
        )
        .eq("tournament_id", id)
        .order("created_at", { ascending: true });

      if (roundsError) {
        if (isMissingTableError(roundsError)) {
          return mapTournamentRow(fallbackTournament as TournamentRow, []);
        }
        throw roundsError;
      }

      return mapTournamentRow(
        fallbackTournament as TournamentRow,
        ((rounds ?? []) as RoundRow[]).map(mapRoundRow),
      );
    }

    if (isMissingTableError(error)) {
      return undefined;
    }
    throw error;
  }

  if (!tournament) {
    return undefined;
  }

  const { data: rounds, error: roundsError } = await supabase
    .from("rounds")
    .select(
      "id,tournament_id,opponent_leader_id,won,won_coin_flip,starting_position,created_at",
    )
    .eq("tournament_id", id)
    .order("created_at", { ascending: true });

  if (roundsError) {
    if (isMissingTableError(roundsError)) {
      return mapTournamentRow(tournament as TournamentRow, []);
    }
    throw roundsError;
  }

  return mapTournamentRow(
    tournament as TournamentRow,
    ((rounds ?? []) as RoundRow[]).map(mapRoundRow),
  );
}

export async function createTournament(
  name: string,
  date: string,
  playedLeaderId?: string,
  tournamentType: TournamentType = DEFAULT_TOURNAMENT_TYPE,
): Promise<Tournament> {
  const supabase = await getSupabaseClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const id = crypto.randomUUID();
  const insertPayload = {
    id,
    user_id: userId,
    name,
    date,
    played_leader_id: playedLeaderId ?? null,
    tournament_type: sanitizeTournamentType(tournamentType),
  };

  const { data, error } = await supabase
    .from("tournaments")
    .insert(insertPayload)
    .select(TOURNAMENT_SELECT_WITH_TYPES)
    .single();

  if (error) {
    if (isMissingColumnError(error)) {
      const fallbackInsertPayload = {
        id,
        user_id: userId,
        name,
        date,
        played_leader_id: playedLeaderId ?? null,
      };

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("tournaments")
        .insert(fallbackInsertPayload)
        .select(TOURNAMENT_SELECT_BASE)
        .single();

      if (fallbackError) {
        throw fallbackError;
      }

      return mapTournamentRow(fallbackData as TournamentRow, []);
    }

    throw error;
  }

  return mapTournamentRow(data as TournamentRow, []);
}

export async function updateTournament(
  id: string,
  name: string,
  date: string,
  tournamentType: TournamentType = DEFAULT_TOURNAMENT_TYPE,
): Promise<Tournament | undefined> {
  const supabase = await getSupabaseClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("tournaments")
    .update({
      name,
      date,
      tournament_type: sanitizeTournamentType(tournamentType),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(TOURNAMENT_SELECT_WITH_TYPES)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("tournaments")
        .update({ name, date })
        .eq("id", id)
        .eq("user_id", userId)
        .select(TOURNAMENT_SELECT_BASE)
        .maybeSingle();

      if (fallbackError) {
        throw fallbackError;
      }

      if (!fallbackData) {
        return undefined;
      }

      const existingFallback = await getTournamentById(id);
      return (
        existingFallback ?? mapTournamentRow(fallbackData as TournamentRow, [])
      );
    }

    throw error;
  }

  if (!data) {
    return undefined;
  }

  const existing = await getTournamentById(id);
  return existing ?? mapTournamentRow(data as TournamentRow, []);
}

export async function deleteTournament(id: string): Promise<boolean> {
  const supabase = await getSupabaseClient();

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const { error: deleteRoundsError } = await supabase
    .from("rounds")
    .delete()
    .eq("tournament_id", id);

  if (deleteRoundsError) {
    throw deleteRoundsError;
  }

  const { data, error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    throw error;
  }

  return Boolean(data && data.length > 0);
}

export async function addRound(
  tournamentId: string,
  won: boolean,
  wonCoinFlip: boolean,
  startingPosition: "1st" | "2nd",
  opponentLeaderId: string,
): Promise<Round | undefined> {
  const supabase = await getSupabaseClient();

  const userId = await getCurrentUserId();
  if (!userId) {
    return undefined;
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("id", tournamentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (tournamentError) {
    throw tournamentError;
  }

  if (!tournament) {
    return undefined;
  }

  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("rounds")
    .insert({
      id,
      tournament_id: tournamentId,
      opponent_leader_id: opponentLeaderId,
      won,
      won_coin_flip: wonCoinFlip,
      starting_position: startingPosition,
    })
    .select(
      "id,tournament_id,opponent_leader_id,won,won_coin_flip,starting_position,created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapRoundRow(data as RoundRow);
}

export async function deleteRound(
  tournamentId: string,
  roundId: string,
): Promise<boolean> {
  const supabase = await getSupabaseClient();

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("rounds")
    .delete()
    .eq("id", roundId)
    .eq("tournament_id", tournamentId)
    .select("id");

  if (error) {
    throw error;
  }

  return Boolean(data && data.length > 0);
}

export async function getTournamentStats(tournamentId: string) {
  const supabase = await getSupabaseClient();

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      totalRounds: 0,
      wins: 0,
      losses: 0,
      coinFlipWins: 0,
      winRate: "0",
    };
  }

  const { data: rounds, error } = await supabase
    .from("rounds")
    .select("won,won_coin_flip")
    .eq("tournament_id", tournamentId);

  if (error) {
    if (isMissingTableError(error)) {
      return {
        totalRounds: 0,
        wins: 0,
        losses: 0,
        coinFlipWins: 0,
        winRate: "0",
      };
    }
    throw error;
  }

  const totalRounds = (rounds ?? []).length;
  const wins = (rounds ?? []).filter((m) => m.won).length;
  const coinFlipWins = (rounds ?? []).filter((m) => m.won_coin_flip).length;
  const winRate =
    totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : "0";

  return {
    totalRounds,
    wins,
    losses: totalRounds - wins,
    coinFlipWins,
    winRate,
  };
}
