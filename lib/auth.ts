import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { hasAdminRoleFromUnknown } from "@/lib/roles";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return user.id;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return hasAdminRoleFromUnknown(user);
}
