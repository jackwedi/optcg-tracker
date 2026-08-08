"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import { LeaderSelectField } from "@/components/LeaderSelectField";
import { useLeaderSelection } from "@/components/useLeaderSelection";
import { RoundBadgeIcon } from "@/components/RoundBadgeIcon";

const BYE_LEADER_ID = "BYE";

const STEPS = [
  { step: 1, label: "Round Type" },
  { step: 2, label: "Opponent Leader" },
  { step: 3, label: "Round Details" },
] as const;

interface RoundFormProps {
  tournamentId: string;
  onRoundAdded?: () => void;
}

export function RoundForm({ tournamentId, onRoundAdded }: RoundFormProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isBye, setIsBye] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const opponentSelection = useLeaderSelection(leaders, {
    excludeLeaderId: BYE_LEADER_ID,
  });
  const [won, setWon] = useState(false);
  const [wonCoinFlip, setWonCoinFlip] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleNextFromRoundType = () => {
    goToStep(isBye ? 3 : 2);
  };

  const handleNextFromOpponent = () => {
    if (!opponentSelection.effectiveLeaderId) {
      setError("Opponent leader is required.");
      return;
    }
    goToStep(3);
  };

  const handleBackFromDetails = () => {
    goToStep(isBye ? 1 : 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBye && !opponentSelection.effectiveLeaderId) {
      setError("Opponent leader is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/rounds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentLeaderId: isBye
            ? BYE_LEADER_ID
            : opponentSelection.effectiveLeaderId,
          won: isBye ? true : won,
          wonCoinFlip: isBye ? false : wonCoinFlip,
          startingPosition: isBye ? "1st" : isFirst ? "1st" : "2nd",
          isBye,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create round");
      }

      opponentSelection.setSelectedLeaderId(undefined);
      setIsBye(false);
      setWon(false);
      setWonCoinFlip(false);
      setIsFirst(true);
      setStep(1);
      onRoundAdded?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-orange-100 bg-white p-6 shadow-sm dark:border-orange-800 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-label={open ? "Collapse add round" : "Expand add round"}
      >
        <div>
          <h3 className="text-xl font-semibold tracking-tight dark:text-slate-50">
            Add Round
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose a standard round or BYE, then record details.
          </p>
        </div>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-white text-lg font-semibold text-orange-700 transition-transform dark:border-orange-800 dark:bg-slate-800 dark:text-orange-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 border-t border-orange-100 pt-4 dark:border-orange-800"
        >
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
            <div key="round-step-1" className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Round Type
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Swiss is the default — use BYE when no battle was played.
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBye(false)}
                    className={`rounded-md border px-2 py-2.5 text-sm font-medium transition ${
                      !isBye
                        ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    Swiss
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBye(true);
                      opponentSelection.setSelectedLeaderId(undefined);
                      setWon(true);
                    }}
                    className={`rounded-md border px-2 py-2.5 text-sm font-medium transition ${
                      isBye
                        ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    BYE
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Top Cut tracking is coming soon"
                    aria-disabled="true"
                    className="rounded-md border border-slate-200 bg-slate-100 px-2 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-700 dark:text-slate-500"
                  >
                    Top Cut
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleNextFromRoundType}
                className="w-full rounded-2xl border-2 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-500 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
              >
                Next
              </button>
            </div>
          ) : step === 2 ? (
            <div key="round-step-2" className="space-y-4">
              <LeaderSelectField
                title="Opponent Leader"
                description="Pick the leader your opponent played this round."
                fieldLabel="Opponent Leader"
                placeholder="-- Select opponent leader --"
                leaders={leaders}
                selection={opponentSelection}
              />

              {error && (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </p>
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
                  onClick={handleNextFromOpponent}
                  className="flex-1 rounded-2xl border-2 border-orange-500 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-500 dark:bg-slate-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div key="round-step-3" className="space-y-4">
              {!isBye ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Round Details
                  </div>

                  <div className="divide-y divide-slate-200 md:grid md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-slate-700">
                    <div className="pb-3 md:px-3 md:pb-0 md:first:pl-0 md:last:pr-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Coin Flip
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWonCoinFlip(false)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            !wonCoinFlip
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="✕"
                            className="bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-400"
                          />
                          Lost
                        </button>
                        <button
                          type="button"
                          onClick={() => setWonCoinFlip(true)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            wonCoinFlip
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="B"
                            className="bg-amber-500 text-white"
                          />
                          Won
                        </button>
                      </div>
                    </div>

                    <div className="py-3 md:px-3 md:py-0 md:first:pl-0 md:last:pr-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Turn Order
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsFirst(true)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            isFirst
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="1"
                            className="bg-slate-400 text-white dark:bg-slate-500"
                          />
                          1st
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFirst(false)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            !isFirst
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="2"
                            className="bg-slate-400 text-white dark:bg-slate-500"
                          />
                          2nd
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 md:px-3 md:pt-0 md:first:pl-0 md:last:pr-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Round Result
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWon(false)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            !won
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="L"
                            className="bg-red-500 text-white"
                          />
                          Lost
                        </button>
                        <button
                          type="button"
                          onClick={() => setWon(true)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium transition ${
                            won
                              ? "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <RoundBadgeIcon
                            text="W"
                            className="bg-emerald-500 text-white"
                          />
                          Won
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-500/10">
                  <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    BYE Round Summary
                  </div>
                  <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                    Result: Semi-win | Coin flip: N/A | Turn order: N/A
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBackFromDetails}
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
                  {loading ? "Adding..." : "Add Round"}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : null}
    </div>
  );
}
