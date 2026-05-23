import { NextRequest, NextResponse } from "next/server";
import { deleteMatch } from "@/lib/db";

interface Params {
  id: string;
  matchId: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id, matchId } = await params;
    const deleted = deleteMatch(id, matchId);

    if (!deleted) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Match deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
