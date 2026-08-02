interface StatMeterProps {
  label: string;
  value: number;
  detail: string;
  trackClassName: string;
  fillClassName: string;
  valueClassName: string;
}

export function StatMeter({
  label,
  value,
  detail,
  trackClassName,
  fillClassName,
  valueClassName,
}: StatMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
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
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
