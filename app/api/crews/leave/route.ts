import { NextResponse } from "next/server";
import { leaveCrew } from "@/lib/crews";

export async function POST() {
  try {
    const result = await leaveCrew();

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Left crew" });
  } catch {
    return NextResponse.json(
      { error: "Failed to leave crew" },
      { status: 500 },
    );
  }
}
