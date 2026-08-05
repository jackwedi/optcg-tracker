import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { UserSessionControls } from "@/components/UserSessionControls";
import { MobileTabBar } from "@/components/MobileTabBar";
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
      style={{ colorScheme: "light" }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 pb-16 sm:pb-0">
        <nav className="bg-white shadow">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                <Link href="/">🃏 OPTCG Tracker</Link>
              </h1>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:gap-6">
                <div className="hidden items-center gap-x-4 sm:flex md:gap-x-6">
                  <Link
                    href="/tournaments"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    📊 Performance
                  </Link>

                  <Link
                    href="/crew"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    🏴‍☠️ Crew
                  </Link>
                </div>
                <div className="flex justify-end sm:justify-start">
                  <UserSessionControls />
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="hidden bg-black text-gray-300 py-4 mt-12 sm:block">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 One Piece TCG Tournament Tracker</p>
          </div>
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
