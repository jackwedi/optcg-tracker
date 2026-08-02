import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getCurrentUserId } from "@/lib/auth";
import { getLifetimeRoundsCount } from "@/lib/db";
import {
  MAX_CREW_MEMBERS,
  MAX_CREW_NAME_LENGTH,
  ROUNDS_REQUIRED_TO_UNLOCK_CREWS,
  type Crew,
  type CrewActionResult,
  type CrewEligibility,
  type CrewLeaderboard,
  type CrewLeaderboardEntry,
} from "@/models/crew";

const CREW_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const CREW_ID_LENGTH = 6;
const MAX_CREW_ID_ATTEMPTS = 8;

function generateCrewId(): string {
  let id = "";
  for (let i = 0; i < CREW_ID_LENGTH; i++) {
    id += CREW_ID_ALPHABET[Math.floor(Math.random() * CREW_ID_ALPHABET.length)];
  }
  return id;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

const CREW_SELECT = "id,name,created_by,created_at";

function mapCrewRow(row: {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}): Crew {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export async function getRoundsEligibility(): Promise<CrewEligibility> {
  const totalRounds = await getLifetimeRoundsCount();
  return {
    eligible: totalRounds >= ROUNDS_REQUIRED_TO_UNLOCK_CREWS,
    totalRounds,
    roundsRequired: ROUNDS_REQUIRED_TO_UNLOCK_CREWS,
  };
}

export async function getCurrentUserCrewId(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("crew_members")
    .select("crew_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.crew_id as string | undefined) ?? null;
}

export async function getCurrentUserCrew(): Promise<Crew | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("crew_members")
    .select("crew_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: crew, error: crewError } = await supabaseAdmin
    .from("crews")
    .select(CREW_SELECT)
    .eq("id", membership.crew_id)
    .maybeSingle();
  if (crewError) throw crewError;

  return crew ? mapCrewRow(crew) : null;
}

export async function createCrew(name: string): Promise<CrewActionResult<Crew>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Authentication required" };

  const normalizedName = name.trim();
  if (!normalizedName) return { ok: false, error: "Crew name is required" };
  if (normalizedName.length > MAX_CREW_NAME_LENGTH) {
    return {
      ok: false,
      error: `Crew name must be ${MAX_CREW_NAME_LENGTH} characters or fewer`,
    };
  }

  const eligibility = await getRoundsEligibility();
  if (!eligibility.eligible) {
    return {
      ok: false,
      error: `You need ${eligibility.roundsRequired} rounds played to create a Crew (you have ${eligibility.totalRounds}).`,
    };
  }

  const existingCrewId = await getCurrentUserCrewId();
  if (existingCrewId) return { ok: false, error: "You are already in a crew" };

  const supabaseAdmin = createSupabaseAdminClient();

  for (let attempt = 0; attempt < MAX_CREW_ID_ATTEMPTS; attempt++) {
    const id = generateCrewId();
    const { data, error } = await supabaseAdmin
      .from("crews")
      .insert({ id, name: normalizedName, created_by: userId })
      .select(CREW_SELECT)
      .single();

    if (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }

    const { error: memberError } = await supabaseAdmin
      .from("crew_members")
      .insert({ user_id: userId, crew_id: id });

    if (memberError) {
      await supabaseAdmin.from("crews").delete().eq("id", id);
      throw memberError;
    }

    return { ok: true, data: mapCrewRow(data) };
  }

  return {
    ok: false,
    error: "Could not generate a unique crew code, please try again",
  };
}

export async function joinCrew(crewId: string): Promise<CrewActionResult<Crew>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Authentication required" };

  const normalizedCrewId = crewId.trim().toUpperCase();
  if (!normalizedCrewId) return { ok: false, error: "Crew code is required" };

  const eligibility = await getRoundsEligibility();
  if (!eligibility.eligible) {
    return {
      ok: false,
      error: `You need ${eligibility.roundsRequired} rounds played to join a Crew (you have ${eligibility.totalRounds}).`,
    };
  }

  const existingCrewId = await getCurrentUserCrewId();
  if (existingCrewId) return { ok: false, error: "You are already in a crew" };

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: crew, error: crewError } = await supabaseAdmin
    .from("crews")
    .select(CREW_SELECT)
    .eq("id", normalizedCrewId)
    .maybeSingle();
  if (crewError) throw crewError;
  if (!crew) return { ok: false, error: "Crew not found" };

  const { count, error: countError } = await supabaseAdmin
    .from("crew_members")
    .select("user_id", { count: "exact", head: true })
    .eq("crew_id", normalizedCrewId);
  if (countError) throw countError;
  if ((count ?? 0) >= MAX_CREW_MEMBERS) {
    return { ok: false, error: "This crew is full" };
  }

  const { error: insertError } = await supabaseAdmin
    .from("crew_members")
    .insert({ user_id: userId, crew_id: normalizedCrewId });

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      return { ok: false, error: "You are already in a crew" };
    }
    throw insertError;
  }

  return { ok: true, data: mapCrewRow(crew) };
}

export async function leaveCrew(): Promise<CrewActionResult<null>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Authentication required" };

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("crew_members")
    .delete()
    .eq("user_id", userId)
    .select("user_id");

  if (error) throw error;
  if (!data || data.length === 0) {
    return { ok: false, error: "You are not in a crew" };
  }
  return { ok: true, data: null };
}

export async function getCrewLeaderboard(): Promise<CrewLeaderboard | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: myMembership, error: myMembershipError } = await supabaseAdmin
    .from("crew_members")
    .select("crew_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (myMembershipError) throw myMembershipError;
  if (!myMembership) return null;

  const crewId = myMembership.crew_id as string;

  const { data: members, error: membersError } = await supabaseAdmin
    .from("crew_members")
    .select("user_id,joined_at")
    .eq("crew_id", crewId)
    .order("joined_at", { ascending: true });
  if (membersError) throw membersError;

  const memberUserIds = (members ?? []).map((m) => m.user_id as string);
  const joinRank = new Map(memberUserIds.map((id, idx) => [id, idx]));

  const { data: tournaments, error: tournamentsError } = await supabaseAdmin
    .from("tournaments")
    .select("id,user_id")
    .in("user_id", memberUserIds);
  if (tournamentsError) throw tournamentsError;

  const tournamentOwner = new Map<string, string>();
  for (const t of tournaments ?? []) {
    tournamentOwner.set(t.id as string, t.user_id as string);
  }
  const tournamentIds = Array.from(tournamentOwner.keys());

  const winsByUser = new Map<string, number>(memberUserIds.map((id) => [id, 0]));
  const roundsByUser = new Map<string, number>(
    memberUserIds.map((id) => [id, 0]),
  );

  if (tournamentIds.length > 0) {
    const { data: rounds, error: roundsError } = await supabaseAdmin
      .from("rounds")
      .select("tournament_id,won")
      .in("tournament_id", tournamentIds);
    if (roundsError) throw roundsError;

    for (const round of rounds ?? []) {
      const owner = tournamentOwner.get(round.tournament_id as string);
      if (!owner) continue;
      roundsByUser.set(owner, (roundsByUser.get(owner) ?? 0) + 1);
      if (round.won) winsByUser.set(owner, (winsByUser.get(owner) ?? 0) + 1);
    }
  }

  const resolved = await Promise.all(
    memberUserIds.map(async (id) => {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
      if (error || !data.user) return { id, displayName: "Unknown Player" };
      const rawName = data.user.user_metadata?.display_name;
      const displayName =
        typeof rawName === "string" && rawName.trim()
          ? rawName
          : (data.user.email ?? "Unknown Player");
      return { id, displayName };
    }),
  );
  const displayNameByUser = new Map(resolved.map((r) => [r.id, r.displayName]));

  const entries: CrewLeaderboardEntry[] = memberUserIds
    .map((id) => ({
      userId: id,
      displayName: displayNameByUser.get(id) ?? "Unknown Player",
      wins: winsByUser.get(id) ?? 0,
      totalRounds: roundsByUser.get(id) ?? 0,
      isCurrentUser: id === userId,
    }))
    .sort(
      (a, b) =>
        b.wins - a.wins || joinRank.get(a.userId)! - joinRank.get(b.userId)!,
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return { crewId, entries };
}
