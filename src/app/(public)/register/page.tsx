import Image from "next/image";
import Link from "next/link";
import { GuestGuard } from "@/components/guest-guard";
import { RegisterIllustration } from "@/components/illustrations";
import { RegisterForm } from "@/components/register-form";
import { TiltScene } from "@/components/tilt-scene";
import { STRINGS } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <GuestGuard>
    <div className="relative z-[2] flex flex-1">
      {/* Brand link — top-right corner */}
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

      {/* Left: Illustration panel — framed parchment card */}
      <div className="hidden w-[46%] items-center justify-center px-12 lg:flex">
        <TiltScene className="relative w-full max-w-[420px]">
          <div className="animate-fade-in relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-taupe/15 bg-popover/40 shadow-[0_1px_0_rgb(255_255_255_/_0.5)_inset,0_24px_60px_-32px_rgb(70_60_51_/_0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(185,153,164,0.08),transparent_70%)]" />
            <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-taupe/30" aria-hidden="true" />
            <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-taupe/30" aria-hidden="true" />
            <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-taupe/30" aria-hidden="true" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-taupe/30" aria-hidden="true" />
            <div className="flex h-full w-full items-center justify-center p-6">
              <RegisterIllustration className="h-auto w-[300px] xl:w-[340px]" />
            </div>
          </div>
          <p className="animate-fade-up mt-5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-taupe/50" style={{ animationDelay: "350ms" }}>
            {STRINGS.REGISTER.CAPTION}
          </p>
        </TiltScene>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          <h1
            className="animate-fade-up text-[2.125rem] font-bold leading-[1.1] tracking-[-0.025em] text-taupe"
            style={{ animationDelay: "80ms" }}
          >
            {STRINGS.REGISTER.HEADING}
          </h1>
          <p
            className="animate-fade-up mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "150ms" }}
          >
            {STRINGS.REGISTER.SUBHEADING}
          </p>

          <RegisterForm />

          <p
            className="animate-fade-up mt-8 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            {STRINGS.REGISTER.FOOTER_PROMPT}{" "}
            <Link
              href="/login"
              className="font-semibold text-dusk underline-offset-4 transition-colors hover:underline"
            >
              {STRINGS.REGISTER.FOOTER_LINK}
            </Link>
          </p>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}
