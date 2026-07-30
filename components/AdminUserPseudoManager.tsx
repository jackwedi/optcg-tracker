"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export function AdminUserPseudoManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

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
    loadUsers();
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by email or pseudo"
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading users...</p>
      ) : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {message ? (
        <p className="mb-3 text-sm text-slate-600">{message}</p>
      ) : null}

      {!loading ? (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">
                  {user.email}
                </p>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500">
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
                  className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => handleSavePseudo(user)}
                  disabled={savingUserId === user.id}
                  className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUserId === user.id ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No users found.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
