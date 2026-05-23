import { NextRequest, NextResponse } from "next/server";
import { addMatch } from "@/lib/db";

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const { opponentDeck, won, wonCoinFlip } = await request.json();

    if (!opponentDeck) {
      return NextResponse.json(
        { error: "Missing required field: opponentDeck" },
        { status: 400 },
      );
    }

    const match = addMatch(id, opponentDeck, won, wonCoinFlip);

    if (!match) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(match, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 },
    );
  }
}
