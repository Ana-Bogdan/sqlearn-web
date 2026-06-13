"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(role === "admin" ? "/admin" : "/dashboard");
    }
  }, [status, role, router]);

  return <>{children}</>;
}
