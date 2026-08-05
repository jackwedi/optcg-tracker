"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_LINKS = [
  { href: "/", label: "Home", icon: "🏠", exact: true },
  { href: "/tournaments", label: "Performance", icon: "📊", exact: false },
  { href: "/crew", label: "Crew", icon: "🏴‍☠️", exact: false },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-around">
        {TAB_LINKS.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              <span
                className={`text-xl leading-none transition ${
                  isActive ? "scale-110" : ""
                }`}
                aria-hidden="true"
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
