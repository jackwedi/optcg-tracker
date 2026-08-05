import Link from "next/link";
import { getTournamentTypeIcon, Tournament } from "@/models/tournament";
import { formatDate } from "@/lib/utils";
import { DeleteTournamentButton } from "@/components/DeleteTournamentButton";

interface TournamentListProps {
  tournaments: Tournament[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No tournaments yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex-1 text-lg font-semibold text-blue-600 hover:underline"
              >
                {tournament.name}
              </Link>
              <span
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg"
                title={tournament.tournamentType}
                aria-label={`Tournament type: ${tournament.tournamentType}`}
              >
                <span role="img" aria-hidden="true">
                  {getTournamentTypeIcon(tournament.tournamentType)}
                </span>
              </span>
            </div>
            <DeleteTournamentButton tournamentId={tournament.id} />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            📅 {formatDate(tournament.date)}
          </p>
          <p className="text-sm font-medium text-blue-600">
            {tournament.rounds.length} rounds
          </p>
        </div>
      ))}
    </div>
  );
}
