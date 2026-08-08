"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TOURNAMENT_TYPES,
  type TournamentType,
} from "@/models/tournament";
import { SpinnerIcon } from "@/components/SpinnerIcon";

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

interface EditTournamentButtonProps {
  tournamentId: string;
  name: string;
  date: string;
  tournamentType: TournamentType;
}

export function EditTournamentButton({
  tournamentId,
  name,
  date,
  tournamentType,
}: EditTournamentButtonProps) {
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDate, setEditedDate] = useState(date);
  const [selectedType, setSelectedType] =
    useState<TournamentType>(tournamentType);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const openEditor = () => {
    setEditedName(name);
    setEditedDate(date);
    setSelectedType(tournamentType);
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete tournament");

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete tournament",
      );
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      setError("Tournament name is required.");
      return;
    }
    if (!editedDate) {
      setError("Date is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName.trim(),
          date: editedDate,
          tournamentType: selectedType,
        }),
      });

      if (!res.ok) throw new Error("Failed to update tournament");

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        aria-label="Edit tournament"
        title="Edit tournament"
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 sm:h-10 sm:w-10"
      >
        <EditIcon className="h-4 w-4 text-slate-600 dark:text-slate-300 sm:h-5 sm:w-5" />
      </button>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit tournament"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Edit Tournament
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || deleting}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-slate-700 dark:text-slate-300">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Name
                </span>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={saving || deleting}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block text-sm text-slate-700 dark:text-slate-300">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Date
                </span>
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  disabled={saving || deleting}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block text-sm text-slate-700 dark:text-slate-300">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Type
                </span>
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as TournamentType)
                  }
                  disabled={saving || deleting}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {TOURNAMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                {deleting ? "Deleting..." : "Delete Tournament"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || deleting}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
                >
                  {saving ? (
                    <>
                      <SpinnerIcon className="h-3.5 w-3.5" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
