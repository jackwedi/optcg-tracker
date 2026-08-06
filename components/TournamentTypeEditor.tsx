"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTournamentTypeIcon,
  TOURNAMENT_TYPES,
  type TournamentType,
} from "@/models/tournament";

interface TournamentTypeEditorProps {
  tournamentId: string;
  name: string;
  date: string;
  tournamentType: TournamentType;
}

export function TournamentTypeEditor({
  tournamentId,
  name,
  date,
  tournamentType,
}: TournamentTypeEditorProps) {
  const [editing, setEditing] = useState(false);
  const [selectedType, setSelectedType] =
    useState<TournamentType>(tournamentType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, tournamentType: selectedType }),
      });

      if (!res.ok) throw new Error("Failed to update tournament type");

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedType(tournamentType);
    setEditing(false);
    setError("");
  };

  return (
    <>
      {/* A label, not a button — pairs visually with the meta badge it
          sits below in the Record card rather than reading as a
          separate page-level action. */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Tournament type: ${tournamentType}. Click to edit.`}
        title="Click to edit tournament type"
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 sm:text-xs"
      >
        <span role="img" aria-hidden="true">
          {getTournamentTypeIcon(tournamentType)}
        </span>
        <span>{tournamentType}</span>
      </button>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit tournament type"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Tournament Type
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Type
              </span>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as TournamentType)
                }
                disabled={saving}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {TOURNAMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            {error ? (
              <p className="mt-2 text-xs text-rose-600">{error}</p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
