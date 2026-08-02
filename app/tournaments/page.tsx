import { getTournaments } from "@/lib/db";
import { getLeaders } from "@/lib/leaders";
import { CreateTournamentCard, TournamentTableWithFilter } from "@/components";
import Link from "next/link";

export default async function TournamentsPage() {
  const [tournaments, leaders] = await Promise.all([
    getTournaments(),
    getLeaders(),
  ]);
  const leadersById = Object.fromEntries(leaders.map((l) => [l.id, l]));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Tournaments</h1>
      </div>

      {tournaments.length > 0 ? (
        <TournamentTableWithFilter
          tournaments={tournaments}
          leadersById={leadersById}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tournaments yet.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Create your first tournament
          </Link>
        </div>
      )}

      <div className="mt-10">
        <CreateTournamentCard />
      </div>
    </main>
  );
}
