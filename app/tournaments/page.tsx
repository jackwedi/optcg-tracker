import { getTournaments } from "@/lib/db";
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

export default function TournamentsPage() {
  const tournaments = getTournaments();

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
            <h3 className="text-xl font-semibold mb-3">{tournament.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📅 {formatDate(tournament.date)}</p>
              <p className="font-medium text-blue-600">
                {tournament.matches.length} rounds
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
    </main>
  );
}
