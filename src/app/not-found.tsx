"use client";

import Link from "next/link";
import { STRINGS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export default function NotFound() {
  const status = useAuthStore((state) => state.status);
  const isAuthed = status === "authenticated";

  return (
    <div className="status-shell status-shell--public">
      <div className="grain-overlay" aria-hidden="true" />
      <div
        className="status-card animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <span className="status-glyph">{STRINGS.NOT_FOUND.EYEBROW}</span>
        <h1 className="status-heading">{STRINGS.NOT_FOUND.HEADING}</h1>
        <p className="status-body">{STRINGS.NOT_FOUND.BODY}</p>

        <div className="status-actions">
          {isAuthed ? (
            <>
              <Link href="/dashboard" className="status-cta status-cta--primary">
                {STRINGS.NOT_FOUND.PRIMARY_CTA}
                <span className="status-cta__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/learn" className="status-cta status-cta--ghost">
                {STRINGS.NOT_FOUND.SECONDARY_CTA}
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="status-cta status-cta--primary">
                {STRINGS.NOT_FOUND.PUBLIC_PRIMARY_CTA}
                <span className="status-cta__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/login" className="status-cta status-cta--ghost">
                {STRINGS.NOT_FOUND.PUBLIC_SECONDARY_CTA}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
