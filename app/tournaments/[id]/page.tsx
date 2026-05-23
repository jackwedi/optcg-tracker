import { getTournamentById, getTournamentStats } from "@/lib/db";
import Link from "next/link";
import { MatchForm } from "@/components/MatchForm";
import { MatchList } from "@/components/MatchList";
import { DeleteTournamentButton } from "@/components/DeleteTournamentButton";
import { notFound } from "next/navigation";

function formatDateServer(dateString: string): string {
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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params;
  const tournament = getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  const stats = getTournamentStats(id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/tournaments"
          className="text-blue-600 hover:underline inline-block"
        >
          ← Back to Tournaments
        </Link>
        <DeleteTournamentButton tournamentId={id} />
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
        <p className="text-gray-600">{formatDateServer(tournament.date)}</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Matches</p>
            <p className="text-3xl font-bold">{stats.totalMatches}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Wins</p>
            <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Losses</p>
            <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.winRate}%
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <MatchForm tournamentId={id} />
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">
            Matches ({tournament.matches.length})
          </h2>
          <MatchList
            tournaments_matches={tournament.matches}
            tournamentId={id}
          />
        </div>
      </div>
    </main>
  );
}
