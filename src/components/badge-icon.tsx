import {
  Award,
  Book,
  BookOpen,
  Brackets,
  Brain,
  Compass,
  Flame,
  Link as LinkIcon,
  Milestone,
  Moon,
  Sparkles,
  Stethoscope,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Map the icon slugs seeded in the backend (apps/gamification/migrations/
// 0002_seed_badges.py) to Lucide components. "scalpel" isn't a Lucide glyph —
// Stethoscope is the closest medical-instrument read.
const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  "book-open": BookOpen,
  milestone: Milestone,
  trophy: Trophy,
  target: Target,
  link: LinkIcon,
  brackets: Brackets,
  scalpel: Stethoscope,
  award: Award,
  flame: Flame,
  moon: Moon,
  zap: Zap,
  brain: Brain,
  compass: Compass,
  book: Book,
  star: Star,
};

interface BadgeIconProps {
  name: string | null | undefined;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function BadgeIcon({
  name,
  size = 20,
  className,
  strokeWidth = 1.75,
}: BadgeIconProps) {
  const slug = (name ?? "").trim().toLowerCase();
  const Icon = ICON_MAP[slug] ?? Trophy;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}
