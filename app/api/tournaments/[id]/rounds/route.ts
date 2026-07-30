import { NextRequest, NextResponse } from "next/server";
import { addRound } from "@/lib/db";
import {
  BYE_LEADER_ID,
  ensureByeLeaderExists,
  getLeaderById,
} from "@/lib/leaders";

interface Params {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const { opponentLeaderId, won, wonCoinFlip, startingPosition, isBye } =
      await request.json();

    const byeRound = Boolean(isBye);
    let normalizedOpponentLeaderId: string;
    if (byeRound) {
      normalizedOpponentLeaderId = BYE_LEADER_ID;
    } else if (
      typeof opponentLeaderId === "string" &&
      opponentLeaderId.length > 0
    ) {
      normalizedOpponentLeaderId = opponentLeaderId;
    } else {
      return NextResponse.json(
        { error: "Missing required field: opponentLeaderId" },
        { status: 400 },
      );
    }

    if (byeRound) {
      await ensureByeLeaderExists();
    } else if (normalizedOpponentLeaderId) {
      const opponentLeader = await getLeaderById(normalizedOpponentLeaderId);
      if (!opponentLeader) {
        return NextResponse.json(
          { error: "Invalid opponentLeaderId" },
          { status: 400 },
        );
      }
    }

    const normalizedPosition = byeRound
      ? "1st"
      : startingPosition === "2nd"
        ? "2nd"
        : "1st";
    const round = await addRound(
      id,
      byeRound ? true : Boolean(won),
      byeRound ? false : Boolean(wonCoinFlip),
      normalizedPosition,
      normalizedOpponentLeaderId,
    );

    if (!round) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(round, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 },
    );
  }
}
