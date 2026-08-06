"use client";

import { Round } from "@/models/tournament";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Leader } from "@/models/leader";
import LeaderThumbnail from "@/components/LeaderThumbnail";
import { LeaderColorDots } from "@/components/LeaderColorDots";
import { SpinnerIcon } from "@/components/SpinnerIcon";
import { getShortLeaderName } from "@/lib/utils";

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

      if (editingRoundId === roundId) {
        cancelEditingRound();
      }
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

  // Leader identity isn't editable from the popup — this is only used to
  // show read-only context for whichever round is currently being edited.
  const editingOpponentLeader =
    draft && !draft.isBye
      ? (leaders.find((leader) => leader.id === draft.opponentLeaderId) ?? null)
      : null;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full table-fixed border-collapse text-left text-sm sm:table-auto">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500 sm:text-xs">
              <th className="w-6 px-1 py-2 font-semibold sm:w-auto sm:px-4 sm:py-3">
                #
              </th>
              <th className="w-28 px-2 py-2 font-semibold sm:w-auto sm:px-4 sm:py-3">
                Opponent
              </th>
              <th className="w-12 px-1 py-2 text-center font-semibold sm:w-auto sm:px-4 sm:py-3">
                Coin Flip
              </th>
              <th className="w-10 px-1 py-2 text-center font-semibold sm:w-auto sm:px-4 sm:py-3">
                Start
              </th>
              <th className="w-10 px-1 py-2 text-center font-semibold sm:w-auto sm:px-4 sm:py-3">
                Result
              </th>
              <th className="w-6 px-1 py-2 sm:w-auto sm:px-2 sm:py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rounds.map((round, index) => {
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
                : (leaders.find(
                    (leader) => leader.id === currentOpponentLeaderId,
                  ) ?? null);
              const opponentName = isByeRound
                ? "BYE"
                : (opponentLeader?.name ?? currentOpponentLeaderId);
              // Sports form-guide pattern (ESPN, league standings, chess
              // ratings): a small solid badge carries the win/loss signal at
              // the data point itself, rather than washing the whole row in
              // color. Letter + color together (not color alone) so it still
              // reads for colorblind users.
              const resultLabel = isByeRound
                ? "BYE"
                : currentWon
                  ? "Won"
                  : "Lost";
              const resultBadgeText = isByeRound ? "B" : currentWon ? "W" : "L";
              const resultBadgeClass = isByeRound
                ? "bg-slate-400"
                : currentWon
                  ? "bg-emerald-500"
                  : "bg-red-500";
              const coinFlipLabel = isByeRound
                ? "N/A"
                : currentWonCoinFlip
                  ? "Won"
                  : "Lost";
              const coinFlipBadgeIcon = isByeRound
                ? "–"
                : currentWonCoinFlip
                  ? "B"
                  : "✕";
              const coinFlipBadgeClass = isByeRound
                ? "bg-slate-100 text-slate-400"
                : currentWonCoinFlip
                  ? "bg-amber-500 text-white"
                  : "bg-slate-200 text-slate-500";
              const startLabel = isByeRound ? "N/A" : currentStartingPosition;
              const startBadgeText = isByeRound
                ? "–"
                : currentStartingPosition === "1st"
                  ? "1"
                  : "2";
              const startBadgeClass = isByeRound
                ? "bg-slate-100 text-slate-400"
                : "bg-sky-500 text-white";

              return (
                <tr
                  key={round.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isEditing}
                  aria-label={`Round ${index + 1} vs ${opponentName}, tap to edit`}
                  onClick={() =>
                    !isEditing ? startEditingRound(round) : undefined
                  }
                  onKeyDown={(event) => {
                    if (
                      !isEditing &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      startEditingRound(round);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-2 py-2 text-gray-500 sm:px-4 sm:py-3">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <LeaderThumbnail
                        src={opponentLeader?.imageUrl ?? "/placeholder.png"}
                        alt={
                          opponentLeader?.name ??
                          (isByeRound ? "BYE round" : "Unknown leader")
                        }
                        className="h-8 w-6 shrink-0 rounded object-cover sm:h-10 sm:w-8"
                      />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {!isByeRound && opponentLeader ? (
                            <LeaderColorDots colors={opponentLeader.colors} />
                          ) : null}
                          <span
                            className="truncate font-medium text-gray-900"
                            title={opponentName}
                          >
                            {getShortLeaderName(opponentName)}
                          </span>
                        </div>
                        {!isByeRound ? (
                          <p className="hidden truncate text-xs text-gray-500 sm:block">
                            {currentOpponentLeaderId}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-2 text-center sm:px-4 sm:py-3"
                    title={coinFlipLabel}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${coinFlipBadgeClass}`}
                    >
                      {coinFlipBadgeIcon}
                    </span>
                    <span className="sr-only">{coinFlipLabel}</span>
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-2 text-center sm:px-4 sm:py-3"
                    title={startLabel}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${startBadgeClass}`}
                    >
                      {startBadgeText}
                    </span>
                    <span className="sr-only">{startLabel}</span>
                  </td>
                  <td
                    className="whitespace-nowrap px-2 py-2 text-center sm:px-4 sm:py-3"
                    title={resultLabel}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${resultBadgeClass}`}
                    >
                      {resultBadgeText}
                    </span>
                    <span className="sr-only">{resultLabel}</span>
                  </td>
                  <td className="px-1 py-2 text-gray-400 sm:px-2 sm:py-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingRoundId && draft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit round"
          onClick={cancelEditingRound}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Edit Round
              </h3>
              <button
                type="button"
                onClick={cancelEditingRound}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                  Opponent
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  {draft.isBye ? (
                    "BYE"
                  ) : (
                    <>
                      {editingOpponentLeader ? (
                        <LeaderColorDots
                          colors={editingOpponentLeader.colors}
                        />
                      ) : null}
                      {editingOpponentLeader?.name ?? draft.opponentLeaderId}
                    </>
                  )}
                </span>
              </div>

              {!draft.isBye ? (
                <label className="block text-sm text-slate-700">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    Start
                  </span>
                  <select
                    value={draft.startingPosition}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        startingPosition: event.target.value as "1st" | "2nd",
                      })
                    }
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                  </select>
                </label>
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

              {errorMessage ? (
                <p className="text-sm font-medium text-rose-600">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => handleDeleteRound(editingRoundId)}
                  disabled={
                    loading === editingRoundId ||
                    savingRoundId === editingRoundId
                  }
                  className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === editingRoundId ? (
                    <SpinnerIcon className="h-4 w-4" />
                  ) : null}
                  Delete round
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEditingRound}
                    disabled={savingRoundId === editingRoundId}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateRound(editingRoundId)}
                    disabled={savingRoundId === editingRoundId}
                    className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingRoundId === editingRoundId ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
