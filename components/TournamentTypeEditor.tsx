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

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Tournament type: ${tournamentType}. Click to edit.`}
        title={`${tournamentType} — click to edit`}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base transition hover:bg-slate-100 sm:h-10 sm:w-10 sm:text-xl"
      >
        <span role="img" aria-hidden="true">
          {getTournamentTypeIcon(tournamentType)}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as TournamentType)}
          disabled={saving}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:text-sm"
        >
          {TOURNAMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
