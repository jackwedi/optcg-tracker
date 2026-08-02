import { NextRequest, NextResponse } from "next/server";
import { joinCrew } from "@/lib/crews";

export async function POST(request: NextRequest) {
  try {
    const { crewId } = await request.json();

    if (!crewId || typeof crewId !== "string") {
      return NextResponse.json(
        { error: "Missing required field: crewId" },
        { status: 400 },
      );
    }

    const result = await joinCrew(crewId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to join crew" },
      { status: 500 },
    );
  }
}
