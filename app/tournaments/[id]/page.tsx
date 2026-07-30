import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaderById } from "@/lib/leaders";
import LeaderThumbnail from "@/components/LeaderThumbnail";
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

      <div className="mb-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="relative flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {playedLeader ? (
            <LeaderThumbnail
              src={playedLeader.imageUrl}
              alt={playedLeader.name}
              className="h-[340px] w-full object-contain object-center bg-white"
            />
          ) : (
            <div className="flex h-[340px] items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
              No leader selected
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold">{tournament.name}</h1>
            <span
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl"
              title={tournament.tournamentType}
              aria-label={`Tournament type: ${tournament.tournamentType}`}
            >
              <span role="img" aria-hidden="true">
                {getTournamentTypeIcon(tournament.tournamentType)}
              </span>
            </span>
          </div>
          <p className="text-gray-600 mb-6">
            {formatDateServer(tournament.date)}
          </p>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Played Leader
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {playedLeader ? playedLeader.name : "Not set"}
            </p>
            {playedLeader ? (
              <p className="text-sm text-slate-500">{playedLeader.id}</p>
            ) : null}
          </div>

          {stats ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-gray-600 text-sm">Total Rounds</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalRounds}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-gray-600 text-sm">Wins</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.wins}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-gray-600 text-sm">Losses</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.losses}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-gray-600 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.winRate}%
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-8 w-full">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">
            Rounds ({tournament.rounds.length})
          </h2>
          <RoundList rounds={tournament.rounds} tournamentId={id} />
        </div>

        <div className="w-full">
          <RoundForm tournamentId={id} />
        </div>
      </div>
    </main>
  );
}
