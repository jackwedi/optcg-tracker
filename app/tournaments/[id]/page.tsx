import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaderById, BYE_LEADER_ID } from "@/lib/leaders";
import { getMetaById } from "@/lib/meta";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { colorToHex } from "@/components/LeaderColorDots";
import Link from "next/link";
import { RoundForm } from "@/components/RoundForm";
import { RoundList } from "@/components/RoundList";
import { DeleteTournamentButton } from "@/components/DeleteTournamentButton";
import { ShareTournamentButton } from "@/components/ShareTournamentButton";
import { TournamentTypeEditor } from "@/components/TournamentTypeEditor";
import { getShortLeaderName } from "@/lib/utils";
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
  const streakRounds = tournament.rounds.slice(-10);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/tournaments"
          className="text-blue-600 hover:underline inline-block"
        >
          ← Back to Tournaments
        </Link>
      </div>

      <div className="mx-auto mb-5 max-w-2xl">
        {/* Name + date on the left, actions on the right, all one line. */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-base font-bold sm:text-2xl">
              {tournament.name}
            </h1>
            <span className="shrink-0 text-[11px] text-slate-500 sm:text-sm">
              {formatDateServer(tournament.date)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
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

        {/* Played leader (image + color bar, name below, same idea as an
            opponent row in RoundList's table but stacked) sized to its
            content; Record grows to fill the rest of the row and
            stretches to match the leader block's natural height. The
            image keeps its own aspect ratio (h-auto, no object-cover)
            instead of being cropped to a fixed box. */}
        <div className="mt-4 flex items-stretch gap-3 sm:gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="flex items-stretch gap-1">
              <LeaderThumbnail
                src={playedLeader?.imageUrl ?? "/placeholder.png"}
                alt={playedLeader?.name ?? "No leader set"}
                className="h-auto w-12 rounded sm:w-16"
              />
              {playedLeader && playedLeader.colors.length > 0 ? (
                <div className="flex w-1 flex-col overflow-hidden rounded-full">
                  {playedLeader.colors.slice(0, 2).map((color, i) => (
                    <span
                      key={color + i}
                      className="flex-1"
                      style={{ backgroundColor: colorToHex(color) }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <span
              className="max-w-[68px] truncate text-center text-xs font-semibold text-slate-700 sm:max-w-[84px] sm:text-sm"
              title={playedLeader?.name}
            >
              {playedLeader
                ? getShortLeaderName(playedLeader.name)
                : "No leader set"}
            </span>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center sm:px-4 sm:py-2.5">
            {meta ? (
              <span className="absolute right-2 top-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:right-3 sm:top-3">
                {meta.extensions.join(" / ")}
              </span>
            ) : null}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
              Record
            </span>
            {stats && stats.totalRounds > 0 ? (
              <>
                <div className="flex items-baseline justify-center gap-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                  <span>{stats.wins}</span>
                  <span className="text-xs font-semibold text-slate-400">
                    W
                  </span>
                  <span className="mx-0.5 text-slate-300">–</span>
                  <span>{stats.losses}</span>
                  <span className="text-xs font-semibold text-slate-400">
                    L
                  </span>
                </div>
                {/* Mini streak — most recent rounds, oldest to newest,
                    left to right, same W/L/B colors as RoundList's
                    result badges. */}
                <div className="flex items-center justify-center gap-1">
                  {tournament.rounds.length > streakRounds.length ? (
                    <span className="text-[9px] leading-none text-slate-400">
                      …
                    </span>
                  ) : null}
                  {streakRounds.map((round) => {
                    const isBye = round.opponentLeaderId === BYE_LEADER_ID;
                    return (
                      <span
                        key={round.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isBye
                            ? "bg-slate-300"
                            : round.won
                              ? "bg-emerald-500"
                              : "bg-red-500"
                        }`}
                        title={isBye ? "Bye" : round.won ? "Win" : "Loss"}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 sm:text-sm">
                No rounds yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 w-full">
        <div className="w-full">
          <RoundList rounds={tournament.rounds} tournamentId={id} />
        </div>

        <div className="w-full">
          <RoundForm tournamentId={id} />
        </div>

        {/* Destructive action, deliberately at the bottom — out of the
            way of everything else on the page, requiring a scroll to
            reach rather than sitting next to routine actions up top. */}
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <DeleteTournamentButton tournamentId={id} />
        </div>
      </div>
    </main>
  );
}
