import type { CrewLeaderboardEntry } from "@/models/crew";

interface CrewLeaderboardTableProps {
  entries: CrewLeaderboardEntry[];
}

export function CrewLeaderboardTable({ entries }: CrewLeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 py-12 text-center">
        <p className="text-gray-500">No crew members yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">Pseudo</th>
            <th className="px-4 py-3 text-right font-semibold">Wins</th>
            <th className="px-4 py-3 text-right font-semibold">Rounds</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              className={entry.isCurrentUser ? "bg-sky-50" : "hover:bg-gray-50"}
            >
              <td className="px-4 py-3 font-medium text-gray-600">
                {entry.rank}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {entry.displayName}
                {entry.isCurrentUser ? (
                  <span className="ml-1.5 text-xs font-normal text-sky-600">
                    (You)
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                {entry.wins}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {entry.totalRounds}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
