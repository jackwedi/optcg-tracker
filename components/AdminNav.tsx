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
    <div className="border-b border-slate-200 bg-slate-50">
      <nav className="container mx-auto flex gap-2 px-4 py-3">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
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
