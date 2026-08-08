"use client";

import { useCallback, useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import { TOURNAMENT_TYPES } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import type { ExtensionMeta } from "@/models/meta";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { colorToHex } from "@/components/LeaderColorDots";
import { StatMeter } from "@/components/StatMeter";
import { StartingPositionStats } from "@/components/StartingPositionStats";
import { WinRateProgressionChart } from "@/components/WinRateProgressionChart";
import { LeaderMatchups } from "@/components/LeaderMatchups";
import { BYE_LEADER_ID } from "@/lib/leaders";
import { getShortLeaderName } from "@/lib/utils";

const ALL_LEADERS = "All";
const ALL_TYPES = "All";

type PerformanceTab = "overview" | "matchups";
const PERFORMANCE_TABS: { key: PerformanceTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "matchups", label: "Matchup" },
];

interface PerformanceOverviewProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
  metas: ExtensionMeta[];
}

// All filters here (Meta/Type/Coin Flip/Leader) drive every widget on the
// page — the chart, the leader repartition, and the stat meters — so the
// whole page always reflects one consistent, filtered view. The raw
// tournament list itself lives on the home page now, not here.
export function PerformanceOverview({
  tournaments,
  leadersById,
  metas,
}: PerformanceOverviewProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTab>("overview");
  // Leader and Meta are the filters people reach for most, so they default
  // to whatever's most current instead of "All" — the most recent
  // tournament (tournaments is already sorted newest-first) that actually
  // set one. Falls back to "All" if nothing qualifies (e.g. no tournament
  // has a leader/meta set yet).
  const [leaderFilter, setLeaderFilter] = useState<string>(() => {
    const lastLeaderId = tournaments.find(
      (t) => t.playedLeaderId,
    )?.playedLeaderId;
    return lastLeaderId && leadersById[lastLeaderId]
      ? lastLeaderId
      : ALL_LEADERS;
  });
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [metaFilter, setMetaFilter] = useState<string[]>(() => {
    const lastMetaId = tournaments.find((t) => t.metaId)?.metaId;
    return lastMetaId && metas.some((m) => m.id === lastMetaId)
      ? [lastMetaId]
      : [];
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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

  // Scoped to whichever meta chip(s) are active — "most played" ranking
  // for the leader list below is relative to the current meta, not the
  // account's whole history, since a leader's usage is expected to shift
  // meta to meta.
  const getMetaScopedTournaments = useCallback(
    (metaIds: string[]) =>
      metaIds.length === 0
        ? tournaments
        : tournaments.filter((t) => t.metaId && metaIds.includes(t.metaId)),
    [tournaments],
  );

  const metaScopedTournaments = useMemo(
    () => getMetaScopedTournaments(metaFilter),
    [metaFilter, getMetaScopedTournaments],
  );

  const leaderPlayCountInMeta = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tournament of metaScopedTournaments) {
      if (!tournament.playedLeaderId) continue;
      counts.set(
        tournament.playedLeaderId,
        (counts.get(tournament.playedLeaderId) ?? 0) + 1,
      );
    }
    return counts;
  }, [metaScopedTournaments]);

  // Only leaders actually played within the current meta scope appear in
  // the filter at all — otherwise a leader with zero plays there could
  // still show up as a dead-end selection. Sorted by plays within the
  // current meta scope (ties broken alphabetically) so whoever's used
  // most sits first. toggleMeta already resets the leader filter away
  // from a leader that no longer qualifies when meta changes, so the
  // active selection is always present in this list.
  const metaLeaders = useMemo(() => {
    return usedLeaders
      .filter((leader) => (leaderPlayCountInMeta.get(leader.id) ?? 0) > 0)
      .sort((a, b) => {
        const diff =
          (leaderPlayCountInMeta.get(b.id) ?? 0) -
          (leaderPlayCountInMeta.get(a.id) ?? 0);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
  }, [usedLeaders, leaderPlayCountInMeta]);

  // getShortLeaderName collapses to just the last capitalized word, so two
  // different printings of the same character (different set/card id, e.g.
  // alt art) can land on an identical short name. When that happens for the
  // leaders actually shown, prefix the chip with the card's set code (the
  // part of the id before the first "-") so the chips stay distinguishable.
  const duplicateShortNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const leader of metaLeaders) {
      const shortName = getShortLeaderName(leader.name);
      counts.set(shortName, (counts.get(shortName) ?? 0) + 1);
    }
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([shortName]) => shortName),
    );
  }, [metaLeaders]);

  const toggleMeta = (metaId: string) => {
    setMetaFilter((current) => {
      const next = current.includes(metaId)
        ? current.filter((id) => id !== metaId)
        : [...current, metaId];

      // A leader that was never played in the meta(s) you just switched to
      // is a dead-end filter combination (it'd always show zero results),
      // so drop it back to "All Leaders" instead of leaving it selected
      // and invisible.
      if (leaderFilter !== ALL_LEADERS) {
        const stillPlayed = getMetaScopedTournaments(next).some(
          (t) => t.playedLeaderId === leaderFilter,
        );
        if (!stillPlayed) {
          setLeaderFilter(ALL_LEADERS);
        }
      }

      return next;
    });
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
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
  }, [tournaments, leaderFilter, typeFilter, metaFilter]);

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

  // Excludes BYE rounds — those always store "1st" as a data-modeling
  // default (no real going-first decision was made), so counting them
  // would skew the going-1st win rate artificially high.
  const startingPositionStats = useMemo(() => {
    let firstRounds = 0;
    let firstWins = 0;
    let secondRounds = 0;
    let secondWins = 0;

    for (const tournament of filteredTournaments) {
      for (const round of tournament.rounds) {
        if (round.opponentLeaderId === BYE_LEADER_ID) continue;

        if (round.startingPosition === "1st") {
          firstRounds += 1;
          if (round.won) firstWins += 1;
        } else {
          secondRounds += 1;
          if (round.won) secondWins += 1;
        }
      }
    }

    return {
      firstRounds,
      firstWins,
      firstWinRate: firstRounds > 0 ? (firstWins / firstRounds) * 100 : 0,
      secondRounds,
      secondWins,
      secondWinRate: secondRounds > 0 ? (secondWins / secondRounds) * 100 : 0,
    };
  }, [filteredTournaments]);

  const moreFiltersActiveCount = typeFilter !== ALL_TYPES ? 1 : 0;

  return (
    <div>
      {/* Leader and Meta are what people filter by most, so both stay
          visible by default (pre-set to the most recent tournament's
          values) instead of living behind "More Filters" — each gets its
          own labeled group rather than an unlabeled wall of chips, the
          usual pattern for multi-facet filters. */}
      <div className="mb-4 space-y-3">
        {usedMetas.length > 0 ? (
          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Meta
            </span>
            <div className="flex flex-wrap gap-2">
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
          </div>
        ) : null}

        {usedLeaders.length > 0 ? (
          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Leader
            </span>
            <div className="flex flex-wrap items-start gap-2">
              {metaLeaders.map((leader) => {
                const leaderColors = Array.isArray(leader.colors)
                  ? leader.colors.flat().filter(Boolean)
                  : [];
                const shortName = getShortLeaderName(leader.name);
                const hasDuplicateName = duplicateShortNames.has(shortName);
                return (
                  <button
                    key={leader.id}
                    type="button"
                    onClick={() => setLeaderFilter(leader.id)}
                    title={leader.name}
                    aria-label={leader.name}
                    aria-pressed={leaderFilter === leader.id}
                    className={`flex shrink-0 flex-col items-center gap-1 rounded-lg border-2 p-1 transition ${
                      leaderFilter === leader.id
                        ? "border-slate-900"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <LeaderThumbnail
                        src={leader.imageUrl}
                        alt={leader.name}
                        className="h-16 w-12 shrink-0 rounded object-cover"
                      />
                      {leaderColors.length > 0 ? (
                        <div
                          className="flex h-16 w-1.5 shrink-0 flex-col overflow-hidden rounded-full"
                          aria-hidden="true"
                        >
                          {leaderColors.slice(0, 2).map((color, i) => (
                            <span
                              key={color + i}
                              className="flex-1"
                              style={{ backgroundColor: colorToHex(color) }}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="max-w-[4.5rem] truncate text-xs font-medium text-slate-700">
                      {hasDuplicateName ? (
                        <span className="mr-0.5 text-[10px] font-normal text-slate-400">
                          {leader.id.split("-")[0]}
                        </span>
                      ) : null}
                      {shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

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
          {usedLeaders.length > 0 ? (
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Leader
              </span>
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
              </div>
            </div>
          ) : null}

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Type
            </span>
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
          </div>
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
          <div className="mb-6 grid grid-cols-2 gap-4">
            <StatMeter
              label="Win Rate"
              value={aggregateStats.winRate}
              detail={`${aggregateStats.wins} / ${aggregateStats.totalRounds} rounds won`}
              trackClassName="bg-emerald-100"
              fillClassName="bg-emerald-500"
              valueClassName="text-emerald-600"
            />
            <StatMeter
              label="Coin Flip"
              value={aggregateStats.coinFlipWinRate}
              detail={`${aggregateStats.coinFlipWins} / ${aggregateStats.totalRounds} coin flips won`}
              trackClassName="bg-amber-100"
              fillClassName="bg-amber-500"
              valueClassName="text-amber-600"
            />
          </div>

          <div className="mb-6">
            <StartingPositionStats
              firstWinRate={startingPositionStats.firstWinRate}
              firstWins={startingPositionStats.firstWins}
              firstRounds={startingPositionStats.firstRounds}
              secondWinRate={startingPositionStats.secondWinRate}
              secondWins={startingPositionStats.secondWins}
              secondRounds={startingPositionStats.secondRounds}
            />
          </div>

          <WinRateProgressionChart tournaments={filteredTournaments} />
        </>
      ) : null}

      {activeTab === "matchups" ? (
        <LeaderMatchups
          tournaments={filteredTournaments}
          leadersById={leadersById}
        />
      ) : null}
    </div>
  );
}
