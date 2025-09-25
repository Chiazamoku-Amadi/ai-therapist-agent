/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes (no auth required)
  const publicRoutes = ["/", "/login", "/signup"];

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  // While checking, you might want to show a spinner instead of nothing
  if (loading) return <p>Loading...</p>;

  // Only render children if authenticated
  return <>{children}</>;
}
