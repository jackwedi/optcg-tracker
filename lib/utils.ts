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
