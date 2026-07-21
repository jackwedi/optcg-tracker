import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaderById } from '@/lib/leaders';
import LeaderThumbnail from '@/components/LeaderThumbnail';
import Link from "next/link";
import { RoundForm } from "@/components/RoundForm";
import { RoundList } from "@/components/RoundList";
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
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  const playedLeader = tournament.playedLeaderId
    ? await getLeaderById(tournament.playedLeaderId)
    : undefined;

  const stats = await getTournamentStats(id);

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
        {playedLeader ? (
          <div className="mb-6 w-full h-96 relative overflow-hidden rounded-md">
            <LeaderThumbnail
              src={playedLeader.imageUrl}
              alt={playedLeader.name}
              className="w-full h-full object-top object-scale-down"
            />
          </div>
        ) : null}

        <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
        <p className="text-gray-600">{formatDateServer(tournament.date)}</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Rounds</p>
            <p className="text-3xl font-bold">{stats.totalRounds}</p>
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

      <div className="space-y-8 w-full">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Rounds ({tournament.rounds.length})</h2>
          <RoundList rounds={tournament.rounds} tournamentId={id} />
        </div>

        <div className="w-full">
          <RoundForm tournamentId={id} />
        </div>
      </div>
    </main>
  );
}
