"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { STRINGS } from "@/lib/constants";
import { fetchChapter, pickResumeLesson } from "@/lib/curriculum";

export default function ChapterResumePage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const detail = await fetchChapter(chapterId);
        const resume = pickResumeLesson(detail.lessons);
        if (!active) return;
        if (resume) {
          router.replace(`/learn/${chapterId}/${resume.id}`);
          return;
        }
        setError(STRINGS.LEARN.EMPTY_CHAPTER);
      } catch {
        if (!active) return;
        setError(STRINGS.LEARN.LOAD_ERROR);
      }
    })();
    return () => {
      active = false;
    };
  }, [chapterId, router]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      {error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : (
        <span
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-2 border-taupe/20 border-t-dusk"
        />
      )}
    </div>
  );
}
