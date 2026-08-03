import { getAllMeta } from "@/lib/meta";
import { MetaManager } from "@/components/MetaManager";

export default async function AdminExtensionsPage() {
  const meta = await getAllMeta();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin — Metas</h1>
        <p className="text-gray-600">
          Manage OPTCG extension/set release windows.
        </p>
      </div>

      <MetaManager initialMeta={meta} />
    </main>
  );
}
