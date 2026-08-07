import {
  AuthPanel,
  CreateTournamentCard,
  RecentTournaments,
  TodayTournamentBanner,
} from "@/components";
import { getTournaments } from "@/lib/db";
import { isToday } from "@/lib/utils";

export default async function Home() {
  const tournaments = await getTournaments();
  const todaysTournament = tournaments.find((t) => isToday(t.date));
  const recentTournaments = tournaments.slice(0, 5);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="w-full">
          <AuthPanel />
        </div>

        {todaysTournament ? (
          <div className="w-full">
            <TodayTournamentBanner tournament={todaysTournament} />
          </div>
        ) : null}

        <div className="w-full">
          <CreateTournamentCard />
        </div>

        <div className="w-full">
          <RecentTournaments tournaments={recentTournaments} />
        </div>
      </div>
    </main>
  );
}
