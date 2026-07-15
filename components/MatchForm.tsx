"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from '@/models/leader';

interface MatchFormProps {
  tournamentId: string;
  onMatchAdded?: () => void;
}

export function MatchForm({ tournamentId, onMatchAdded }: MatchFormProps) {
  const [selectedOpponentLeaderId, setSelectedOpponentLeaderId] = useState<string | undefined>(undefined);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState('All');
  const [won, setWon] = useState(false);
  const [wonCoinFlip, setWonCoinFlip] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch('/api/leaders')
      .then((r) => r.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const idGroupOptions = Array.from(
    new Set(leaders.map((l) => (l.id.split('-')[0] || '')).filter(Boolean).map((p) => (p.startsWith('ST') ? 'ST' : p)))
  ).sort();

  const opGroups = idGroupOptions.filter((g) => g.startsWith('OP'));
  const ebGroups = idGroupOptions.filter((g) => g.startsWith('EB'));
  const restGroups = idGroupOptions.filter((g) => !g.startsWith('OP') && !g.startsWith('EB'));

  const filteredLeaders = leaders.filter((l) => {
    let prefix = l.id.split('-')[0] || '';
    if (prefix.startsWith('ST')) prefix = 'ST';
    return idGroupFilter === 'All' || prefix === idGroupFilter;
  });

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
          opponentLeaderId: selectedOpponentLeaderId,
          won,
          wonCoinFlip,
          startingPosition: isFirst ? '1st' : '2nd',
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create match");
      }

      setSelectedOpponentLeaderId(undefined);
      setWon(false);
      setWonCoinFlip(false);
      setIsFirst(true);
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
      className="space-y-6 w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-xl font-semibold tracking-tight">Add Round</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select the opponent leader and update the round outcome.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Opponent Leader
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-600">ID groups</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIdGroupFilter('All')}
                className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                All
              </button>
              {opGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setIdGroupFilter(g)}
                  className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  {g}
                </button>
              ))}
              {ebGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setIdGroupFilter(g)}
                  className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  {g}
                </button>
              ))}
              {restGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setIdGroupFilter(g)}
                  className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <select
              value={selectedOpponentLeaderId ?? ''}
              onChange={(e) => {
                const leaderId = e.target.value || undefined;
                setSelectedOpponentLeaderId(leaderId);
              }}
              required
              className="mt-1 block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select opponent leader --</option>
              {filteredLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name} ({leader.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700">Match Result</div>
              <p className="mt-1 text-xs text-slate-500">Toggle to record win or loss.</p>
            </div>
            <button
              type="button"
              onClick={() => setWon((value) => !value)}
              className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                won ? 'bg-emerald-600' : 'bg-rose-500'
              }`}
            >
              <span className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                won ? 'opacity-100' : 'opacity-0'
              }`}>
                Won
              </span>
              <span className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                won ? 'opacity-0' : 'opacity-100'
              }`}>
                Lost
              </span>
              <span className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                won ? 'translate-x-14' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700">Coin Flip</div>
              <p className="mt-1 text-xs text-slate-500">Toggle to record the coin flip result.</p>
            </div>
            <button
              type="button"
              onClick={() => setWonCoinFlip((value) => !value)}
              className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                wonCoinFlip ? 'bg-blue-600' : 'bg-rose-500'
              }`}
            >
              <span className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                wonCoinFlip ? 'opacity-100' : 'opacity-0'
              }`}>
                Won
              </span>
              <span className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                wonCoinFlip ? 'opacity-0' : 'opacity-100'
              }`}>
                Lost
              </span>
              <span className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                wonCoinFlip ? 'translate-x-14' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700">Turn Order</div>
              <p className="mt-1 text-xs text-slate-500">Choose whether you played first or second.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFirst((value) => !value)}
              className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                isFirst ? 'bg-amber-500' : 'bg-sky-500'
              }`}
            >
              <span className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                isFirst ? 'opacity-100' : 'opacity-0'
              }`}>
                1st
              </span>
              <span className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                isFirst ? 'opacity-0' : 'opacity-100'
              }`}>
                2nd
              </span>
              <span className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                isFirst ? 'translate-x-14' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-slate-400"
      >
        {loading ? "Adding..." : "Add Round"}
      </button>
    </form>
  );
}
