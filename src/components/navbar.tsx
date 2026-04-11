"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-dusk/10 bg-dusk">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="font-logo text-xl italic tracking-[-0.02em] text-primary-foreground transition-opacity hover:opacity-80"
        >
          <span>SQL</span>
          <span className="text-light-mauve">earn</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium text-primary-foreground/80 transition-colors",
              pathname === "/login"
                ? "bg-white/15 text-primary-foreground"
                : "hover:bg-white/8 hover:text-primary-foreground"
            )}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-light-mauve/90 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-light-mauve"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
