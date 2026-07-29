"use client";

import { Round } from "@/models/tournament";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";

interface RoundListProps {
  rounds: Round[];
  tournamentId: string;
}

export function RoundList({ rounds, tournamentId }: RoundListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/leaders")
      .then((res) => res.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteRound = async (roundId: string) => {
    if (!confirm("Are you sure you want to delete this round?")) return;

    setLoading(roundId);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/rounds/${roundId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete round");

      router.refresh();
    } catch {
      alert("Failed to delete round");
    } finally {
      setLoading(null);
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No rounds recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => {
        const opponentLeader =
          leaders.find(
            (leader) =>
              round.opponentLeaderId && leader.id === round.opponentLeaderId,
          ) ?? null;

        return (
          <div
            key={round.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <LeaderThumbnail
                  src={opponentLeader?.imageUrl ?? "/placeholder.png"}
                  alt={opponentLeader?.name ?? round.opponentLeaderId}
                  isCard
                  className="w-20 h-[112px] object-cover bg-white"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {opponentLeader
                      ? opponentLeader.name
                      : round.opponentLeaderId}
                  </h4>
                  <button
                    onClick={() => handleDeleteRound(round.id)}
                    disabled={loading === round.id}
                    className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading === round.id ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-xs text-slate-500">Deck</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {round.opponentLeaderId}
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="text-xs text-slate-500">Coin Flip</div>
                    <div className="mt-1 text-sm font-semibold text-amber-700">
                      {round.wonCoinFlip ? "Won" : "Lost"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-4">
                    <div className="text-xs text-slate-500">Start</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {round.startingPosition}
                    </div>
                  </div>

                  <div
                    className={`rounded-lg p-4 ${
                      round.won ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="text-xs text-slate-500">Result</div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        round.won ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {round.won ? "Won" : "Lost"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
