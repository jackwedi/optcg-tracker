import { AdminUserPseudoManager } from "@/components/AdminUserPseudoManager";

export default function AdminPlayersPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin - Player Pseudos</h1>
        <p className="text-gray-600">
          Search players and update their pseudos from the backoffice.
        </p>
      </div>

      <AdminUserPseudoManager />
    </main>
  );
}
