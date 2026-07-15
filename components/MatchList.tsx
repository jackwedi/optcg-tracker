"use client";

import { Match } from "@/models/tournament";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from '@/models/leader';
import LeaderThumbnail from '@/components/LeaderThumbnail';

interface MatchListProps {
  tournaments_matches: Match[];
  tournamentId: string;
}

export function MatchList({
  tournaments_matches,
  tournamentId,
}: MatchListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch('/api/leaders')
      .then((res) => res.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

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
    } catch {
      alert("Failed to delete match");
    } finally {
      setLoading(null);
    }
  };

  if (tournaments_matches.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No rounds recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tournaments_matches.map((match) => {
        const opponentLeader = leaders.find((leader) =>
        (match.opponentLeaderId && leader.id === match.opponentLeaderId)) ?? null;

        return (
          <div
            key={match.id}
            className={"relative flex items-stretch gap-4 p-4 pr-24 border rounded-lg shadow-sm hover:bg-slate-50"}
          >
            <div className="shrink-0 flex flex-col items-center gap-2">
              <LeaderThumbnail
                src={opponentLeader?.imageUrl ?? '/leader-images/placeholder.png'}
                alt={opponentLeader?.name ?? match.opponentLeaderId}
                isCard
                className="w-20 h-full object-cover rounded-xl bg-white self-stretch"
              />
              <button
                onClick={() => handleDeleteMatch(match.id)}
                disabled={loading === match.id}
                className="rounded-full border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === match.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Round</h4>
                    <p className="text-sm text-slate-500">{opponentLeader ? opponentLeader.name : match.opponentLeaderId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Deck</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{match.opponentLeaderId} </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Coin Flip</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {match.wonCoinFlip ? 'Won' : 'Lost'}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Start</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{match.startingPosition}</div>
                </div>
              </div>
            </div>
 <div className="absolute top-0 right-0 h-full w-[10%] rounded-r-lg overflow-hidden"> <div

                className={`w-full ${match.won  ? 'bg-green-200' :  'bg-red-200'}`}
                style={{ height:`100%` }}
              /></div>
          </div>
        );
      })}
    </div>
  );
}
