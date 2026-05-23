"use client";

import { Match } from "@/models/tournament";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MatchListProps {
  tournaments_matches: Match[];
  tournamentId: string;
}

export function MatchList({
  tournaments_matches,
  tournamentId,
}: MatchListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    setLoading(matchId);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete match");

      router.refresh();
    } catch (error) {
      alert("Failed to delete match");
    } finally {
      setLoading(null);
    }
  };

  if (tournaments_matches.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No matches recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tournaments_matches.map((match) => (
        <div
          key={match.id}
          className="flex items-start justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg">Match</h4>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  match.won
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {match.won ? "Won" : "Lost"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Deck: <span className="font-medium">{match.opponentDeck}</span>
            </p>
            <p className="text-sm text-gray-600">
              Coin Flip: {match.wonCoinFlip ? "✓ Won" : "✗ Lost"}
            </p>
          </div>
          <button
            onClick={() => handleDeleteMatch(match.id)}
            disabled={loading === match.id}
            className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:bg-gray-200"
          >
            {loading === match.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
