"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  fetchChapters,
  pickResumeLesson,
  type ChapterListItem,
} from "@/lib/curriculum";
import {
  fetchBadges,
  fetchMyProgress,
  fullName,
  levelProgressPercent,
  xpToNextLevel,
  type BadgeWithStatus,
  type ProgressSummary,
} from "@/lib/gamification";
import { useAuthStore } from "@/stores/auth-store";

interface ResumeTarget {
  chapterTitle: string;
  lessonTitle: string;
  href: string;
  chapterOrder: number;
  lessonOrder: number;
  isStart: boolean;
  isComplete: boolean;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [recentBadges, setRecentBadges] = useState<BadgeWithStatus[] | null>(
    null,
  );
  const [resume, setResume] = useState<ResumeTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [progressData, badges, chapters] = await Promise.all([
          fetchMyProgress(),
          fetchBadges().catch(() => [] as BadgeWithStatus[]),
          fetchChapters().catch(() => [] as ChapterListItem[]),
        ]);
        if (!active) return;
        setProgress(progressData);

        // Keep the three most recently earned badges.
        const earned = badges
          .filter((b) => b.earned && b.awarded_at)
          .sort((a, b) =>
            (b.awarded_at ?? "").localeCompare(a.awarded_at ?? ""),
          )
          .slice(0, 3);
        setRecentBadges(earned);

        const resumeTarget = await resolveResumeTarget(chapters);
        if (!active) return;
        setResume(resumeTarget);
      } catch {
        if (!active) return;
        setError(STRINGS.DASHBOARD.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const name = user ? fullName(user.first_name, user.last_name) : "";

  return (
    <div className="dash-shell">
      <header className="dash-header animate-fade-up">
        <p className="dash-eyebrow">{STRINGS.DASHBOARD.EYEBROW}</p>
        <h1 className="dash-heading">
          {name ? STRINGS.DASHBOARD.GREETING(name) : STRINGS.DASHBOARD.GREETING_GUEST}
        </h1>
        <p className="dash-sub">{STRINGS.DASHBOARD.SUB}</p>
      </header>

      {error ? (
        <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!progress && !error ? <DashboardSkeleton /> : null}

      {progress ? (
        <>
          <div className="dash-grid">
            <LevelCard progress={progress} />
            <StreakCard progress={progress} />
            <BadgesCard badges={recentBadges ?? []} />
            <ProgressCard progress={progress} />
          </div>

          <ContinueLearning target={resume} />

          <div className="dash-footer-links">
            <Link href="/leaderboard" className="dash-link">
              {STRINGS.DASHBOARD.CTA_LEADERBOARD}
              <span className="dash-link__arrow" aria-hidden="true">
                →
              </span>
            </Link>
            {user ? (
              <Link href={`/profile/${user.id}`} className="dash-link">
                {STRINGS.DASHBOARD.CTA_PROFILE}
                <span className="dash-link__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

async function resolveResumeTarget(
  chapters: ChapterListItem[],
): Promise<ResumeTarget | null> {
  if (chapters.length === 0) return null;
  const sorted = [...chapters].sort((a, b) => a.order - b.order);

  // Prefer the first chapter that has unfinished exercises.
  const inProgress = sorted.find(
    (ch) => ch.total_exercises > 0 && ch.completed_exercises < ch.total_exercises,
  );
  const target = inProgress ?? sorted[0];

  try {
    const detail = await fetchChapter(target.id);
    const resumeLesson = pickResumeLesson(detail.lessons);
    if (!resumeLesson) return null;
    const isStart = target.completed_exercises === 0;
    const isComplete =
      target.total_exercises > 0 &&
      target.completed_exercises >= target.total_exercises;
    return {
      chapterTitle: target.title,
      lessonTitle: resumeLesson.title,
      href: `/learn/${target.id}/${resumeLesson.id}`,
      chapterOrder: target.order,
      lessonOrder: resumeLesson.order,
      isStart,
      isComplete,
    };
  } catch {
    return null;
  }
}

function LevelCard({ progress }: { progress: ProgressSummary }) {
  const percent = levelProgressPercent(
    progress.xp,
    progress.level_start_xp,
    progress.next_level_xp,
  );
  const toNext = xpToNextLevel(progress.xp, progress.next_level_xp);
  const isMax = progress.next_level_xp === null;
  const ringSize = 140;
  const stroke = 7;
  const radius = ringSize / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <section
      className="dash-card dash-card--level animate-fade-up"
      style={{ animationDelay: "60ms" }}
    >
      <div className="level-ring" data-complete={isMax ? "true" : "false"}>
        <svg viewBox={`0 0 ${ringSize} ${ringSize}`}>
          <defs>
            <linearGradient id="level-ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3E5570" />
              <stop offset="100%" stopColor="#B999A4" />
            </linearGradient>
          </defs>
          <circle
            className="level-ring__track"
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
          />
          <circle
            className="level-ring__fill"
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="level-ring__label">
          <span className="level-ring__tag">
            {STRINGS.DASHBOARD.LEVEL_CARD.EYEBROW}
          </span>
          <span className="level-ring__num">{progress.level}</span>
        </div>
      </div>

      <div className="level-meta">
        <p className="dash-card__eyebrow">
          <span className="dash-card__eyebrow-dot" />
          {progress.level_title}
        </p>
        <div className="level-meta__xp">
          <span className="level-meta__xp-amount">
            {progress.xp.toLocaleString()}
          </span>
          <span className="level-meta__xp-label">
            {STRINGS.DASHBOARD.LEVEL_CARD.XP_LABEL}
          </span>
        </div>
        <p className="level-meta__next">
          {isMax ? (
            STRINGS.DASHBOARD.LEVEL_CARD.MAX_LEVEL
          ) : (
            <>
              <span className="level-meta__next-accent">
                {toNext?.toLocaleString()} XP
              </span>
              <span>to next level</span>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

function StreakCard({ progress }: { progress: ProgressSummary }) {
  const hasStreak = progress.current_streak > 0;

  return (
    <section
      className="dash-card dash-card--streak animate-fade-up"
      style={{ animationDelay: "140ms" }}
    >
      <p className="dash-card__eyebrow">
        <span className="dash-card__eyebrow-dot" />
        {STRINGS.DASHBOARD.STREAK_CARD.EYEBROW}
      </p>

      {hasStreak ? (
        <>
          <div className="streak-line">
            <span className="streak-pulse" aria-hidden="true">
              <FlameIcon />
            </span>
            <div className="streak-big">
              <span className="streak-big__num">{progress.current_streak}</span>
              <span className="streak-big__unit">
                {progress.current_streak === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          <p className="streak-tag">
            {STRINGS.DASHBOARD.STREAK_CARD.TAGLINE}
          </p>
          {progress.longest_streak > progress.current_streak ? (
            <p className="streak-best">
              {STRINGS.DASHBOARD.STREAK_CARD.BEST(progress.longest_streak)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="streak-empty">
          {STRINGS.DASHBOARD.STREAK_CARD.NONE_TAGLINE}
        </p>
      )}
    </section>
  );
}

function BadgesCard({ badges }: { badges: BadgeWithStatus[] }) {
  return (
    <section
      className="dash-card dash-card--badges animate-fade-up"
      style={{ animationDelay: "220ms" }}
    >
      <p className="dash-card__eyebrow">
        <span className="dash-card__eyebrow-dot" />
        {STRINGS.DASHBOARD.BADGES_CARD.EYEBROW}
      </p>

      {badges.length === 0 ? (
        <p className="dash-empty">
          {STRINGS.DASHBOARD.BADGES_CARD.EMPTY}
        </p>
      ) : (
        <div className="badge-stream">
          {badges.map((badge) => (
            <div key={badge.id} className="badge-chip">
              <span
                className="badge-chip__icon"
                data-category={badge.category}
                aria-hidden="true"
              >
                <BadgeIcon name={badge.icon} size={22} />
              </span>
              <div className="badge-chip__text">
                <div className="badge-chip__name">{badge.name}</div>
                <div
                  className="badge-chip__meta"
                  data-category={badge.category}
                >
                  {STRINGS.PROFILE.CATEGORIES[badge.category]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProgressCard({ progress }: { progress: ProgressSummary }) {
  const tiles: Array<{ label: string; done: number; total: number }> = [
    {
      label: "Chapters",
      done: progress.completed_chapters,
      total: progress.total_chapters,
    },
    {
      label: "Lessons",
      done: progress.completed_lessons,
      total: progress.total_lessons,
    },
    {
      label: "Exercises",
      done: progress.completed_exercises,
      total: progress.total_exercises,
    },
    {
      label: "Badges",
      done: progress.badges_earned,
      total: progress.total_badges,
    },
  ];

  return (
    <section
      className="dash-card dash-card--progress animate-fade-up"
      style={{ animationDelay: "300ms" }}
    >
      <p className="dash-card__eyebrow">
        <span className="dash-card__eyebrow-dot" />
        {STRINGS.DASHBOARD.PROGRESS_CARD.EYEBROW}
      </p>

      <div className="progress-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="progress-tile">
            <span className="progress-tile__label">{tile.label}</span>
            <span className="progress-tile__value">
              {tile.done}
              <span className="progress-tile__value-accent"> / {tile.total}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContinueLearning({ target }: { target: ResumeTarget | null }) {
  if (!target) return null;

  const eyebrow = target.isStart
    ? STRINGS.DASHBOARD.CONTINUE.FALLBACK_EYEBROW
    : STRINGS.DASHBOARD.CONTINUE.EYEBROW;
  const cta = target.isComplete
    ? STRINGS.DASHBOARD.CONTINUE.COMPLETE_CTA
    : target.isStart
      ? STRINGS.DASHBOARD.CONTINUE.BEGIN_CTA
      : STRINGS.DASHBOARD.CONTINUE.RESUME_CTA;

  return (
    <Link
      href={target.href}
      className="dash-continue animate-fade-up"
      style={{ animationDelay: "380ms" }}
    >
      <div className="dash-continue__copy">
        <p className="dash-continue__eyebrow">{eyebrow}</p>
        <h2 className="dash-continue__title">
          {target.chapterTitle}{" "}
          <span aria-hidden="true" style={{ opacity: 0.55 }}>
            ·
          </span>{" "}
          {target.lessonTitle}
        </h2>
        <span className="dash-continue__meta">
          <span className="dash-continue__meta-dot" aria-hidden="true" />
          <span>
            Chapter {String(target.chapterOrder).padStart(2, "0")} · Lesson{" "}
            {target.lessonOrder}
          </span>
        </span>
      </div>
      <span className="dash-continue__cta">
        {cta}
        <span aria-hidden="true" className="dash-continue__cta-arrow">
          →
        </span>
      </span>
    </Link>
  );
}

function FlameIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3c1.3 2.4 3.5 3.2 3.5 6.2 0 1.3-.7 2.3-1.7 2.8 0 0 1.2-2.2.2-4.2 0 0 .8 3.6-2.3 5.3-1.6.9-2.8 2.4-2.8 4.3 0 2.6 2.2 4.6 5 4.6s5-2 5-4.6c0-5-3.6-7.3-6.9-14.4z"
        fill="currentColor"
      />
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash-grid" aria-hidden="true">
      <div className="dash-card dash-card--level" style={{ minHeight: "11rem" }}>
        <div className="skel" style={{ width: "8.5rem", height: "8.5rem", borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ width: "8rem", height: "0.7rem" }} />
          <div
            className="skel"
            style={{ width: "14rem", height: "1.6rem", marginTop: "0.9rem" }}
          />
          <div
            className="skel"
            style={{ width: "10rem", height: "0.7rem", marginTop: "0.9rem" }}
          />
        </div>
      </div>
      <div className="dash-card" style={{ minHeight: "11rem" }}>
        <div className="skel" style={{ width: "5rem", height: "0.65rem" }} />
        <div
          className="skel"
          style={{ width: "7rem", height: "2.2rem", marginTop: "1.4rem" }}
        />
        <div
          className="skel"
          style={{ width: "12rem", height: "0.7rem", marginTop: "1rem" }}
        />
      </div>
      <div className="dash-card" style={{ minHeight: "11rem" }}>
        <div className="skel" style={{ width: "6rem", height: "0.65rem" }} />
        <div
          className="skel"
          style={{ width: "100%", height: "2.4rem", marginTop: "0.95rem", borderRadius: "0.6rem" }}
        />
        <div
          className="skel"
          style={{ width: "100%", height: "2.4rem", marginTop: "0.5rem", borderRadius: "0.6rem" }}
        />
      </div>
      <div className="dash-card" style={{ minHeight: "11rem" }}>
        <div className="skel" style={{ width: "7rem", height: "0.65rem" }} />
        <div
          className="progress-grid"
          style={{ marginTop: "0.9rem" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skel"
              style={{ width: "100%", height: "3.4rem", borderRadius: "0.7rem" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
