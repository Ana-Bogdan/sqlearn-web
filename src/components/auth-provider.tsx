"use client";

import { useEffect, useRef } from "react";
import { ensureCsrfCookie } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        await ensureCsrfCookie();
      } catch {
        // Ignore — CSRF cookie will be re-fetched if needed later.
      }
      await fetchUser();
    })();
  }, [fetchUser]);

  return <>{children}</>;
}
