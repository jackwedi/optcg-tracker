"use client";

import { useState } from "react";

interface ExtensionChipsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ExtensionChipsInput({
  value,
  onChange,
}: ExtensionChipsInputProps) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const code = draft.trim().toUpperCase();
    if (!code) return;
    if (!value.includes(code)) {
      onChange([...value, code]);
    }
    setDraft("");
  };

  const removeCode = (code: string) => {
    onChange(value.filter((c) => c !== code));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {code}
            <button
              type="button"
              onClick={() => removeCode(code)}
              aria-label={`Remove ${code}`}
              className="text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder="e.g. OP16"
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="button"
          onClick={addDraft}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
