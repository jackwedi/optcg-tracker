import { NextRequest, NextResponse } from "next/server";
import { getLeaderById, updateLeader, deleteLeader } from "@/lib/leaders";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const leader = await getLeaderById(id);
    if (!leader)
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    return NextResponse.json(leader);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leader" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const { name, colors, imageUrl, altImageUrl } = await request.json();

    if (!name || !colors || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leader = await updateLeader(id, name, colors, imageUrl, altImageUrl);
    if (!leader)
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    return NextResponse.json(leader);
  } catch {
    return NextResponse.json(
      { error: "Failed to update leader" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteLeader(id);
    if (!deleted)
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    return NextResponse.json({ message: "Leader deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete leader" },
      { status: 500 }
    );
  }
}
