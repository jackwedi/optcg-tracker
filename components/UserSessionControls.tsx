"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { hasAdminRoleFromUnknown } from "@/lib/roles";

export function UserSessionControls() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      const userDisplayName = user?.user_metadata?.display_name as
        | string
        | undefined;
      const normalizedDisplayName = userDisplayName?.trim() || null;
      setUserEmail(user?.email ?? null);
      setDisplayName(normalizedDisplayName);
      setIsAdmin(hasAdminRoleFromUnknown(user));
      setLoading(false);
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    setUserEmail(null);
    setDisplayName(null);
    router.replace("/login");
    router.refresh();
  };

  if (loading || !userEmail) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <span className="max-w-[160px] truncate rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 md:max-w-[220px] md:text-sm">
        {displayName ?? userEmail}
      </span>
      {isAdmin ? (
        <Link
          href="/admin/players"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 md:text-sm"
        >
          Backoffice
        </Link>
      ) : null}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
