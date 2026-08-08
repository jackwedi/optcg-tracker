"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_CREW_NAME_LENGTH } from "@/models/crew";

export function CreateOrJoinCrewCard() {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [crewName, setCrewName] = useState("");
  const [crewCode, setCrewCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: crewName.trim() }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to create crew");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    setError("");

    try {
      const response = await fetch("/api/crews/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId: crewCode.trim() }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to join crew");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Create a Crew
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Name your crew and get a code to share with friends.
          </p>
          <form onSubmit={handleCreate} className="mt-4 space-y-2">
            <input
              type="text"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              placeholder="e.g. Straw Hats"
              maxLength={MAX_CREW_NAME_LENGTH}
              required
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/30"
            />
            <button
              type="submit"
              disabled={creating || joining}
              className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {creating ? "Creating..." : "Create Crew"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Join a Crew
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter a crew code a friend shared with you.
          </p>
          <form onSubmit={handleJoin} className="mt-4 flex gap-2">
            <input
              type="text"
              value={crewCode}
              onChange={(e) => setCrewCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7K3P9Q"
              maxLength={6}
              required
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm uppercase tracking-widest outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/30"
            />
            <button
              type="submit"
              disabled={creating || joining}
              className="shrink-0 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
