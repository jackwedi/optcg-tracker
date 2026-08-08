"use client";

import { useState } from "react";
import { SpinnerIcon } from "@/components/SpinnerIcon";

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

interface ShareTournamentButtonProps {
  tournamentId: string;
  tournamentName: string;
}

export function ShareTournamentButton({
  tournamentId,
  tournamentName,
}: ShareTournamentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    setLoading(true);
    setError("");

    try {
      // A stuck upstream image/font fetch on the server would otherwise
      // leave this spinning forever with no feedback — cap it so a hang
      // surfaces as a clear error instead.
      const response = await fetch(
        `/api/tournaments/${tournamentId}/share-image`,
        { signal: AbortSignal.timeout(20000) },
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      const fileName = `${tournamentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-summary.png`;

      // Always a direct download, deliberately skipping navigator.share():
      // on desktop Chrome/Edge it either hangs the button until the native
      // OS share flyout is dismissed, or — as tested — silently no-ops
      // with no visible panel and no error, which is worse than doing
      // nothing. A download always visibly happens, on every browser.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        aria-label={loading ? "Generating share image" : "Share tournament"}
        title={loading ? "Generating share image" : "Share tournament"}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 sm:h-10 sm:w-10"
      >
        {loading ? (
          <SpinnerIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 sm:h-5 sm:w-5" />
        ) : (
          <ShareIcon className="h-4 w-4 text-slate-600 dark:text-slate-300 sm:h-5 sm:w-5" />
        )}
      </button>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
