import { NextRequest, NextResponse } from "next/server";
import { getTournaments, createTournament } from "@/lib/db";

export async function GET() {
  try {
    const tournaments = getTournaments();
    return NextResponse.json(tournaments);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, date } = await request.json();

    if (!name || !date) {
      return NextResponse.json(
        { error: "Missing required fields: name, date" },
        { status: 400 },
      );
    }

    const tournament = createTournament(name, date);
    return NextResponse.json(tournament, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 },
    );
  }
}
