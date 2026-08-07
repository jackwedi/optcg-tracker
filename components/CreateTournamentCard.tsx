"use client";

import { useState } from "react";
import { TournamentForm } from "@/components/TournamentForm";

interface CreateTournamentCardProps {
  // Folded by default when there's already an ongoing tournament (today's
  // tournament banner is showing) — that's the more relevant action then,
  // so this card shouldn't compete for attention wide open.
  defaultOpen?: boolean;
}

export function CreateTournamentCard({
  defaultOpen = true,
}: CreateTournamentCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white shadow-md">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left sm:p-8"
        aria-label={
          open ? "Collapse create tournament" : "Expand create tournament"
        }
      >
        <div className="flex items-center gap-4">
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl shadow-sm"
            aria-hidden="true"
          >
            ⚔️
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Log Tournament
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Log a new tournament and start tracking your performance.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-lg font-semibold text-blue-700 transition-transform ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <div className="border-t border-blue-100 bg-white p-6 sm:p-8">
          <TournamentForm />
        </div>
      ) : null}
    </div>
  );
}
