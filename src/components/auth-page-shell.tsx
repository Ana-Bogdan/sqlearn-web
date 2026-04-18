import Image from "next/image";
import Link from "next/link";
import { TiltScene } from "@/components/tilt-scene";
import { STRINGS } from "@/lib/constants";

interface AuthPageShellProps {
  illustration: React.ReactNode;
  radialTint: string;
  caption: string;
  heading: string;
  subheading: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthPageShell({
  illustration,
  radialTint,
  caption,
  heading,
  subheading,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="relative z-[2] flex flex-1">
      <Link
        href="/"
        aria-label={STRINGS.BRAND.NAME}
        className="absolute right-6 top-6 z-10 lg:right-10 lg:top-8"
      >
        <Image
          src="/sqlearn-logo.svg"
          alt={STRINGS.BRAND.NAME}
          width={1427}
          height={516}
          priority
          className="h-16 w-auto"
        />
      </Link>

      <div className="hidden w-[46%] items-center justify-center px-12 lg:flex">
        <TiltScene className="relative w-full max-w-[420px]">
          <div className="animate-fade-in relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-taupe/15 bg-popover/40 shadow-[0_1px_0_rgb(255_255_255_/_0.5)_inset,0_24px_60px_-32px_rgb(70_60_51_/_0.4)]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 70% 55% at 50% 40%, ${radialTint}, transparent 70%)`,
              }}
            />
            <span
              className="absolute left-3 top-3 h-3 w-3 border-l border-t border-taupe/30"
              aria-hidden="true"
            />
            <span
              className="absolute right-3 top-3 h-3 w-3 border-r border-t border-taupe/30"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-taupe/30"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-taupe/30"
              aria-hidden="true"
            />
            <div className="flex h-full w-full items-center justify-center p-6">
              {illustration}
            </div>
          </div>
          <p
            className="animate-fade-up mt-5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-taupe/50"
            style={{ animationDelay: "350ms" }}
          >
            {caption}
          </p>
        </TiltScene>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          <h1
            className="animate-fade-up text-[2.125rem] font-bold leading-[1.1] tracking-[-0.025em] text-taupe"
            style={{ animationDelay: "80ms" }}
          >
            {heading}
          </h1>
          <p
            className="animate-fade-up mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "150ms" }}
          >
            {subheading}
          </p>

          {children}

          {footer ? (
            <div
              className="animate-fade-up mt-8 text-sm text-muted-foreground"
              style={{ animationDelay: "300ms" }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
