"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteTournamentButtonProps {
  tournamentId: string;
}

export function DeleteTournamentButton({
  tournamentId,
}: DeleteTournamentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tournament");
      }

      router.push("/");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete tournament",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="ml-4 rounded-md border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete Tournament"}
    </button>
  );
}
