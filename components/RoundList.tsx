"use client";

import { Round } from "@/models/tournament";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";

const BYE_LEADER_ID = "BYE";

interface RoundListProps {
  rounds: Round[];
  tournamentId: string;
}

interface RoundDraft {
  opponentLeaderId: string;
  won: boolean;
  wonCoinFlip: boolean;
  startingPosition: "1st" | "2nd";
  isBye: boolean;
}

export function RoundList({ rounds, tournamentId }: RoundListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [savingRoundId, setSavingRoundId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoundDraft | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/leaders")
      .then((res) => res.json())
      .then((data: Leader[]) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteRound = async (roundId: string) => {
    if (!confirm("Are you sure you want to delete this round?")) return;

    setLoading(roundId);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/rounds/${roundId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete round");

      router.refresh();
    } catch {
      alert("Failed to delete round");
    } finally {
      setLoading(null);
    }
  };

  const startEditingRound = (round: Round) => {
    const isBye = round.opponentLeaderId === BYE_LEADER_ID;

    setEditingRoundId(round.id);
    setErrorMessage(null);
    setDraft({
      opponentLeaderId: round.opponentLeaderId,
      won: round.won,
      wonCoinFlip: round.wonCoinFlip,
      startingPosition: round.startingPosition,
      isBye,
    });
  };

  const cancelEditingRound = () => {
    setEditingRoundId(null);
    setSavingRoundId(null);
    setErrorMessage(null);
    setDraft(null);
  };

  const handleUpdateRound = async (roundId: string) => {
    if (!draft) {
      return;
    }

    if (!draft.isBye && !draft.opponentLeaderId) {
      setErrorMessage("Opponent leader is required.");
      return;
    }

    setSavingRoundId(roundId);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/rounds/${roundId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opponentLeaderId: draft.isBye
              ? BYE_LEADER_ID
              : draft.opponentLeaderId,
            won: draft.won,
            wonCoinFlip: draft.wonCoinFlip,
            startingPosition: draft.startingPosition,
            isBye: draft.isBye,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update round");
      }

      cancelEditingRound();
      router.refresh();
    } catch {
      setErrorMessage("Failed to update round.");
    } finally {
      setSavingRoundId(null);
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No rounds recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => {
        const isEditing = editingRoundId === round.id && draft !== null;
        const isByeRound = isEditing
          ? draft.isBye
          : round.opponentLeaderId === BYE_LEADER_ID;
        const currentOpponentLeaderId = isEditing
          ? draft.opponentLeaderId
          : round.opponentLeaderId;
        const currentWon = isEditing ? draft.won : round.won;
        const currentWonCoinFlip = isEditing
          ? draft.wonCoinFlip
          : round.wonCoinFlip;
        const currentStartingPosition = isEditing
          ? draft.startingPosition
          : round.startingPosition;

        const opponentLeader = isByeRound
          ? null
          : (leaders.find((leader) => leader.id === currentOpponentLeaderId) ??
            null);
        const resultText = isByeRound ? "BYE" : currentWon ? "Won" : "Lost";
        const resultCardClass = isByeRound
          ? "bg-emerald-50"
          : currentWon
            ? "bg-green-50"
            : "bg-red-50";
        const resultTextClass = isByeRound
          ? "text-emerald-700"
          : currentWon
            ? "text-green-700"
            : "text-red-700";

        return (
          <div
            key={round.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <LeaderThumbnail
                  src={opponentLeader?.imageUrl ?? "/placeholder.png"}
                  alt={
                    opponentLeader?.name ??
                    (isByeRound ? "BYE round" : "Unknown leader")
                  }
                  isCard
                  className="w-20 h-[112px] object-cover bg-white"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {isByeRound
                      ? "BYE"
                      : opponentLeader
                        ? opponentLeader.name
                        : currentOpponentLeaderId}
                  </h4>
                  <div className="flex shrink-0 gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateRound(round.id)}
                          disabled={savingRoundId === round.id}
                          className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingRoundId === round.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingRound}
                          disabled={savingRoundId === round.id}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingRound(round)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRound(round.id)}
                      disabled={
                        loading === round.id || savingRoundId === round.id
                      }
                      className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading === round.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.isBye}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            isBye: event.target.checked,
                            opponentLeaderId: event.target.checked
                              ? BYE_LEADER_ID
                              : "",
                            won: event.target.checked ? true : draft.won,
                            wonCoinFlip: event.target.checked
                              ? false
                              : draft.wonCoinFlip,
                            startingPosition: event.target.checked
                              ? "1st"
                              : draft.startingPosition,
                          })
                        }
                      />
                      BYE round
                    </label>

                    {!draft.isBye ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-700">
                          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Opponent Leader
                          </span>
                          <select
                            value={draft.opponentLeaderId}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                opponentLeaderId: event.target.value,
                              })
                            }
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Select leader</option>
                            {leaders
                              .filter((leader) => leader.id !== BYE_LEADER_ID)
                              .map((leader) => (
                                <option key={leader.id} value={leader.id}>
                                  {leader.name} ({leader.id})
                                </option>
                              ))}
                          </select>
                        </label>

                        <label className="text-sm text-slate-700">
                          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                            Start
                          </span>
                          <select
                            value={draft.startingPosition}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                startingPosition: event.target.value as
                                  | "1st"
                                  | "2nd",
                              })
                            }
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                          </select>
                        </label>
                      </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm text-slate-700">
                        <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                          Result
                        </span>
                        <select
                          value={draft.won ? "won" : "lost"}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              won: event.target.value === "won",
                            })
                          }
                          disabled={draft.isBye}
                          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                        >
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </label>

                      <label className="text-sm text-slate-700">
                        <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                          Coin Flip
                        </span>
                        <select
                          value={draft.wonCoinFlip ? "won" : "lost"}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              wonCoinFlip: event.target.value === "won",
                            })
                          }
                          disabled={draft.isBye}
                          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                        >
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </label>
                    </div>

                    {errorMessage && editingRoundId === round.id ? (
                      <p className="text-sm font-medium text-rose-600">
                        {errorMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-xs text-slate-500">Deck</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {currentOpponentLeaderId ?? "BYE"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="text-xs text-slate-500">Coin Flip</div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        isByeRound ? "text-slate-500" : "text-amber-700"
                      }`}
                    >
                      {isByeRound ? "N/A" : currentWonCoinFlip ? "Won" : "Lost"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-4">
                    <div className="text-xs text-slate-500">Start</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {isByeRound ? "N/A" : currentStartingPosition}
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${resultCardClass}`}>
                    <div className="text-xs text-slate-500">Result</div>
                    <div
                      className={`mt-1 text-sm font-semibold ${resultTextClass}`}
                    >
                      {resultText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
