"use client";

import { useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import { TOURNAMENT_TYPES } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import type { ExtensionMeta } from "@/models/meta";
import { TournamentTable } from "@/components/TournamentTable";
import { LeaderColorDots } from "@/components/LeaderColorDots";
import { StatMeter } from "@/components/StatMeter";

const ALL_LEADERS = "All";
const ALL_TYPES = "All";

type CoinFlipFilter = "All" | "Won" | "Lost";
const COIN_FLIP_FILTERS: CoinFlipFilter[] = ["All", "Won", "Lost"];

interface TournamentTableWithFilterProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
  metas: ExtensionMeta[];
}

export function TournamentTableWithFilter({
  tournaments,
  leadersById,
  metas,
}: TournamentTableWithFilterProps) {
  const [leaderFilter, setLeaderFilter] = useState(ALL_LEADERS);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [coinFlipFilter, setCoinFlipFilter] = useState<CoinFlipFilter>("All");
  const [metaFilter, setMetaFilter] = useState<string[]>([]);

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

  const usedMetas = useMemo(() => {
    const usedIds = new Set(
      tournaments.map((t) => t.metaId).filter((id): id is string => !!id),
    );
    return metas.filter((meta) => usedIds.has(meta.id));
  }, [tournaments, metas]);

  const toggleMeta = (metaId: string) => {
    setMetaFilter((current) =>
      current.includes(metaId)
        ? current.filter((id) => id !== metaId)
        : [...current, metaId],
    );
  };

  const filteredTournaments = useMemo(() => {
    const base = tournaments.filter((t) => {
      if (leaderFilter !== ALL_LEADERS && t.playedLeaderId !== leaderFilter) {
        return false;
      }
      if (typeFilter !== ALL_TYPES && t.tournamentType !== typeFilter) {
        return false;
      }
      if (
        metaFilter.length > 0 &&
        (!t.metaId || !metaFilter.includes(t.metaId))
      ) {
        return false;
      }
      return true;
    });

    if (coinFlipFilter === "All") return base;

    return base
      .map((t) => ({
        ...t,
        rounds: t.rounds.filter((r) =>
          coinFlipFilter === "Won" ? r.wonCoinFlip : !r.wonCoinFlip,
        ),
      }))
      .filter((t) => t.rounds.length > 0);
  }, [tournaments, leaderFilter, typeFilter, metaFilter, coinFlipFilter]);

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

      {usedMetas.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMetaFilter([])}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              metaFilter.length === 0
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Metas
          </button>
          {usedMetas.map((meta) => (
            <button
              key={meta.id}
              type="button"
              onClick={() => toggleMeta(meta.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                metaFilter.includes(meta.id)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {meta.extensions.join(" / ")}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {COIN_FLIP_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setCoinFlipFilter(filter)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              coinFlipFilter === filter
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {filter === "All"
              ? "All Coin Flips"
              : filter === "Won"
                ? "Won Coin Flip"
                : "Lost Coin Flip"}
          </button>
        ))}
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
