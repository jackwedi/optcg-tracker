"use client";

import { colorToHex } from "@/components/LeaderColorDots";

export const MAX_LEADER_COLOR_FILTERS = 2;

function getContrastText(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return luminance > 0.55 ? "#111827" : "#ffffff";
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface LeaderColorFilterProps {
  colors: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

// No color selected == no filter (all colors). There is no dedicated
// "all colors" swatch; that state is simply the empty selection.
export function LeaderColorFilter({
  colors,
  value,
  onChange,
}: LeaderColorFilterProps) {
  if (colors.length === 0) return null;

  const toggleColor = (color: string) => {
    if (value.includes(color)) {
      onChange(value.filter((c) => c !== color));
      return;
    }
    if (value.length >= MAX_LEADER_COLOR_FILTERS) return;
    onChange([...value, color]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((color) => {
        const hex = colorToHex(color);
        const isSelected = value.includes(color);
        const isDisabled =
          !isSelected && value.length >= MAX_LEADER_COLOR_FILTERS;
        return (
          <button
            key={color}
            type="button"
            onClick={() => toggleColor(color)}
            disabled={isDisabled}
            title={color}
            aria-label={`Filter by ${color}`}
            aria-pressed={isSelected}
            style={{ backgroundColor: hex }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
              isSelected
                ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1"
                : isDisabled
                  ? "cursor-not-allowed border-black/10 opacity-40"
                  : "border-black/10 hover:opacity-90"
            }`}
          >
            {isSelected ? <CheckIcon color={getContrastText(hex)} /> : null}
          </button>
        );
      })}
    </div>
  );
}
