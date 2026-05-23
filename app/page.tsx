import { getTournaments } from "@/lib/db";
import { TournamentForm, TournamentList } from "@/components";

export default function Home() {
  const tournaments = getTournaments();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          One Piece TCG Tournament Tracker
        </h1>
        <p className="text-gray-600">
          Track your tournament matches and deck performance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <TournamentForm />
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
          <TournamentList tournaments={tournaments} />
        </div>
      </div>
    </main>
  );
}
