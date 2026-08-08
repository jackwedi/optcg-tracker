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
import { LeaderSelectField } from "@/components/LeaderSelectField";
import { useLeaderSelection } from "@/components/useLeaderSelection";

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
  const leaderSelection = useLeaderSelection(leaders);
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
          playedLeaderId: leaderSelection.effectiveLeaderId,
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
      leaderSelection.setSelectedLeaderId(undefined);
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
                    ? "border-orange-600 bg-orange-600"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              />
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  step === s.step
                    ? "text-orange-600 dark:text-orange-400"
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
                  step > s.step ? "bg-orange-600" : "bg-slate-200 dark:bg-slate-700"
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
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-base dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={handleNextFromDetails}
            className="w-full rounded-2xl border-2 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-500 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
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
                      ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
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
              className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="flex-1 rounded-2xl border-2 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-500 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div key="step-3" className="space-y-6">
          <LeaderSelectField
            title="Played Leader"
            description="Pick the leader you'll be playing for this tournament."
            fieldLabel="Played Leader"
            placeholder="-- Select leader --"
            leaders={leaders}
            selection={leaderSelection}
            showPreview
          />

          {error && (
            <p className="text-red-600 text-sm dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goToStep(2)}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl border-2 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
            >
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
