"use client";

import { useEffect, useState } from "react";
import { StatMeter } from "@/components/StatMeter";

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface PlayerStats {
  totalTournaments: number;
  totalRounds: number;
  wins: number;
  winRate: number;
  coinFlipWins: number;
  coinFlipWinRate: number;
}

export function AdminUserPseudoManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [statsByUserId, setStatsByUserId] = useState<
    Record<string, PlayerStats>
  >({});
  const [statsLoadingUserId, setStatsLoadingUserId] = useState<string | null>(
    null,
  );
  const [statsError, setStatsError] = useState<Record<string, string>>({});

  const loadUsers = async (currentQuery = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users?query=${encodeURIComponent(currentQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = (await response.json()) as AdminUser[];
      setUsers(data);
      setDrafts(
        Object.fromEntries(
          data.map((user) => [user.id, user.displayName ?? ""]),
        ),
      );
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadUsers());
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadUsers(query.trim());
  };

  const handleSavePseudo = async (user: AdminUser) => {
    const nextPseudo = (drafts[user.id] ?? "").trim();
    setMessage(null);

    if (!nextPseudo) {
      setError("Pseudo is required.");
      return;
    }

    if (nextPseudo.length > 40) {
      setError("Pseudo must be 40 characters or fewer.");
      return;
    }

    setSavingUserId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: nextPseudo }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pseudo");
      }

      const updated = (await response.json()) as {
        id: string;
        displayName: string;
      };

      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id
            ? { ...item, displayName: updated.displayName }
            : item,
        ),
      );
      setDrafts((current) => ({
        ...current,
        [updated.id]: updated.displayName,
      }));
      setMessage("Pseudo updated.");
    } catch {
      setError("Failed to update pseudo.");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleStats = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);

    if (statsByUserId[userId]) {
      return;
    }

    setStatsLoadingUserId(userId);
    setStatsError((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });

    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch player stats");
      }

      const data = (await response.json()) as PlayerStats;
      setStatsByUserId((current) => ({ ...current, [userId]: data }));
    } catch {
      setStatsError((current) => ({
        ...current,
        [userId]: "Failed to load stats.",
      }));
    } finally {
      setStatsLoadingUserId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by email or pseudo"
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/30"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading users...
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {message ? (
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          {message}
        </p>
      ) : null}

      {!loading ? (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {user.email}
                </p>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {user.role}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={drafts[user.id] ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [user.id]: event.target.value,
                    }))
                  }
                  maxLength={40}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-sky-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleSavePseudo(user)}
                  disabled={savingUserId === user.id}
                  className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUserId === user.id ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStats(user.id)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {expandedUserId === user.id ? "Hide stats" : "View stats"}
                </button>
              </div>

              {expandedUserId === user.id ? (
                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-600">
                  {statsLoadingUserId === user.id ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Loading stats...
                    </p>
                  ) : statsError[user.id] ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {statsError[user.id]}
                    </p>
                  ) : statsByUserId[user.id] ? (
                    <>
                      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                        {statsByUserId[user.id].totalTournaments} tournament
                        {statsByUserId[user.id].totalTournaments === 1
                          ? ""
                          : "s"}{" "}
                        · {statsByUserId[user.id].totalRounds} rounds played
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <StatMeter
                          label="Win Rate"
                          value={statsByUserId[user.id].winRate}
                          detail={`${statsByUserId[user.id].wins} / ${statsByUserId[user.id].totalRounds} rounds won`}
                          trackClassName="bg-emerald-100 dark:bg-emerald-500/10"
                          fillClassName="bg-emerald-500"
                          valueClassName="text-emerald-600 dark:text-emerald-400"
                        />
                        <StatMeter
                          label="Coin Flip Win Rate"
                          value={statsByUserId[user.id].coinFlipWinRate}
                          detail={`${statsByUserId[user.id].coinFlipWins} / ${statsByUserId[user.id].totalRounds} coin flips won`}
                          trackClassName="bg-amber-100 dark:bg-amber-500/10"
                          fillClassName="bg-amber-500"
                          valueClassName="text-amber-600 dark:text-amber-400"
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          {users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No users found.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
