"use client";

import React, { useEffect, useState } from "react";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";

interface Props {
  leader: Leader;
  selected?: boolean;
  onSelect?: (leader: Leader) => void;
  actionLabel?: string;
  selectedLabel?: string;
}

export function LeaderCard({
  leader,
  selected,
  onSelect,
  actionLabel = "Select",
  selectedLabel = "Selected",
}: Props) {
  const flatColors: string[] = Array.isArray(leader.colors)
    ? (leader.colors.flat().filter(Boolean) as string[])
    : [];
  const colorsToShow =
    flatColors.length > 0 ? flatColors.slice(0, 2) : ["gray"];

  const pastelMap: Record<string, string> = {
    Red: "#EF4444",
    Green: "#22C55E",
    Blue: "#3B82F6",
    Purple: "#A855F7",
    Black: "#0F172A",
    Yellow: "#EAB308",
    Gray: "#94A3B8",
    Pink: "#EC4899",
    Brown: "#92400E",
  };

  const pastel = (name: string) => {
    const key = String(name ?? "").trim();
    if (!key) return pastelMap.Gray;
    if (pastelMap[key]) return pastelMap[key];
    const lower = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    return pastelMap[lower] ?? key;
  };

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="relative flex items-stretch gap-4 p-4 pr-[10%] border border-slate-200 rounded-lg bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${leader.name} image`}
          className="shrink-0 cursor-zoom-in"
        >
          <LeaderThumbnail
            src={leader.imageUrl}
            alt={leader.name}
            isCard
            className="w-20 h-full object-cover bg-white self-stretch"
          />
        </button>

        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate dark:text-slate-50">
              {leader.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {leader.id}
            </p>
          </div>
          {onSelect && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onSelect(leader)}
                aria-label={selected ? selectedLabel : actionLabel}
                title={selected ? selectedLabel : actionLabel}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                <span className="text-xl font-semibold leading-none">⋯</span>
              </button>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 h-full w-[10%] rounded-r-lg overflow-hidden">
          {colorsToShow.length === 1 ? (
            <div
              className="h-full w-full"
              style={{ backgroundColor: pastel(colorsToShow[0]) }}
            />
          ) : (
            colorsToShow.map((c, i) => (
              <div
                key={c + i}
                className="w-full"
                style={{
                  backgroundColor: pastel(c),
                  height: `${100 / colorsToShow.length}%`,
                }}
              />
            ))
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          {(() => {
            const modalSrc = /^https?:\/\//i.test(leader.imageUrl)
              ? leader.imageUrl
              : `/${leader.imageUrl}`.replace(/^\//, "/");

            return (
              <div className="relative">
                <button
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="absolute right-2 top-2 z-10 rounded bg-white/80 p-1 text-sm dark:bg-slate-800/80 dark:text-slate-100"
                >
                  ✕
                </button>
                <img
                  src={modalSrc}
                  alt={leader.name}
                  className="max-h-[90vh] max-w-[90vw] object-contain bg-white p-2 dark:bg-slate-800"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder.png";
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
