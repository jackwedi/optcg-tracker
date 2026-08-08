"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin/players", label: "Players" },
  { href: "/admin/leaders", label: "Leaders" },
  { href: "/admin/extensions", label: "Metas" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <nav className="container mx-auto flex gap-2 px-4 py-3">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
