// Matches Tailwind's default -500 swatches (the shade used for solid
// buttons/accents elsewhere in the app), so leader colors read consistently
// with the rest of the UI. Black/Gray use the app's slate neutral family.
const PASTEL_MAP: Record<string, string> = {
  Red: "#EF4444", // red-500
  Green: "#22C55E", // green-500
  Blue: "#3B82F6", // blue-500
  Purple: "#A855F7", // purple-500
  Black: "#0F172A", // slate-900
  Yellow: "#EAB308", // yellow-500
  Gray: "#94A3B8", // slate-400
  Pink: "#EC4899", // pink-500
  Brown: "#92400E", // amber-800
};

// The 6 official OPTCG colors a leader can be assigned. Gray/Pink/Brown in
// PASTEL_MAP above are rendering fallbacks only (e.g. Gray for the
// colorless BYE placeholder), not selectable leader colors.
export const LEADER_COLOR_OPTIONS = [
  "Red",
  "Green",
  "Blue",
  "Purple",
  "Black",
  "Yellow",
];

export function colorToHex(name: string): string {
  const key = String(name ?? "").trim();
  if (!key) return PASTEL_MAP.Gray;
  if (PASTEL_MAP[key]) return PASTEL_MAP[key];
  const normalized = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  return PASTEL_MAP[normalized] ?? PASTEL_MAP.Gray;
}

interface LeaderColorDotsProps {
  colors: string[] | undefined;
  className?: string;
  dotClassName?: string;
}

export function LeaderColorDots({
  colors,
  className = "",
  dotClassName = "h-2.5 w-2.5",
}: LeaderColorDotsProps) {
  const flatColors = Array.isArray(colors)
    ? (colors.flat().filter(Boolean) as string[])
    : [];

  if (flatColors.length === 0) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 ${className}`}
      aria-hidden="true"
    >
      {flatColors.slice(0, 2).map((color, index) => (
        <span
          key={color + index}
          className={`shrink-0 rounded border border-black/10 dark:border-white/10 ${dotClassName}`}
          style={{ backgroundColor: colorToHex(color) }}
        />
      ))}
    </span>
  );
}
