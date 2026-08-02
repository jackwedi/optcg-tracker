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
      const response = await fetch(
        `/api/tournaments/${tournamentId}/share-image`,
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      const fileName = `${tournamentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-summary.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: {
          files: File[];
          title?: string;
          text?: string;
        }) => Promise<void>;
      };

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({
            files: [file],
            title: tournamentName,
            text: `Check out my ${tournamentName} results!`,
          });
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === "AbortError") {
            // User dismissed the native share sheet — not an error.
            return;
          }
          // Some browsers (notably iOS Safari) can throw NotAllowedError
          // here if the fetch above took long enough to lose the user's
          // activation window. Fall through to a plain download instead
          // of surfacing that as a failure.
        }
      }

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
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:w-10"
      >
        {loading ? (
          <SpinnerIcon className="h-4 w-4 text-slate-500 sm:h-5 sm:w-5" />
        ) : (
          <ShareIcon className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
        )}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
