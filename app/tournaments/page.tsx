import { getTournaments } from "@/lib/db";
import { getLeaders } from "@/lib/leaders";
import { getAllMeta } from "@/lib/meta";
import { PerformanceOverview } from "@/components";
import Link from "next/link";

export default async function TournamentsPage() {
  const [tournaments, leaders, metas] = await Promise.all([
    getTournaments(),
    getLeaders(),
    getAllMeta(),
  ]);
  const leadersById = Object.fromEntries(leaders.map((l) => [l.id, l]));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📈 Stats</h1>
      </div>

      {tournaments.length > 0 ? (
        <PerformanceOverview
          tournaments={tournaments}
          leadersById={leadersById}
          metas={metas}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4 dark:text-slate-400">
            No tournaments yet.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Log your first tournament
          </Link>
        </div>
      )}
    </main>
  );
}
