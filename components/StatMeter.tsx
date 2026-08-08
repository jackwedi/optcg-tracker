import type { ReactNode } from "react";

interface StatMeterContentProps {
  label: ReactNode;
  value: number;
  detail: string;
  trackClassName: string;
  fillClassName: string;
  valueClassName: string;
}

// The label/value/bar/detail block on its own, no card chrome — reused by
// StatMeter (standalone card, below) and by grouped cards that need two
// or more meters sharing a single outer border, e.g. StartingPositionStats.
export function StatMeterContent({
  label,
  value,
  detail,
  trackClassName,
  fillClassName,
  valueClassName,
}: StatMeterContentProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </p>
        <p className={`text-2xl font-semibold ${valueClassName}`}>
          {value.toFixed(1)}%
        </p>
      </div>
      <div
        className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${trackClassName}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fillClassName}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
}

export function StatMeter(props: StatMeterContentProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <StatMeterContent {...props} />
    </div>
  );
}
