"use client";

import { useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { TournamentTable } from "@/components/TournamentTable";
import { LeaderColorDots } from "@/components/LeaderColorDots";

const ALL_LEADERS = "All";

interface StatMeterProps {
  label: string;
  value: number;
  detail: string;
  trackClassName: string;
  fillClassName: string;
  valueClassName: string;
}

function StatMeter({
  label,
  value,
  detail,
  trackClassName,
  fillClassName,
  valueClassName,
}: StatMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className={`text-2xl font-semibold ${valueClassName}`}>
          {value.toFixed(1)}%
        </p>
      </div>
      <div
        className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${trackClassName}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fillClassName}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

interface TournamentTableWithFilterProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

export function TournamentTableWithFilter({
  tournaments,
  leadersById,
}: TournamentTableWithFilterProps) {
  const [leaderFilter, setLeaderFilter] = useState(ALL_LEADERS);

  const usedLeaders = useMemo(() => {
    const seen = new Map<string, Leader>();
    for (const tournament of tournaments) {
      if (!tournament.playedLeaderId) continue;
      const leader = leadersById[tournament.playedLeaderId];
      if (leader) seen.set(leader.id, leader);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [tournaments, leadersById]);

  const filteredTournaments = useMemo(() => {
    if (leaderFilter === ALL_LEADERS) return tournaments;
    return tournaments.filter((t) => t.playedLeaderId === leaderFilter);
  }, [tournaments, leaderFilter]);

  const aggregateStats = useMemo(() => {
    let totalRounds = 0;
    let wins = 0;
    let coinFlipWins = 0;

    for (const tournament of filteredTournaments) {
      totalRounds += tournament.rounds.length;
      wins += tournament.rounds.filter((r) => r.won).length;
      coinFlipWins += tournament.rounds.filter((r) => r.wonCoinFlip).length;
    }

    return {
      totalRounds,
      wins,
      coinFlipWins,
      winRate: totalRounds > 0 ? (wins / totalRounds) * 100 : 0,
      coinFlipWinRate:
        totalRounds > 0 ? (coinFlipWins / totalRounds) * 100 : 0,
    };
  }, [filteredTournaments]);

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatMeter
          label="Win Rate"
          value={aggregateStats.winRate}
          detail={`${aggregateStats.wins} / ${aggregateStats.totalRounds} rounds won`}
          trackClassName="bg-emerald-100"
          fillClassName="bg-emerald-500"
          valueClassName="text-emerald-600"
        />
        <StatMeter
          label="Coin Flip Win Rate"
          value={aggregateStats.coinFlipWinRate}
          detail={`${aggregateStats.coinFlipWins} / ${aggregateStats.totalRounds} coin flips won`}
          trackClassName="bg-amber-100"
          fillClassName="bg-amber-500"
          valueClassName="text-amber-600"
        />
      </div>

      {usedLeaders.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLeaderFilter(ALL_LEADERS)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              leaderFilter === ALL_LEADERS
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Leaders
          </button>
          {usedLeaders.map((leader) => (
            <button
              key={leader.id}
              type="button"
              onClick={() => setLeaderFilter(leader.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                leaderFilter === leader.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <LeaderColorDots colors={leader.colors} />
              {leader.name}
            </button>
          ))}
        </div>
      ) : null}

      <TournamentTable
        tournaments={filteredTournaments}
        leadersById={leadersById}
      />
    </div>
  );
}
