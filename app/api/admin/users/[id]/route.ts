import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasAdminRoleFromUnknown } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface Params {
  id: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!hasAdminRoleFromUnknown(currentUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { displayName } = await request.json();

    if (typeof displayName !== "string" || !displayName.trim()) {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 },
      );
    }

    const normalizedDisplayName = displayName.trim();
    if (normalizedDisplayName.length > 40) {
      return NextResponse.json(
        { error: "displayName must be 40 characters or fewer" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: fetchedUser, error: fetchError } =
      await supabaseAdmin.auth.admin.getUserById(id);
    if (fetchError || !fetchedUser.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const nextUserMetadata = {
      ...(fetchedUser.user.user_metadata ?? {}),
      display_name: normalizedDisplayName,
    };

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: nextUserMetadata,
    });

    if (error || !data.user) {
      throw error ?? new Error("Failed to update user");
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email ?? "",
      displayName:
        typeof data.user.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name
          : "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update pseudo" },
      { status: 500 },
    );
  }
}
