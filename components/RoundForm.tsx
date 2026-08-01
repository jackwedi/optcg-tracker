"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import { LeaderColorFilter } from "@/components/LeaderColorFilter";

const BYE_LEADER_ID = "BYE";

interface RoundFormProps {
  tournamentId: string;
  onRoundAdded?: () => void;
}

export function RoundForm({ tournamentId, onRoundAdded }: RoundFormProps) {
  const [open, setOpen] = useState(false);
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

  const idGroupOptions = Array.from(
    new Set(
      leaders
        .filter((l) => l.id !== BYE_LEADER_ID)
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

  const filteredLeaders = leaders.filter((l) => {
    if (l.id === BYE_LEADER_ID) return false;
    let prefix = l.id.split("-")[0] || "";
    if (prefix.startsWith("ST")) prefix = "ST";
    const matchesId = idGroupFilter === "All" || prefix === idGroupFilter;
    const leaderColors = Array.isArray(l.colors) ? l.colors.flat() : [];
    const matchesColor =
      colorFilter.length === 0 ||
      colorFilter.every((c) => leaderColors.includes(c));
    return matchesId && matchesColor;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/rounds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponentLeaderId: isBye ? BYE_LEADER_ID : selectedOpponentLeaderId,
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

            {!isBye && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    Color
                  </label>
                  <LeaderColorFilter
                    colors={colorOptions}
                    value={colorFilter}
                    onChange={setColorFilter}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Extension
                    </label>
                    <select
                      value={idGroupFilter}
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
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      Opponent Leader
                    </label>
                    <select
                      value={selectedOpponentLeaderId ?? ""}
                      onChange={(e) => {
                        const leaderId = e.target.value || undefined;
                        setSelectedOpponentLeaderId(leaderId);
                      }}
                      required
                      className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select opponent leader --</option>
                      {filteredLeaders.map((leader) => (
                        <option key={leader.id} value={leader.id}>
                          {leader.name} ({leader.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-slate-400"
          >
            {loading ? "Adding..." : "Add Round"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
