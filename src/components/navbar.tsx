"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { STRINGS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

interface NavLink {
  href: string;
  label: string;
  match: (p: string) => boolean;
  adminOnly?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", match: (p) => p === "/dashboard" },
  { href: "/learn", label: "Learn", match: (p) => p.startsWith("/learn") },
  { href: "/sandbox", label: "Sandbox", match: (p) => p.startsWith("/sandbox") },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    match: (p) => p.startsWith("/leaderboard"),
  },
  {
    href: "/admin",
    label: "Admin",
    match: (p) => p.startsWith("/admin"),
    adminOnly: true,
  },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (signingOut) return;
    setMenuOpen(false);
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "";
  const initials = user
    ? [user.first_name, user.last_name]
        .map((p) => (p ?? "").trim().charAt(0))
        .join("")
        .toUpperCase() || "??"
    : "";

  return (
    <nav className="relative z-[3] border-b border-dusk/20 bg-dusk shadow-[0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div className="flex h-16 items-center justify-between pl-4 pr-6 lg:pr-8">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            aria-label={STRINGS.BRAND.NAME}
            className="inline-flex items-center"
          >
            <Image
              src="/sqlearn-logo-light.png"
              alt={STRINGS.BRAND.NAME}
              width={1427}
              height={516}
              priority
              className="h-12 w-auto"
            />
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.filter(
                (link) => !link.adminOnly || user.role === "admin",
              ).map((link) => {
                const active = link.match(pathname ?? "");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group/navlink relative rounded-md px-2.5 py-1.5 text-sm font-medium text-primary-foreground/75 transition-colors duration-200 hover:text-primary-foreground"
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                    <span
                      className="pointer-events-none absolute bottom-[0.2rem] left-2.5 right-2.5 h-[1.5px] scale-x-0 bg-[#EAD4C0] transition-transform duration-300 ease-out group-hover/navlink:scale-x-100"
                      style={{ transformOrigin: "left" }}
                      data-active={active ? "true" : "false"}
                    />
                    {active ? (
                      <span className="pointer-events-none absolute bottom-[0.2rem] left-2.5 right-2.5 h-[1.5px] bg-[#EAD4C0]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {user ? (
          <div className="relative flex items-center gap-3" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="group/account flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-left transition-all duration-200 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EAD4C0] font-mono text-[0.7rem] font-bold tracking-wide text-dusk"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span
                className="hidden text-sm font-medium text-primary-foreground/90 sm:inline"
                title={user.email}
              >
                {displayName}
              </span>
              <svg
                aria-hidden="true"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="hidden text-primary-foreground/50 transition-transform duration-200 group-hover/account:text-primary-foreground/80 sm:block"
                style={{
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M2 4l3 3 3-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="animate-fade-up absolute right-0 top-[calc(100%+0.55rem)] z-20 w-60 origin-top-right overflow-hidden rounded-xl border border-taupe/10 bg-popover shadow-[0_24px_60px_-30px_rgba(70,60,51,0.45)]"
                style={{ animationDuration: "180ms" }}
              >
                <div className="border-b border-taupe/10 px-4 py-3">
                  <p className="text-[0.6875rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-taupe">
                    {displayName}
                  </p>
                  <p className="truncate font-mono text-[0.75rem] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="py-1.5">
                  <Link
                    role="menuitem"
                    href={`/profile/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-taupe transition-colors duration-200 hover:bg-muted/70"
                  >
                    <span className="text-muted-foreground" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" />
                        <path
                          d="M2.5 13.5c.7-2.4 2.9-3.7 5.5-3.7s4.8 1.3 5.5 3.7"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    View profile
                  </Link>
                  <Link
                    role="menuitem"
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-taupe transition-colors duration-200 hover:bg-muted/70"
                  >
                    <span className="text-muted-foreground" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
                        <path
                          d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7L3.6 3.6"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    {STRINGS.SETTINGS.NAV_LABEL}
                  </Link>
                </div>
                <div className="border-t border-taupe/10 py-1.5">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleLogout}
                    disabled={signingOut}
                    aria-busy={signingOut || undefined}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-taupe transition-colors duration-200 hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="text-muted-foreground" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M9.5 11.5L13 8 9.5 4.5M13 8H5M5 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {signingOut ? "Signing out…" : "Log out"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
