import Link from "next/link";
import { getTournamentTypeIcon, type Tournament } from "@/models/tournament";
import { formatDate } from "@/lib/utils";

interface RecentTournamentsProps {
  tournaments: Tournament[];
}

export function RecentTournaments({ tournaments }: RecentTournamentsProps) {
  if (tournaments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          Recent Tournaments
        </h2>
        <Link
          href="/tournaments"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          See all →
        </Link>
      </div>

      <ul className="divide-y divide-slate-100">
        {tournaments.map((tournament) => {
          const wins = tournament.rounds.filter((r) => r.won).length;
          const losses = tournament.rounds.length - wins;

          return (
            <li key={tournament.id}>
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50 sm:px-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base"
                    title={tournament.tournamentType}
                    aria-label={`Tournament type: ${tournament.tournamentType}`}
                  >
                    <span role="img" aria-hidden="true">
                      {getTournamentTypeIcon(tournament.tournamentType)}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {tournament.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(tournament.date)} · {tournament.rounds.length}{" "}
                      rounds
                    </p>
                  </div>
                </div>
                {/* Same record treatment as the tournament detail page's
                    Record card, scaled down for a compact list row. */}
                {tournament.rounds.length > 0 ? (
                  <div className="flex shrink-0 items-baseline gap-1 text-sm font-bold text-slate-900">
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
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
