import { NextRequest, NextResponse } from "next/server";
import { addMatch } from "@/lib/db";
import { getLeaderById } from "@/lib/leaders";

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const { opponentLeaderId, won, wonCoinFlip, startingPosition } = await request.json();

    if (!opponentLeaderId) {
      return NextResponse.json(
        { error: "Missing required field: opponentLeaderId" },
        { status: 400 },
      );
    }

    const opponentLeader = getLeaderById(opponentLeaderId);
    if (!opponentLeader) {
      return NextResponse.json(
        { error: "Invalid opponentLeaderId" },
        { status: 400 },
      );
    }

    const normalizedPosition = startingPosition === "2nd" ? "2nd" : "1st";
    const match = addMatch(
      id,
      won,
      wonCoinFlip,
      normalizedPosition,
      opponentLeaderId,
    );

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
