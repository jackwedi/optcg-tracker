"use client";

import { useEffect, useState } from "react";
import type { Leader } from "@/models/leader";
import { LeaderForm } from "@/components/LeaderForm";
import { LeaderSearch } from "@/components/LeaderSearch";
import { CreateLeaderCard } from "@/components/CreateLeaderCard";

interface AdminLeaderManagerProps {
  initialLeaders: Leader[];
}

export function AdminLeaderManager({
  initialLeaders,
}: AdminLeaderManagerProps) {
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch("/api/leaders");
        const data = await res.json();
        setLeaders(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("leaders:changed", fetchLeaders);
    return () => window.removeEventListener("leaders:changed", fetchLeaders);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-xl font-semibold">All Leaders</h2>
        <p className="mb-4 text-sm text-gray-600">
          Click a leader to edit its details.
        </p>
        <LeaderSearch
          leaders={leaders}
          onSelectLeader={setEditingLeader}
          actionLabel="Edit"
        />
      </div>

      <CreateLeaderCard />

      {editingLeader && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingLeader(null)}
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <LeaderForm
              leader={editingLeader}
              onCancel={() => setEditingLeader(null)}
              onSaved={() => setEditingLeader(null)}
              onDeleted={() => setEditingLeader(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
