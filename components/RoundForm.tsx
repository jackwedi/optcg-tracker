"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";
import { LeaderColorDots } from "@/components/LeaderColorDots";

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
  const [selectedOpponentLeaderId, setSelectedOpponentLeaderId] = useState<
    string | undefined
  >(undefined);
  const [isBye, setIsBye] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [idGroupFilter, setIdGroupFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState<string[]>([]);
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

  const colorFilteredLeaders = leaders.filter((l) => {
    if (l.id === BYE_LEADER_ID) return false;
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
      leaders
        .filter((l) => l.id !== BYE_LEADER_ID)
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
    if (l.id === BYE_LEADER_ID) return false;
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

  const effectiveOpponentLeaderId =
    filteredLeaders.length === 1
      ? filteredLeaders[0].id
      : selectedOpponentLeaderId;

  const goToStep = (target: 1 | 2 | 3) => {
    setError("");
    setStep(target);
  };

  const handleNextFromRoundType = () => {
    goToStep(isBye ? 3 : 2);
  };

  const handleNextFromOpponent = () => {
    if (!effectiveOpponentLeaderId) {
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

    if (!isBye && !effectiveOpponentLeaderId) {
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
          opponentLeaderId: isBye ? BYE_LEADER_ID : effectiveOpponentLeaderId,
          won: isBye ? true : won,
          wonCoinFlip: isBye ? false : wonCoinFlip,
          startingPosition: isBye ? "1st" : isFirst ? "1st" : "2nd",
          isBye,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create round");
      }

      setSelectedOpponentLeaderId(undefined);
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
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-label={open ? "Collapse add round" : "Expand add round"}
      >
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Add Round</h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose a standard round or BYE, then record details.
          </p>
        </div>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-lg font-semibold text-sky-700 transition-transform ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-6 border-t border-slate-200 pt-4"
        >
          <div className="mx-auto flex w-fit items-start">
            {STEPS.map((s, index) => (
              <div key={s.step} className="flex items-start">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full border-2 transition ${
                      step >= s.step
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                  <span
                    className={`whitespace-nowrap text-[11px] font-medium ${
                      step === s.step
                        ? "text-emerald-600"
                        : step > s.step
                          ? "text-slate-600"
                          : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < STEPS.length - 1 ? (
                  <span
                    className={`mx-2 mt-1.5 h-0.5 w-6 shrink-0 rounded-full transition ${
                      step > s.step ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <div key="round-step-1" className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Round Type
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Enable BYE when no battle was played.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBye((value) => {
                          const next = !value;
                          if (next) {
                            setSelectedOpponentLeaderId(undefined);
                            setWon(true);
                          }
                          return next;
                        });
                      }}
                      className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                        isBye ? "bg-emerald-600" : "bg-slate-400"
                      }`}
                    >
                      <span
                        className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                          isBye ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        BYE
                      </span>
                      <span
                        className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                          isBye ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        Off
                      </span>
                      <span
                        className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                          isBye ? "translate-x-14" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              )}

              <button
                type="button"
                onClick={handleNextFromRoundType}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Next
              </button>
            </div>
          ) : step === 2 ? (
            <div key="round-step-2" className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Opponent Leader
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Pick the leader your opponent played this round.
                  </p>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
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
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Extension
                    </label>
                    {idGroupOptions.length > 0 && idGroupOptions.length < 5 ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setIdGroupFilter("All")}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                            effectiveIdGroupFilter === "All"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
                        className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Opponent Leader
                    </label>
                    {filteredLeaders.length > 0 &&
                    filteredLeaders.length < 5 ? (
                      <div className="flex flex-wrap gap-2">
                        {filteredLeaders.map((leader) => (
                          <button
                            key={leader.id}
                            type="button"
                            onClick={() =>
                              setSelectedOpponentLeaderId(leader.id)
                            }
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                              effectiveOpponentLeaderId === leader.id
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <LeaderColorDots colors={leader.colors} />
                            {leader.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <select
                        value={effectiveOpponentLeaderId ?? ""}
                        onChange={(e) => {
                          const leaderId = e.target.value || undefined;
                          setSelectedOpponentLeaderId(leaderId);
                        }}
                        className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Select opponent leader --</option>
                        {filteredLeaders.map((leader) => (
                          <option key={leader.id} value={leader.id}>
                            {leader.name} ({leader.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromOpponent}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div key="round-step-3" className="space-y-6">
              {!isBye ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Round Details
                    </div>
                    <p className="text-xs text-slate-500">
                      Record result, coin flip, and turn order.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-slate-700">
                            Round Result
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Toggle to record win or loss.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWon((value) => !value)}
                          className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                            won ? "bg-emerald-600" : "bg-rose-500"
                          }`}
                        >
                          <span
                            className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              won ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            Won
                          </span>
                          <span
                            className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              won ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            Lost
                          </span>
                          <span
                            className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                              won ? "translate-x-14" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-slate-700">
                            Coin Flip
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Toggle to record the coin flip result.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWonCoinFlip((value) => !value)}
                          className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                            wonCoinFlip ? "bg-blue-600" : "bg-rose-500"
                          }`}
                        >
                          <span
                            className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              wonCoinFlip ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            Won
                          </span>
                          <span
                            className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              wonCoinFlip ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            Lost
                          </span>
                          <span
                            className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                              wonCoinFlip ? "translate-x-14" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-slate-700">
                            Turn Order
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Choose whether you played first or second.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFirst((value) => !value)}
                          className={`relative inline-flex h-12 w-28 shrink-0 rounded-full p-1 transition-colors duration-200 ${
                            isFirst ? "bg-amber-500" : "bg-sky-500"
                          }`}
                        >
                          <span
                            className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              isFirst ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            1st
                          </span>
                          <span
                            className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white transition-opacity duration-200 ${
                              isFirst ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            2nd
                          </span>
                          <span
                            className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
                              isFirst ? "translate-x-14" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-semibold text-emerald-800">
                    BYE Round Summary
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">
                    Result: Semi-win | Coin flip: N/A | Turn order: N/A
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBackFromDetails}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-slate-400"
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
