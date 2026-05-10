"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchAdminStats,
  type AdminStats,
  type AdminStatsExerciseRow,
} from "@/lib/admin";

interface MetricTile {
  eyebrow: string;
  value: number | string;
  label: string;
  caption?: string;
  emphasis?: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminStats();
        if (!active) return;
        setStats(data);
      } catch {
        if (!active) return;
        setError("We couldn't load the admin overview. Refresh to try again.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page__header animate-fade-up">
        <p className="admin-eyebrow">
          <span className="admin-eyebrow__mark" aria-hidden="true" />
          Overview
        </p>
        <h1 className="admin-page__title">Today, at the desk.</h1>
        <p className="admin-page__sub">
          A snapshot of who&apos;s learning, what they&apos;re stuck on, and
          where the curriculum is doing its job.
        </p>
      </header>

      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      {!stats && !error ? (
        <MetricsSkeleton />
      ) : stats ? (
        <>
          <MetricsRow stats={stats} />
          <div
            className="admin-tables-grid animate-fade-up"
            style={{ animationDelay: "260ms" }}
          >
            <ExerciseTable
              eyebrow="Friction"
              title="Where learners struggle"
              caption="Top published exercises by failure rate (with at least one attempt)."
              rows={stats.highest_fail_rate_exercises}
              emptyCopy="No struggle data yet — submissions will populate this list."
              metric="fail_rate"
            />
            <ExerciseTable
              eyebrow="Traffic"
              title="Most attempted"
              caption="Where learners are spending the most submissions right now."
              rows={stats.most_attempted_exercises}
              emptyCopy="No attempts recorded yet."
              metric="attempts"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricsRow({ stats }: { stats: AdminStats }) {
  const tiles: MetricTile[] = [
    {
      eyebrow: "Total",
      value: stats.total_users.toLocaleString(),
      label: "Learners enrolled",
      caption: `${stats.new_registrations_this_week} new this week`,
      emphasis: true,
    },
    {
      eyebrow: "Today",
      value: stats.active_today.toLocaleString(),
      label: "Active right now",
      caption: pctOf(stats.active_today, stats.total_users),
    },
    {
      eyebrow: "Last 7 days",
      value: stats.active_this_week.toLocaleString(),
      label: "Active this week",
      caption: pctOf(stats.active_this_week, stats.total_users),
    },
    {
      eyebrow: "Cohort",
      value: stats.avg_exercises_per_user.toFixed(2),
      label: "Avg. exercises / learner",
      caption: "All-time completions per registered user",
    },
    {
      eyebrow: "New",
      value: stats.new_registrations_this_week.toLocaleString(),
      label: "Registrations this week",
      caption: stats.new_registrations_this_week === 0
        ? "Quiet week — nudge a few invites?"
        : "Fresh accounts in the last 7 days",
    },
  ];

  return (
    <section className="admin-metrics" aria-label="Admin metrics">
      {tiles.map((tile, i) => (
        <article
          key={tile.label}
          className="admin-metric animate-fade-up"
          data-emphasis={tile.emphasis ? "true" : "false"}
          style={{ animationDelay: `${80 + i * 60}ms` }}
        >
          <span className="admin-metric__eyebrow">{tile.eyebrow}</span>
          <span className="admin-metric__value">{tile.value}</span>
          <span className="admin-metric__label">{tile.label}</span>
          {tile.caption ? (
            <span className="admin-metric__caption">{tile.caption}</span>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function ExerciseTable({
  eyebrow,
  title,
  caption,
  rows,
  emptyCopy,
  metric,
}: {
  eyebrow: string;
  title: string;
  caption: string;
  rows: AdminStatsExerciseRow[];
  emptyCopy: string;
  metric: "fail_rate" | "attempts";
}) {
  return (
    <section className="admin-table-card">
      <header className="admin-table-card__header">
        <span className="admin-table-card__eyebrow">{eyebrow}</span>
        <h2 className="admin-table-card__title">{title}</h2>
        <p className="admin-table-card__caption">{caption}</p>
      </header>

      {rows.length === 0 ? (
        <p className="admin-table-card__empty">{emptyCopy}</p>
      ) : (
        <ol className="admin-row-list">
          {rows.map((row, idx) => {
            const failPct = Math.round(row.fail_rate * 100);
            const isFailMetric = metric === "fail_rate";
            return (
              <li key={row.id} className="admin-row">
                <span className="admin-row__index" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="admin-row__body">
                  <Link
                    href={
                      row.lesson_id
                        ? `/learn/${row.chapter_id}/${row.lesson_id}`
                        : `/learn/${row.chapter_id}`
                    }
                    className="admin-row__title"
                  >
                    {row.title}
                  </Link>
                  <span className="admin-row__meta">
                    Chapter {row.chapter_id}
                    {row.lesson_id ? ` · Lesson ${row.lesson_id}` : " · Quiz"}
                  </span>
                </div>
                <div className="admin-row__metrics">
                  <span className="admin-row__metric">
                    <span className="admin-row__metric-num">{row.attempts}</span>
                    <span className="admin-row__metric-label">attempts</span>
                  </span>
                  <span
                    className="admin-row__metric admin-row__metric--accent"
                    data-strong={isFailMetric ? "true" : "false"}
                  >
                    <span className="admin-row__metric-num">{failPct}%</span>
                    <span className="admin-row__metric-label">fail rate</span>
                  </span>
                </div>
                <div
                  className="admin-row__bar"
                  aria-hidden="true"
                  data-strong={isFailMetric ? "true" : "false"}
                >
                  <span
                    className="admin-row__bar-fill"
                    style={{ width: `${Math.max(4, failPct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function MetricsSkeleton() {
  return (
    <>
      <section className="admin-metrics" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <article key={i} className="admin-metric" data-emphasis="false">
            <span className="skel" style={{ width: "3rem", height: "0.65rem" }} />
            <span
              className="skel"
              style={{ width: "4rem", height: "1.9rem", marginTop: "0.85rem" }}
            />
            <span
              className="skel"
              style={{ width: "8rem", height: "0.75rem", marginTop: "0.5rem" }}
            />
          </article>
        ))}
      </section>
      <div className="admin-tables-grid" aria-hidden="true">
        {[0, 1].map((i) => (
          <section key={i} className="admin-table-card">
            <span className="skel" style={{ width: "5rem", height: "0.65rem" }} />
            <span
              className="skel"
              style={{ width: "12rem", height: "1.4rem", marginTop: "0.65rem" }}
            />
            <span
              className="skel"
              style={{ width: "100%", height: "1px", marginTop: "1rem" }}
            />
            {[0, 1, 2].map((r) => (
              <span
                key={r}
                className="skel"
                style={{
                  width: "100%",
                  height: "3rem",
                  borderRadius: "0.6rem",
                  marginTop: "0.6rem",
                }}
              />
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

function pctOf(part: number, whole: number): string {
  if (!whole) return "—";
  const pct = Math.round((part / whole) * 100);
  return `${pct}% of all learners`;
}
