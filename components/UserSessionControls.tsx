"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function UserSessionControls() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

      setUserEmail(user?.email ?? null);
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
    router.replace("/login");
    router.refresh();
  };

  if (loading || !userEmail) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="max-w-[160px] truncate rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 md:max-w-[220px] md:text-sm">
        {userEmail}
      </span>
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
