import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
    "Track your One Piece TCG tournament matches, win rates, and deck performance",
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
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <Link href="/">🃏 OPTCG Tracker</Link>
              </h1>
              <div className="space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link
                  href="/tournaments"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Tournaments
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="bg-gray-800 text-gray-300 py-4 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 One Piece TCG Tournament Tracker</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
