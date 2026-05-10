"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import {
  AdminField,
  AdminNumberInput,
  AdminTextInput,
} from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createAdminExercise,
  createAdminLesson,
  deleteAdminLesson,
  fetchAdminChapter,
  updateAdminLesson,
  type AdminChapter,
  type AdminLessonSummary,
} from "@/lib/admin-content";

interface LessonDraft {
  title: string;
  order: number;
  pending: boolean;
  error: string | null;
}

interface LessonEditDraft extends LessonDraft {
  id: number;
}

interface QuickExerciseDraft {
  lessonId: number;
  title: string;
  pending: boolean;
  error: string | null;
}

export default function AdminChapterLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: chapterId } = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<AdminChapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<LessonDraft | null>(null);
  const [editDraft, setEditDraft] = useState<LessonEditDraft | null>(null);
  const [quickExercise, setQuickExercise] =
    useState<QuickExerciseDraft | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminLessonSummary | null>(
    null,
  );
  const [confirmPending, setConfirmPending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminChapter(chapterId);
        if (!active) return;
        setChapter(data);
      } catch {
        if (!active) return;
        setError("We couldn't load this chapter. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, [chapterId]);

  const sortedLessons = useMemo(
    () =>
      chapter ? [...chapter.lessons].sort((a, b) => a.order - b.order) : [],
    [chapter],
  );

  const nextOrder = useMemo(() => {
    if (!chapter) return 1;
    const max = chapter.lessons.reduce((m, l) => Math.max(m, l.order), 0);
    return max + 1;
  }, [chapter]);

  function startCreate() {
    setCreateDraft({
      title: "",
      order: nextOrder,
      pending: false,
      error: null,
    });
  }

  async function onCreate() {
    if (!createDraft || !chapter) return;
    if (!createDraft.title.trim()) {
      setCreateDraft({ ...createDraft, error: "A title is required." });
      return;
    }
    setCreateDraft({ ...createDraft, pending: true, error: null });
    try {
      const created = await createAdminLesson({
        chapter: chapter.id,
        title: createDraft.title.trim(),
        order: createDraft.order,
        is_active: true,
      });
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              lessons: [
                ...prev.lessons,
                {
                  id: created.id,
                  title: created.title,
                  order: created.order,
                  is_active: created.is_active,
                  exercise_count: 0,
                },
              ],
              lesson_count: prev.lesson_count + 1,
            }
          : prev,
      );
      setCreateDraft(null);
      // Optionally jump straight to lesson editor for theory authoring.
      router.push(`/admin/lessons/${created.id}/edit`);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("409")
          ? "Another lesson already uses that order. Pick a different number."
          : "Couldn't save — try again.";
      setCreateDraft((prev) =>
        prev ? { ...prev, pending: false, error: message } : prev,
      );
    }
  }

  async function onSaveEdit() {
    if (!editDraft) return;
    if (!editDraft.title.trim()) {
      setEditDraft({ ...editDraft, error: "A title is required." });
      return;
    }
    setEditDraft({ ...editDraft, pending: true, error: null });
    try {
      const updated = await updateAdminLesson(editDraft.id, {
        title: editDraft.title.trim(),
        order: editDraft.order,
      });
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons.map((l) =>
                l.id === updated.id
                  ? { ...l, title: updated.title, order: updated.order }
                  : l,
              ),
            }
          : prev,
      );
      setEditDraft(null);
    } catch {
      setEditDraft((prev) =>
        prev
          ? {
              ...prev,
              pending: false,
              error:
                "Couldn't save — that order may already be taken in this chapter.",
            }
          : prev,
      );
    }
  }

  async function onConfirmDelete() {
    if (!confirmTarget) return;
    setConfirmPending(true);
    try {
      if (confirmTarget.is_active) {
        await deleteAdminLesson(confirmTarget.id);
      } else {
        await updateAdminLesson(confirmTarget.id, { is_active: true });
      }
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons.map((l) =>
                l.id === confirmTarget.id
                  ? { ...l, is_active: !l.is_active }
                  : l,
              ),
            }
          : prev,
      );
      setConfirmTarget(null);
    } catch {
      setError(
        confirmTarget.is_active
          ? "Couldn't archive that lesson. Try again."
          : "Couldn't restore that lesson. Try again.",
      );
    } finally {
      setConfirmPending(false);
    }
  }

  async function onQuickCreateExercise() {
    if (!quickExercise || !chapter) return;
    if (!quickExercise.title.trim()) {
      setQuickExercise({
        ...quickExercise,
        error: "A title is required.",
      });
      return;
    }
    setQuickExercise({ ...quickExercise, pending: true, error: null });
    try {
      const created = await createAdminExercise({
        chapter: chapter.id,
        lesson: quickExercise.lessonId,
        title: quickExercise.title.trim(),
        instructions: "",
        difficulty: "easy",
        solution_query: "",
        is_chapter_quiz: false,
        is_published: false,
        order: 1,
      });
      router.push(`/admin/exercises/${created.id}/edit`);
    } catch {
      setQuickExercise((prev) =>
        prev
          ? { ...prev, pending: false, error: "Couldn't create — try again." }
          : prev,
      );
    }
  }

  if (error && !chapter) {
    return (
      <div className="admin-page">
        <div className="admin-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Chapter {chapter ? chapter.order : ""}
          {chapter ? (
            <Link
              href="/admin/chapters"
              className="admin-eyebrow__crumb"
            >
              ← All chapters
            </Link>
          ) : null}
        </p>
        <h1 className="admin-page__title">
          {chapter ? chapter.title : "Loading…"}
        </h1>
        <p className="admin-page__sub">
          {chapter && chapter.description
            ? chapter.description
            : "Compose the lessons that walk a learner from first principles to mastery."}
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
        {createDraft ? null : (
          <button
            type="button"
            className="admin-primary-btn"
            onClick={startCreate}
          >
            <PlusIcon /> New lesson
          </button>
        )}
        <p className="admin-meta">
          {chapter
            ? `${chapter.lessons.filter((l) => l.is_active).length} active · ${chapter.lessons.filter((l) => !l.is_active).length} archived`
            : "—"}
        </p>
      </div>

      {createDraft ? (
        <section
          className="admin-create-card animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="admin-create-card__head">
            <span className="admin-create-card__eyebrow">New lesson</span>
            <p className="admin-create-card__title">
              Pick a working title — you&apos;ll write theory next.
            </p>
          </div>
          <form
            className="admin-create-card__form"
            onSubmit={(e) => {
              e.preventDefault();
              onCreate();
            }}
          >
            <div className="admin-form__row">
              <AdminField
                label="Title"
                htmlFor="lesson-create-title"
                width="full"
              >
                <AdminTextInput
                  id="lesson-create-title"
                  value={createDraft.title}
                  onChange={(e) =>
                    setCreateDraft({
                      ...createDraft,
                      title: e.target.value,
                      error: null,
                    })
                  }
                  placeholder="e.g. SELECT and FROM"
                  maxLength={200}
                  autoFocus
                />
              </AdminField>
              <AdminField
                label="Order"
                htmlFor="lesson-create-order"
                width="narrow"
              >
                <AdminNumberInput
                  id="lesson-create-order"
                  value={createDraft.order}
                  onChange={(e) =>
                    setCreateDraft({
                      ...createDraft,
                      order: Number(e.target.value) || 0,
                      error: null,
                    })
                  }
                  min={1}
                />
              </AdminField>
            </div>

            {createDraft.error ? (
              <p className="admin-field__error" role="alert">
                {createDraft.error}
              </p>
            ) : null}

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setCreateDraft(null)}
                disabled={createDraft.pending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-primary-btn"
                disabled={createDraft.pending}
              >
                {createDraft.pending
                  ? "Creating…"
                  : "Create & open editor →"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {!chapter && !error ? (
        <LessonsSkeleton />
      ) : sortedLessons.length === 0 ? (
        <section className="admin-empty-state animate-fade-up">
          <p className="admin-empty-state__eyebrow">Empty chapter</p>
          <h2 className="admin-empty-state__title">No lessons yet.</h2>
          <p className="admin-empty-state__body">
            A lesson holds a piece of theory and a few exercises that practice
            the new concept. You&apos;ll add exercises after creating one.
          </p>
          <button
            type="button"
            className="admin-primary-btn"
            onClick={startCreate}
          >
            <PlusIcon /> Add your first lesson
          </button>
        </section>
      ) : (
        <ul
          className="lesson-list animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          {sortedLessons.map((lesson) => {
            const isEditing = editDraft?.id === lesson.id;
            return (
              <li
                key={lesson.id}
                className="lesson-card"
                data-active={lesson.is_active ? "true" : "false"}
              >
                <span className="lesson-card__order">
                  {String(lesson.order).padStart(2, "0")}
                </span>

                {isEditing && editDraft ? (
                  <form
                    className="lesson-card__edit"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveEdit();
                    }}
                  >
                    <div className="admin-form__row">
                      <AdminTextInput
                        value={editDraft.title}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            title: e.target.value,
                            error: null,
                          })
                        }
                        maxLength={200}
                        autoFocus
                      />
                      <AdminNumberInput
                        value={editDraft.order}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            order: Number(e.target.value) || 0,
                            error: null,
                          })
                        }
                        min={1}
                        style={{ maxWidth: "5rem" }}
                      />
                    </div>
                    {editDraft.error ? (
                      <p className="admin-field__error" role="alert">
                        {editDraft.error}
                      </p>
                    ) : null}
                    <div className="admin-form__actions admin-form__actions--inline">
                      <button
                        type="button"
                        className="admin-secondary-btn admin-secondary-btn--sm"
                        onClick={() => setEditDraft(null)}
                        disabled={editDraft.pending}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="admin-primary-btn admin-primary-btn--sm"
                        disabled={editDraft.pending}
                      >
                        {editDraft.pending ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="lesson-card__body">
                    <h3 className="lesson-card__title">
                      {lesson.title}
                      {!lesson.is_active ? (
                        <span className="chapter-card__archived">
                          Archived
                        </span>
                      ) : null}
                    </h3>
                    <p className="lesson-card__meta">
                      {lesson.exercise_count} exercises
                    </p>
                  </div>
                )}

                {!isEditing ? (
                  <div className="lesson-card__actions">
                    <Link
                      href={`/admin/lessons/${lesson.id}/edit`}
                      className="admin-action"
                    >
                      Theory →
                    </Link>
                    <button
                      type="button"
                      className="admin-action"
                      onClick={() =>
                        setQuickExercise({
                          lessonId: lesson.id,
                          title: "",
                          pending: false,
                          error: null,
                        })
                      }
                    >
                      + Exercise
                    </button>
                    <button
                      type="button"
                      className="admin-action"
                      onClick={() =>
                        setEditDraft({
                          id: lesson.id,
                          title: lesson.title,
                          order: lesson.order,
                          pending: false,
                          error: null,
                        })
                      }
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="admin-action"
                      data-tone={lesson.is_active ? "danger" : "default"}
                      onClick={() => setConfirmTarget(lesson)}
                    >
                      {lesson.is_active ? "Archive" : "Restore"}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {/* Quick-create exercise modal — keeps the user on the lesson list. */}
      <ConfirmDialog
        open={quickExercise !== null}
        title="Add an exercise"
        body={
          quickExercise ? (
            <form
              id="quick-exercise-form"
              onSubmit={(e) => {
                e.preventDefault();
                onQuickCreateExercise();
              }}
            >
              <p className="admin-meta" style={{ marginBottom: "0.85rem" }}>
                You&apos;ll be taken to the editor next, where you&apos;ll write the
                instructions, set the difficulty, link a dataset, and author the
                solution.
              </p>
              <AdminField label="Working title">
                <AdminTextInput
                  value={quickExercise.title}
                  onChange={(e) =>
                    setQuickExercise({
                      ...quickExercise,
                      title: e.target.value,
                      error: null,
                    })
                  }
                  placeholder="e.g. List products under $20"
                  maxLength={200}
                  autoFocus
                />
              </AdminField>
              {quickExercise.error ? (
                <p
                  className="admin-field__error"
                  role="alert"
                  style={{ marginTop: "0.6rem" }}
                >
                  {quickExercise.error}
                </p>
              ) : null}
            </form>
          ) : null
        }
        confirmLabel="Create draft & open"
        pending={quickExercise?.pending ?? false}
        onConfirm={onQuickCreateExercise}
        onCancel={() => {
          if (!quickExercise?.pending) setQuickExercise(null);
        }}
      />

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
              Archiving hides the lesson from learners. Their existing progress
              and submissions are preserved.
            </p>
          ) : (
            <p>This lesson will be visible to learners again.</p>
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

function LessonsSkeleton() {
  return (
    <ul className="lesson-list" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="lesson-card">
          <span
            className="skel"
            style={{ width: "2rem", height: "0.85rem" }}
          />
          <div style={{ flex: 1 }}>
            <span
              className="skel"
              style={{ width: "12rem", height: "1rem", display: "block" }}
            />
            <span
              className="skel"
              style={{
                width: "5rem",
                height: "0.7rem",
                display: "block",
                marginTop: "0.5rem",
              }}
            />
          </div>
          <span className="skel" style={{ width: "5rem", height: "1.6rem" }} />
        </li>
      ))}
    </ul>
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
