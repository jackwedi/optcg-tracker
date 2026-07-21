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
    <div className="space-y-3">
      {rounds.map((round) => {
        const opponentLeader =
          leaders.find(
            (leader) =>
              round.opponentLeaderId && leader.id === round.opponentLeaderId,
          ) ?? null;

        return (
          <div
            key={round.id}
            className={
              "relative flex items-stretch gap-4 p-4 pr-24 border rounded-lg shadow-sm hover:bg-slate-50"
            }
          >
            <div className="shrink-0 flex flex-col items-center gap-2">
              <LeaderThumbnail
                src={opponentLeader?.imageUrl ?? "/placeholder.png"}
                alt={opponentLeader?.name ?? round.opponentLeaderId}
                isCard
                className="w-20 h-full object-cover rounded-xl bg-white self-stretch"
              />
              <button
                onClick={() => handleDeleteRound(round.id)}
                disabled={loading === round.id}
                className="rounded-full border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === round.id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      Round
                    </h4>
                    <p className="text-sm text-slate-500">
                      {opponentLeader
                        ? opponentLeader.name
                        : round.opponentLeaderId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Deck</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {round.opponentLeaderId}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Coin Flip</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {round.wonCoinFlip ? "Won" : "Lost"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Start</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {round.startingPosition}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full w-[10%] rounded-r-lg overflow-hidden">
              <div
                className={`w-full ${round.won ? "bg-green-200" : "bg-red-200"}`}
                style={{ height: "100%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
