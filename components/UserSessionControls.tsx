"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { hasAdminRoleFromUnknown } from "@/lib/roles";
import { SpinnerIcon } from "@/components/SpinnerIcon";

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function UserSessionControls() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const applyUser = (user: User | null) => {
      const userDisplayName = user?.user_metadata?.display_name as
        | string
        | undefined;
      const normalizedDisplayName = userDisplayName?.trim() || null;
      setUserEmail(user?.email ?? null);
      setDisplayName(normalizedDisplayName);
      setIsAdmin(hasAdminRoleFromUnknown(user));
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => applyUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
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
        aria-label="Sign out"
        title="Sign out"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900 bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {signingOut ? (
          <SpinnerIcon className="h-4 w-4" />
        ) : (
          <LogoutIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
