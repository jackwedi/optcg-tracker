"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import {
  DEFAULT_TOURNAMENT_TYPE,
  TOURNAMENT_TYPES,
  type TournamentType,
} from "@/models/tournament";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TournamentForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayDateString);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [playedLeaderId, setPlayedLeaderId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTournamentType, setSelectedTournamentType] =
    useState<TournamentType>(DEFAULT_TOURNAMENT_TYPE);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/leaders")
      .then((r) => r.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const idGroupOptions = Array.from(
    new Set(
      leaders
        .map((l) => l.id.split("-")[0] || "")
        .filter(Boolean)
        .map((p) => (p.startsWith("ST") ? "ST" : p)),
    ),
  ).sort();

  const colorOptions = Array.from(
    new Set(
      leaders
        .flatMap((l) => (Array.isArray(l.colors) ? l.colors.flat() : []))
        .filter(Boolean),
    ),
  ).sort();

  const filteredLeaders = leaders.filter((l) => {
    let prefix = l.id.split("-")[0] || "";
    if (prefix.startsWith("ST")) prefix = "ST";
    const matchesId = idGroupFilter === "All" || prefix === idGroupFilter;
    const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
    const matchesColor =
      colorFilter.length === 0 ||
      colorFilter.every((c) => leaderColors.includes(c));
    return matchesId && matchesColor;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          date,
          playedLeaderId,
          tournamentType: selectedTournamentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tournament");
      }

      const tournament = await response.json();
      setName("");
      setDate(getTodayDateString());
      setSelectedTournamentType(DEFAULT_TOURNAMENT_TYPE);
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-slate-700"
          >
            Tournament Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base"
            placeholder="e.g., Regional Championship"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-semibold text-slate-700"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="tournamentType"
          className="block text-sm font-semibold text-slate-700"
        >
          Tournament Type
        </label>
        <select
          id="tournamentType"
          value={selectedTournamentType}
          onChange={(e) =>
            setSelectedTournamentType(e.target.value as TournamentType)
          }
          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {TOURNAMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Played Leader
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Pick the leader you&apos;ll be playing for this tournament.
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            Color
          </label>
          <LeaderColorFilter
            colors={colorOptions}
            value={colorFilter}
            onChange={setColorFilter}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Extension
            </label>
            <select
              value={idGroupFilter}
              onChange={(e) => setIdGroupFilter(e.target.value)}
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Select Extension</option>
              {idGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Played Leader
            </label>
            <select
              value={playedLeaderId ?? ""}
              onChange={(e) => setPlayedLeaderId(e.target.value || undefined)}
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select leader --</option>
              {filteredLeaders.map((l) => (
                <option key={l.id} value={l.id}>{`${l.name} (${l.id})`}</option>
              ))}
            </select>
          </div>
        </div>

        {playedLeaderId &&
          (() => {
            const sel = leaders.find((x) => x.id === playedLeaderId);
            if (!sel) return null;
            const previewSrc = /^https?:\/\//i.test(sel.imageUrl)
              ? sel.imageUrl
              : `/${sel.imageUrl}`.replace(/^\//, "/");
            return (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <img
                  src={previewSrc}
                  alt={sel.name}
                  className="h-14 w-14 border bg-white object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder.png";
                  }}
                />
                <div>
                  <div className="text-lg font-medium">{sel.name}</div>
                  <div className="text-sm text-gray-500">{sel.id}</div>
                </div>
              </div>
            );
          })()}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Tournament"}
      </button>
    </form>
  );
}
