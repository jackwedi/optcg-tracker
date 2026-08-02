import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { UserSessionControls } from "@/components/UserSessionControls";
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
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="bg-white shadow">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                <Link href="/">🃏</Link>
              </h1>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:gap-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-4 md:gap-x-6">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                  <Link
                    href="/tournaments"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Tournaments
                  </Link>

                  <Link
                    href="/crew"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    🏴‍☠️ Crew
                  </Link>
                </div>
                <UserSessionControls />
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="bg-black text-gray-300 py-4 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 One Piece TCG Tournament Tracker</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
