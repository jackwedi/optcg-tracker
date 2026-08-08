"use client";

import { useState } from "react";

interface CrewInviteCodeProps {
  code: string;
}

export function CrewInviteCode({ code }: CrewInviteCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browser, insecure context, etc.) —
      // the code is still shown large enough to copy manually, so no
      // fallback UI is needed.
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-800 dark:bg-sky-500/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
          Invite Code
        </p>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
          Share this code so friends can join your crew.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-sky-200 bg-white px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] text-slate-900 dark:border-sky-800 dark:bg-slate-800 dark:text-slate-50">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
