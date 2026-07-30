"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function UserSessionControls() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [displayNameMessage, setDisplayNameMessage] = useState<string | null>(
    null,
  );
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
      setDisplayNameDraft(normalizedDisplayName ?? "");
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

  const handleUpdateDisplayName = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setDisplayNameMessage(null);

    const trimmedDisplayName = displayNameDraft.trim();

    if (!trimmedDisplayName) {
      setDisplayNameMessage("Pseudo is required.");
      return;
    }

    setSavingDisplayName(true);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: trimmedDisplayName },
    });

    setSavingDisplayName(false);

    if (error) {
      setDisplayNameMessage(error.message);
      return;
    }

    setDisplayName(trimmedDisplayName);
    setDisplayNameDraft(trimmedDisplayName);
    setEditingDisplayName(false);
    setDisplayNameMessage("Pseudo updated.");
    router.refresh();
  };

  const handleCancelEditDisplayName = () => {
    setDisplayNameDraft(displayName ?? "");
    setDisplayNameMessage(null);
    setEditingDisplayName(false);
  };

  if (loading || !userEmail) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {editingDisplayName ? (
        <form
          onSubmit={handleUpdateDisplayName}
          className="flex items-center gap-2 md:gap-3"
        >
          <input
            type="text"
            value={displayNameDraft}
            onChange={(event) => setDisplayNameDraft(event.target.value)}
            placeholder="Pseudo"
            required
            maxLength={40}
            className="w-[130px] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 md:w-[180px] md:text-sm"
          />
          <button
            type="submit"
            disabled={savingDisplayName}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            {savingDisplayName ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancelEditDisplayName}
            disabled={savingDisplayName}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <span className="max-w-[160px] truncate rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 md:max-w-[220px] md:text-sm">
            {displayName ?? userEmail}
          </span>
          <button
            type="button"
            onClick={() => {
              setDisplayNameDraft(displayName ?? "");
              setDisplayNameMessage(null);
              setEditingDisplayName(true);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 md:text-sm"
          >
            Edit pseudo
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut || savingDisplayName}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
      {displayNameMessage ? (
        <span className="text-xs text-slate-600 md:text-sm">
          {displayNameMessage}
        </span>
      ) : null}
    </div>
  );
}
