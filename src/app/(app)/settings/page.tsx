"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SettingsPasswordForm } from "@/components/settings-password-form";
import { SettingsProfileForm } from "@/components/settings-profile-form";
import { STRINGS } from "@/lib/constants";
import {
  fetchMyProgress,
  fullName,
  initials,
  type ProgressSummary,
} from "@/lib/gamification";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMyProgress()
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch(() => {
        if (active) setProgress(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  const memberSince = formatMemberSince(user.created_at);
  const initialsLabel = initials(user.first_name, user.last_name);
  const fullNameLabel = fullName(user.first_name, user.last_name);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="settings-shell">
      <header
        className="settings-header animate-fade-up"
        style={{ animationDelay: "40ms" }}
      >
        <p className="settings-eyebrow">{STRINGS.SETTINGS.EYEBROW}</p>
        <h1 className="settings-heading">{STRINGS.SETTINGS.HEADING}</h1>
        <p className="settings-sub">{STRINGS.SETTINGS.SUBHEADING}</p>
      </header>

      <div className="settings-grid">
        <aside
          className="settings-side animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="settings-side__card">
            <div
              className="settings-avatar"
              data-role={user.role}
              aria-hidden="true"
            >
              <span>{initialsLabel}</span>
            </div>
            <p className="settings-side__eyebrow">
              {STRINGS.SETTINGS.SIDE_PANEL.EYEBROW}
            </p>
            <p className="settings-side__name">{fullNameLabel}</p>
            <p className="settings-side__email" title={user.email}>
              {user.email}
            </p>

            {progress ? (
              <p className="settings-side__level">
                {STRINGS.SETTINGS.SIDE_PANEL.LEVEL_LINE(
                  progress.level,
                  progress.level_title,
                )}
              </p>
            ) : (
              <p className="settings-side__level settings-side__level--placeholder">
                Level {user.level}
              </p>
            )}

            <dl className="settings-side__meta">
              <div>
                <dt>{STRINGS.SETTINGS.SIDE_PANEL.ROLE_LABEL}</dt>
                <dd>
                  {user.role === "admin"
                    ? STRINGS.SETTINGS.SIDE_PANEL.ROLE_ADMIN
                    : STRINGS.SETTINGS.SIDE_PANEL.ROLE_LEARNER}
                </dd>
              </div>
              {memberSince ? (
                <div>
                  <dt>Joined</dt>
                  <dd>{memberSince}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </aside>

        <div className="settings-stack">
          <section
            className="settings-card animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <header className="settings-card__head">
              <p className="settings-card__eyebrow">
                <span className="settings-card__eyebrow-dot" />
                {STRINGS.SETTINGS.SECTIONS.PROFILE}
              </p>
              <h2 className="settings-card__title">
                {STRINGS.SETTINGS.SECTIONS.PROFILE}
              </h2>
              <p className="settings-card__hint">
                {STRINGS.SETTINGS.SECTIONS.PROFILE_HINT}
              </p>
            </header>

            <SettingsProfileForm />
          </section>

          <section
            className="settings-card animate-fade-up"
            style={{ animationDelay: "260ms" }}
          >
            <header className="settings-card__head">
              <p className="settings-card__eyebrow">
                <span className="settings-card__eyebrow-dot" />
                {STRINGS.SETTINGS.SECTIONS.PASSWORD}
              </p>
              <h2 className="settings-card__title">
                {STRINGS.SETTINGS.SECTIONS.PASSWORD}
              </h2>
              <p className="settings-card__hint">
                {STRINGS.SETTINGS.SECTIONS.PASSWORD_HINT}
              </p>
            </header>

            <SettingsPasswordForm />
          </section>

          <section
            className="settings-card settings-card--quiet animate-fade-up"
            style={{ animationDelay: "340ms" }}
          >
            <header className="settings-card__head">
              <p className="settings-card__eyebrow">
                <span className="settings-card__eyebrow-dot" />
                {STRINGS.SETTINGS.SECTIONS.DANGER}
              </p>
              <h2 className="settings-card__title">
                {STRINGS.SETTINGS.SECTIONS.DANGER}
              </h2>
              <p className="settings-card__hint">
                {STRINGS.SETTINGS.SECTIONS.DANGER_HINT}
              </p>
            </header>

            <div className="settings-form__actions">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-busy={signingOut || undefined}
                className="settings-signout"
              >
                {signingOut
                  ? STRINGS.SETTINGS.SIGN_OUT_PENDING
                  : STRINGS.SETTINGS.SIGN_OUT}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function formatMemberSince(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
