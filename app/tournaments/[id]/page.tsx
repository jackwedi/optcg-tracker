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
          <DeleteTournamentButton tournamentId={id} />
        </div>
      </div>

      <div className="mx-auto mb-8 flex max-w-2xl flex-row divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* 1. Leader image — object-contain, not object-cover: the whole
            card art stays visible instead of having its edges cropped
            off to force-fill the column. */}
        <div className="flex w-16 shrink-0 bg-slate-50 sm:w-24">
          {playedLeader ? (
            <LeaderThumbnail
              src={playedLeader.imageUrl}
              alt={playedLeader.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
              No leader
            </div>
          )}
        </div>

        {/* 2. All the data — name, played leader, date/meta. Action
            buttons live in the top bar now, not here, so the title
            always gets the full column width instead of truncating
            after a word or two. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-2.5 sm:gap-1.5 sm:p-4">
          <h1 className="truncate text-base font-bold sm:text-2xl">
            {tournament.name}
          </h1>
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700 sm:text-sm">
            {playedLeader ? (
              <LeaderColorDots colors={playedLeader.colors} />
            ) : null}
            <span className="truncate">
              {playedLeader ? playedLeader.name : "No leader set"}
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-sm">
            <span>{formatDateServer(tournament.date)}</span>
            {meta ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {meta.extensions.join(" / ")}
              </span>
            ) : null}
          </div>
        </div>

        {/* 3. Record — its own section, not squeezed under the buttons,
            with room to be the biggest text on the card. */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-l border-slate-200 px-3 py-2.5 sm:gap-1 sm:px-6 sm:py-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
            Record
          </span>
          {stats && stats.totalRounds > 0 ? (
            <span className="flex items-baseline gap-1 text-2xl font-extrabold text-slate-900 sm:text-4xl">
              <span>{stats.wins}</span>
              <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                W
              </span>
              <span className="mx-0.5 text-slate-300">–</span>
              <span>{stats.losses}</span>
              <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                L
              </span>
            </span>
          ) : (
            <span className="text-xs text-slate-400 sm:text-sm">
              No rounds yet
            </span>
          )}
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
