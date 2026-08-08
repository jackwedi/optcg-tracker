import { StatMeterContent } from "@/components/StatMeter";

interface StartingPositionStatsProps {
  firstWinRate: number;
  firstWins: number;
  firstRounds: number;
  secondWinRate: number;
  secondWins: number;
  secondRounds: number;
}

// "Going 1st" and "Going 2nd" are naturally a pair, not two independent
// stats — one shared card, split in half, instead of two separate
// StatMeter cards sitting side by side.
export function StartingPositionStats({
  firstWinRate,
  firstWins,
  firstRounds,
  secondWinRate,
  secondWins,
  secondRounds,
}: StartingPositionStatsProps) {
  return (
    <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-0 p-4">
        <StatMeterContent
          label="Going 1st"
          value={firstWinRate}
          detail={`${firstWins} / ${firstRounds} rounds won`}
          trackClassName="bg-emerald-100"
          fillClassName="bg-emerald-500"
          valueClassName="text-emerald-600"
        />
      </div>

      <div className="min-w-0 p-4">
        <StatMeterContent
          label="Going 2nd"
          value={secondWinRate}
          detail={`${secondWins} / ${secondRounds} rounds won`}
          trackClassName="bg-emerald-100"
          fillClassName="bg-emerald-500"
          valueClassName="text-emerald-600"
        />
      </div>
    </div>
  );
}
