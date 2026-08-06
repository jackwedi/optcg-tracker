"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { hasAdminRoleFromUnknown } from "@/lib/roles";
import { SpinnerIcon } from "@/components/SpinnerIcon";

function UserIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

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

  // One consistent pill/circle language for the actions (Backoffice,
  // sign-out) so they read as a single group instead of mismatched
  // floating controls. The identity chip shares that same rounded-full
  // shape but gets a solid dark fill + icon so it reads as "this is
  // you," not a third button sitting among the actions.
  return (
    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
      <span className="inline-flex max-w-[160px] items-center gap-1.5 truncate rounded-full bg-slate-500 px-3 py-1.5 text-xs font-medium text-white md:max-w-[220px] md:text-sm">
        <UserIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{displayName ?? userEmail}</span>
      </span>
      {isAdmin ? (
        <Link
          href="/admin/players"
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 md:text-sm"
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:h-9 md:w-9"
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
