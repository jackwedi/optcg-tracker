import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { UserSessionControls } from "@/components/UserSessionControls";
import { MobileTabBar } from "@/components/MobileTabBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "One Piece TCG Tournament Tracker",
  description:
    "Track your One Piece TCG tournament rounds, win rates, and deck performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The theme-init script below mutates this element's classList
      // (adding "dark") before React hydrates, which React would
      // otherwise flag as a hydration mismatch since it doesn't know
      // about that DOM-level change — this is the standard, expected
      // fix for that exact pattern (same reason next-themes does it).
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-slate-50 pb-16 sm:pb-0">
        {/* Sets the `dark` class on <html> before first paint, based on a
            saved choice or the OS preference — runs before hydration so
            there's no flash of the wrong theme and no light/dark mismatch
            for ThemeToggle to work around. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var s=localStorage.getItem('theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`}
        </Script>
        <nav className="bg-white shadow dark:bg-slate-800 dark:shadow-slate-950/40">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-50 sm:text-2xl">
                <Link href="/">🃏 Tracker</Link>
              </h1>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:gap-6">
                <div className="hidden items-center gap-x-4 sm:flex md:gap-x-6">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50"
                  >
                    🏟️ Tournaments
                  </Link>

                  <Link
                    href="/tournaments"
                    className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50"
                  >
                    📈 Stats
                  </Link>

                  <Link
                    href="/crew"
                    className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50"
                  >
                    🏴‍☠️ Crew
                  </Link>
                </div>
                <div className="flex items-center justify-end gap-2 sm:justify-start">
                  <ThemeToggle />
                  <UserSessionControls />
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="hidden bg-black text-gray-300 py-4 mt-12 sm:block dark:bg-slate-950 dark:text-slate-400">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 One Piece TCG Tournament Tracker</p>
          </div>
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
