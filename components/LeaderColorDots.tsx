const PASTEL_MAP: Record<string, string> = {
  Red: "#EF4444",
  Green: "#10B981",
  Blue: "#3B82F6",
  Purple: "#7C3AED",
  Black: "#374151",
  Yellow: "#FDE047",
  Gray: "#9CA3AF",
  Pink: "#EC4899",
  Brown: "#A16207",
};

function colorToHex(name: string): string {
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
  dotClassName = "h-5 w-5",
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
          className={`shrink-0 rounded border border-black/10 ${dotClassName}`}
          style={{ backgroundColor: colorToHex(color) }}
        />
      ))}
    </span>
  );
}
