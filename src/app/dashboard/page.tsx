"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { AppLayout } from "@/components/AppLayout";
import { DashboardContent } from "@/components/DashboardContent";
import { useDashboard } from "@/features/dashboard";


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { overview, loading, error } = useDashboard({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  if (auth.status === "loading") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  if (auth.status === "unauthenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <AppLayout>
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading || !overview ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[168px] animate-pulse rounded-lg border border-neutral-200 bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <DashboardContent overview={overview} />
      )}
    </AppLayout>
  );
}
