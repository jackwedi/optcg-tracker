"use client";

import { useState } from "react";
import type { ExtensionMeta } from "@/models/meta";
import { ExtensionChipsInput } from "@/components/ExtensionChipsInput";

interface MetaFormProps {
  meta?: ExtensionMeta;
  onSaved?: (meta: ExtensionMeta) => void;
  onDeleted?: (id: string) => void;
  onCancel?: () => void;
}

export function MetaForm({
  meta,
  onSaved,
  onDeleted,
  onCancel,
}: MetaFormProps) {
  const isEditing = Boolean(meta);
  const [extensions, setExtensions] = useState<string[]>(
    meta?.extensions ?? [],
  );
  const [startDate, setStartDate] = useState(meta?.startDate ?? "");
  const [endDate, setEndDate] = useState(meta?.endDate ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const notifyMetaChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("meta:changed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (extensions.length === 0) {
      setError("Add at least one extension.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        isEditing ? `/api/meta/${meta!.id}` : "/api/meta",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extensions,
            startDate: startDate || null,
            endDate: endDate || null,
          }),
        },
      );

      if (!res.ok)
        throw new Error(
          isEditing
            ? "Failed to update extension"
            : "Failed to create extension",
        );

      const saved = (await res.json()) as ExtensionMeta;

      if (!isEditing) {
        setExtensions([]);
        setStartDate("");
        setEndDate("");
      }

      notifyMetaChanged();
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!meta) return;
    if (!confirm(`Delete ${meta.extensions.join(", ")}?`)) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/meta/${meta.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete extension");

      notifyMetaChanged();
      onDeleted?.(meta.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-50 p-4 rounded-md"
    >
      <h3 className="text-lg font-semibold">
        {isEditing ? `Edit ${meta!.extensions.join(", ")}` : "Add Extension"}
      </h3>

      <div>
        <label className="block text-sm font-medium">Meta</label>
        <div className="mt-1">
          <ExtensionChipsInput value={extensions} onChange={setExtensions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">
            Start Date (optional)
          </label>
          <input
            type="date"
            className="mt-1 block w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            End Date (optional)
          </label>
          <input
            type="date"
            className="mt-1 block w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || deleting}
          className="flex-1 bg-green-600 text-white py-2 rounded-md disabled:opacity-60"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Extension"}
        </button>
        {isEditing && (
          <>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || deleting}
              className="py-2 px-4 rounded-md border border-gray-300 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="py-2 px-4 rounded-md bg-red-600 text-white disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
