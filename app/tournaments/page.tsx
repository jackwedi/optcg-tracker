import { getTournaments } from "@/lib/db";
import { CreateTournamentCard } from "@/components";
import Link from "next/link";

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00Z");
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function getTournamentTypeIcon(type: string): string {
  switch (type) {
    case "Local":
      return "🏠";
    case "Regional":
      return "🗺️";
    case "Treasure Cup":
      return "🏆";
    default:
      return "🏷️";
  }
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold">All Tournaments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <Link
            key={tournament.id}
            href={`/tournaments/${tournament.id}`}
            className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">{tournament.name}</h3>
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
            <div className="space-y-2 text-sm text-gray-600">
              <p>📅 {formatDate(tournament.date)}</p>
              <p className="font-medium text-blue-600">
                {tournament.rounds.length} rounds
              </p>
            </div>
          </Link>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tournaments yet.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Create your first tournament
          </Link>
        </div>
      )}

      <div className="mt-10">
        <CreateTournamentCard />
      </div>
    </main>
  );
}
