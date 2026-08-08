import { StatMeterContent } from "@/components/StatMeter";
import { RoundBadgeIcon } from "@/components/RoundBadgeIcon";

interface StartingPositionStatsProps {
  firstWinRate: number;
  firstWins: number;
  firstRounds: number;
  secondWinRate: number;
  secondWins: number;
  secondRounds: number;
}

// Same "1"/"2" badge as RoundList's Start column, not a text label — much
// tighter on mobile than "Going 1st"/"Going 2nd", and it's already a
// familiar icon for turn order by the time someone reaches this page.
function StartingPositionLabel({ text }: { text: "1" | "2" }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <RoundBadgeIcon
        text={text}
        className="bg-slate-400 text-white"
        sizeClassName="h-5 w-5 text-[10px]"
      />
    </span>
  );
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Names the pair once instead of repeating it inside each half —
          same wording as RoundList's Start column. */}
      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Start
      </p>
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
        <div className="min-w-0 p-4">
          <StatMeterContent
            label={<StartingPositionLabel text="1" />}
            value={firstWinRate}
            detail={`${firstWins} / ${firstRounds} rounds won`}
            trackClassName="bg-emerald-100 dark:bg-emerald-500/10"
            fillClassName="bg-emerald-500"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="min-w-0 p-4">
          <StatMeterContent
            label={<StartingPositionLabel text="2" />}
            value={secondWinRate}
            detail={`${secondWins} / ${secondRounds} rounds won`}
            trackClassName="bg-emerald-100 dark:bg-emerald-500/10"
            fillClassName="bg-emerald-500"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
