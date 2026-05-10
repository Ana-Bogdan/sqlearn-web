"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AdminField,
  AdminTextInput,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createAdminChapter,
  deleteAdminChapter,
  fetchAdminChapters,
  reorderAdminChapter,
  updateAdminChapter,
  type AdminChapter,
} from "@/lib/admin-content";

interface CreateState {
  title: string;
  description: string;
  pending: boolean;
  error: string | null;
}

interface EditState {
  title: string;
  description: string;
  pending: boolean;
  error: string | null;
}

const initialCreate: CreateState = {
  title: "",
  description: "",
  pending: false,
  error: null,
};

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<AdminChapter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<CreateState | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminChapter | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [reorderPending, setReorderPending] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminChapters();
        if (!active) return;
        setChapters([...data].sort((a, b) => a.order - b.order));
      } catch {
        if (!active) return;
        setError("We couldn't load the chapters. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onCreate() {
    if (!creating) return;
    if (!creating.title.trim()) {
      setCreating({ ...creating, error: "A title is required." });
      return;
    }
    setCreating({ ...creating, pending: true, error: null });
    try {
      const nextOrder = (chapters?.[chapters.length - 1]?.order ?? 0) + 1;
      const created = await createAdminChapter({
        title: creating.title.trim(),
        description: creating.description.trim(),
        order: nextOrder,
        is_active: true,
      });
      setChapters((prev) =>
        prev ? [...prev, created].sort((a, b) => a.order - b.order) : [created],
      );
      setCreating(null);
    } catch {
      setCreating((prev) =>
        prev
          ? { ...prev, pending: false, error: "Couldn't save — try again." }
          : prev,
      );
    }
  }

  function startEdit(chapter: AdminChapter) {
    setEditingId(chapter.id);
    setEdit({
      title: chapter.title,
      description: chapter.description,
      pending: false,
      error: null,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(null);
  }

  async function onSaveEdit() {
    if (!edit || editingId == null) return;
    if (!edit.title.trim()) {
      setEdit({ ...edit, error: "A title is required." });
      return;
    }
    setEdit({ ...edit, pending: true, error: null });
    try {
      const updated = await updateAdminChapter(editingId, {
        title: edit.title.trim(),
        description: edit.description.trim(),
      });
      setChapters((prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : prev,
      );
      cancelEdit();
    } catch {
      setEdit((prev) =>
        prev
          ? { ...prev, pending: false, error: "Couldn't save — try again." }
          : prev,
      );
    }
  }

  async function onConfirmDelete() {
    if (!confirmTarget) return;
    setConfirmPending(true);
    try {
      if (confirmTarget.is_active) {
        await deleteAdminChapter(confirmTarget.id);
      } else {
        await updateAdminChapter(confirmTarget.id, { is_active: true });
      }
      setChapters((prev) =>
        prev
          ? prev.map((c) =>
              c.id === confirmTarget.id
                ? { ...c, is_active: !confirmTarget.is_active }
                : c,
            )
          : prev,
      );
      setConfirmTarget(null);
    } catch {
      setError(
        confirmTarget.is_active
          ? "Couldn't archive that chapter. Try again."
          : "Couldn't restore that chapter. Try again.",
      );
    } finally {
      setConfirmPending(false);
    }
  }

  async function handleDrop(targetChapter: AdminChapter) {
    if (draggedId == null || draggedId === targetChapter.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    if (!chapters) return;
    const dragged = chapters.find((c) => c.id === draggedId);
    if (!dragged) return;
    const targetOrder = targetChapter.order;
    setReorderPending(true);
    try {
      const updated = await reorderAdminChapter(dragged.id, targetOrder);
      // Refetch the list — server has shifted siblings.
      const all = await fetchAdminChapters();
      setChapters([...all].sort((a, b) => a.order - b.order));
      void updated;
    } catch {
      setError("Couldn't reorder. Try again.");
    } finally {
      setReorderPending(false);
      setDraggedId(null);
      setDragOverId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Chapters
        </p>
        <h1 className="admin-page__title">The shape of the curriculum.</h1>
        <p className="admin-page__sub">
          Drag a chapter to reorder. Click into one to edit its lessons. Soft
          delete archives a chapter without losing learner progress.
        </p>
      </header>

      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      <div
        className="admin-cta-row animate-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        {creating ? null : (
          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => setCreating(initialCreate)}
          >
            <PlusIcon />
            New chapter
          </button>
        )}
        <p className="admin-meta">
          {chapters
            ? `${chapters.filter((c) => c.is_active).length} active · ${
                chapters.filter((c) => !c.is_active).length
              } archived`
            : "—"}
        </p>
      </div>

      {creating ? (
        <section
          className="admin-create-card animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="admin-create-card__head">
            <span className="admin-create-card__eyebrow">New chapter</span>
            <p className="admin-create-card__title">Start with a working title.</p>
          </div>
          <form
            className="admin-create-card__form"
            onSubmit={(e) => {
              e.preventDefault();
              onCreate();
            }}
          >
            <AdminField label="Title" htmlFor="chapter-create-title">
              <AdminTextInput
                id="chapter-create-title"
                value={creating.title}
                onChange={(e) =>
                  setCreating({ ...creating, title: e.target.value, error: null })
                }
                placeholder="e.g. Filtering & Sorting"
                maxLength={200}
                autoFocus
              />
            </AdminField>
            <AdminField
              label="Description"
              htmlFor="chapter-create-desc"
              hint="One sentence — what will the learner be able to do after this chapter?"
            >
              <AdminTextarea
                id="chapter-create-desc"
                value={creating.description}
                onChange={(e) =>
                  setCreating({
                    ...creating,
                    description: e.target.value,
                    error: null,
                  })
                }
                rows={2}
                maxLength={500}
              />
            </AdminField>

            {creating.error ? (
              <p className="admin-field__error" role="alert">
                {creating.error}
              </p>
            ) : null}

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setCreating(null)}
                disabled={creating.pending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-primary-btn"
                disabled={creating.pending}
                aria-busy={creating.pending || undefined}
              >
                {creating.pending ? "Creating…" : "Create chapter"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {!chapters && !error ? (
        <ChaptersSkeleton />
      ) : chapters && chapters.length === 0 ? (
        <EmptyState onCreate={() => setCreating(initialCreate)} />
      ) : chapters ? (
        <ol
          className="chapter-list animate-fade-up"
          style={{ animationDelay: "200ms" }}
          data-reordering={reorderPending ? "true" : "false"}
        >
          {chapters.map((chapter) => {
            const isEditing = editingId === chapter.id;
            return (
              <li
                key={chapter.id}
                className="chapter-card"
                data-active={chapter.is_active ? "true" : "false"}
                data-dragging={draggedId === chapter.id ? "true" : "false"}
                data-drag-over={dragOverId === chapter.id ? "true" : "false"}
                draggable={!isEditing && chapter.is_active}
                onDragStart={() => setDraggedId(chapter.id)}
                onDragOver={(e) => {
                  if (draggedId == null || draggedId === chapter.id) return;
                  e.preventDefault();
                  setDragOverId(chapter.id);
                }}
                onDragLeave={() => {
                  if (dragOverId === chapter.id) setDragOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(chapter);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
              >
                <span
                  className="chapter-card__handle"
                  aria-hidden="true"
                  title={chapter.is_active ? "Drag to reorder" : undefined}
                >
                  <DragIcon />
                </span>

                <span className="chapter-card__order">
                  {String(chapter.order).padStart(2, "0")}
                </span>

                {isEditing && edit ? (
                  <form
                    className="chapter-card__edit"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveEdit();
                    }}
                  >
                    <AdminTextInput
                      value={edit.title}
                      onChange={(e) =>
                        setEdit({ ...edit, title: e.target.value, error: null })
                      }
                      maxLength={200}
                      autoFocus
                    />
                    <AdminTextarea
                      value={edit.description}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          description: e.target.value,
                          error: null,
                        })
                      }
                      rows={2}
                      maxLength={500}
                      placeholder="Description"
                    />
                    {edit.error ? (
                      <p className="admin-field__error" role="alert">
                        {edit.error}
                      </p>
                    ) : null}
                    <div className="admin-form__actions admin-form__actions--inline">
                      <button
                        type="button"
                        className="admin-secondary-btn admin-secondary-btn--sm"
                        onClick={cancelEdit}
                        disabled={edit.pending}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="admin-primary-btn admin-primary-btn--sm"
                        disabled={edit.pending}
                      >
                        {edit.pending ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="chapter-card__body">
                    <div className="chapter-card__header">
                      <h2 className="chapter-card__title">
                        {chapter.title}
                        {!chapter.is_active ? (
                          <span className="chapter-card__archived">
                            Archived
                          </span>
                        ) : null}
                      </h2>
                      <p className="chapter-card__meta">
                        <span>{chapter.lesson_count} lessons</span>
                        <span aria-hidden="true">·</span>
                        <span>{chapter.exercise_count} exercises</span>
                      </p>
                    </div>
                    {chapter.description ? (
                      <p className="chapter-card__desc">{chapter.description}</p>
                    ) : (
                      <p className="chapter-card__desc chapter-card__desc--empty">
                        No description yet.
                      </p>
                    )}
                  </div>
                )}

                {!isEditing ? (
                  <div className="chapter-card__actions">
                    <Link
                      href={`/admin/chapters/${chapter.id}/lessons`}
                      className="admin-action"
                    >
                      Lessons →
                    </Link>
                    <button
                      type="button"
                      className="admin-action"
                      onClick={() => startEdit(chapter)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-action"
                      data-tone={chapter.is_active ? "danger" : "default"}
                      onClick={() => setConfirmTarget(chapter)}
                    >
                      {chapter.is_active ? "Archive" : "Restore"}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      <ConfirmDialog
        open={confirmTarget !== null}
        title={
          confirmTarget?.is_active
            ? `Archive "${confirmTarget.title}"?`
            : `Restore "${confirmTarget?.title ?? ""}"?`
        }
        body={
          confirmTarget?.is_active ? (
            <p>
              Archived chapters are hidden from learners. Existing progress and
              submissions are preserved — you can restore the chapter at any
              time.
            </p>
          ) : (
            <p>
              This chapter will be visible to learners again. Order is
              preserved.
            </p>
          )
        }
        confirmLabel={confirmTarget?.is_active ? "Archive" : "Restore"}
        variant={confirmTarget?.is_active ? "danger" : "default"}
        pending={confirmPending}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          if (!confirmPending) setConfirmTarget(null);
        }}
      />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="admin-empty-state animate-fade-up">
      <p className="admin-empty-state__eyebrow">Empty desk</p>
      <h2 className="admin-empty-state__title">No chapters yet.</h2>
      <p className="admin-empty-state__body">
        A chapter is the largest unit of the curriculum. Inside it lives a
        cluster of lessons and a quiz that ties them together.
      </p>
      <button
        type="button"
        className="admin-primary-btn"
        onClick={onCreate}
      >
        <PlusIcon /> Create your first chapter
      </button>
    </section>
  );
}

function ChaptersSkeleton() {
  return (
    <ol className="chapter-list" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="chapter-card">
          <span className="skel" style={{ width: "1.6rem", height: "1.6rem" }} />
          <span
            className="skel"
            style={{ width: "2rem", height: "0.85rem" }}
          />
          <div style={{ flex: 1 }}>
            <span
              className="skel"
              style={{ width: "16rem", height: "1.1rem", display: "block" }}
            />
            <span
              className="skel"
              style={{
                width: "26rem",
                height: "0.7rem",
                display: "block",
                marginTop: "0.6rem",
              }}
            />
          </div>
          <span
            className="skel"
            style={{ width: "5rem", height: "1.6rem" }}
          />
        </li>
      ))}
    </ol>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="1.4" fill="currentColor" />
      <circle cx="9" cy="3" r="1.4" fill="currentColor" />
      <circle cx="3" cy="10" r="1.4" fill="currentColor" />
      <circle cx="9" cy="10" r="1.4" fill="currentColor" />
      <circle cx="3" cy="17" r="1.4" fill="currentColor" />
      <circle cx="9" cy="17" r="1.4" fill="currentColor" />
    </svg>
  );
}
