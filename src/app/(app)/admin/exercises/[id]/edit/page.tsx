"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminField,
  AdminNumberInput,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ResultTable } from "@/components/admin/result-table";
import { SqlEditor } from "@/components/learn/sql-editor";
import { renderTheoryMarkdown } from "@/lib/markdown";
import {
  deleteAdminExercise,
  fetchAdminDatasets,
  fetchAdminExercise,
  testAdminExerciseSolution,
  updateAdminExercise,
  type AdminDataset,
  type AdminExercise,
  type AdminExerciseHint,
  type AdminExpectedResult,
  type TestSolutionResult,
} from "@/lib/admin-content";
import type { Difficulty } from "@/lib/curriculum";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditState {
  title: string;
  instructions: string;
  difficulty: Difficulty;
  starter_code: string;
  solution_query: string;
  is_published: boolean;
  is_active: boolean;
  is_chapter_quiz: boolean;
  order: number;
  hints: AdminExerciseHint[];
  selected_dataset_ids: number[];
}

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function AdminExerciseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: exerciseId } = use(params);
  const router = useRouter();
  const [exercise, setExercise] = useState<AdminExercise | null>(null);
  const [datasets, setDatasets] = useState<AdminDataset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [original, setOriginal] = useState<EditState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestSolutionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [showInstrPreview, setShowInstrPreview] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ex, ds] = await Promise.all([
          fetchAdminExercise(exerciseId),
          fetchAdminDatasets(),
        ]);
        if (!active) return;
        setExercise(ex);
        setDatasets(ds);
        const initial = exerciseToEditState(ex);
        setEdit(initial);
        setOriginal(initial);
      } catch {
        if (!active) return;
        setError("We couldn't load this exercise. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, [exerciseId]);

  const dirty = useMemo(() => {
    if (!edit || !original) return false;
    return JSON.stringify(edit) !== JSON.stringify(original);
  }, [edit, original]);

  const expectedResult = exercise?.expected_result as
    | AdminExpectedResult
    | undefined;
  const hasExpected =
    !!expectedResult &&
    Array.isArray(expectedResult.columns) &&
    expectedResult.columns.length > 0;

  const canTest =
    !!edit &&
    !!exercise &&
    edit.solution_query.trim().length > 0 &&
    edit.selected_dataset_ids.length > 0;

  function patch(partial: Partial<EditState>) {
    setEdit((prev) => (prev ? { ...prev, ...partial } : prev));
    setSaveError(null);
  }

  const persistEdit = useCallback(async (): Promise<AdminExercise | null> => {
    if (!edit || !exercise || !original) return null;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const datasetsChanged =
        JSON.stringify([...edit.selected_dataset_ids].sort()) !==
        JSON.stringify([...original.selected_dataset_ids].sort());
      const updated = await updateAdminExercise(exercise.id, {
        title: edit.title,
        instructions: edit.instructions,
        difficulty: edit.difficulty,
        starter_code: edit.starter_code,
        solution_query: edit.solution_query,
        is_published: edit.is_published,
        is_active: edit.is_active,
        is_chapter_quiz: edit.is_chapter_quiz,
        order: edit.order,
        hints: edit.hints.map((h, i) => ({
          order: i + 1,
          hint_text: h.hint_text,
        })),
        ...(datasetsChanged
          ? { sandbox_schema_ids: edit.selected_dataset_ids }
          : {}),
      });
      setExercise(updated);
      const next = exerciseToEditState(updated);
      setEdit(next);
      setOriginal(next);
      setSaveStatus("saved");
      window.setTimeout(() => {
        setSaveStatus((s) => (s === "saved" ? "idle" : s));
      }, 1800);
      return updated;
    } catch {
      setSaveStatus("error");
      setSaveError(
        "Couldn't save — check the fields below and try again.",
      );
      return null;
    }
  }, [edit, exercise, original]);

  const onSave = useCallback(async () => {
    if (!edit) return;
    if (!edit.title.trim()) {
      setSaveError("A title is required.");
      setSaveStatus("error");
      return;
    }
    await persistEdit();
  }, [edit, persistEdit]);

  async function onTestSolution() {
    if (!exercise || !edit) return;
    setTestRunning(true);
    setTestError(null);
    setTestResult(null);

    // Persist any pending changes first so the backend tests against the
    // current solution + dataset selection.
    if (dirty) {
      const ok = await persistEdit();
      if (!ok) {
        setTestRunning(false);
        return;
      }
    }

    try {
      const res = await testAdminExerciseSolution(exercise.id);
      setTestResult(res);
    } catch (err) {
      const fallback = "The solution couldn't be tested.";
      let message = fallback;
      if (err && typeof err === "object" && "body" in err) {
        const body = (err as { body: unknown }).body;
        if (
          body &&
          typeof body === "object" &&
          "detail" in body &&
          typeof (body as { detail?: unknown }).detail === "string"
        ) {
          message = (body as { detail: string }).detail;
          if (
            "error" in body &&
            typeof (body as { error?: unknown }).error === "string"
          ) {
            message += ` ${(body as { error: string }).error}`;
          }
        }
      }
      setTestError(message);
    } finally {
      setTestRunning(false);
    }
  }

  async function onSaveAsExpected() {
    if (!exercise || !testResult) return;
    setSaveStatus("saving");
    try {
      const updated = await updateAdminExercise(exercise.id, {
        expected_result: {
          columns: testResult.columns,
          rows: testResult.rows,
        },
      });
      setExercise(updated);
      setSaveStatus("saved");
      window.setTimeout(() => {
        setSaveStatus((s) => (s === "saved" ? "idle" : s));
      }, 1800);
    } catch {
      setSaveStatus("error");
      setSaveError("Couldn't save expected result — try again.");
    }
  }

  async function onDelete() {
    if (!exercise) return;
    setConfirmPending(true);
    try {
      await deleteAdminExercise(exercise.id);
      const target = exercise.lesson
        ? `/admin/chapters/${exercise.chapter}/lessons`
        : "/admin/chapters";
      router.push(target);
    } catch {
      setConfirmPending(false);
      setSaveError("Couldn't archive — try again.");
    }
  }

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

  if (error && !exercise) {
    return (
      <div className="admin-page">
        <div className="admin-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!exercise || !edit) {
    return (
      <div className="admin-page">
        <ExerciseEditorSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--editor">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Exercise
          {exercise.lesson_title ? (
            <Link
              href={`/admin/chapters/${exercise.chapter}/lessons`}
              className="admin-eyebrow__crumb"
            >
              ← {exercise.chapter_title} · {exercise.lesson_title}
            </Link>
          ) : (
            <Link
              href="/admin/chapters"
              className="admin-eyebrow__crumb"
            >
              ← {exercise.chapter_title} (chapter quiz)
            </Link>
          )}
        </p>
        <input
          type="text"
          className="admin-title-input"
          value={edit.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Exercise title"
          maxLength={200}
          aria-label="Exercise title"
        />
        <div className="admin-page__pillrow">
          <span
            className="admin-page__pill"
            data-tone={edit.is_published ? "ok" : "neutral"}
          >
            {edit.is_published ? "● Published" : "○ Draft"}
          </span>
          <span
            className="admin-page__pill"
            data-tone={hasExpected ? "ok" : "warn"}
          >
            {hasExpected
              ? "Expected result set"
              : "Expected result not yet set"}
          </span>
          <span className="admin-page__pill">
            {edit.hints.length} {edit.hints.length === 1 ? "hint" : "hints"}
          </span>
        </div>
      </header>

      <div
        className="admin-editor-toolbar animate-fade-up"
        style={{ animationDelay: "100ms" }}
      >
        <span
          className="md-editor-status__pill"
          data-tone={
            dirty
              ? "warn"
              : saveStatus === "saved"
                ? "ok"
                : saveStatus === "error"
                  ? "danger"
                  : "neutral"
          }
        >
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "saved"
              ? "Saved ✓"
              : saveStatus === "error"
                ? "Save failed"
                : dirty
                  ? "Unsaved changes"
                  : "All saved"}
        </span>
        <div className="admin-editor-toolbar__spacer" />
        <button
          type="button"
          className="admin-secondary-btn admin-secondary-btn--sm"
          onClick={() => setConfirmDelete(true)}
        >
          Archive
        </button>
        <button
          type="button"
          className="admin-secondary-btn admin-secondary-btn--sm"
          onClick={() => patch({ is_published: !edit.is_published })}
        >
          {edit.is_published ? "Unpublish" : "Mark to publish"}
        </button>
        <button
          type="button"
          className="admin-primary-btn admin-primary-btn--sm"
          onClick={onSave}
          disabled={!dirty || saveStatus === "saving"}
        >
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </button>
      </div>

      {saveError ? (
        <div className="admin-error" role="alert">
          {saveError}
        </div>
      ) : null}

      <div className="exercise-editor animate-fade-up">
        <section className="exercise-editor__section">
          <SectionHeader
            eyebrow="Brief"
            title="What the learner sees"
            caption="Instructions, difficulty, and the starter SQL the learner opens with."
          />

          <div className="exercise-editor__panel">
            <AdminField
              label="Instructions"
              hint="Markdown supported. Keep it short — 2 to 4 sentences plus a clear goal."
            >
              <div className="md-mini">
                <div className="md-mini__tabs">
                  <button
                    type="button"
                    className="md-mini__tab"
                    data-active={!showInstrPreview ? "true" : "false"}
                    onClick={() => setShowInstrPreview(false)}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    className="md-mini__tab"
                    data-active={showInstrPreview ? "true" : "false"}
                    onClick={() => setShowInstrPreview(true)}
                  >
                    Preview
                  </button>
                </div>
                {showInstrPreview ? (
                  <div className="md-mini__preview">
                    {edit.instructions.trim() ? (
                      <div
                        className="md-prose"
                        dangerouslySetInnerHTML={{
                          __html: renderTheoryMarkdown(edit.instructions),
                        }}
                      />
                    ) : (
                      <p className="md-editor__preview-empty">
                        Nothing to preview yet.
                      </p>
                    )}
                  </div>
                ) : (
                  <AdminTextarea
                    value={edit.instructions}
                    onChange={(e) => patch({ instructions: e.target.value })}
                    rows={6}
                    placeholder={
                      "Write a query that returns the names and prices of products under $20, ordered by price.\n\nReturn columns: `name`, `price`."
                    }
                  />
                )}
              </div>
            </AdminField>

            <div className="admin-form__row">
              <AdminField label="Difficulty">
                <div className="segmented" role="radiogroup">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={edit.difficulty === opt.value}
                      className="segmented__option"
                      data-active={edit.difficulty === opt.value ? "true" : "false"}
                      onClick={() => patch({ difficulty: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </AdminField>

              <AdminField label="Order" width="narrow">
                <AdminNumberInput
                  value={edit.order}
                  onChange={(e) =>
                    patch({ order: Number(e.target.value) || 0 })
                  }
                  min={1}
                />
              </AdminField>
            </div>

            <AdminField
              label="Starter code"
              hint="Optional — pre-fills the editor when the learner opens this exercise."
            >
              <AdminTextarea
                className="admin-input--mono"
                value={edit.starter_code}
                onChange={(e) => patch({ starter_code: e.target.value })}
                rows={3}
                placeholder={"-- Your query goes here\nSELECT"}
                spellCheck={false}
              />
            </AdminField>

            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={edit.is_chapter_quiz}
                onChange={(e) =>
                  patch({ is_chapter_quiz: e.target.checked })
                }
              />
              <span className="admin-toggle__track" aria-hidden="true">
                <span className="admin-toggle__thumb" />
              </span>
              <span className="admin-toggle__text">
                <span className="admin-toggle__label">Chapter quiz</span>
                <span className="admin-toggle__hint">
                  Mark as the capstone exercise of its chapter.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="exercise-editor__section">
          <SectionHeader
            eyebrow="Dataset"
            title="Tables the learner queries"
            caption="Pick one or more sandbox schemas. Their tables are loaded into the learner's per-user schema before each attempt."
          />
          <DatasetPicker
            datasets={datasets ?? []}
            selectedIds={edit.selected_dataset_ids}
            onChange={(ids) => patch({ selected_dataset_ids: ids })}
          />
        </section>

        <section className="exercise-editor__section">
          <SectionHeader
            eyebrow="Solution"
            title="The reference query"
            caption="Used to validate learner submissions. The Test Solution button runs this against your selected dataset and returns a result set you can save as the expected output."
          />

          <div className="exercise-editor__solution">
            <div className="exercise-editor__sql">
              <SqlEditor
                value={edit.solution_query}
                onChange={(v) => patch({ solution_query: v })}
                placeholder={
                  "SELECT name, price\nFROM products\nWHERE price < 20\nORDER BY price;"
                }
                ariaLabel="Solution SQL"
              />
            </div>

            <div className="exercise-editor__solution-actions">
              <button
                type="button"
                className="admin-primary-btn"
                disabled={!canTest || testRunning || saveStatus === "saving"}
                onClick={onTestSolution}
                title={
                  !canTest
                    ? "Add a dataset and write a solution query first."
                    : "Save changes and run the solution."
                }
              >
                {testRunning
                  ? "Testing…"
                  : dirty
                    ? "Save & test solution"
                    : "Test solution"}
              </button>
              {hasExpected ? (
                <span className="exercise-editor__expected-state">
                  Expected result is set ({expectedResult?.columns?.length ?? 0}{" "}
                  cols · {expectedResult?.rows?.length ?? 0} rows)
                </span>
              ) : (
                <span className="exercise-editor__expected-state exercise-editor__expected-state--warn">
                  Expected result not set — run the solution and save the
                  output.
                </span>
              )}
            </div>

            {testError ? (
              <div className="exercise-editor__test-error" role="alert">
                {testError}
              </div>
            ) : null}

            {testResult ? (
              <div className="exercise-editor__test-result">
                <ResultTable
                  columns={testResult.columns}
                  rows={testResult.rows}
                  caption="Output of your solution against the selected dataset."
                />
                <div className="exercise-editor__solution-actions">
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={onSaveAsExpected}
                    disabled={saveStatus === "saving"}
                  >
                    Use this as the expected result
                  </button>
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => setTestResult(null)}
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : null}

            {hasExpected && !testResult ? (
              <details className="exercise-editor__expected-peek">
                <summary>Peek at the saved expected result</summary>
                <ResultTable
                  columns={expectedResult?.columns ?? []}
                  rows={expectedResult?.rows ?? []}
                />
              </details>
            ) : null}
          </div>
        </section>

        <section className="exercise-editor__section">
          <SectionHeader
            eyebrow="Hints"
            title="Progressive nudges"
            caption="Up to 3 static hints, revealed one at a time. The first should orient; the third can be very close to the solution."
          />
          <HintsEditor
            hints={edit.hints}
            onChange={(hints) => patch({ hints })}
          />
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Archive "${exercise.title}"?`}
        body={
          <p>
            Archived exercises are hidden from learners. Existing submissions
            and progress are preserved — you can restore by toggling{" "}
            <code>is_active</code> in the admin API.
          </p>
        }
        confirmLabel="Archive exercise"
        variant="danger"
        pending={confirmPending}
        onConfirm={onDelete}
        onCancel={() => {
          if (!confirmPending) setConfirmDelete(false);
        }}
      />
    </div>
  );
}

function exerciseToEditState(ex: AdminExercise): EditState {
  return {
    title: ex.title,
    instructions: ex.instructions,
    difficulty: ex.difficulty,
    starter_code: ex.starter_code,
    solution_query: ex.solution_query,
    is_published: ex.is_published,
    is_active: ex.is_active,
    is_chapter_quiz: ex.is_chapter_quiz,
    order: ex.order,
    hints: ex.hints
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((h) => ({ order: h.order, hint_text: h.hint_text })),
    selected_dataset_ids: ex.datasets.map((d) => d.sandbox_schema),
  };
}

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption: string;
}) {
  return (
    <header className="exercise-editor__section-header">
      <span className="exercise-editor__eyebrow">{eyebrow}</span>
      <h2 className="exercise-editor__section-title">{title}</h2>
      <p className="exercise-editor__section-caption">{caption}</p>
    </header>
  );
}

function DatasetPicker({
  datasets,
  selectedIds,
  onChange,
}: {
  datasets: AdminDataset[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  if (datasets.length === 0) {
    return (
      <p className="exercise-editor__hint">
        No datasets exist yet.{" "}
        <Link href="/admin/datasets" className="admin-text-link">
          Create one →
        </Link>
      </p>
    );
  }

  function toggle(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <ul className="dataset-picker">
      {datasets.map((d) => {
        const checked = selectedIds.includes(d.id);
        return (
          <li key={d.id}>
            <label
              className="dataset-picker__item"
              data-checked={checked ? "true" : "false"}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(d.id)}
              />
              <span className="dataset-picker__check" aria-hidden="true">
                <CheckIcon />
              </span>
              <span className="dataset-picker__text">
                <span className="dataset-picker__name">
                  {d.name}
                  {d.is_playground ? (
                    <span className="dataset-picker__tag">Playground</span>
                  ) : null}
                </span>
                {d.description ? (
                  <span className="dataset-picker__desc">{d.description}</span>
                ) : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function HintsEditor({
  hints,
  onChange,
}: {
  hints: AdminExerciseHint[];
  onChange: (hints: AdminExerciseHint[]) => void;
}) {
  function update(index: number, text: string) {
    onChange(
      hints.map((h, i) => (i === index ? { ...h, hint_text: text } : h)),
    );
  }
  function remove(index: number) {
    onChange(hints.filter((_, i) => i !== index));
  }
  function add() {
    if (hints.length >= 3) return;
    onChange([...hints, { order: hints.length + 1, hint_text: "" }]);
  }
  function move(index: number, dir: -1 | 1) {
    const next = [...hints];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="hints-editor">
      <ol className="hints-editor__list">
        {hints.map((hint, i) => (
          <li key={i} className="hints-editor__item">
            <span className="hints-editor__index">
              Hint {i + 1}
              <span className="hints-editor__index-of">/ {hints.length}</span>
            </span>
            <AdminTextarea
              value={hint.hint_text}
              onChange={(e) => update(i, e.target.value)}
              rows={2}
              placeholder={
                i === 0
                  ? "Orient them — point to the relevant clause without revealing the structure."
                  : i === 1
                    ? "Get more specific — name the operator or function."
                    : "Almost there — show shape without giving the full query."
              }
              maxLength={500}
            />
            <div className="hints-editor__item-actions">
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Move up"
                aria-label="Move hint up"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === hints.length - 1}
                title="Move down"
                aria-label="Move hint down"
              >
                ↓
              </button>
              <button
                type="button"
                className="admin-icon-btn admin-icon-btn--danger"
                onClick={() => remove(i)}
                title="Remove"
                aria-label="Remove hint"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ol>
      {hints.length < 3 ? (
        <button
          type="button"
          className="admin-secondary-btn admin-secondary-btn--sm"
          onClick={add}
        >
          + Add hint
        </button>
      ) : (
        <p className="exercise-editor__hint">
          Three hints is the limit — keep them tight.
        </p>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExerciseEditorSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: "grid", gap: "1.25rem" }}>
      <span className="skel" style={{ width: "10rem", height: "0.75rem" }} />
      <span className="skel" style={{ width: "24rem", height: "2rem" }} />
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="skel"
          style={{ height: "10rem", width: "100%", borderRadius: "1rem" }}
        />
      ))}
    </div>
  );
}
