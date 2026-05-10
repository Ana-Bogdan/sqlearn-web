"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { renderTheoryMarkdown } from "@/lib/markdown";
import {
  fetchAdminLesson,
  updateAdminLesson,
  type AdminLesson,
} from "@/lib/admin-content";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminLessonEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = use(params);
  const [lesson, setLesson] = useState<AdminLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [theory, setTheory] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalTheory, setOriginalTheory] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<"split" | "write" | "preview">(
    "split",
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminLesson(lessonId);
        if (!active) return;
        setLesson(data);
        setTitle(data.title);
        setOriginalTitle(data.title);
        setTheory(data.theory_content);
        setOriginalTheory(data.theory_content);
      } catch {
        if (!active) return;
        setError("We couldn't load this lesson. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId]);

  const dirty = title !== originalTitle || theory !== originalTheory;

  const renderedHtml = useMemo(() => {
    if (!theory.trim()) return "";
    try {
      return renderTheoryMarkdown(theory);
    } catch {
      return "<p><em>Markdown could not be rendered.</em></p>";
    }
  }, [theory]);

  const wordCount = useMemo(
    () => (theory.trim() ? theory.trim().split(/\s+/).length : 0),
    [theory],
  );

  const onSave = useCallback(async () => {
    if (!lesson) return;
    if (!title.trim()) {
      setSaveError("A title is required.");
      setSaveStatus("error");
      return;
    }
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const updated = await updateAdminLesson(lesson.id, {
        title: title.trim(),
        theory_content: theory,
      });
      setLesson(updated);
      setOriginalTitle(updated.title);
      setOriginalTheory(updated.theory_content);
      setSaveStatus("saved");
      window.setTimeout(() => {
        setSaveStatus((s) => (s === "saved" ? "idle" : s));
      }, 1800);
    } catch {
      setSaveStatus("error");
      setSaveError("Couldn't save — try again.");
    }
  }, [lesson, title, theory]);

  // Cmd/Ctrl-S to save.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && saveStatus !== "saving") onSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saveStatus, onSave]);

  if (error && !lesson) {
    return (
      <div className="admin-page">
        <div className="admin-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--editor">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Lesson theory
          {lesson ? (
            <Link
              href={`/admin/chapters/${lesson.chapter}/lessons`}
              className="admin-eyebrow__crumb"
            >
              ← {lesson.chapter_title}
            </Link>
          ) : null}
        </p>
        <input
          type="text"
          className="admin-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          maxLength={200}
          aria-label="Lesson title"
        />
        <p className="admin-page__sub">
          Markdown is supported. Code fences with <code>```sql</code> render
          with PostgreSQL syntax highlighting in the learner&apos;s theory
          panel.
        </p>
      </header>

      <div
        className="md-editor-toolbar animate-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        <div
          className="md-editor-modes"
          role="tablist"
          aria-label="Editor mode"
        >
          {(
            [
              { v: "write", l: "Write" },
              { v: "split", l: "Split" },
              { v: "preview", l: "Preview" },
            ] as const
          ).map((m) => (
            <button
              key={m.v}
              type="button"
              role="tab"
              aria-selected={splitMode === m.v}
              className="md-editor-mode"
              data-active={splitMode === m.v ? "true" : "false"}
              onClick={() => setSplitMode(m.v)}
            >
              {m.l}
            </button>
          ))}
        </div>

        <div className="md-editor-status">
          <span className="md-editor-status__pill">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span
            className="md-editor-status__pill"
            data-tone={dirty ? "warn" : saveStatus === "saved" ? "ok" : "neutral"}
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved ✓"
                : dirty
                  ? "Unsaved changes"
                  : "All saved"}
          </span>
        </div>

        <div className="md-editor-actions">
          {lesson ? (
            <Link
              href={`/admin/chapters/${lesson.chapter}/lessons`}
              className="admin-secondary-btn admin-secondary-btn--sm"
            >
              Done
            </Link>
          ) : null}
          <button
            type="button"
            className="admin-primary-btn admin-primary-btn--sm"
            onClick={onSave}
            disabled={!dirty || saveStatus === "saving" || !lesson}
          >
            {saveStatus === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="admin-error" role="alert">
          {saveError}
        </div>
      ) : null}

      <section
        className="md-editor animate-fade-up"
        data-mode={splitMode}
        style={{ animationDelay: "150ms" }}
      >
        <div className="md-editor__pane md-editor__pane--source">
          <div className="md-editor__pane-head">
            <span className="md-editor__pane-eyebrow">Source</span>
            <span className="md-editor__pane-hint">Markdown · ⌘S to save</span>
          </div>
          <textarea
            className="md-editor__textarea"
            value={theory}
            onChange={(e) => setTheory(e.target.value)}
            placeholder={
              "## What you'll learn\n\nA short paragraph framing the lesson.\n\n```sql\nSELECT name, price\nFROM products\nWHERE price < 20;\n```\n\n- A bullet outlining the concept\n- Another bullet\n"
            }
            spellCheck
            aria-label="Lesson theory markdown source"
          />
        </div>

        <div className="md-editor__pane md-editor__pane--preview">
          <div className="md-editor__pane-head">
            <span className="md-editor__pane-eyebrow">Preview</span>
            <span className="md-editor__pane-hint">
              How the learner sees it
            </span>
          </div>
          <div className="md-editor__preview">
            {theory.trim() ? (
              <div
                className="md-prose"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <p className="md-editor__preview-empty">
                Start typing to see the preview.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
