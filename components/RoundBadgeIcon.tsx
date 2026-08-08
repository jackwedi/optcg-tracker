interface RoundBadgeIconProps {
  text: string;
  className: string;
  // Defaults to the round-form button size; pass a smaller one for tighter
  // contexts like a stat card label.
  sizeClassName?: string;
}

// Same badge shape/colors as RoundList's table (W/L/B, B/✕, 1/2) — reused
// wherever a round result/coin-flip/turn-order value needs a compact icon
// instead of a text label, so the whole app reads as one consistent system.
export function RoundBadgeIcon({
  text,
  className,
  sizeClassName = "h-8 w-8 text-sm",
}: RoundBadgeIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClassName} ${className}`}
    >
      {text}
    </span>
  );
}
