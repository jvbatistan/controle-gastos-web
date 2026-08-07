"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { AppLayout } from "@/components/AppLayout";
import { DashboardContent } from "@/components/DashboardContent";
import { useDashboard } from "@/features/dashboard";


function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);
  const competence = competenceFromSearchParams(searchParams);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { overview, loading, error } = useDashboard({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
    competence,
  });

  const navigateMonth = (offset: number) => {
    const date = new Date(competence.year, competence.month - 1 + offset, 1);
    router.push(`/dashboard?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
  };

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
        <DashboardContent
          overview={overview}
          isProjection={isFutureCompetence(overview.period.month, overview.period.year)}
          onPreviousMonth={() => navigateMonth(-1)}
          onNextMonth={() => navigateMonth(1)}
        />
      )}
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <DashboardPageContent />
    </Suspense>
  );
}

function competenceFromSearchParams(searchParams: ReturnType<typeof useSearchParams>) {
  const currentDate = new Date();
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : currentDate.getMonth() + 1,
    year: Number.isInteger(year) && year > 0 ? year : currentDate.getFullYear(),
  };
}

function isFutureCompetence(month: number, year: number) {
  const currentDate = new Date();
  return new Date(year, month - 1, 1) > new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
}
