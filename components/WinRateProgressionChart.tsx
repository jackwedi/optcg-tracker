"use client";

import { useId, useMemo, useState } from "react";
import type { Tournament } from "@/models/tournament";
import { formatDate } from "@/lib/utils";

interface WinRateProgressionChartProps {
  tournaments: Tournament[];
}

interface DailyPoint {
  date: string;
  dayWins: number;
  dayRounds: number;
  cumulativeWins: number;
  cumulativeRounds: number;
  winRate: number;
}

// emerald-600 — validated >=3:1 against a white chart surface, matches the
// Win Rate accent already used by StatMeter elsewhere in the app.
const LINE_COLOR = "#059669";
const GRID_COLOR = "var(--chart-grid)"; // slate-200 / slate-700, one step off the card surface
const AXIS_TEXT_COLOR = "var(--chart-axis)"; // slate-500 / slate-400, muted ink

function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00Z");
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function WinRateProgressionChart({
  tournaments,
}: WinRateProgressionChartProps) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const points = useMemo<DailyPoint[]>(() => {
    const byDate = new Map<string, { wins: number; rounds: number }>();

    for (const tournament of tournaments) {
      if (tournament.rounds.length === 0) continue;
      const entry = byDate.get(tournament.date) ?? { wins: 0, rounds: 0 };
      entry.wins += tournament.rounds.filter((r) => r.won).length;
      entry.rounds += tournament.rounds.length;
      byDate.set(tournament.date, entry);
    }

    const sortedDates = Array.from(byDate.keys()).sort();

    return sortedDates.reduce<DailyPoint[]>((acc, date) => {
      const day = byDate.get(date)!;
      const previous = acc[acc.length - 1];
      const cumulativeWins = (previous?.cumulativeWins ?? 0) + day.wins;
      const cumulativeRounds = (previous?.cumulativeRounds ?? 0) + day.rounds;

      return [
        ...acc,
        {
          date,
          dayWins: day.wins,
          dayRounds: day.rounds,
          cumulativeWins,
          cumulativeRounds,
          winRate:
            cumulativeRounds > 0
              ? (cumulativeWins / cumulativeRounds) * 100
              : 0,
        },
      ];
    }, []);
  }, [tournaments]);

  if (points.length === 0) {
    return null;
  }

  const width = 640;
  const height = 260;
  const padding = { top: 16, right: 16, bottom: 34, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xFor = (i: number) =>
    points.length === 1
      ? padding.left + plotWidth / 2
      : padding.left + (i / (points.length - 1)) * plotWidth;
  const yFor = (value: number) => padding.top + (1 - value / 100) * plotHeight;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.winRate)}`)
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${linePath} L ${xFor(points.length - 1)} ${padding.top + plotHeight} L ${xFor(0)} ${padding.top + plotHeight} Z`
      : "";

  const gridLines = [0, 25, 50, 75, 100];
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const last = points[points.length - 1];
  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Win Rate Progression
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cumulative win rate across the {points.length} day
            {points.length === 1 ? " " : "s "} you&apos;ve played tournaments
          </p>
        </div>
        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
          {last.winRate.toFixed(1)}%
        </p>
      </div>

      {points.length < 2 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Play tournaments on another day to start seeing your win rate trend.
        </p>
      ) : (
        <>
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full"
              role="img"
              aria-label={`Cumulative win rate progression, ending at ${last.winRate.toFixed(1)}% on ${formatDate(last.date)}`}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              {gridLines.map((g) => (
                <g key={g}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={yFor(g)}
                    y2={yFor(g)}
                    stroke={GRID_COLOR}
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 8}
                    y={yFor(g)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={AXIS_TEXT_COLOR}
                  >
                    {g}%
                  </text>
                </g>
              ))}

              <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
              <path
                d={linePath}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {activeIndex !== null ? (
                <line
                  x1={xFor(activeIndex)}
                  x2={xFor(activeIndex)}
                  y1={padding.top}
                  y2={padding.top + plotHeight}
                  stroke={AXIS_TEXT_COLOR}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
              ) : null}

              {points.map((p, i) => (
                <g key={p.date}>
                  <circle
                    cx={xFor(i)}
                    cy={yFor(p.winRate)}
                    r={12}
                    fill="transparent"
                    tabIndex={0}
                    role="img"
                    aria-label={`${formatDate(p.date)}: ${p.winRate.toFixed(1)}% cumulative win rate, ${p.dayWins} of ${p.dayRounds} rounds won that day`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() =>
                      setActiveIndex((cur) => (cur === i ? null : cur))
                    }
                    className="cursor-pointer outline-none"
                  />
                  <circle
                    cx={xFor(i)}
                    cy={yFor(p.winRate)}
                    r={i === activeIndex || i === points.length - 1 ? 5 : 4}
                    fill={LINE_COLOR}
                    stroke="var(--chart-surface)"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </g>
              ))}

              {points.map((p, i) =>
                i % labelEvery === 0 || i === points.length - 1 ? (
                  <text
                    key={p.date}
                    x={xFor(i)}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    fontSize={11}
                    fill={AXIS_TEXT_COLOR}
                  >
                    {formatShortDate(p.date)}
                  </text>
                ) : null,
              )}

              <text
                x={xFor(points.length - 1) - 8}
                y={yFor(last.winRate) - 10}
                textAnchor="end"
                fontSize={12}
                fontWeight={600}
                fill="var(--chart-value-ink)"
              >
                {last.winRate.toFixed(1)}%
              </text>
            </svg>

            {active ? (
              <div
                className="pointer-events-none absolute rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-800"
                style={{
                  left: `${(xFor(activeIndex!) / width) * 100}%`,
                  top: `${(yFor(active.winRate) / height) * 100}%`,
                  transform: "translate(-50%, -120%)",
                }}
              >
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {active.winRate.toFixed(1)}% cumulative
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {formatDate(active.date)}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {active.dayWins}/{active.dayRounds} rounds won that day
                </p>
              </div>
            ) : null}
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">
              View as table
            </summary>
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-400">
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Rounds that day
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Wins that day
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Cumulative win rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {points.map((p) => (
                    <tr key={p.date}>
                      <td className="px-3 py-2 dark:text-slate-300">
                        {formatDate(p.date)}
                      </td>
                      <td className="px-3 py-2 text-right dark:text-slate-300">
                        {p.dayRounds}
                      </td>
                      <td className="px-3 py-2 text-right dark:text-slate-300">
                        {p.dayWins}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {p.winRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
