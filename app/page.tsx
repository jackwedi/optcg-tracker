import { AuthPanel } from "@/components";
import { getTournaments } from "@/lib/db";

export default async function Home() {
  const tournaments = await getTournaments();

  const totalTournaments = tournaments.length;
  const totalRounds = tournaments.reduce(
    (acc, tournament) => acc + tournament.rounds.length,
    0,
  );
  const wins = tournaments.reduce(
    (acc, tournament) =>
      acc + tournament.rounds.filter((round) => round.won).length,
    0,
  );
  const losses = totalRounds - wins;
  const coinFlipWins = tournaments.reduce(
    (acc, tournament) =>
      acc + tournament.rounds.filter((round) => round.wonCoinFlip).length,
    0,
  );
  const winRate =
    totalRounds > 0 ? ((wins / totalRounds) * 100).toFixed(1) : "0.0";

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          One Piece TCG Tournament Tracker
        </h1>
        <p className="text-gray-600">
          Track your tournament rounds and deck performance
        </p>
      </div>

      <div className="space-y-8">
        <div className="w-full">
          <AuthPanel />
        </div>

        <section className="w-full">
          <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-slate-600">Tournaments</p>
              <p className="text-3xl font-bold text-slate-900">
                {totalTournaments}
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-4">
              <p className="text-sm text-slate-600">Total Rounds</p>
              <p className="text-3xl font-bold text-slate-900">{totalRounds}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-slate-600">Win Rate</p>
              <p className="text-3xl font-bold text-emerald-700">{winRate}%</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-slate-600">Wins</p>
              <p className="text-3xl font-bold text-green-700">{wins}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-4">
              <p className="text-sm text-slate-600">Losses</p>
              <p className="text-3xl font-bold text-rose-700">{losses}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-slate-600">Coin Flip Wins</p>
              <p className="text-3xl font-bold text-amber-700">
                {coinFlipWins}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
