"use client";

import { useState } from "react";
import Link from "next/link";
import { getTournamentTypeIcon, type Tournament } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { colorToHex } from "@/components/LeaderColorDots";
import { formatDate, getShortLeaderName } from "@/lib/utils";

const PAGE_SIZE = 5;

interface TournamentListCardProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

// The full tournament list, most recent first — this used to be a 5-item
// preview ("Recent Tournaments") pointing at a separate full list on the
// Stats page's Tournaments tab. That tab is gone now; this is the one and
// only place the raw list lives, paginated the same way the tab was.
export function TournamentListCard({
  tournaments,
  leadersById,
}: TournamentListCardProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (tournaments.length === 0) {
    return null;
  }

  const displayedTournaments = tournaments.slice(0, visibleCount);
  const hasMore = tournaments.length > visibleCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
        Tournaments
      </h2>

      <ul className="divide-y divide-slate-100">
        {displayedTournaments.map((tournament) => {
          const wins = tournament.rounds.filter((r) => r.won).length;
          const losses = tournament.rounds.length - wins;
          const playedLeader = tournament.playedLeaderId
            ? leadersById[tournament.playedLeaderId]
            : undefined;

          return (
            <li key={tournament.id}>
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50 sm:px-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Same leader thumbnail + color bar treatment as an
                      opponent cell in RoundList's table. */}
                  <LeaderThumbnail
                    src={playedLeader?.imageUrl ?? "/placeholder.png"}
                    alt={playedLeader?.name ?? "No leader set"}
                    className="h-10 w-8 shrink-0 rounded object-cover sm:h-12 sm:w-10"
                  />
                  {playedLeader && playedLeader.colors.length > 0 ? (
                    <div
                      className="flex h-10 w-1 shrink-0 flex-col overflow-hidden rounded-full sm:h-12"
                      aria-hidden="true"
                    >
                      {playedLeader.colors.slice(0, 2).map((color, i) => (
                        <span
                          key={color + i}
                          className="flex-1"
                          style={{ backgroundColor: colorToHex(color) }}
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <span
                        className="shrink-0 text-xs"
                        role="img"
                        aria-label={`Tournament type: ${tournament.tournamentType}`}
                        title={tournament.tournamentType}
                      >
                        {getTournamentTypeIcon(tournament.tournamentType)}
                      </span>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {tournament.name}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatDate(tournament.date)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {playedLeader
                        ? getShortLeaderName(playedLeader.name)
                        : "No leader set"}
                    </p>
                  </div>
                </div>
                {/* Same record treatment as the tournament detail page's
                    Record card, scaled down for a compact list row. */}
                {tournament.rounds.length > 0 ? (
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <div className="flex items-baseline gap-1 text-sm font-bold text-slate-900">
                      <span>{wins}</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        W
                      </span>
                      <span className="text-slate-300">–</span>
                      <span>{losses}</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        L
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {tournament.rounds.length} rounds
                    </p>
                  </div>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Show More Tournaments
          </button>
        </div>
      ) : null}
    </div>
  );
}
