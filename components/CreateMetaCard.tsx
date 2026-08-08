"use client";

import { useState } from "react";
import { MetaForm } from "@/components/MetaForm";

export function CreateMetaCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-label={open ? "Collapse add extension" : "Expand add extension"}
      >
        <h2 className="text-2xl font-bold dark:text-slate-50">
          Add Extension
        </h2>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-lg font-semibold text-sky-700 transition-transform dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <MetaForm />
        </div>
      ) : null}
    </div>
  );
}
