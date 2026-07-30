import { redirect } from "next/navigation";
import { LeaderForm } from "@/components/LeaderForm";
import { LeaderList } from "@/components/LeaderList";
import { isCurrentUserAdmin } from "@/lib/auth";

export default async function AdminLeadersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin — Leaders</h1>
        <p className="text-gray-600">
          Add and manage OPTCG leaders and their images.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <LeaderForm />
        </div>
        <div className="md:col-span-2">
          <LeaderList />
        </div>
      </div>
    </main>
  );
}
