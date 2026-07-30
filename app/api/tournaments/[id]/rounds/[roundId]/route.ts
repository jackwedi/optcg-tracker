import { NextRequest, NextResponse } from "next/server";
import { deleteRound, updateRound } from "@/lib/db";
import {
  BYE_LEADER_ID,
  ensureByeLeaderExists,
  getLeaderById,
} from "@/lib/leaders";

interface Params {
  id: string;
  roundId: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id, roundId } = await params;
    const deleted = await deleteRound(id, roundId);

    if (!deleted) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Round deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete round" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id, roundId } = await params;
    const { opponentLeaderId, won, wonCoinFlip, startingPosition, isBye } =
      await request.json();

    const byeRound = Boolean(isBye);
    let normalizedOpponentLeaderId: string;

    if (byeRound) {
      normalizedOpponentLeaderId = BYE_LEADER_ID;
      await ensureByeLeaderExists();
    } else if (
      typeof opponentLeaderId === "string" &&
      opponentLeaderId.length > 0
    ) {
      normalizedOpponentLeaderId = opponentLeaderId;
      const opponentLeader = await getLeaderById(normalizedOpponentLeaderId);

      if (!opponentLeader) {
        return NextResponse.json(
          { error: "Invalid opponentLeaderId" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Missing required field: opponentLeaderId" },
        { status: 400 },
      );
    }

    const normalizedPosition = byeRound
      ? "1st"
      : startingPosition === "2nd"
        ? "2nd"
        : "1st";

    const round = await updateRound(
      id,
      roundId,
      byeRound ? true : Boolean(won),
      byeRound ? false : Boolean(wonCoinFlip),
      normalizedPosition,
      normalizedOpponentLeaderId,
    );

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json(round);
  } catch {
    return NextResponse.json(
      { error: "Failed to update round" },
      { status: 500 },
    );
  }
}
