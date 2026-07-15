'use client';

import React, { useMemo, useState } from 'react';
import type { Leader } from '@/models/leader';
import { LeaderCard } from './LeaderCard';

interface Props {
  leaders: Leader[];
  selectedLeaderId?: string;
  onSelectLeader?: (leader: Leader) => void;
}

export function LeaderSearch({ leaders, selectedLeaderId, onSelectLeader }: Props) {
  const [color, setColor] = useState('All');
  const [idGroup, setIdGroup] = useState('All');

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    leaders.forEach((l) => {
      if (Array.isArray(l.colors)) l.colors.flat().forEach((c) => set.add(c));
    });
    return ['All', ...Array.from(set).sort()];
  }, [leaders]);

  const idGroupOptions = useMemo(() => {
    const set = new Set<string>();
    leaders.forEach((l) => {
      let prefix = l.id.split('-')[0] || '';
      if (!prefix) return;
      if (prefix.startsWith('ST')) prefix = 'ST';
      set.add(prefix);
    });
    return ['All', ...Array.from(set).sort()];
  }, [leaders]);

  const opGroups = useMemo(() => idGroupOptions.filter((g) => g !== 'All' && g.startsWith('OP')), [idGroupOptions]);
  const ebGroups = useMemo(() => idGroupOptions.filter((g) => g.startsWith('EB')), [idGroupOptions]);
  const restGroups = useMemo(
    () => idGroupOptions.filter((g) => g !== 'All' && !g.startsWith('OP') && !g.startsWith('EB')),
    [idGroupOptions],
  );

  const filtered = useMemo(() => {
    return leaders.filter((l) => {
      let prefix = l.id.split('-')[0] || '';
      if (prefix.startsWith('ST')) prefix = 'ST';
      const matchesColor = color === 'All' || (Array.isArray(l.colors) && l.colors.flat().includes(color));
      const matchesIdGroup = idGroup === 'All' || prefix === idGroup;
      return matchesColor && matchesIdGroup;
    });
  }, [leaders, color, idGroup]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {colorOptions.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`px-3 py-2 rounded border text-sm font-medium transition ${
              color === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="mb-2 text-sm font-semibold text-slate-600">OP groups</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIdGroup('All')}
            className={`px-3 py-2 rounded border text-sm font-medium transition ${
              idGroup === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {opGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setIdGroup(group)}
              className={`px-3 py-2 rounded border text-sm font-medium transition ${
                idGroup === group ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="mb-2 text-sm font-semibold text-slate-600">EB groups</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ebGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setIdGroup(group)}
              className={`px-3 py-2 rounded border text-sm font-medium transition ${
                idGroup === group ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="mb-2 text-sm font-semibold text-slate-600">Other groups</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {restGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setIdGroup(group)}
              className={`px-3 py-2 rounded border text-sm font-medium transition ${
                idGroup === group ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((leader) => (
          <LeaderCard
            leader={leader}
            key={leader.id}
            selected={selectedLeaderId === leader.id}
            onSelect={onSelectLeader}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-gray-500">No leaders match the selected filters.</p>
      )}
    </div>
  );
}
