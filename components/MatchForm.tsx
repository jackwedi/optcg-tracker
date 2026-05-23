"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MatchFormProps {
  tournamentId: string;
  onMatchAdded?: () => void;
}

export function MatchForm({ tournamentId, onMatchAdded }: MatchFormProps) {
  const [opponentDeck, setOpponentDeck] = useState("");
  const [won, setWon] = useState(false);
  const [wonCoinFlip, setWonCoinFlip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentDeck,
          won,
          wonCoinFlip,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create match");
      }

      setOpponentDeck("");
      setWon(false);
      setWonCoinFlip(false);
      onMatchAdded?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md bg-gray-50 p-4 rounded-md"
    >
      <h3 className="text-lg font-semibold">Add Match</h3>

      <div>
        <label htmlFor="opponentDeck" className="block text-sm font-medium">
          Opponent's Deck
        </label>
        <input
          type="text"
          id="opponentDeck"
          value={opponentDeck}
          onChange={(e) => setOpponentDeck(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Red Luffy"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="won"
          checked={won}
          onChange={(e) => setWon(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="won" className="ml-2 block text-sm">
          Won Match
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="wonCoinFlip"
          checked={wonCoinFlip}
          onChange={(e) => setWonCoinFlip(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="wonCoinFlip" className="ml-2 block text-sm">
          Won Coin Flip
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Adding..." : "Add Match"}
      </button>
    </form>
  );
}
