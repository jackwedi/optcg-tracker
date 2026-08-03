import { NextRequest, NextResponse } from "next/server";
import { getMetaById, updateMeta, deleteMeta } from "@/lib/meta";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const meta = await getMetaById(id);
    if (!meta)
      return NextResponse.json({ error: "Meta not found" }, { status: 404 });
    return NextResponse.json(meta);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch meta" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const { extensions, startDate, endDate } = await request.json();

    if (!Array.isArray(extensions) || extensions.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: extensions" },
        { status: 400 },
      );
    }

    const meta = await updateMeta(
      id,
      extensions,
      startDate ?? null,
      endDate ?? null,
    );
    if (!meta)
      return NextResponse.json({ error: "Meta not found" }, { status: 404 });
    return NextResponse.json(meta);
  } catch {
    return NextResponse.json(
      { error: "Failed to update meta" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteMeta(id);
    if (!deleted)
      return NextResponse.json({ error: "Meta not found" }, { status: 404 });
    return NextResponse.json({ message: "Meta deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete meta" },
      { status: 500 },
    );
  }
}
