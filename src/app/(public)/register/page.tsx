import Link from "next/link";
import { RegisterIllustration } from "@/components/illustrations";

export default function RegisterPage() {
  return (
    <div className="relative flex flex-1">
      {/* Left: Illustration panel */}
      <div className="hidden w-[45%] items-center justify-center bg-dusk/[0.03] lg:flex">
        <div className="animate-fade-in px-12" style={{ animationDelay: "150ms" }}>
          <RegisterIllustration className="h-auto w-[280px] animate-float xl:w-[320px]" />
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Brand link */}
          <Link
            href="/"
            className="animate-fade-up mb-12 inline-block font-logo text-2xl italic tracking-[-0.02em]"
            style={{ animationDelay: "0ms" }}
          >
            <span className="text-dusk">SQL</span>
            <span className="text-light-mauve">earn</span>
          </Link>

          <h1
            className="animate-fade-up text-3xl font-bold tracking-[-0.02em] text-taupe"
            style={{ animationDelay: "50ms" }}
          >
            Create your account
          </h1>
          <p
            className="animate-fade-up mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "100ms" }}
          >
            Start your SQL journey in minutes.
          </p>

          {/* Registration form will be added in Milestone 4 */}
          <div
            className="animate-fade-up mt-8 space-y-4"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex gap-4">
              <div className="h-11 flex-1 rounded-lg border border-border/80 bg-popover/60" />
              <div className="h-11 flex-1 rounded-lg border border-border/80 bg-popover/60" />
            </div>
            <div className="h-11 rounded-lg border border-border/80 bg-popover/60" />
            <div className="h-11 rounded-lg border border-border/80 bg-popover/60" />
            <div className="h-11 rounded-lg border border-border/80 bg-popover/60" />
            <div className="h-11 rounded-lg bg-dusk" />
          </div>

          <p
            className="animate-fade-up mt-8 text-sm text-muted-foreground"
            style={{ animationDelay: "200ms" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-dusk underline-offset-4 transition-colors hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
