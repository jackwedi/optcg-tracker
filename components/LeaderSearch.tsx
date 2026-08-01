"use client";

import React, { useMemo, useState } from "react";
import type { Leader } from "@/models/leader";
import { LeaderCard } from "./LeaderCard";
import { LeaderColorFilter } from "./LeaderColorFilter";

interface Props {
  leaders: Leader[];
  selectedLeaderId?: string;
  onSelectLeader?: (leader: Leader) => void;
}

export function LeaderSearch({
  leaders,
  selectedLeaderId,
  onSelectLeader,
}: Props) {
  const [color, setColor] = useState<string[]>([]);
  const [idGroup, setIdGroup] = useState("All");

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    leaders.forEach((l) => {
      if (Array.isArray(l.colors)) l.colors.flat().forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [leaders]);

  const idGroupOptions = useMemo(() => {
    const set = new Set<string>();
    leaders.forEach((l) => {
      let prefix = l.id.split("-")[0] || "";
      if (!prefix) return;
      if (prefix.startsWith("ST")) prefix = "ST";
      set.add(prefix);
    });
    return ["All", ...Array.from(set).sort()];
  }, [leaders]);

  const filtered = useMemo(() => {
    return leaders.filter((l) => {
      let prefix = l.id.split("-")[0] || "";
      if (prefix.startsWith("ST")) prefix = "ST";
      const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
      const matchesColor =
        color.length === 0 || color.every((c) => leaderColors.includes(c));
      const matchesIdGroup = idGroup === "All" || prefix === idGroup;
      return matchesColor && matchesIdGroup;
    });
  }, [leaders, color, idGroup]);

  return (
    <div>
      <div className="mb-4">
        <LeaderColorFilter
          colors={colorOptions}
          value={color}
          onChange={setColor}
        />
      </div>

      <div className="mb-4">
        <select
          value={idGroup}
          onChange={(e) => setIdGroup(e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          <option value="All">Select Extension</option>
          {idGroupOptions
            .filter((group) => group !== "All")
            .map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((leader) => (
          <LeaderCard
            leader={leader}
            key={leader.id}
            selected={selectedLeaderId === leader.id}
            onSelect={onSelectLeader}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-gray-500">
          No leaders fit the selected filters.
        </p>
      )}
    </div>
  );
}
