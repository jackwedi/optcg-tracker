import Link from "next/link";
import { getTournamentTypeIcon, Tournament } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { formatDate } from "@/lib/utils";
import { LeaderColorDots } from "@/components/LeaderColorDots";

interface TournamentTableProps {
  tournaments: Tournament[];
  leadersById: Record<string, Leader>;
}

export function TournamentTable({
  tournaments,
  leadersById,
}: TournamentTableProps) {
  if (tournaments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 py-12 text-center">
        <p className="text-gray-500">No tournaments yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 font-semibold">Tournament</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Played Leader</th>
            <th className="px-4 py-3 text-right font-semibold">Rounds</th>
            <th className="px-4 py-3 text-right font-semibold">Win Rate</th>
            <th className="px-4 py-3 text-right font-semibold">Coin Flip</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tournaments.map((tournament) => {
            const totalRounds = tournament.rounds.length;
            const wins = tournament.rounds.filter((r) => r.won).length;
            const coinFlipWins = tournament.rounds.filter(
              (r) => r.wonCoinFlip,
            ).length;
            const winRate =
              totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : "0.0";

            const playedLeader = tournament.playedLeaderId
              ? leadersById[tournament.playedLeaderId]
              : undefined;

            return (
              <tr key={tournament.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
                  >
                    <span
                      className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm"
                      title={tournament.tournamentType}
                      aria-label={`Tournament type: ${tournament.tournamentType}`}
                    >
                      <span role="img" aria-hidden="true">
                        {getTournamentTypeIcon(tournament.tournamentType)}
                      </span>
                    </span>
                    <span className="truncate">{tournament.name}</span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatDate(tournament.date)}
                </td>
                <td className="px-4 py-3">
                  {playedLeader ? (
                    <span className="flex items-center gap-1.5">
                      <LeaderColorDots colors={playedLeader.colors} />
                      <span className="truncate">{playedLeader.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {totalRounds}
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  {winRate}%
                </td>
                <td className="px-4 py-3 text-right font-medium text-amber-600">
                  {coinFlipWins} / {totalRounds}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
