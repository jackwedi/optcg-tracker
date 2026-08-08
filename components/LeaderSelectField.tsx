"use client";

import type { Leader } from "@/models/leader";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";
import { LeaderColorDots } from "@/components/LeaderColorDots";
import type { UseLeaderSelectionResult } from "@/components/useLeaderSelection";

interface LeaderSelectFieldProps {
  title: string;
  description: string;
  fieldLabel: string;
  placeholder?: string;
  // Full leader list (unfiltered) — only used to resolve the preview card.
  leaders: Leader[];
  selection: UseLeaderSelectionResult;
  showPreview?: boolean;
}

// Shared "pick a leader" panel: color filter + extension filter + leader
// picker (pills when there are few options, a <select> once there are many).
// Used by both RoundForm (opponent leader) and TournamentForm (played
// leader) so the two never drift out of sync with each other.
export function LeaderSelectField({
  title,
  description,
  fieldLabel,
  placeholder = "-- Select leader --",
  leaders,
  selection,
  showPreview = false,
}: LeaderSelectFieldProps) {
  const {
    colorOptions,
    colorFilter,
    setColorFilter,
    idGroupOptions,
    effectiveIdGroupFilter,
    setIdGroupFilter,
    filteredLeaders,
    effectiveLeaderId,
    setSelectedLeaderId,
  } = selection;

  const selectedLeader = effectiveLeaderId
    ? leaders.find((l) => l.id === effectiveLeaderId)
    : undefined;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700">
      <div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
          Color
        </label>
        <LeaderColorFilter
          colors={colorOptions}
          value={colorFilter}
          onChange={setColorFilter}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Extension
          </label>
          {idGroupOptions.length > 0 && idGroupOptions.length < 5 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIdGroupFilter("All")}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  effectiveIdGroupFilter === "All"
                    ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {idGroupOptions.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setIdGroupFilter(group)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    effectiveIdGroupFilter === group
                      ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={effectiveIdGroupFilter}
              onChange={(e) => setIdGroupFilter(e.target.value)}
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="All">Select Extension</option>
              {idGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            {fieldLabel}
          </label>
          {filteredLeaders.length > 0 && filteredLeaders.length < 5 ? (
            <div className="flex flex-wrap gap-2">
              {filteredLeaders.map((leader) => (
                <button
                  key={leader.id}
                  type="button"
                  onClick={() => setSelectedLeaderId(leader.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    effectiveLeaderId === leader.id
                      ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <LeaderColorDots colors={leader.colors} />
                  {leader.name}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={effectiveLeaderId ?? ""}
              onChange={(e) =>
                setSelectedLeaderId(e.target.value || undefined)
              }
              className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{placeholder}</option>
              {filteredLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name} ({leader.id})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {showPreview && selectedLeader ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
          <img
            src={
              /^https?:\/\//i.test(selectedLeader.imageUrl)
                ? selectedLeader.imageUrl
                : `/${selectedLeader.imageUrl}`.replace(/^\//, "/")
            }
            alt={selectedLeader.name}
            className="h-14 w-14 border bg-white object-contain dark:bg-slate-700"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          <div>
            <div className="text-lg font-medium dark:text-slate-100">
              {selectedLeader.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {selectedLeader.id}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
