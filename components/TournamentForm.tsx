"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import {
  DEFAULT_TOURNAMENT_TYPE,
  getTournamentTypeIcon,
  TOURNAMENT_TYPES,
  type TournamentType,
} from "@/models/tournament";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";
import { LeaderColorDots } from "@/components/LeaderColorDots";

const STEPS = [
  { step: 1, label: "Name & Date" },
  { step: 2, label: "Tournament Type" },
  { step: 3, label: "Played Leader" },
] as const;

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TournamentForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayDateString);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [playedLeaderId, setPlayedLeaderId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTournamentType, setSelectedTournamentType] =
    useState<TournamentType>(DEFAULT_TOURNAMENT_TYPE);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/leaders")
      .then((r) => r.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const colorFilteredLeaders = leaders.filter((l) => {
    const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
    return (
      colorFilter.length === 0 ||
      colorFilter.every((c) => leaderColors.includes(c))
    );
  });

  const idGroupOptions = Array.from(
    new Set(
      colorFilteredLeaders
        .map((l) => l.id.split("-")[0] || "")
        .filter(Boolean)
        .map((p) => (p.startsWith("ST") ? "ST" : p)),
    ),
  ).sort();

  const colorOptions = Array.from(
    new Set(
      leaders
        .flatMap((l) => (Array.isArray(l.colors) ? l.colors.flat() : []))
        .filter(Boolean),
    ),
  ).sort();

  // When narrowed to a single choice, treat it as selected without requiring
  // an explicit click — derived during render (not an effect) so it never
  // trails a render behind.
  const effectiveIdGroupFilter =
    idGroupOptions.length === 1 ? idGroupOptions[0] : idGroupFilter;

  const filteredLeaders = leaders.filter((l) => {
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

  const effectivePlayedLeaderId =
    filteredLeaders.length === 1 ? filteredLeaders[0].id : playedLeaderId;

  const goToStep = (target: 1 | 2 | 3) => {
    setError("");
    setStep(target);
  };

  const handleNextFromDetails = () => {
    if (!name.trim()) {
      setError("Tournament name is required.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }
    goToStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          date,
          playedLeaderId: effectivePlayedLeaderId,
          tournamentType: selectedTournamentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tournament");
      }

      const tournament = await response.json();
      setName("");
      setDate(getTodayDateString());
      setSelectedTournamentType(DEFAULT_TOURNAMENT_TYPE);
      setPlayedLeaderId(undefined);
      setStep(1);
      router.push(`/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="mx-auto flex w-fit items-start">
        {STEPS.map((s, index) => (
          <div key={s.step} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`h-3 w-3 shrink-0 rounded-full border-2 transition ${
                  step >= s.step
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              />
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  step === s.step
                    ? "text-blue-600 dark:text-blue-400"
                    : step > s.step
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={`mx-2 mt-1.5 h-0.5 w-6 shrink-0 rounded-full transition ${
                  step > s.step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div key="step-1" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Tournament Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="e.g., Regional Championship"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={handleNextFromDetails}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      ) : step === 2 ? (
        <div key="step-2" className="space-y-6">
          <div>
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tournament Type
            </span>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {TOURNAMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedTournamentType(type)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-4 text-sm font-medium transition ${
                    selectedTournamentType === type
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {getTournamentTypeIcon(type)}
                  </span>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex-1 rounded-md border border-gray-300 py-2 px-4 text-slate-700 dark:border-slate-600 dark:text-slate-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div key="step-3" className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700">
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Played Leader
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Pick the leader you&apos;ll be playing for this tournament.
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
                          ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
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
                            ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
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
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                  Played Leader
                </label>
                {filteredLeaders.length > 0 && filteredLeaders.length < 5 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredLeaders.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setPlayedLeaderId(l.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                          effectivePlayedLeaderId === l.id
                            ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        <LeaderColorDots colors={l.colors} />
                        {l.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    value={effectivePlayedLeaderId ?? ""}
                    onChange={(e) =>
                      setPlayedLeaderId(e.target.value || undefined)
                    }
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Select leader --</option>
                    {filteredLeaders.map((l) => (
                      <option
                        key={l.id}
                        value={l.id}
                      >{`${l.name} (${l.id})`}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {effectivePlayedLeaderId &&
              (() => {
                const sel = leaders.find(
                  (x) => x.id === effectivePlayedLeaderId,
                );
                if (!sel) return null;
                const previewSrc = /^https?:\/\//i.test(sel.imageUrl)
                  ? sel.imageUrl
                  : `/${sel.imageUrl}`.replace(/^\//, "/");
                return (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
                    <img
                      src={previewSrc}
                      alt={sel.name}
                      className="h-14 w-14 border bg-white object-contain dark:bg-slate-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder.png";
                      }}
                    />
                    <div>
                      <div className="text-lg font-medium">{sel.name}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        {sel.id}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>

          {error && (
            <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goToStep(2)}
              disabled={loading}
              className="flex-1 rounded-md border border-gray-300 py-2 px-4 text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:text-slate-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600"
            >
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
