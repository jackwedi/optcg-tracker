import { redirect } from "next/navigation";
import { AuthPanel } from "@/components";
import { getCurrentUserId } from "@/lib/auth";

export default async function LoginPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect("/");
  }

  return (
    <main className="relative min-h-[calc(100vh-180px)] overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(220,38,38,0.14),transparent_45%)]" />

      <div className="relative mx-auto max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            OPTCG Tracker
          </p>
          <h1 className="mb-3 text-3xl font-bold text-slate-900">
            Deck Access
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">
            Sign in to access your tournament history, rounds, and match stats.
          </p>

          <AuthPanel />
        </div>
      </div>
    </main>
  );
}
