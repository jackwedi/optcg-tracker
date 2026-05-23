import { NextRequest, NextResponse } from "next/server";
import { getLeaders, createLeader } from "@/lib/leaders";

export async function GET() {
  try {
    const leaders = getLeaders();
    return NextResponse.json(leaders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leaders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, colors, imageUrl, altImageUrl } = await request.json();

    if (!name || !colors || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields: name, colors, imageUrl" },
        { status: 400 },
      );
    }

    const leader = createLeader(name, colors, imageUrl, altImageUrl);
    return NextResponse.json(leader, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create leader" },
      { status: 500 },
    );
  }
}
