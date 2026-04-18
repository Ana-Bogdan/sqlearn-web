"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <AuthBootstrapping />;
}

function AuthBootstrapping() {
  return (
    <div
      className="flex flex-1 items-center justify-center py-24"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-taupe/20 border-t-dusk"
      />
      <span className="sr-only">Loading your session…</span>
    </div>
  );
}
