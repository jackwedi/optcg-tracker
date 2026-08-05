"use client";

import { useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import { TOURNAMENT_TYPES } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { StatMeter } from "@/components/StatMeter";
import { PlayedLeaderRepartition } from "@/components/PlayedLeaderRepartition";

const ALL_TYPES = "All";

interface TournamentStatsByTypeProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

export function TournamentStatsByType({
  tournaments,
  leadersById,
}: TournamentStatsByTypeProps) {
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);

  const filteredTournaments = useMemo(() => {
    if (typeFilter === ALL_TYPES) return tournaments;
    return tournaments.filter((t) => t.tournamentType === typeFilter);
  }, [tournaments, typeFilter]);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="mt-6">
        <PlayedLeaderRepartition
          tournaments={filteredTournaments}
          leadersById={leadersById}
        />
      </div>
    </div>
  );
}
