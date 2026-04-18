"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative z-[3] border-b border-dusk/20 bg-dusk shadow-[0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div className="flex h-16 items-center justify-between pl-4 pr-6 lg:pr-8">
        <Link
          href="/"
          aria-label={STRINGS.BRAND.NAME}
          className="inline-flex items-center"
        >
          <Image
            src="/sqlearn-logo-light.png"
            alt={STRINGS.BRAND.NAME}
            width={1427}
            height={516}
            priority
            className="h-15 w-auto"
          />
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
            {STRINGS.NAV.LOG_IN}
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-light-mauve/90 px-4 py-1.5 text-sm font-semibold tracking-[-0.005em] text-white shadow-[0_1px_0_rgb(255_255_255_/_0.25)_inset,0_2px_8px_-2px_rgb(185_153_164_/_0.5)] transition-all duration-300 ease-out hover:-translate-y-[1px] hover:bg-light-mauve"
          >
            {STRINGS.NAV.REGISTER}
          </Link>
        </div>
      </div>
    </nav>
  );
}
