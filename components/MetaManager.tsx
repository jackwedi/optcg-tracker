"use client";

import { useEffect, useState } from "react";
import type { ExtensionMeta } from "@/models/meta";
import { MetaForm } from "@/components/MetaForm";
import { CreateMetaCard } from "@/components/CreateMetaCard";
import { formatDate } from "@/lib/utils";

interface MetaManagerProps {
  initialMeta: ExtensionMeta[];
}

function formatOptionalDate(date: string | null): string {
  return date ? formatDate(date) : "—";
}

export function MetaManager({ initialMeta }: MetaManagerProps) {
  const [metaList, setMetaList] = useState<ExtensionMeta[]>(initialMeta);
  const [editingMeta, setEditingMeta] = useState<ExtensionMeta | null>(null);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/meta");
        const data = await res.json();
        setMetaList(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("meta:changed", fetchMeta);
    return () => window.removeEventListener("meta:changed", fetchMeta);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        {metaList.length === 0 ? (
          <div className="rounded-lg border border-gray-200 py-12 text-center dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400">No metas yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Meta</th>
                  <th className="px-4 py-3 font-semibold">Start Date</th>
                  <th className="px-4 py-3 font-semibold">End Date</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {metaList.map((meta) => (
                  <tr
                    key={meta.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {meta.extensions.map((code) => (
                          <span
                            key={code}
                            className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                      {formatOptionalDate(meta.startDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                      {formatOptionalDate(meta.endDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingMeta(meta)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateMetaCard />

      {editingMeta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingMeta(null)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <MetaForm
              meta={editingMeta}
              onCancel={() => setEditingMeta(null)}
              onSaved={() => setEditingMeta(null)}
              onDeleted={() => setEditingMeta(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
