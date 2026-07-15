"use client";

import React, { useEffect, useState } from 'react';
import type { Leader } from '@/models/leader';
import LeaderThumbnail from '@/components/LeaderThumbnail';

interface Props {
  leader: Leader;
  selected?: boolean;
  onSelect?: (leader: Leader) => void;
}

export function LeaderCard({ leader, selected, onSelect }: Props) {
  const flatColors: string[] = Array.isArray(leader.colors) ? leader.colors.flat().filter(Boolean) as string[] : [];
  const colorsToShow = flatColors.length > 0 ? flatColors.slice(0, 2) : ['gray'];

  const pastelMap: Record<string, string> = {
    Red: '#EF4444',
    Green: '#10B981',
    Blue: '#3B82F6',
    Purple: '#7C3AED',
    Black: '#374151',
    Yellow: '#FDE047',
    Gray: '#9CA3AF',
    Pink: '#EC4899',
    Brown: '#A16207',
  };

  const pastel = (name: string) => {
    const key = String(name ?? '').trim();
    if (!key) return pastelMap.Gray;
    if (pastelMap[key]) return pastelMap[key];
    const lower = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    return pastelMap[lower] ?? key;
  };

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
        className="relative flex items-stretch gap-4 p-4 pr-[10%] border rounded-lg bg-white shadow-sm cursor-pointer"
      >
      <LeaderThumbnail
        src={leader.imageUrl}
        alt={leader.name}
        isCard
        className="w-20 h-full object-cover rounded-xl bg-white self-stretch"
      />

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{leader.name}</h3>
        </div>
        <p className="text-sm text-gray-500">{leader.id}</p>
      </div>
      <div className="absolute top-0 right-0 h-full w-[10%] rounded-r-lg overflow-hidden">
          {colorsToShow.length === 1 ? (
            <div className="h-full w-full" style={{ backgroundColor: pastel(colorsToShow[0]) }} />
          ) : (
            colorsToShow.map((c, i) => (
              <div
                key={c + i}
                className="w-full"
                style={{ backgroundColor: pastel(c), height: `${100 / colorsToShow.length}%` }}
              />
            ))
          )}
        </div>
      </div>

      {onSelect && (
        <div className="absolute bottom-4 right-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(leader);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              selected ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="relative">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-10 rounded bg-white/80 p-1 text-sm"
            >
              ✕
            </button>
            <img
              src={`/${leader.imageUrl}`.replace(/^\//, '/')}
              alt={leader.name}
              className="max-h-[90vh] max-w-[90vw] object-contain bg-white p-2 rounded"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/leader-images/placeholder.png'; }}
            />
          </div>
        </div>
      )}
    </>
  );
}
