import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getLeaders } from "@/lib/leaders";
import { AdminLeaderManager } from "@/components/AdminLeaderManager";

export default async function AdminLeadersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const leaders = await getLeaders();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin — Leaders</h1>
        <p className="text-gray-600">
          Add, browse, and edit OPTCG leaders and their images.
        </p>
      </div>

      <AdminLeaderManager initialLeaders={leaders} />
    </main>
  );
}
