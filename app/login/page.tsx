import { redirect } from "next/navigation";
import { AuthPanel } from "@/components";
import { getCurrentUserId } from "@/lib/auth";

export default async function LoginPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-slate-50">
            Sign In
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Access your tournaments, rounds, and performance dashboard.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <AuthPanel />
        </div>
      </div>
    </main>
  );
}
