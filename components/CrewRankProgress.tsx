import { CREW_RANK_TIERS, getCrewRankProgress } from "@/models/crew";

interface CrewRankProgressProps {
  totalWins: number;
}

export function CrewRankProgress({ totalWins }: CrewRankProgressProps) {
  const { currentTier, nextTier, winsToNextTier, progressToNextTier } =
    getCrewRankProgress(totalWins);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-600">Crew Rank</p>
        <p className="text-xl font-semibold text-amber-600">
          {currentTier.emoji} {currentTier.name}
        </p>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-[width] duration-300"
          style={{ width: `${progressToNextTier}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {nextTier
          ? `${totalWins} wins — ${winsToNextTier} more to reach ${nextTier.emoji} ${nextTier.name}`
          : `${totalWins} wins — maximum rank reached!`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {CREW_RANK_TIERS.map((tier) => {
          const achieved = tier.rank <= currentTier.rank;
          const isCurrent = tier.rank === currentTier.rank;
          return (
            <div
              key={tier.rank}
              className={`rounded-lg border p-2 text-center transition ${
                isCurrent
                  ? "border-amber-400 bg-amber-50"
                  : achieved
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-100 bg-white opacity-50"
              }`}
            >
              <p className="text-lg">{tier.emoji}</p>
              <p className="text-xs font-semibold text-slate-700">
                {tier.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {tier.maxWins ? `${tier.minWins}–${tier.maxWins}` : `${tier.minWins}+`}{" "}
                wins
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs italic text-slate-500">
        {currentTier.description}
      </p>
    </div>
  );
}
