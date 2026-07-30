import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasAdminRoleFromUnknown } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface AdminUserDTO {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

function mapUserRole(user: unknown): string {
  if (!user || typeof user !== "object") {
    return "user";
  }

  const typedUser = user as {
    app_metadata?: { role?: unknown };
    user_metadata?: { role?: unknown };
  };

  const appRole = typedUser.app_metadata?.role;
  const userRole = typedUser.user_metadata?.role;

  if (typeof appRole === "string" && appRole.trim()) {
    return appRole;
  }

  if (typeof userRole === "string" && userRole.trim()) {
    return userRole;
  }

  return "user";
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!hasAdminRoleFromUnknown(currentUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query =
      request.nextUrl.searchParams.get("query")?.trim().toLowerCase() ?? "";
    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users: AdminUserDTO[] = (data.users ?? []).map((user) => {
      const displayName =
        typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : "";

      return {
        id: user.id,
        email: user.email ?? "",
        displayName,
        role: mapUserRole(user),
      };
    });

    const filteredUsers = query
      ? users.filter((user) => {
          const haystack = `${user.email} ${user.displayName}`.toLowerCase();
          return haystack.includes(query);
        })
      : users;

    return NextResponse.json(filteredUsers);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
