"use client";

import { useState } from "react";
import type { Tournament } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { LeaderColorDots } from "@/components/LeaderColorDots";

const NOT_SET_KEY = "__not_set__";
const LEADERS_PAGE_SIZE = 5;

interface PlayedLeaderRepartitionProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

interface LeaderShare {
  key: string;
  name: string;
  colors: string[] | undefined;
  count: number;
  percentage: number;
}

export function PlayedLeaderRepartition({
  tournaments,
  leadersById,
}: PlayedLeaderRepartitionProps) {
  const [visibleCount, setVisibleCount] = useState(LEADERS_PAGE_SIZE);
  const total = tournaments.length;

  if (total === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const tournament of tournaments) {
    const key = tournament.playedLeaderId ?? NOT_SET_KEY;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const shares: LeaderShare[] = Array.from(counts.entries())
    .map(([key, count]) => {
      const leader = key !== NOT_SET_KEY ? leadersById[key] : undefined;
      return {
        key,
        name: leader ? leader.name : "Not set",
        colors: leader?.colors,
        count,
        percentage: (count / total) * 100,
      };
    })
    .sort((a, b) => b.count - a.count);

  const displayedShares = shares.slice(0, visibleCount);
  const hasMoreShares = shares.length > visibleCount;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Played Leaders
        </h3>
        <p className="text-sm text-slate-500">
          Share of your {total} tournament{total === 1 ? "" : "s"} by leader
          played
        </p>
      </div>

      <div className="space-y-3">
        {displayedShares.map((share) => (
          <div key={share.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-700">
                {share.colors ? (
                  <LeaderColorDots colors={share.colors} />
                ) : null}
                <span className="truncate">{share.name}</span>
              </span>
              <span className="shrink-0 text-sm text-slate-500">
                {share.count} · {share.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${share.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {hasMoreShares ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + LEADERS_PAGE_SIZE)
            }
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Show More Leaders
          </button>
        </div>
      ) : null}
    </div>
  );
}
