"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  fetchAdminUsers,
  patchAdminUser,
  type AdminUser,
  type AdminUserListResponse,
} from "@/lib/admin";
import { fullName, initials } from "@/lib/gamification";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 25;

type ActiveFilter = "all" | "active" | "inactive";
type RoleFilter = "all" | "learner" | "admin";

export default function AdminUsersPage() {
  const me = useAuthStore((state) => state.user);
  const [data, setData] = useState<AdminUserListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<AdminUser | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search input.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminUsers({
          search: debouncedSearch,
          is_active:
            activeFilter === "active"
              ? "true"
              : activeFilter === "inactive"
                ? "false"
                : "",
          role: roleFilter === "all" ? "" : roleFilter,
          page,
          page_size: PAGE_SIZE,
        });
        if (!active) return;
        setData(res);
      } catch {
        if (!active) return;
        setError("We couldn't load users. Refresh to try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedSearch, activeFilter, roleFilter, page]);

  const users = data?.results ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  async function onConfirm() {
    if (!confirmTarget) return;
    setConfirmPending(true);
    setActionError(null);
    try {
      const updated = await patchAdminUser(confirmTarget.id, {
        is_active: !confirmTarget.is_active,
      });
      // Patch the row in place so we don't lose the user's filter state.
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((u) =>
                u.id === updated.id ? updated : u,
              ),
            }
          : prev,
      );
      setConfirmTarget(null);
    } catch {
      setActionError(
        "We couldn't update that user. They might be offline — try again.",
      );
    } finally {
      setConfirmPending(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Users
        </p>
        <h1 className="admin-page__title">The roster.</h1>
        <p className="admin-page__sub">
          Search by name or email, narrow by status, and deactivate accounts
          that need to step away.
        </p>
      </header>

      <div className="admin-toolbar animate-fade-up" style={{ animationDelay: "100ms" }}>
        <label className="admin-search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          {search ? (
            <button
              type="button"
              className="admin-search__clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </label>

        <FilterChipGroup
          label="Status"
          value={activeFilter}
          onChange={(v) => {
            setActiveFilter(v as ActiveFilter);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Deactivated" },
          ]}
        />

        <FilterChipGroup
          label="Role"
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v as RoleFilter);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "learner", label: "Learner" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </div>

      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="admin-error" role="alert">
          {actionError}
        </div>
      ) : null}

      <section
        className="admin-table-frame animate-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last active</th>
              <th className="num">Level</th>
              <th className="num">XP</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <UsersSkeleton rows={6} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-empty-row">
                  <p className="admin-empty-title">No users match those filters.</p>
                  <p className="admin-empty-body">
                    Loosen your search or reset the status & role filters.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isMe={me?.id === user.id}
                  onToggle={() => setConfirmTarget(user)}
                />
              ))
            )}
          </tbody>
        </table>

        <div className="admin-pager">
          <span className="admin-pager__count">
            {data
              ? `${(page - 1) * PAGE_SIZE + Math.min(users.length, 1)}–${
                  (page - 1) * PAGE_SIZE + users.length
                } of ${data.count.toLocaleString()}`
              : "—"}
          </span>
          <div className="admin-pager__controls">
            <button
              type="button"
              className="admin-pager-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span className="admin-pager__label">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-pager-btn"
              disabled={!data || !data.next || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={
          confirmTarget?.is_active
            ? `Deactivate ${fullName(
                confirmTarget.first_name,
                confirmTarget.last_name,
              )}?`
            : `Reactivate ${
                confirmTarget
                  ? fullName(confirmTarget.first_name, confirmTarget.last_name)
                  : ""
              }?`
        }
        body={
          confirmTarget?.is_active ? (
            <>
              <p>
                <strong>{confirmTarget.email}</strong> won&apos;t be able to
                sign in until you reactivate them. Their progress, badges, and
                submissions stay intact.
              </p>
            </>
          ) : (
            <p>
              {confirmTarget?.email} will be able to sign in again. Their
              previous progress is unchanged.
            </p>
          )
        }
        confirmLabel={confirmTarget?.is_active ? "Deactivate" : "Reactivate"}
        variant={confirmTarget?.is_active ? "danger" : "default"}
        pending={confirmPending}
        onConfirm={onConfirm}
        onCancel={() => {
          if (!confirmPending) setConfirmTarget(null);
        }}
      />
    </div>
  );
}

function UserRow({
  user,
  isMe,
  onToggle,
}: {
  user: AdminUser;
  isMe: boolean;
  onToggle: () => void;
}) {
  const name = fullName(user.first_name, user.last_name);
  return (
    <tr className="admin-user-row" data-deactivated={!user.is_active}>
      <td>
        <div className="admin-user-cell">
          <span className="admin-user-avatar" aria-hidden="true">
            {initials(user.first_name, user.last_name)}
          </span>
          <div className="admin-user-cell__text">
            <span className="admin-user-cell__name">
              {name}
              {isMe ? <span className="admin-user-cell__you">You</span> : null}
            </span>
            <span className="admin-user-cell__email">{user.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="admin-pill" data-tone={user.role}>
          {user.role === "admin" ? "Admin" : "Learner"}
        </span>
      </td>
      <td className="admin-user-cell__date">{formatDate(user.created_at)}</td>
      <td className="admin-user-cell__date">
        {user.last_activity_date
          ? formatDate(user.last_activity_date)
          : <span className="admin-user-cell__muted">Never</span>}
      </td>
      <td className="num">{user.level}</td>
      <td className="num">{user.xp.toLocaleString()}</td>
      <td>
        <span
          className="admin-status"
          data-active={user.is_active ? "true" : "false"}
        >
          <span className="admin-status__dot" aria-hidden="true" />
          {user.is_active ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="admin-user-cell__actions">
        <button
          type="button"
          className="admin-action"
          data-tone={user.is_active ? "danger" : "default"}
          onClick={onToggle}
          disabled={isMe}
          title={isMe ? "You can't deactivate yourself" : undefined}
        >
          {user.is_active ? "Deactivate" : "Reactivate"}
        </button>
      </td>
    </tr>
  );
}

function FilterChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="admin-chips" role="group" aria-label={label}>
      <span className="admin-chips__label">{label}</span>
      <div className="admin-chips__group">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="admin-chip"
            data-active={value === opt.value ? "true" : "false"}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UsersSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="admin-user-row">
          <td>
            <div className="admin-user-cell">
              <span
                className="skel"
                style={{ width: "2.4rem", height: "2.4rem", borderRadius: "999px" }}
              />
              <div style={{ flex: 1 }}>
                <span
                  className="skel"
                  style={{ width: "8rem", height: "0.85rem", display: "block" }}
                />
                <span
                  className="skel"
                  style={{
                    width: "11rem",
                    height: "0.7rem",
                    marginTop: "0.4rem",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </td>
          <td>
            <span className="skel" style={{ width: "4rem", height: "1.4rem" }} />
          </td>
          <td>
            <span className="skel" style={{ width: "5rem", height: "0.7rem" }} />
          </td>
          <td>
            <span className="skel" style={{ width: "5rem", height: "0.7rem" }} />
          </td>
          <td className="num">
            <span className="skel" style={{ width: "1.5rem", height: "0.85rem" }} />
          </td>
          <td className="num">
            <span className="skel" style={{ width: "3rem", height: "0.85rem" }} />
          </td>
          <td>
            <span className="skel" style={{ width: "5rem", height: "1.4rem" }} />
          </td>
          <td>
            <span className="skel" style={{ width: "5.5rem", height: "1.8rem" }} />
          </td>
        </tr>
      ))}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
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
