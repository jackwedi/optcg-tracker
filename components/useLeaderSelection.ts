"use client";

import { useState } from "react";
import type { Leader } from "@/models/leader";

interface UseLeaderSelectionOptions {
  // A leader id to drop from every list this hook produces (e.g. the
  // synthetic BYE leader, which is never a pickable opponent).
  excludeLeaderId?: string;
}

export function useLeaderSelection(
  leaders: Leader[],
  { excludeLeaderId }: UseLeaderSelectionOptions = {},
) {
  const [selectedLeaderId, setSelectedLeaderId] = useState<
    string | undefined
  >(undefined);
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState("All");

  const eligibleLeaders = leaders.filter((l) => l.id !== excludeLeaderId);

  const colorFilteredLeaders = eligibleLeaders.filter((l) => {
    const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
    return (
      colorFilter.length === 0 ||
      colorFilter.every((c) => leaderColors.includes(c))
    );
  });

  const idGroupOptions = Array.from(
    new Set(
      colorFilteredLeaders
        .map((l) => (l.id.split("-")[0] || "").trim())
        .filter(Boolean)
        .map((p) => (p.startsWith("ST") ? "ST" : p)),
    ),
  ).sort();

  const colorOptions = Array.from(
    new Set(
      eligibleLeaders
        .flatMap((l) => (Array.isArray(l.colors) ? l.colors.flat() : []))
        .filter(Boolean),
    ),
  ).sort();

  // When narrowed to a single choice, treat it as selected without requiring
  // an explicit click — derived during render (not an effect) so it never
  // trails a render behind.
  const effectiveIdGroupFilter =
    idGroupOptions.length === 1 ? idGroupOptions[0] : idGroupFilter;

  const filteredLeaders = eligibleLeaders.filter((l) => {
    let prefix = l.id.split("-")[0] || "";
    if (prefix.startsWith("ST")) prefix = "ST";
    const matchesId =
      effectiveIdGroupFilter === "All" || prefix === effectiveIdGroupFilter;
    const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
    const matchesColor =
      colorFilter.length === 0 ||
      colorFilter.every((c) => leaderColors.includes(c));
    return matchesId && matchesColor;
  });

  const effectiveLeaderId =
    filteredLeaders.length === 1 ? filteredLeaders[0].id : selectedLeaderId;

  return {
    selectedLeaderId,
    setSelectedLeaderId,
    colorFilter,
    setColorFilter,
    idGroupFilter,
    setIdGroupFilter,
    colorOptions,
    idGroupOptions,
    effectiveIdGroupFilter,
    filteredLeaders,
    effectiveLeaderId,
  };
}

export type UseLeaderSelectionResult = ReturnType<typeof useLeaderSelection>;
