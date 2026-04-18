"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STRINGS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
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

  return (
    <nav className="relative z-[3] border-b border-dusk/20 bg-dusk shadow-[0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div className="flex h-16 items-center justify-between pl-4 pr-6 lg:pr-8">
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
          <div className="flex items-center gap-3">
            <span
              className="hidden text-sm font-medium text-primary-foreground/90 sm:inline"
              title={user.email}
            >
              {displayName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              aria-busy={signingOut || undefined}
              className="rounded-md bg-white/10 px-3.5 py-1.5 text-sm font-medium text-primary-foreground/90 transition-all duration-300 ease-out hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
