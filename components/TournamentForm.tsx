"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from '@/models/leader';

export function TournamentForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState('All');
  const [playedLeaderId, setPlayedLeaderId] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch('/api/leaders')
      .then((r) => r.json())
      .then((data: Leader[]) => { if (mounted) setLeaders(data); })
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
    const matchesId = idGroupFilter === 'All' || prefix === idGroupFilter;
    return matchesId;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, date, playedLeaderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tournament");
      }

      const tournament = await response.json();
      setName("");
      setDate("");
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
            Tournament Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base"
            placeholder="e.g., Regional Championship"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-slate-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base"
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <label className="block text-sm font-medium">Played Leader</label>

        <div className="mb-2 text-sm font-semibold text-slate-600 mt-3">ID groups</div>
        <div className="flex flex-wrap gap-2 mb-3">
          <button type="button" className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} onClick={() => setIdGroupFilter('All')}>All</button>
          {opGroups.map((g) => (
            <button key={g} type="button" className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} onClick={() => setIdGroupFilter(g)}>{g}</button>
          ))}
          {ebGroups.map((g) => (
            <button key={g} type="button" className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} onClick={() => setIdGroupFilter(g)}>{g}</button>
          ))}
          {restGroups.map((g) => (
            <button key={g} type="button" className={`px-3 py-1.5 rounded border text-sm ${idGroupFilter === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} onClick={() => setIdGroupFilter(g)}>{g}</button>
          ))}
        </div>

        <select
          value={playedLeaderId ?? ''}
          onChange={(e) => setPlayedLeaderId(e.target.value || undefined)}
          className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-md shadow-sm text-base"
        >
          <option value="">-- Select leader --</option>
          {filteredLeaders.map((l) => (
            <option key={l.id} value={l.id}>{`${l.name} (${l.id})`}</option>
          ))}
        </select>

        {playedLeaderId && (() => {
          const sel = leaders.find((x) => x.id === playedLeaderId);
          if (!sel) return null;
          return (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={`/${sel.imageUrl}`.replace(/^\//, '/')}
                alt={sel.name}
                className="w-14 h-14 object-contain rounded-md bg-white border"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/leader-images/placeholder.png'; }}
              />
              <div>
                <div className="font-medium text-lg">{sel.name}</div>
                <div className="text-sm text-gray-500">{sel.id}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Tournament"}
      </button>
    </form>
  );
}
