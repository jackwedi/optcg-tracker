import {
  AuthPanel,
  CreateOrJoinCrewCard,
  CrewInviteCode,
  CrewLeaderboardTable,
  CrewRankProgress,
  LeaveCrewButton,
} from "@/components";
import { getCurrentUserId } from "@/lib/auth";
import {
  getCrewLeaderboard,
  getCurrentUserCrew,
  getRoundsEligibility,
} from "@/lib/crews";

export default async function CrewPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Crew
        </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Sign in and play 10 rounds to unlock Crews.
          </p>
          <AuthPanel />
        </div>
      </main>
    );
  }

  const crew = await getCurrentUserCrew();

  if (crew) {
    const leaderboard = await getCrewLeaderboard();

    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {crew.name}
          </h1>
          <CrewInviteCode code={crew.id} />
          <CrewRankProgress totalWins={leaderboard?.totalWins ?? 0} />
          <CrewLeaderboardTable entries={leaderboard?.entries ?? []} />

          {/* Destructive/exit action, deliberately at the bottom — out of
              the way of routine info, matching the tournament detail
              page's delete-button placement. */}
          <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">
            <LeaveCrewButton />
          </div>
        </div>
      </main>
    );
  }

  const eligibility = await getRoundsEligibility();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Crew
        </h1>

        {eligibility.eligible ? (
          <CreateOrJoinCrewCard />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Crew Progress
              </p>
              <p className="text-2xl font-semibold text-sky-700 dark:text-sky-400">
                {eligibility.totalRounds}/{eligibility.roundsRequired}
              </p>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
              <div
                className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (eligibility.totalRounds / eligibility.roundsRequired) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Play{" "}
              {Math.max(
                0,
                eligibility.roundsRequired - eligibility.totalRounds,
              )}{" "}
              more round
              {eligibility.roundsRequired - eligibility.totalRounds === 1
                ? ""
                : "s"}{" "}
              to unlock Crews.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
