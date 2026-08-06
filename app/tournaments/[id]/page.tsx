import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaderById } from "@/lib/leaders";
import { getMetaById } from "@/lib/meta";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { LeaderColorDots } from "@/components/LeaderColorDots";
import Link from "next/link";
import { RoundForm } from "@/components/RoundForm";
import { RoundList } from "@/components/RoundList";
import { DeleteTournamentButton } from "@/components/DeleteTournamentButton";
import { ShareTournamentButton } from "@/components/ShareTournamentButton";
import { TournamentTypeEditor } from "@/components/TournamentTypeEditor";
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

  const meta = tournament.metaId
    ? await getMetaById(tournament.metaId)
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

      <div className="mb-8 flex items-start gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid sm:grid-cols-[280px_1fr] sm:items-stretch sm:gap-6 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="shrink-0 sm:flex sm:items-center sm:justify-center sm:overflow-hidden sm:rounded-xl sm:border sm:border-slate-200 sm:bg-white sm:p-3 sm:shadow-sm">
          {playedLeader ? (
            <LeaderThumbnail
              src={playedLeader.imageUrl}
              alt={playedLeader.name}
              className="h-28 w-20 rounded-lg border border-slate-200 object-cover sm:h-[340px] sm:w-full sm:rounded-none sm:border-0 sm:object-contain sm:object-center"
            />
          ) : (
            <div className="flex h-28 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[10px] text-slate-500 sm:h-[340px] sm:w-full sm:rounded-lg sm:border-0 sm:text-sm">
              No leader
            </div>
          )}
          <p className="mt-1 flex max-w-20 items-center justify-center gap-1 text-[10px] font-medium text-slate-600 sm:hidden">
            {playedLeader ? (
              <LeaderColorDots
                colors={playedLeader.colors}
                dotClassName="h-1.5 w-1.5"
              />
            ) : null}
            <span className="truncate">
              {playedLeader ? playedLeader.name : "Not set"}
            </span>
          </p>
        </div>

        <div className="min-w-0 flex-1 sm:rounded-xl sm:border sm:border-slate-200 sm:bg-white sm:p-6 sm:shadow-sm">
          <div className="mb-1 flex items-start justify-between gap-2 sm:mb-2 sm:gap-4">
            <h1 className="text-xl font-bold sm:text-4xl">{tournament.name}</h1>
            <div className="flex items-center gap-2">
              <ShareTournamentButton
                tournamentId={id}
                tournamentName={tournament.name}
              />
              <TournamentTypeEditor
                tournamentId={id}
                name={tournament.name}
                date={tournament.date}
                tournamentType={tournament.tournamentType}
              />
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-6">
            <p className="text-xs text-gray-600 sm:text-base">
              {formatDateServer(tournament.date)}
            </p>
            {meta ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:text-xs">
                {meta.extensions.join(" / ")}
              </span>
            ) : null}
          </div>

          <div className="mb-6 hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Played Leader
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-slate-900">
              {playedLeader ? (
                <LeaderColorDots colors={playedLeader.colors} />
              ) : null}
              {playedLeader ? playedLeader.name : "Not set"}
            </p>
            {playedLeader ? (
              <p className="text-xs text-slate-500">{playedLeader.id}</p>
            ) : null}
          </div>

          {stats ? (
            <div className="mt-3 border-t border-slate-100 pt-4 sm:mt-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Win Rate
                </p>
                <p className="text-2xl font-bold text-amber-600 sm:text-3xl">
                  {stats.winRate}%
                </p>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(stats.winRate)))}%`,
                  }}
                />
              </div>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden="true">🏆</span>
                  {stats.wins} won
                </span>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden="true">☠️</span>
                  {stats.losses} lost
                </span>
                <span>
                  {stats.totalRounds} round{stats.totalRounds === 1 ? "" : "s"}
                </span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-8 w-full">
        <div className="w-full">
          <RoundList rounds={tournament.rounds} tournamentId={id} />
        </div>

        <div className="w-full">
          <RoundForm tournamentId={id} />
        </div>
      </div>
    </main>
  );
}
