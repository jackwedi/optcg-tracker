// Leader names are "First Last" (or longer); in space-constrained UI we
// only show the last word, e.g. "Charlotte Katakuri" -> "Katakuri".
// Names with no spaces (e.g. "Monkey.D.Luffy") pass through unchanged.
export function getShortLeaderName(name: string): string {
  const words = name.trim().split(/\s+/);
  return words[words.length - 1];
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
