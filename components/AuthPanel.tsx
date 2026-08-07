"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function AuthPanel() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim(),
              },
            },
          });

    if (error) {
      setMessage(error.message);
      return;
    }

    setEmail("");
    setPassword("");
    setDisplayName("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserEmail(user?.email ?? null);

    if (user) {
      router.replace("/");
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // On success the browser is redirected to Google before this ever
    // resolves — only a pre-redirect failure (e.g. provider not enabled
    // in Supabase yet) reaches here.
    if (error) {
      setMessage(error.message);
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
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

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

        {mode === "sign-up" ? (
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Pseudo"
            required
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        ) : null}

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
