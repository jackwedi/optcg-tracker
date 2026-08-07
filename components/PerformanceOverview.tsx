"use client";

import { useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import { TOURNAMENT_TYPES } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import type { ExtensionMeta } from "@/models/meta";
import { TournamentTable } from "@/components/TournamentTable";
import { LeaderColorDots } from "@/components/LeaderColorDots";
import { StatMeter } from "@/components/StatMeter";
import { WinRateProgressionChart } from "@/components/WinRateProgressionChart";
import { PlayedLeaderRepartition } from "@/components/PlayedLeaderRepartition";

const ALL_LEADERS = "All";
const ALL_TYPES = "All";
const TOURNAMENTS_PAGE_SIZE = 5;

type CoinFlipFilter = "All" | "Won" | "Lost";
const COIN_FLIP_FILTERS: CoinFlipFilter[] = ["All", "Won", "Lost"];

type PerformanceTab = "overview" | "leaders" | "tournaments";
const PERFORMANCE_TABS: { key: PerformanceTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tournaments", label: "Tournaments" },
  { key: "leaders", label: "Leaders" },
];

interface PerformanceOverviewProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
  metas: ExtensionMeta[];
}

// All filters here (Meta/Type/Coin Flip/Leader) drive every widget on the
// page — the chart, the leader repartition, the stat meters, and the table —
// so the whole page always reflects one consistent, filtered view.
export function PerformanceOverview({
  tournaments,
  leadersById,
  metas,
}: PerformanceOverviewProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTab>("overview");
  const [leaderFilter, setLeaderFilter] = useState(ALL_LEADERS);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [coinFlipFilter, setCoinFlipFilter] = useState<CoinFlipFilter>("All");
  const [metaFilter, setMetaFilter] = useState<string[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOURNAMENTS_PAGE_SIZE);

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
      coinFlipWinRate: totalRounds > 0 ? (coinFlipWins / totalRounds) * 100 : 0,
    };
  }, [filteredTournaments]);

  const moreFiltersActiveCount =
    (typeFilter !== ALL_TYPES ? 1 : 0) +
    (coinFlipFilter !== "All" ? 1 : 0) +
    (leaderFilter !== ALL_LEADERS ? 1 : 0);

  // Table only shows the most recent slice; every other widget still
  // aggregates the full filtered set regardless of how many rows are
  // currently revealed.
  const displayedTournaments = filteredTournaments.slice(0, visibleCount);
  const hasMoreTournaments = filteredTournaments.length > visibleCount;

  return (
    <div>
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

      <button
        type="button"
        onClick={() => setShowMoreFilters((value) => !value)}
        className="mb-4 flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        aria-expanded={showMoreFilters}
      >
        More Filters
        {moreFiltersActiveCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold text-white">
            {moreFiltersActiveCount}
          </span>
        ) : null}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 transition-transform ${
            showMoreFilters ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {showMoreFilters ? (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
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

          <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2">
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
        </div>
      ) : null}

      <div
        className="mb-6 flex rounded-full border border-slate-200 bg-slate-100 p-1"
        role="tablist"
      >
        {PERFORMANCE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <>
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

          <WinRateProgressionChart tournaments={filteredTournaments} />
        </>
      ) : null}

      {activeTab === "leaders" ? (
        <PlayedLeaderRepartition
          tournaments={filteredTournaments}
          leadersById={leadersById}
        />
      ) : null}

      {activeTab === "tournaments" ? (
        <div>
          <TournamentTable
            tournaments={displayedTournaments}
            leadersById={leadersById}
          />
          {hasMoreTournaments ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + TOURNAMENTS_PAGE_SIZE)
                }
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Show More Tournaments
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
