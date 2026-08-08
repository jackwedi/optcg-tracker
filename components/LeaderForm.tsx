"use client";

import { useState } from "react";
import type { Leader } from "@/models/leader";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";
import { LEADER_COLOR_OPTIONS } from "@/components/LeaderColorDots";

interface LeaderFormProps {
  leader?: Leader;
  onSaved?: (leader: Leader) => void;
  onDeleted?: (id: string) => void;
  onCancel?: () => void;
}

export function LeaderForm({
  leader,
  onSaved,
  onDeleted,
  onCancel,
}: LeaderFormProps) {
  const isEditing = Boolean(leader);
  const [id, setId] = useState(leader?.id ?? "");
  const [name, setName] = useState(leader?.name ?? "");
  const [colors, setColors] = useState<string[]>(leader?.colors ?? []);
  const [imageUrl, setImageUrl] = useState(leader?.imageUrl ?? "");
  const [altImageUrl, setAltImageUrl] = useState(leader?.altImageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const notifyLeadersChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("leaders:changed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (colors.length === 0) {
      setError("Select at least one color.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        isEditing ? `/api/leaders/${leader!.id}` : "/api/leaders",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name, colors, imageUrl, altImageUrl }),
        },
      );

      if (!res.ok)
        throw new Error(
          isEditing ? "Failed to update leader" : "Failed to create leader",
        );

      const saved = (await res.json()) as Leader;

      if (!isEditing) {
        setId("");
        setName("");
        setColors([]);
        setImageUrl("");
        setAltImageUrl("");
      }

      notifyLeadersChanged();
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!leader) return;
    if (!confirm(`Delete ${leader.name}?`)) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/leaders/${leader.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete leader");

      notifyLeadersChanged();
      onDeleted?.(leader.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-50 p-4 rounded-md dark:bg-slate-800"
    >
      <h3 className="text-lg font-semibold">
        {isEditing ? `Edit ${leader!.name}` : "Add Leader"}
      </h3>

      <div>
        <label className="block text-sm font-medium">ID</label>
        <input
          className="mt-1 block w-full disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          required
          disabled={isEditing}
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g., OP01-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 block w-full"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Colors (up to 2)
        </label>
        <div className="mt-2">
          <LeaderColorFilter
            colors={LEADER_COLOR_OPTIONS}
            value={colors}
            onChange={setColors}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          className="mt-1 block w-full"
          required
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Alt Image URL (optional)
        </label>
        <input
          className="mt-1 block w-full"
          value={altImageUrl}
          onChange={(e) => setAltImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || deleting}
          className="flex-1 bg-green-600 text-white py-2 rounded-md disabled:opacity-60"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Leader"}
        </button>
        {isEditing && (
          <>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || deleting}
              className="py-2 px-4 rounded-md border border-gray-300 disabled:opacity-60 dark:border-slate-600"
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
