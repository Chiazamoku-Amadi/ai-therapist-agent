"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";

export function AuthGuard() {
  // Use the loading state to wait for the session check to complete.
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only run the redirect logic after the session check is finished.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  return null; // This component doesn't render anything
}
