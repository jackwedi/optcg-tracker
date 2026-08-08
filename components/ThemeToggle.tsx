"use client";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// The `dark` class is already set on <html> before this ever mounts (see
// the beforeInteractive script in layout.tsx), so there's no need for
// useState/useEffect to pick the right icon — both render unconditionally
// and pure `dark:` visibility classes decide which one shows. That keeps
// server and client markup identical (no hydration mismatch) and avoids
// a one-frame icon flash after hydration.
export function ThemeToggle() {
  const handleToggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 sm:h-10 sm:w-10"
    >
      <SunIcon className="hidden h-4 w-4 text-slate-600 dark:block dark:text-slate-300 sm:h-5 sm:w-5" />
      <MoonIcon className="block h-4 w-4 text-slate-600 dark:hidden sm:h-5 sm:w-5" />
    </button>
  );
}
