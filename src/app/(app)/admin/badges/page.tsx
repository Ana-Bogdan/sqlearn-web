"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeIcon, BADGE_ICON_OPTIONS } from "@/components/badge-icon";
import {
  BADGE_CATEGORY_ORDER,
  fetchAdminBadges,
  patchAdminBadge,
  type AdminBadge,
} from "@/lib/admin";
import type { BadgeCategory } from "@/lib/gamification";

const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  milestone: "Milestones",
  skill: "Skill",
  streak: "Streak",
  fun: "Fun",
};

const CATEGORY_DESCRIPTION: Record<BadgeCategory, string> = {
  milestone: "First steps and curriculum landmarks.",
  skill: "Earned by practising a particular SQL technique.",
  streak: "Reward consistent daily practice.",
  fun: "Hidden quirks and easter-egg achievements.",
};

interface DraftState {
  name: string;
  description: string;
  icon: string;
  pending: boolean;
  status: "idle" | "saved" | "error";
  errorMessage: string | null;
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<AdminBadge[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, DraftState>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminBadges();
        if (!active) return;
        setBadges(data);
      } catch {
        if (!active) return;
        setError("We couldn't load the badges. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    if (!badges) return null;
    const buckets: Record<BadgeCategory, AdminBadge[]> = {
      milestone: [],
      skill: [],
      streak: [],
      fun: [],
    };
    for (const badge of badges) {
      buckets[badge.category].push(badge);
    }
    return buckets;
  }, [badges]);

  function startEdit(badge: AdminBadge) {
    setEditingId(badge.id);
    setDrafts((prev) => ({
      ...prev,
      [badge.id]: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        pending: false,
        status: "idle",
        errorMessage: null,
      },
    }));
  }

  function cancelEdit(id: number) {
    setEditingId((current) => (current === id ? null : current));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function patchDraft(id: number, partial: Partial<DraftState>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] as DraftState), ...partial },
    }));
  }

  async function save(badge: AdminBadge) {
    const draft = drafts[badge.id];
    if (!draft) return;
    if (!draft.name.trim() || !draft.description.trim() || !draft.icon.trim()) {
      patchDraft(badge.id, {
        status: "error",
        errorMessage: "Every field needs a value.",
      });
      return;
    }
    patchDraft(badge.id, { pending: true, status: "idle", errorMessage: null });
    try {
      const updated = await patchAdminBadge(badge.id, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        icon: draft.icon.trim(),
      });
      setBadges((prev) =>
        prev
          ? prev.map((b) => (b.id === updated.id ? updated : b))
          : prev,
      );
      patchDraft(badge.id, { pending: false, status: "saved" });
      // Auto-collapse the editor after a brief confirmation.
      window.setTimeout(() => {
        setEditingId((current) => (current === badge.id ? null : current));
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[badge.id];
          return next;
        });
      }, 900);
    } catch {
      patchDraft(badge.id, {
        pending: false,
        status: "error",
        errorMessage: "Save failed — try again.",
      });
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Badges
        </p>
        <h1 className="admin-page__title">Reward language.</h1>
        <p className="admin-page__sub">
          Edit the name, description, and icon shown to learners. The trigger
          and category are fixed — they wire the achievement to backend logic.
        </p>
      </header>

      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      {!grouped && !error ? <BadgeSkeleton /> : null}

      {grouped
        ? BADGE_CATEGORY_ORDER.map((category, idx) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <section
                key={category}
                className="badge-category animate-fade-up"
                style={{ animationDelay: `${100 + idx * 80}ms` }}
              >
                <header className="badge-category__header">
                  <span className="badge-category__eyebrow">
                    {CATEGORY_LABEL[category]}
                  </span>
                  <p className="badge-category__caption">
                    {CATEGORY_DESCRIPTION[category]}
                  </p>
                </header>
                <ul className="badge-list">
                  {items.map((badge) => {
                    const isEditing = editingId === badge.id;
                    const draft = drafts[badge.id];
                    return (
                      <li
                        key={badge.id}
                        className="badge-row"
                        data-editing={isEditing ? "true" : "false"}
                      >
                        <div className="badge-row__display">
                          <span
                            className="badge-row__icon"
                            data-category={badge.category}
                          >
                            <BadgeIcon
                              name={isEditing ? draft?.icon : badge.icon}
                              size={26}
                            />
                          </span>
                          <div className="badge-row__text">
                            <h3 className="badge-row__name">{badge.name}</h3>
                            <p className="badge-row__desc">
                              {badge.description}
                            </p>
                            <p className="badge-row__trigger">
                              <code>{badge.trigger_type}</code>
                            </p>
                          </div>
                          {!isEditing ? (
                            <button
                              type="button"
                              className="badge-row__edit"
                              onClick={() => startEdit(badge)}
                            >
                              Edit
                            </button>
                          ) : null}
                        </div>

                        {isEditing && draft ? (
                          <BadgeEditForm
                            draft={draft}
                            onChange={(partial) =>
                              patchDraft(badge.id, {
                                ...partial,
                                status: "idle",
                                errorMessage: null,
                              })
                            }
                            onCancel={() => cancelEdit(badge.id)}
                            onSave={() => save(badge)}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        : null}
    </div>
  );
}

function BadgeEditForm({
  draft,
  onChange,
  onCancel,
  onSave,
}: {
  draft: DraftState;
  onChange: (partial: Partial<DraftState>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <form
      className="badge-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="badge-form__field">
        <label className="badge-form__label" htmlFor="badge-name">
          Display name
        </label>
        <input
          id="badge-name"
          className="badge-form__input"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          maxLength={120}
          autoComplete="off"
          spellCheck
          required
        />
      </div>

      <div className="badge-form__field">
        <label className="badge-form__label" htmlFor="badge-desc">
          Description
        </label>
        <textarea
          id="badge-desc"
          className="badge-form__input badge-form__input--textarea"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          maxLength={300}
          required
        />
      </div>

      <div className="badge-form__field">
        <span className="badge-form__label">Icon</span>
        <div
          className="badge-icon-grid"
          role="radiogroup"
          aria-label="Badge icon"
        >
          {BADGE_ICON_OPTIONS.map((slug) => (
            <button
              key={slug}
              type="button"
              role="radio"
              aria-checked={draft.icon === slug}
              data-selected={draft.icon === slug ? "true" : "false"}
              className="badge-icon-btn"
              onClick={() => onChange({ icon: slug })}
              title={slug}
            >
              <BadgeIcon name={slug} size={18} />
            </button>
          ))}
        </div>
      </div>

      {draft.errorMessage ? (
        <p className="badge-form__error" role="alert">
          {draft.errorMessage}
        </p>
      ) : null}

      <div className="badge-form__actions">
        <button
          type="button"
          className="badge-form__btn badge-form__btn--ghost"
          onClick={onCancel}
          disabled={draft.pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="badge-form__btn"
          disabled={draft.pending}
          aria-busy={draft.pending || undefined}
        >
          {draft.pending
            ? "Saving…"
            : draft.status === "saved"
              ? "Saved ✓"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function BadgeSkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1].map((c) => (
        <section key={c} className="badge-category">
          <span
            className="skel"
            style={{ width: "5rem", height: "0.65rem", display: "block" }}
          />
          <span
            className="skel"
            style={{
              width: "16rem",
              height: "0.7rem",
              display: "block",
              marginTop: "0.45rem",
            }}
          />
          <ul className="badge-list">
            {[0, 1, 2].map((i) => (
              <li key={i} className="badge-row">
                <div className="badge-row__display">
                  <span
                    className="skel"
                    style={{
                      width: "3.4rem",
                      height: "3.4rem",
                      borderRadius: "0.85rem",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      className="skel"
                      style={{
                        width: "10rem",
                        height: "1rem",
                        display: "block",
                      }}
                    />
                    <span
                      className="skel"
                      style={{
                        width: "18rem",
                        height: "0.7rem",
                        display: "block",
                        marginTop: "0.45rem",
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
