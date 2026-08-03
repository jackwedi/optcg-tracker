import { NextRequest, NextResponse } from "next/server";
import { getAllMeta, createMeta } from "@/lib/meta";

export async function GET() {
  try {
    const meta = await getAllMeta();
    return NextResponse.json(meta);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch meta" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { extensions, startDate, endDate } = await request.json();

    if (!Array.isArray(extensions) || extensions.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: extensions" },
        { status: 400 },
      );
    }

    const meta = await createMeta(extensions, startDate ?? null, endDate ?? null);
    return NextResponse.json(meta, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create meta" },
      { status: 500 },
    );
  }
}
