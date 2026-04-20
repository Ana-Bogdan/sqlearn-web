"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { STRINGS } from "@/lib/constants";
import {
  fetchBadges,
  fetchPublicProfile,
  fullName,
  initials,
  type BadgeCategory,
  type BadgeWithStatus,
  type PublicProfile,
  type UserBadge,
} from "@/lib/gamification";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

const CATEGORY_ORDER: BadgeCategory[] = [
  "milestone",
  "skill",
  "streak",
  "fun",
];

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  // Only the viewer's own badge catalog includes the locked/greyed-out tiles —
  // a public profile just shows earned badges. So we fetch the full badge
  // catalog separately to fill in the unearned tiles with real names/icons.
  const [catalog, setCatalog] = useState<BadgeWithStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setProfile(null);
      setError(null);
      try {
        const [profileData, catalogData] = await Promise.all([
          fetchPublicProfile(userId),
          fetchBadges().catch(() => [] as BadgeWithStatus[]),
        ]);
        if (!active) return;
        setProfile(profileData);
        setCatalog(catalogData);
      } catch {
        if (!active) return;
        setError(STRINGS.PROFILE.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (error) {
    return (
      <div className="profile-shell">
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
        <Link
          href="/dashboard"
          className="dash-link mt-6 inline-flex"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="profile-shell">
      <ProfileHero profile={profile} />
      <Stats profile={profile} />
      <BadgeCollection profile={profile} catalog={catalog ?? []} />
    </div>
  );
}

function ProfileHero({ profile }: { profile: PublicProfile }) {
  const name = fullName(profile.first_name, profile.last_name);
  return (
    <section className="profile-hero animate-fade-up">
      <div className="profile-avatar" aria-hidden="true">
        {initials(profile.first_name, profile.last_name)}
      </div>
      <div className="profile-id">
        <h1 className="profile-name">{name}</h1>
        <p className="profile-level">
          {STRINGS.PROFILE.LEVEL} {profile.level} · {profile.level_title}
        </p>
      </div>
    </section>
  );
}

function Stats({ profile }: { profile: PublicProfile }) {
  const stats: Array<{ label: string; value: string; unit?: string }> = [
    {
      label: STRINGS.PROFILE.STATS.XP,
      value: profile.xp.toLocaleString(),
      unit: "xp",
    },
    {
      label: STRINGS.PROFILE.STATS.STREAK,
      value: String(profile.current_streak),
      unit: profile.current_streak === 1 ? "day" : "days",
    },
    {
      label: STRINGS.PROFILE.STATS.LONGEST_STREAK,
      value: String(profile.longest_streak),
      unit: profile.longest_streak === 1 ? "day" : "days",
    },
    {
      label: STRINGS.PROFILE.STATS.EXERCISES,
      value: String(profile.exercises_completed),
    },
  ];

  return (
    <div
      className="profile-stats animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="profile-stat">
          <p className="profile-stat__label">{stat.label}</p>
          <p className="profile-stat__value">
            {stat.value}
            {stat.unit ? (
              <span className="profile-stat__unit">{stat.unit}</span>
            ) : null}
          </p>
        </div>
      ))}
    </div>
  );
}

function BadgeCollection({
  profile,
  catalog,
}: {
  profile: PublicProfile;
  catalog: BadgeWithStatus[];
}) {
  // Index this user's earned badges by trigger_type (stable across users)
  const earnedByTrigger = useMemo(() => {
    const map = new Map<string, UserBadge>();
    for (const ub of profile.badges) {
      map.set(ub.badge.trigger_type, ub);
    }
    return map;
  }, [profile.badges]);

  // Merge the viewer's catalog (full list) with this profile's earned set.
  // For viewing someone else's profile, a badge is "earned" only if it's in
  // *their* earned set — regardless of whether the viewer has it.
  const merged = useMemo(() => {
    if (catalog.length === 0) {
      // Fall back to only the earned badges when catalog isn't available.
      return profile.badges.map((ub) => ({
        ...ub.badge,
        earned: true,
        awarded_at: ub.awarded_at,
      })) satisfies BadgeWithStatus[];
    }
    return catalog.map((badge) => {
      const earned = earnedByTrigger.get(badge.trigger_type);
      return {
        ...badge,
        earned: Boolean(earned),
        awarded_at: earned?.awarded_at ?? null,
      } satisfies BadgeWithStatus;
    });
  }, [catalog, earnedByTrigger, profile.badges]);

  const totalEarned = profile.badges_earned;
  const totalBadges = merged.length;

  const groups = useMemo(() => {
    const map = new Map<BadgeCategory, BadgeWithStatus[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const badge of merged) {
      const list = map.get(badge.category) ?? [];
      list.push(badge);
      map.set(badge.category, list);
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: map.get(cat) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [merged]);

  return (
    <section
      className="profile-collection animate-fade-up"
      style={{ animationDelay: "180ms" }}
    >
      <div className="profile-collection__head">
        <h2 className="profile-collection__heading">
          {STRINGS.PROFILE.BADGES_HEADING}
        </h2>
        <span className="profile-collection__count">
          {STRINGS.PROFILE.BADGES_COUNT(totalEarned, totalBadges)}
        </span>
      </div>

      {merged.length === 0 ? (
        <p className="dash-empty mt-6">{STRINGS.PROFILE.BADGES_EMPTY}</p>
      ) : (
        groups.map((group) => (
          <div key={group.category} className="badge-group">
            <p className="badge-group__label">
              {STRINGS.PROFILE.CATEGORIES[group.category]}
            </p>
            <div className="badge-grid">
              {group.items.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function BadgeCard({ badge }: { badge: BadgeWithStatus }) {
  return (
    <div
      className="badge-card"
      data-earned={badge.earned ? "true" : "false"}
      data-category={badge.category}
      title={badge.earned ? undefined : STRINGS.PROFILE.NOT_EARNED}
    >
      <span className="badge-card__icon" aria-hidden="true">
        <BadgeIcon name={badge.icon} size={26} />
      </span>
      <span className="badge-card__name">{badge.name}</span>
      <span className="badge-card__desc">{badge.description}</span>
      {!badge.earned ? (
        <span className="badge-card__locked">Locked</span>
      ) : null}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="profile-shell">
      <section className="profile-hero">
        <div
          className="skel"
          style={{ width: "5.75rem", height: "5.75rem", borderRadius: "999px" }}
        />
        <div>
          <div className="skel" style={{ width: "12rem", height: "1.6rem" }} />
          <div
            className="skel"
            style={{ width: "9rem", height: "0.8rem", marginTop: "0.8rem" }}
          />
        </div>
      </section>
      <div className="profile-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="profile-stat">
            <div className="skel" style={{ width: "5rem", height: "0.6rem" }} />
            <div
              className="skel"
              style={{ width: "6rem", height: "1.4rem", marginTop: "0.7rem" }}
            />
          </div>
        ))}
      </div>
      <div className="profile-collection">
        <div className="profile-collection__head">
          <div className="skel" style={{ width: "10rem", height: "1.2rem" }} />
        </div>
        <div className="badge-grid" style={{ marginTop: "1.25rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="badge-card"
              style={{ minHeight: "8rem" }}
            >
              <div className="skel" style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.7rem" }} />
              <div className="skel" style={{ width: "7rem", height: "0.9rem" }} />
              <div className="skel" style={{ width: "9rem", height: "0.7rem" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
