"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: Array<{
  href: string;
  label: string;
  hint: string;
  match: (p: string) => boolean;
}> = [
  {
    href: "/admin",
    label: "Overview",
    hint: "Activity & content health",
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/chapters",
    label: "Curriculum",
    hint: "Chapters, lessons, exercises",
    match: (p) =>
      p.startsWith("/admin/chapters") ||
      p.startsWith("/admin/lessons") ||
      p.startsWith("/admin/exercises"),
  },
  {
    href: "/admin/datasets",
    label: "Datasets",
    hint: "Sandbox schemas",
    match: (p) => p.startsWith("/admin/datasets"),
  },
  {
    href: "/admin/users",
    label: "Users",
    hint: "Roster & access",
    match: (p) => p.startsWith("/admin/users"),
  },
  {
    href: "/admin/badges",
    label: "Badges",
    hint: "Display copy & icons",
    match: (p) => p.startsWith("/admin/badges"),
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar__header">
          <span className="admin-sidebar__eyebrow">
            <span className="admin-sidebar__eyebrow-mark" aria-hidden="true" />
            Admin Console
          </span>
          <p className="admin-sidebar__title">Instructor desk</p>
          <p className="admin-sidebar__sub">
            Curate the curriculum, audit activity, keep the roster healthy.
          </p>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="admin-sidebar__link"
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
              >
                <span className="admin-sidebar__link-dot" aria-hidden="true" />
                <span className="admin-sidebar__link-text">
                  <span className="admin-sidebar__link-label">{item.label}</span>
                  <span className="admin-sidebar__link-hint">{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__footer-eyebrow">Tip</p>
          <p className="admin-sidebar__footer-body">
            Author a draft, link a dataset, then click <em>Test solution</em>{" "}
            to capture the expected result.
          </p>
        </div>
      </aside>

      <div className="admin-canvas">{children}</div>
    </div>
  );
}
