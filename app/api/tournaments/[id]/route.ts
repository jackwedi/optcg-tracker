import { NextRequest, NextResponse } from "next/server";
import {
  getTournamentById,
  updateTournament,
  deleteTournament,
} from "@/lib/db";
import {
  DEFAULT_TOURNAMENT_TYPE,
  TOURNAMENT_TYPES,
  type TournamentType,
} from "@/models/tournament";

interface Params {
  id: string;
}

function normalizeTournamentType(value: unknown): TournamentType {
  if (typeof value !== "string") {
    return DEFAULT_TOURNAMENT_TYPE;
  }

  if (TOURNAMENT_TYPES.includes(value as TournamentType)) {
    return value as TournamentType;
  }

  return DEFAULT_TOURNAMENT_TYPE;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(tournament);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const { name, date, tournamentType } = await request.json();

    if (!name || !date) {
      return NextResponse.json(
        { error: "Missing required fields: name, date" },
        { status: 400 },
      );
    }

    const tournament = await updateTournament(
      id,
      name,
      date,
      normalizeTournamentType(tournamentType),
    );

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(tournament);
  } catch {
    return NextResponse.json(
      { error: "Failed to update tournament" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteTournament(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Tournament deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 },
    );
  }
}
