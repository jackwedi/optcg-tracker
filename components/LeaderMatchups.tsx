"use client";

import { useState } from "react";
import type { Tournament } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { colorToHex } from "@/components/LeaderColorDots";
import { StartingPositionStats } from "@/components/StartingPositionStats";
import { BYE_LEADER_ID } from "@/lib/leaders";
import { getShortLeaderName } from "@/lib/utils";

const MATCHUPS_PAGE_SIZE = 5;
const ROW_DONUT_SIZE = 40;
const ROW_DONUT_STROKE_WIDTH = 4;
const MODAL_DONUT_SIZE = 72;
const MODAL_DONUT_STROKE_WIDTH = 6;

interface LeaderMatchupsProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

interface Matchup {
  key: string;
  name: string;
  fullName: string;
  shortId: string | undefined;
  imageUrl: string | undefined;
  colors: string[] | undefined;
  timesFaced: number;
  wins: number;
  losses: number;
  coinFlipWins: number;
  winRate: number;
  coinFlipRate: number;
  firstRounds: number;
  firstWins: number;
  firstWinRate: number;
  secondRounds: number;
  secondWins: number;
  secondWinRate: number;
}

function DonutStat({
  value,
  color,
  trackColor,
  label,
  size = ROW_DONUT_SIZE,
  strokeWidth = ROW_DONUT_STROKE_WIDTH,
}: {
  value: number;
  color: string;
  trackColor: string;
  label: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);
  const fontSize = size >= 60 ? "text-sm" : "text-[10px]";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold text-slate-900 ${fontSize}`}
        >
          {Math.round(clamped)}%
        </span>
      </div>
      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}

// Every opponent leader you've faced across the filtered tournaments —
// distinct from PlayedLeaderRepartition (which is about the leaders *you*
// played). BYE rounds are excluded: there's no real opponent to have a
// matchup against.
export function LeaderMatchups({
  tournaments,
  leadersById,
}: LeaderMatchupsProps) {
  const [visibleCount, setVisibleCount] = useState(MATCHUPS_PAGE_SIZE);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const statsByOpponent = new Map<
    string,
    {
      wins: number;
      coinFlipWins: number;
      total: number;
      firstRounds: number;
      firstWins: number;
      secondRounds: number;
      secondWins: number;
    }
  >();

  for (const tournament of tournaments) {
    for (const round of tournament.rounds) {
      if (round.opponentLeaderId === BYE_LEADER_ID) continue;

      const existing = statsByOpponent.get(round.opponentLeaderId) ?? {
        wins: 0,
        coinFlipWins: 0,
        total: 0,
        firstRounds: 0,
        firstWins: 0,
        secondRounds: 0,
        secondWins: 0,
      };
      existing.total += 1;
      if (round.won) existing.wins += 1;
      if (round.wonCoinFlip) existing.coinFlipWins += 1;
      if (round.startingPosition === "1st") {
        existing.firstRounds += 1;
        if (round.won) existing.firstWins += 1;
      } else {
        existing.secondRounds += 1;
        if (round.won) existing.secondWins += 1;
      }
      statsByOpponent.set(round.opponentLeaderId, existing);
    }
  }

  if (statsByOpponent.size === 0) {
    return null;
  }

  const matchups: Matchup[] = Array.from(statsByOpponent.entries())
    .map(([key, s]) => {
      const leader = leadersById[key];
      return {
        key,
        name: leader ? getShortLeaderName(leader.name) : "Unknown leader",
        fullName: leader ? leader.name : "Unknown leader",
        shortId: leader ? leader.id.split("-")[0] : undefined,
        imageUrl: leader?.imageUrl,
        colors: leader?.colors,
        timesFaced: s.total,
        wins: s.wins,
        losses: s.total - s.wins,
        coinFlipWins: s.coinFlipWins,
        winRate: (s.wins / s.total) * 100,
        coinFlipRate: (s.coinFlipWins / s.total) * 100,
        firstRounds: s.firstRounds,
        firstWins: s.firstWins,
        firstWinRate:
          s.firstRounds > 0 ? (s.firstWins / s.firstRounds) * 100 : 0,
        secondRounds: s.secondRounds,
        secondWins: s.secondWins,
        secondWinRate:
          s.secondRounds > 0 ? (s.secondWins / s.secondRounds) * 100 : 0,
      };
    })
    .sort((a, b) => b.timesFaced - a.timesFaced);

  const displayedMatchups = matchups.slice(0, visibleCount);
  const hasMoreMatchups = matchups.length > visibleCount;
  const selectedMatchup = matchups.find((m) => m.key === selectedKey) ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Matchups</h3>
        <p className="text-sm text-slate-500">
          Win rate against every leader you&apos;ve faced — tap a row for more
          detail
        </p>
      </div>

      <ul className="divide-y divide-slate-100">
        {displayedMatchups.map((matchup) => (
          <li key={matchup.key} className="py-2.5 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => setSelectedKey(matchup.key)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex w-8 shrink-0 flex-col items-center text-center">
                <span className="text-sm font-bold text-slate-700">
                  {matchup.timesFaced}
                </span>
                <span className="text-[9px] uppercase tracking-wide text-slate-400">
                  faced
                </span>
              </div>

              {/* Same leader thumbnail + color bar treatment as an
                  opponent cell in RoundList's table. */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <LeaderThumbnail
                  src={matchup.imageUrl ?? "/placeholder.png"}
                  alt={matchup.fullName}
                  className="h-10 w-8 shrink-0 rounded object-cover sm:h-12 sm:w-10"
                />
                {matchup.colors && matchup.colors.length > 0 ? (
                  <div
                    className="flex h-10 w-1 shrink-0 flex-col overflow-hidden rounded-full sm:h-12"
                    aria-hidden="true"
                  >
                    {matchup.colors.slice(0, 2).map((color, i) => (
                      <span
                        key={color + i}
                        className="flex-1"
                        style={{ backgroundColor: colorToHex(color) }}
                      />
                    ))}
                  </div>
                ) : null}
                <span
                  className="truncate text-sm font-medium text-slate-900"
                  title={matchup.fullName}
                >
                  {matchup.shortId ? (
                    <span className="mr-1 text-xs font-normal text-slate-400">
                      {matchup.shortId}
                    </span>
                  ) : null}
                  {matchup.name}
                </span>
              </div>

              <DonutStat
                value={matchup.winRate}
                color="#10b981"
                trackColor="#d1fae5"
                label="Win"
              />
            </button>
          </li>
        ))}
      </ul>

      {hasMoreMatchups ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + MATCHUPS_PAGE_SIZE)
            }
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Show More Matchups
          </button>
        </div>
      ) : null}

      {selectedMatchup ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Matchup detail vs ${selectedMatchup.fullName}`}
          onClick={() => setSelectedKey(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <LeaderThumbnail
                  src={selectedMatchup.imageUrl ?? "/placeholder.png"}
                  alt={selectedMatchup.fullName}
                  className="h-10 w-8 shrink-0 rounded object-cover"
                />
                {selectedMatchup.colors && selectedMatchup.colors.length > 0 ? (
                  <div
                    className="flex h-10 w-1 shrink-0 flex-col overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    {selectedMatchup.colors.slice(0, 2).map((color, i) => (
                      <span
                        key={color + i}
                        className="flex-1"
                        style={{ backgroundColor: colorToHex(color) }}
                      />
                    ))}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <h3
                    className="truncate text-base font-semibold text-slate-900"
                    title={selectedMatchup.fullName}
                  >
                    {selectedMatchup.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMatchup.timesFaced} rounds faced
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-center gap-8">
              <DonutStat
                value={selectedMatchup.coinFlipRate}
                color="#f59e0b"
                trackColor="#fef3c7"
                label="Coin Flip"
                size={MODAL_DONUT_SIZE}
                strokeWidth={MODAL_DONUT_STROKE_WIDTH}
              />
              <DonutStat
                value={selectedMatchup.winRate}
                color="#10b981"
                trackColor="#d1fae5"
                label="Win Rate"
                size={MODAL_DONUT_SIZE}
                strokeWidth={MODAL_DONUT_STROKE_WIDTH}
              />
            </div>

            <div className="mt-6">
              <StartingPositionStats
                firstWinRate={selectedMatchup.firstWinRate}
                firstWins={selectedMatchup.firstWins}
                firstRounds={selectedMatchup.firstRounds}
                secondWinRate={selectedMatchup.secondWinRate}
                secondWins={selectedMatchup.secondWins}
                secondRounds={selectedMatchup.secondRounds}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
