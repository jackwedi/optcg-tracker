"use client";

import { useMemo, useState } from "react";
import type { CrewLeaderboardEntry } from "@/models/crew";
import { TOURNAMENT_TYPES, type TournamentType } from "@/models/tournament";

const ALL_TYPES = "All";
type TypeFilter = "All" | TournamentType;

interface CrewLeaderboardTableProps {
  entries: CrewLeaderboardEntry[];
}

export function CrewLeaderboardTable({ entries }: CrewLeaderboardTableProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL_TYPES);

  const rankedEntries = useMemo(() => {
    return entries
      .map((entry) => {
        const rounds =
          typeFilter === ALL_TYPES
            ? entry.rounds
            : entry.rounds.filter((r) => r.tournamentType === typeFilter);
        return {
          userId: entry.userId,
          displayName: entry.displayName,
          isCurrentUser: entry.isCurrentUser,
          wins: rounds.filter((r) => r.won).length,
          totalRounds: rounds.length,
        };
      })
      .sort((a, b) => b.wins - a.wins)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [entries, typeFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter(ALL_TYPES)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            typeFilter === ALL_TYPES
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All Types
        </button>
        {TOURNAMENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              typeFilter === type
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {rankedEntries.length === 0 ? (
        <div className="rounded-lg border border-gray-200 py-12 text-center">
          <p className="text-gray-500">No crew members yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Pseudo</th>
                <th className="px-4 py-3 text-right font-semibold">Wins</th>
                <th className="px-4 py-3 text-right font-semibold">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankedEntries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={
                    entry.rank === 1
                      ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50"
                      : entry.isCurrentUser
                        ? "bg-sky-50"
                        : "hover:bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-600">
                    {entry.rank === 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                        👑
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {entry.displayName}
                    {entry.isCurrentUser ? (
                      <span className="ml-1.5 text-xs font-normal text-sky-600">
                        (You)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {entry.wins}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {entry.totalRounds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
