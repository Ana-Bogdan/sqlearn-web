"use client";

import { useEffect, useState } from "react";
import {
  AdminField,
  AdminTextInput,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createAdminDataset,
  deleteAdminDataset,
  fetchAdminDatasets,
  updateAdminDataset,
  type AdminDataset,
} from "@/lib/admin-content";

interface CreateState {
  name: string;
  description: string;
  schema_sql: string;
  is_playground: boolean;
  pending: boolean;
  error: string | null;
}

interface EditState {
  id: number;
  name: string;
  description: string;
  schema_sql: string;
  pending: boolean;
  error: string | null;
}

const SAMPLE_SCHEMA = `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

INSERT INTO products (id, name, price) VALUES
  (1, 'Notebook', 4.99),
  (2, 'Pen set',  9.50),
  (3, 'Backpack', 39.00);
`;

export default function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState<AdminDataset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<CreateState | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminDataset | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminDatasets();
        if (!active) return;
        setDatasets(data);
      } catch {
        if (!active) return;
        setError("We couldn't load the datasets. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function startCreate() {
    setCreating({
      name: "",
      description: "",
      schema_sql: SAMPLE_SCHEMA,
      is_playground: false,
      pending: false,
      error: null,
    });
  }

  async function onCreate() {
    if (!creating) return;
    if (!creating.name.trim()) {
      setCreating({ ...creating, error: "A name is required." });
      return;
    }
    if (!creating.schema_sql.trim()) {
      setCreating({ ...creating, error: "Schema SQL is required." });
      return;
    }
    setCreating({ ...creating, pending: true, error: null });
    try {
      const created = await createAdminDataset({
        name: creating.name.trim(),
        description: creating.description.trim(),
        schema_sql: creating.schema_sql,
        is_playground: creating.is_playground,
      });
      setDatasets((prev) =>
        prev
          ? [...prev, created].sort((a, b) =>
              a.name.localeCompare(b.name),
            )
          : [created],
      );
      setCreating(null);
    } catch {
      setCreating((prev) =>
        prev ? { ...prev, pending: false, error: "Couldn't save — try again." } : prev,
      );
    }
  }

  function startEdit(d: AdminDataset) {
    setEditing({
      id: d.id,
      name: d.name,
      description: d.description,
      schema_sql: d.schema_sql,
      pending: false,
      error: null,
    });
  }

  async function onSaveEdit() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setEditing({ ...editing, error: "A name is required." });
      return;
    }
    if (!editing.schema_sql.trim()) {
      setEditing({ ...editing, error: "Schema SQL is required." });
      return;
    }
    setEditing({ ...editing, pending: true, error: null });
    try {
      const updated = await updateAdminDataset(editing.id, {
        name: editing.name.trim(),
        description: editing.description.trim(),
        schema_sql: editing.schema_sql,
      });
      setDatasets((prev) =>
        prev
          ? prev
              .map((d) => (d.id === updated.id ? updated : d))
              .sort((a, b) => a.name.localeCompare(b.name))
          : prev,
      );
      setEditing(null);
    } catch {
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              pending: false,
              error: "Couldn't save — check the SQL syntax and try again.",
            }
          : prev,
      );
    }
  }

  async function onConfirmDelete() {
    if (!confirmTarget) return;
    setConfirmPending(true);
    try {
      await deleteAdminDataset(confirmTarget.id);
      setDatasets((prev) =>
        prev ? prev.filter((d) => d.id !== confirmTarget.id) : prev,
      );
      setConfirmTarget(null);
    } catch (err) {
      const blocked =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status === 409
          : false;
      setError(
        blocked
          ? "This dataset is still linked to one or more exercises. Unlink it first."
          : "Couldn't delete — try again.",
      );
    } finally {
      setConfirmPending(false);
      setConfirmTarget(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Datasets
        </p>
        <h1 className="admin-page__title">Sandbox schemas.</h1>
        <p className="admin-page__sub">
          Each dataset is a self-contained set of <code>CREATE TABLE</code> and
          <code> INSERT</code> statements. Exercises link to one or more
          datasets so the learner queries against the same tables you tested
          your solution against.
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
            onClick={startCreate}
          >
            <PlusIcon /> New dataset
          </button>
        )}
        <p className="admin-meta">
          {datasets
            ? `${datasets.length} dataset${datasets.length === 1 ? "" : "s"}`
            : "—"}
        </p>
      </div>

      {creating ? (
        <section
          className="admin-create-card animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="admin-create-card__head">
            <span className="admin-create-card__eyebrow">New dataset</span>
            <p className="admin-create-card__title">
              Define the tables and seed rows the learner will query.
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
              <AdminField label="Name" htmlFor="ds-create-name">
                <AdminTextInput
                  id="ds-create-name"
                  value={creating.name}
                  onChange={(e) =>
                    setCreating({
                      ...creating,
                      name: e.target.value,
                      error: null,
                    })
                  }
                  placeholder="e.g. products_v1"
                  maxLength={120}
                  autoFocus
                />
              </AdminField>
              <AdminField label="Type" width="narrow">
                <label className="admin-checkline">
                  <input
                    type="checkbox"
                    checked={creating.is_playground}
                    onChange={(e) =>
                      setCreating({
                        ...creating,
                        is_playground: e.target.checked,
                      })
                    }
                  />
                  <span>Playground</span>
                </label>
              </AdminField>
            </div>

            <AdminField
              label="Description"
              htmlFor="ds-create-desc"
              hint="Internal note — what tables this contains and what topics it suits."
            >
              <AdminTextarea
                id="ds-create-desc"
                value={creating.description}
                onChange={(e) =>
                  setCreating({
                    ...creating,
                    description: e.target.value,
                    error: null,
                  })
                }
                rows={2}
                maxLength={300}
              />
            </AdminField>

            <AdminField
              label="Schema SQL"
              htmlFor="ds-create-sql"
              hint="CREATE TABLE statements followed by INSERT statements. Run inside a per-user schema."
            >
              <AdminTextarea
                id="ds-create-sql"
                className="admin-input--mono admin-input--sql"
                value={creating.schema_sql}
                onChange={(e) =>
                  setCreating({
                    ...creating,
                    schema_sql: e.target.value,
                    error: null,
                  })
                }
                rows={14}
                spellCheck={false}
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
              >
                {creating.pending ? "Creating…" : "Create dataset"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {!datasets && !error ? (
        <DatasetSkeleton />
      ) : datasets && datasets.length === 0 ? (
        <section className="admin-empty-state animate-fade-up">
          <p className="admin-empty-state__eyebrow">No datasets</p>
          <h2 className="admin-empty-state__title">
            Datasets are the tables learners query.
          </h2>
          <p className="admin-empty-state__body">
            You can&apos;t author an exercise until at least one dataset exists.
            Start with a small one — three columns, six rows — and grow from
            there.
          </p>
          <button
            type="button"
            className="admin-primary-btn"
            onClick={startCreate}
          >
            <PlusIcon /> Create first dataset
          </button>
        </section>
      ) : (
        <ul
          className="dataset-list animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          {datasets!.map((d) => {
            const isEditing = editing?.id === d.id;
            return (
              <li key={d.id} className="dataset-card">
                {isEditing && editing ? (
                  <form
                    className="dataset-card__edit"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveEdit();
                    }}
                  >
                    <div className="admin-form__row">
                      <AdminField label="Name">
                        <AdminTextInput
                          value={editing.name}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              name: e.target.value,
                              error: null,
                            })
                          }
                          maxLength={120}
                        />
                      </AdminField>
                    </div>
                    <AdminField label="Description">
                      <AdminTextarea
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                            error: null,
                          })
                        }
                        rows={2}
                        maxLength={300}
                      />
                    </AdminField>
                    <AdminField label="Schema SQL">
                      <AdminTextarea
                        className="admin-input--mono admin-input--sql"
                        value={editing.schema_sql}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            schema_sql: e.target.value,
                            error: null,
                          })
                        }
                        rows={14}
                        spellCheck={false}
                      />
                    </AdminField>
                    {editing.error ? (
                      <p className="admin-field__error" role="alert">
                        {editing.error}
                      </p>
                    ) : null}
                    <div className="admin-form__actions">
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        onClick={() => setEditing(null)}
                        disabled={editing.pending}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="admin-primary-btn"
                        disabled={editing.pending}
                      >
                        {editing.pending ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="dataset-card__header">
                      <div>
                        <h3 className="dataset-card__name">
                          {d.name}
                          {d.is_playground ? (
                            <span className="dataset-picker__tag">Playground</span>
                          ) : null}
                        </h3>
                        <p className="dataset-card__meta">
                          {d.exercise_count} linked exercises ·{" "}
                          <time dateTime={d.created_at}>
                            created {formatDate(d.created_at)}
                          </time>
                        </p>
                      </div>
                      <div className="dataset-card__actions">
                        <button
                          type="button"
                          className="admin-action"
                          onClick={() => startEdit(d)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-action"
                          data-tone="danger"
                          onClick={() => setConfirmTarget(d)}
                          disabled={d.exercise_count > 0}
                          title={
                            d.exercise_count > 0
                              ? "Unlink from all exercises before deleting."
                              : undefined
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {d.description ? (
                      <p className="dataset-card__desc">{d.description}</p>
                    ) : null}
                    <details className="dataset-card__sql">
                      <summary>Inspect schema SQL</summary>
                      <pre className="dataset-card__pre">
                        <code>{d.schema_sql}</code>
                      </pre>
                    </details>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title={`Delete "${confirmTarget?.name ?? ""}"?`}
        body={
          <p>
            This dataset will be removed permanently. It can&apos;t be deleted
            while exercises still link to it.
          </p>
        }
        confirmLabel="Delete dataset"
        variant="danger"
        pending={confirmPending}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          if (!confirmPending) setConfirmTarget(null);
        }}
      />
    </div>
  );
}

function DatasetSkeleton() {
  return (
    <ul className="dataset-list" aria-hidden="true">
      {[0, 1].map((i) => (
        <li key={i} className="dataset-card">
          <span
            className="skel"
            style={{ width: "12rem", height: "1.1rem", display: "block" }}
          />
          <span
            className="skel"
            style={{
              width: "20rem",
              height: "0.7rem",
              display: "block",
              marginTop: "0.5rem",
            }}
          />
          <span
            className="skel"
            style={{
              width: "100%",
              height: "5rem",
              display: "block",
              marginTop: "1rem",
              borderRadius: "0.6rem",
            }}
          />
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
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
