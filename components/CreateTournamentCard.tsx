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
  defaultOpen = false,
}: CreateTournamentCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white shadow-md dark:border-blue-900/40 dark:from-blue-950/40 dark:via-slate-800 dark:to-slate-800">
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
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl shadow-sm dark:bg-blue-500/10"
            aria-hidden="true"
          >
            ⚔️
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
              New Tournament
            </h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              Log a new tournament and start tracking your performance.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-lg font-semibold text-blue-700 transition-transform dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <div className="border-t border-blue-100 bg-white p-6 dark:border-blue-900/40 dark:bg-slate-800 sm:p-8">
          <TournamentForm />
        </div>
      ) : null}
    </div>
  );
}
