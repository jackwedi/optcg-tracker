"use client";

import { useState } from "react";
import { LeaderForm } from "@/components/LeaderForm";

export function CreateLeaderCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-label={open ? "Collapse add leader" : "Expand add leader"}
      >
        <h2 className="text-2xl font-bold">Add Leader</h2>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-lg font-semibold text-sky-700 transition-transform ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <LeaderForm />
        </div>
      ) : null}
    </div>
  );
}
