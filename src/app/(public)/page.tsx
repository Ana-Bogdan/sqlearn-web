import Image from "next/image";
import Link from "next/link";
import { HeroIllustration } from "@/components/illustrations";
import { TiltScene } from "@/components/tilt-scene";
import { STRINGS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Soft warm halos */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_-5%,rgba(62,85,112,0.09),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_85%,rgba(185,153,164,0.10),transparent_55%)]" />

      <TiltScene className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid w-full items-center gap-x-8 gap-y-10 lg:grid-cols-12">
          {/* Content — left, hard-aligned to col 1 */}
          <div className="lg:col-span-7 lg:col-start-1">
            <h1 aria-label={STRINGS.BRAND.NAME} className="animate-fade-up -mt-12 flex leading-none lg:-mt-20">
              <Image
                src="/sqlearn-logo.svg"
                alt={STRINGS.BRAND.NAME}
                width={1427}
                height={516}
                priority
                aria-hidden="true"
                className="block w-auto"
                style={{ height: "clamp(9rem, 21vw, 18rem)" }}
              />
            </h1>

            <p
              className="animate-fade-up -mt-7 max-w-[46ch] text-[1.125rem] leading-[1.65] text-taupe/85 lg:text-[1.3125rem] lg:leading-[1.55]"
              style={{ animationDelay: "650ms" }}
            >
              {STRINGS.HOME.TAGLINE_LEAD}{" "}
              <span className="inline-flex translate-y-[1px] items-center rounded-[5px] border border-dusk/15 bg-popover/80 px-[0.45em] py-[0.15em] font-mono text-[0.78em] font-medium tracking-tight text-dusk shadow-[0_1px_0_rgb(255_255_255_/_0.45)_inset,0_1px_0_rgb(62_85_112_/_0.08)]">
                {STRINGS.HOME.TAGLINE_SNIPPET}
              </span>{" "}
              {STRINGS.HOME.TAGLINE_TAIL}
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "780ms" }}
            >
              <Link
                href="/register"
                className="group shadow-dusk shadow-dusk-hover inline-flex h-[3.125rem] items-center gap-2 rounded-[11px] bg-dusk pl-7 pr-5 text-[0.9375rem] font-semibold tracking-[-0.005em] text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk active:translate-y-0"
              >
                {STRINGS.HOME.CTA_PRIMARY}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="-mr-1 transition-transform duration-300 ease-out group-hover:translate-x-[3px]"
                  aria-hidden="true"
                >
                  <path
                    d="M3.75 9h10.5M9.75 4.5l4.5 4.5-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-[3.125rem] items-center rounded-[11px] border border-taupe/20 bg-card/40 px-7 text-[0.9375rem] font-medium text-taupe transition-all duration-300 ease-out hover:-translate-y-[1px] hover:border-taupe/35 hover:bg-card/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk active:translate-y-0"
              >
                {STRINGS.HOME.CTA_SECONDARY}
              </Link>
            </div>
          </div>

          {/* Illustration — right, smaller, side-by-side */}
          <div className="hidden justify-center lg:col-span-5 lg:col-start-8 lg:flex lg:justify-end">
            <div
              className="animate-fade-in"
              style={{ animationDelay: "200ms", animationDuration: "1100ms" }}
            >
              <HeroIllustration className="h-auto w-[420px] xl:w-[480px]" />
            </div>
          </div>
        </div>
      </TiltScene>

      {/* Bottom rule */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-6 lg:px-10 lg:pb-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-taupe/15" />
          <p
            className="animate-fade-up text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-taupe/55"
            style={{ animationDelay: "950ms" }}
          >
            {STRINGS.HOME.FOOTER_NOTE}
          </p>
          <div className="h-px flex-1 bg-taupe/15" />
        </div>
      </div>
    </div>
  );
}
