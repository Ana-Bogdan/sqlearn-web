"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative z-[3] border-b border-dusk/20 bg-dusk shadow-[0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="group font-logo text-xl italic tracking-[-0.02em] text-primary-foreground"
        >
          <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-x-[1px]">
            SQL
          </span>
          <span className="inline-block text-light-mauve transition-all duration-500 ease-out group-hover:translate-x-[1px] group-hover:text-[#FFFFFB]">
            earn
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ease-out",
              pathname === "/login"
                ? "bg-white/15 text-primary-foreground"
                : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
            )}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-light-mauve/90 px-4 py-1.5 text-sm font-semibold tracking-[-0.005em] text-white shadow-[0_1px_0_rgb(255_255_255_/_0.25)_inset,0_2px_8px_-2px_rgb(185_153_164_/_0.5)] transition-all duration-300 ease-out hover:-translate-y-[1px] hover:bg-light-mauve"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
