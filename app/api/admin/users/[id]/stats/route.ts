import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasAdminRoleFromUnknown } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!hasAdminRoleFromUnknown(currentUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: tournaments, error: tournamentsError } = await supabaseAdmin
      .from("tournaments")
      .select("id")
      .eq("user_id", id);

    if (tournamentsError) {
      throw tournamentsError;
    }

    const tournamentIds = (tournaments ?? []).map((t) => t.id as string);

    if (tournamentIds.length === 0) {
      return NextResponse.json({
        totalTournaments: 0,
        totalRounds: 0,
        wins: 0,
        winRate: 0,
        coinFlipWins: 0,
        coinFlipWinRate: 0,
      });
    }

    const { data: rounds, error: roundsError } = await supabaseAdmin
      .from("rounds")
      .select("won,won_coin_flip")
      .in("tournament_id", tournamentIds);

    if (roundsError) {
      throw roundsError;
    }

    const totalRounds = rounds?.length ?? 0;
    const wins = (rounds ?? []).filter((r) => r.won).length;
    const coinFlipWins = (rounds ?? []).filter((r) => r.won_coin_flip).length;

    return NextResponse.json({
      totalTournaments: tournamentIds.length,
      totalRounds,
      wins,
      winRate: totalRounds > 0 ? (wins / totalRounds) * 100 : 0,
      coinFlipWins,
      coinFlipWinRate:
        totalRounds > 0 ? (coinFlipWins / totalRounds) * 100 : 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 },
    );
  }
}
