import { getLeaders } from '@/lib/leaders';
import { LeaderSearch } from '@/components/LeaderSearch';

export default async function LeadersPage() {
  const leaders = await getLeaders();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Leaders</h1>
      <p className="text-gray-600 mb-6">Browse all available leaders. Quicksearch by name or color.</p>

      <LeaderSearch leaders={leaders} />
    </main>
  );
}
