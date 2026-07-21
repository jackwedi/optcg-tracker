import { NextRequest, NextResponse } from "next/server";
import { deleteRound } from "@/lib/db";

interface Params {
  id: string;
  roundId: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
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
      { status: 500 }
    );
  }
}
