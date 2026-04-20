"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STRINGS } from "@/lib/constants";
import {
  fetchLeaderboard,
  fullName,
  initials,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from "@/lib/gamification";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 50;

export default function LeaderboardPage() {
  const me = useAuthStore((state) => state.user);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLeaderboard(page);
        if (!active) return;
        setData(res);
      } catch {
        if (!active) return;
        setError(STRINGS.LEADERBOARD.LOAD_ERROR);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;
  const entries = data?.results ?? [];

  // The current-user row is always attached to the response, even when they
  // fall outside the current page window.
  const currentRankVisible =
    data && me
      ? entries.some((entry) => entry.id === me.id)
      : false;

  return (
    <div className="leaderboard-shell">
      <header className="leaderboard-header animate-fade-up">
        <p className="dash-eyebrow">{STRINGS.LEADERBOARD.EYEBROW}</p>
        <h1 className="leaderboard-header__heading">
          {STRINGS.LEADERBOARD.HEADING}
        </h1>
        <p className="leaderboard-header__sub">
          {STRINGS.LEADERBOARD.SUBHEADING}
        </p>
      </header>

      {error ? (
        <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div
        className="leaderboard-frame animate-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>{STRINGS.LEADERBOARD.HEADERS.RANK}</th>
              <th>{STRINGS.LEADERBOARD.HEADERS.LEARNER}</th>
              <th>{STRINGS.LEADERBOARD.HEADERS.LEVEL}</th>
              <th className="num">{STRINGS.LEADERBOARD.HEADERS.XP}</th>
              <th className="num">{STRINGS.LEADERBOARD.HEADERS.BADGES}</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <LeaderboardSkeleton rows={6} />
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center italic text-muted-foreground">
                  {STRINGS.LEADERBOARD.EMPTY}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <LeaderRow
                  key={entry.id}
                  entry={entry}
                  isMe={me?.id === entry.id}
                />
              ))
            )}
          </tbody>
        </table>

        {data && data.count > PAGE_SIZE ? (
          <div className="leaderboard-pager">
            <button
              type="button"
              className="pager-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← {STRINGS.LEADERBOARD.PAGER.PREV}
            </button>
            <span className="pager-label">
              {STRINGS.LEADERBOARD.PAGER.PAGE(page, totalPages)}
            </span>
            <button
              type="button"
              className="pager-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {STRINGS.LEADERBOARD.PAGER.NEXT} →
            </button>
          </div>
        ) : null}
      </div>

      {data?.current_user && !currentRankVisible ? (
        <section className="leaderboard-me animate-fade-up" style={{ animationDelay: "220ms" }}>
          <div>
            <p className="leaderboard-me__label">
              {STRINGS.LEADERBOARD.CURRENT_USER_ROW}
            </p>
            <p className="leaderboard-me__rank">
              #{data.current_user.rank}
            </p>
          </div>
          <LearnerCell
            entry={data.current_user}
            isMe
          />
          <div className="flex items-center gap-6 text-sm">
            <span className="font-mono tabular-nums text-dusk">
              Lv {data.current_user.level}
            </span>
            <span className="font-mono tabular-nums text-taupe">
              {data.current_user.xp.toLocaleString()} XP
            </span>
            {me ? (
              <Link
                href={`/profile/${me.id}`}
                className="dash-link"
              >
                Profile
                <span className="dash-link__arrow" aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LeaderRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  return (
    <tr
      className="leaderboard-row"
      data-me={isMe ? "true" : "false"}
      data-top={entry.rank <= 3 ? String(entry.rank) : undefined}
    >
      <td>
        <span className="rank-badge">
          {entry.rank <= 3 ? (
            <span className="rank-crown" aria-hidden="true">
              <CrownIcon />
            </span>
          ) : null}
          {entry.rank}
        </span>
      </td>
      <td>
        <LearnerCell entry={entry} isMe={isMe} />
      </td>
      <td>
        <span className="level-tag">Lv {entry.level}</span>
      </td>
      <td className="num">{entry.xp.toLocaleString()}</td>
      <td className="num">{entry.badge_count}</td>
    </tr>
  );
}

function LearnerCell({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  return (
    <Link
      href={`/profile/${entry.id}`}
      className="learner-cell no-underline hover:opacity-90"
    >
      <span className="learner-avatar" aria-hidden="true">
        {initials(entry.first_name, entry.last_name)}
      </span>
      <span className="learner-name">
        {fullName(entry.first_name, entry.last_name)}
        {isMe ? (
          <span className="learner-you">{STRINGS.LEADERBOARD.YOU}</span>
        ) : null}
      </span>
    </Link>
  );
}

function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M2 12h12l1-7-4 2-3-4-3 4-4-2 1 7zm0 1v1h12v-1H2z" />
    </svg>
  );
}

function LeaderboardSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td>
            <div className="skel" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.55rem" }} />
          </td>
          <td>
            <div className="learner-cell">
              <div className="skel" style={{ width: "2.4rem", height: "2.4rem", borderRadius: "999px" }} />
              <div className="skel" style={{ width: "9rem", height: "0.9rem" }} />
            </div>
          </td>
          <td>
            <div className="skel" style={{ width: "3rem", height: "0.8rem" }} />
          </td>
          <td className="num">
            <div className="skel" style={{ width: "4rem", height: "0.8rem", marginLeft: "auto" }} />
          </td>
          <td className="num">
            <div className="skel" style={{ width: "2rem", height: "0.8rem", marginLeft: "auto" }} />
          </td>
        </tr>
      ))}
    </>
  );
}
