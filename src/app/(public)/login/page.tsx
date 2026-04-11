import Link from "next/link";
import { LoginIllustration } from "@/components/illustrations";
import { TiltScene } from "@/components/tilt-scene";

export default function LoginPage() {
  return (
    <div className="relative z-[2] flex flex-1">
      {/* Left: Illustration panel — framed parchment card */}
      <div className="hidden w-[46%] items-center justify-center px-12 lg:flex">
        <TiltScene className="relative w-full max-w-[420px]">
          {/* Frame */}
          <div className="animate-fade-in relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-taupe/15 bg-popover/40 shadow-[0_1px_0_rgb(255_255_255_/_0.5)_inset,0_24px_60px_-32px_rgb(70_60_51_/_0.4)]">
            {/* Inner radial wash */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(62,85,112,0.06),transparent_70%)]" />
            {/* Corner ornaments */}
            <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-taupe/30" aria-hidden="true" />
            <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-taupe/30" aria-hidden="true" />
            <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-taupe/30" aria-hidden="true" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-taupe/30" aria-hidden="true" />
            <div className="flex h-full w-full items-center justify-center p-6">
              <LoginIllustration className="h-auto w-[300px] xl:w-[340px]" />
            </div>
          </div>
          {/* Caption under frame */}
          <p className="animate-fade-up mt-5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-taupe/50" style={{ animationDelay: "350ms" }}>
            Tables · Joins · Aggregations
          </p>
        </TiltScene>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Brand link */}
          <Link
            href="/"
            className="animate-fade-up group mb-12 inline-block font-logo text-2xl italic tracking-[-0.02em]"
            style={{ animationDelay: "0ms" }}
          >
            <span className="text-dusk transition-colors duration-300 ease-out">SQL</span>
            <span className="text-light-mauve transition-colors duration-300 ease-out group-hover:text-dusk">
              earn
            </span>
          </Link>

          <h1
            className="animate-fade-up text-[2.125rem] font-bold leading-[1.1] tracking-[-0.025em] text-taupe"
            style={{ animationDelay: "80ms" }}
          >
            Welcome back
          </h1>
          <p
            className="animate-fade-up mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "150ms" }}
          >
            Sign in to pick up where you left off.
          </p>

          {/* Auth form will be added in Milestone 4 */}
          <div
            className="animate-fade-up mt-10 space-y-3"
            style={{ animationDelay: "220ms" }}
          >
            <div className="h-12 rounded-[10px] border border-border/80 bg-popover/70" />
            <div className="h-12 rounded-[10px] border border-border/80 bg-popover/70" />
            <div className="shadow-dusk h-12 rounded-[10px] bg-dusk" />
          </div>

          <p
            className="animate-fade-up mt-8 text-sm text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-dusk underline-offset-4 transition-colors hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
