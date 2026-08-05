// Leader names are "First Last" (space-separated) or multiple capitalized
// parts joined without spaces via dots/quotes, e.g. "Marshall.D.Teach" or
// 'Eustass"Captain"Kid'. In space-constrained UI we only show the last
// capitalized portion: "Charlotte Katakuri" -> "Katakuri",
// "Marshall.D.Teach" -> "Teach", 'Eustass"Captain"Kid' -> "Kid". A single
// capitalized word (e.g. "Kin'emon") passes through unchanged.
export function getShortLeaderName(name: string): string {
  const trimmed = name.trim();
  const parts = trimmed.match(/[A-Z][a-zA-Z']*/g);
  return parts && parts.length > 0 ? parts[parts.length - 1] : trimmed;
}

// Utility function for consistent date formatting across server and client
export function formatDate(dateString: string): string {
  try {
    // Parse the date string and format it consistently
    const date = new Date(dateString + "T00:00:00Z"); // Append time to avoid timezone issues
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}
