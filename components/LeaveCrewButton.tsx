"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LeaveCrewButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this crew?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/crews/leave", { method: "POST" });

      if (!response.ok) {
        throw new Error("Failed to leave crew");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to leave crew");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={loading}
      className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-500/10"
    >
      {loading ? "Leaving..." : "Leave Crew"}
    </button>
  );
}
