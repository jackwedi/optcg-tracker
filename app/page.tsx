import {
  AuthPanel,
  TournamentStatsByType,
  WinRateProgressionChart,
} from "@/components";
import { getTournaments } from "@/lib/db";
import { getLeaders } from "@/lib/leaders";

export default async function Home() {
  const [tournaments, leaders] = await Promise.all([
    getTournaments(),
    getLeaders(),
  ]);
  const leadersById = Object.fromEntries(leaders.map((l) => [l.id, l]));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">One Piece TCG Tracker</h1>
        <p className="text-gray-600">
          Track your tournament rounds and deck performance
        </p>
      </div>

      <div className="space-y-8">
        <div className="w-full">
          <AuthPanel />
        </div>

        {tournaments.length > 0 ? (
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <TournamentStatsByType
              tournaments={tournaments}
              leadersById={leadersById}
            />
            <WinRateProgressionChart tournaments={tournaments} />
          </section>
        ) : null}
      </div>
    </main>
  );
}
