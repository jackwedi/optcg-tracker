import {
  AuthPanel,
  CreateOrJoinCrewCard,
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
          <h1 className="text-3xl font-bold text-slate-900">Crew</h1>
          <p className="text-slate-600">
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {crew.name}
            </h1>
            <LeaveCrewButton />
          </div>
          <p className="text-sm text-slate-500">
            Share this code so friends can join:{" "}
            <span className="font-mono font-semibold tracking-widest text-slate-900">
              {crew.id}
            </span>
          </p>
          <CrewRankProgress totalWins={leaderboard?.totalWins ?? 0} />
          <CrewLeaderboardTable entries={leaderboard?.entries ?? []} />
        </div>
      </main>
    );
  }

  const eligibility = await getRoundsEligibility();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Crew</h1>

        {eligibility.eligible ? (
          <CreateOrJoinCrewCard />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-600">
                Crew Progress
              </p>
              <p className="text-2xl font-semibold text-sky-700">
                {eligibility.totalRounds}/{eligibility.roundsRequired}
              </p>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (eligibility.totalRounds / eligibility.roundsRequired) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
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
