import Link from "next/link";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth";
import { AdminUserPseudoManager } from "@/components/AdminUserPseudoManager";

export default async function AdminPlayersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin - Player Pseudos</h1>
          <p className="text-gray-600">
            Search players and update their pseudos from the backoffice.
          </p>
        </div>
        <Link
          href="/admin/leaders"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Manage leaders
        </Link>
      </div>

      <AdminUserPseudoManager />
    </main>
  );
}
