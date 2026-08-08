import Link from "next/link";
import type { Tournament } from "@/models/tournament";

interface TodayTournamentBannerProps {
  tournament: Tournament;
}

// Mirrors CreateTournamentCard's card shape (rounded-2xl, border-2,
// gradient, circular emoji badge) but in emerald — this app's existing
// "positive/primary action" accent — so it reads as "do this now" and
// stays visually distinct from the blue create-card directly below it.
export function TodayTournamentBanner({
  tournament,
}: TodayTournamentBannerProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-md dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-4">
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl shadow-sm dark:bg-emerald-500/10"
          aria-hidden="true"
        >
          🔥
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Tournament today
          </p>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            Pick up where you left off.
          </p>
        </div>
      </div>
      <Link
        href={`/tournaments/${tournament.id}`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:text-base"
      >
        Continue {tournament.name} →
      </Link>
    </div>
  );
}
