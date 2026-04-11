import Link from "next/link";
import { HeroIllustration } from "@/components/illustrations";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(62,85,112,0.06),transparent)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-16 lg:px-12">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          {/* Left: Content */}
          <div className="max-w-xl">
            {/* Logo mark */}
            <h1
              className="animate-fade-up font-logo text-7xl italic tracking-[-0.03em] sm:text-8xl lg:text-9xl"
              style={{ animationDelay: "0ms" }}
            >
              <span className="text-dusk">SQL</span>
              <span className="text-light-mauve">earn</span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-md text-lg leading-relaxed text-taupe/80 sm:text-xl sm:leading-relaxed"
              style={{ animationDelay: "100ms" }}
            >
              Master SQL through hands-on exercises and real-time feedback.
              A structured path from your first{" "}
              <span className="font-mono text-[0.9em] text-dusk/70">SELECT</span>{" "}
              to confident querying.
            </p>

            <div
              className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-lg bg-dusk px-8 text-[0.9375rem] font-medium text-primary-foreground transition-all hover:bg-dusk/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk active:translate-y-px"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-lg border border-taupe/15 bg-card/60 px-8 text-[0.9375rem] font-medium text-taupe transition-all hover:border-taupe/25 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk active:translate-y-px"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Right: Illustration */}
          <div
            className="animate-fade-in hidden lg:block"
            style={{ animationDelay: "300ms" }}
          >
            <HeroIllustration className="h-auto w-[400px] animate-float xl:w-[460px]" />
          </div>
        </div>
      </div>

      {/* Bottom subtle rule */}
      <div className="mx-auto w-full max-w-6xl px-6 pb-8 lg:px-12">
        <p
          className="animate-fade-up text-sm text-muted-foreground"
          style={{ animationDelay: "350ms" }}
        >
          Built for university students learning databases for the first time.
        </p>
      </div>
    </div>
  );
}
