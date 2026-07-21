import { NextRequest, NextResponse } from "next/server";
import { addRound } from "@/lib/db";
import { getLeaderById } from "@/lib/leaders";

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const { opponentLeaderId, won, wonCoinFlip, startingPosition } =
      await request.json();

    if (!opponentLeaderId) {
      return NextResponse.json(
        { error: "Missing required field: opponentLeaderId" },
        { status: 400 }
      );
    }

    const opponentLeader = await getLeaderById(opponentLeaderId);
    if (!opponentLeader) {
      return NextResponse.json(
        { error: "Invalid opponentLeaderId" },
        { status: 400 }
      );
    }

    const normalizedPosition = startingPosition === "2nd" ? "2nd" : "1st";
    const round = await addRound(
      id,
      won,
      wonCoinFlip,
      normalizedPosition,
      opponentLeaderId
    );

    if (!round) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json(round, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}
