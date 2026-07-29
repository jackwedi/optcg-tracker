"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function AuthPanel() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setEmail("");
    setPassword("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserEmail(user?.email ?? null);

    if (user) {
      router.replace("/");
      router.refresh();
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading account…</div>;
  }

  if (userEmail) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "sign-in"
                ? "bg-black text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "sign-up"
                ? "bg-black text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Sign up
          </button>
        </div>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>

        <p className="text-xs text-slate-500">
          Email/password is enabled for this deck profile.
        </p>
      </form>
      {message ? <p className="pt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
