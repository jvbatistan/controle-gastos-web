"use client";

import { useEffect, useState } from "react";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";
import { fetchDashboard, type DashboardCompetence } from "@/features/dashboard/services/dashboard.service";

type UseDashboardParams = {
  enabled: boolean;
  onUnauthorized: () => void;
  competence: DashboardCompetence;
};

export function useDashboard({ enabled, onUnauthorized, competence }: UseDashboardParams) {
  const { month, year } = competence;
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDashboard({ month, year }, controller.signal);

        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setOverview(result.data);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
          setOverview(null);
          setError("Não foi possível carregar o dashboard. Tente novamente.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [enabled, month, onUnauthorized, year]);

  return { overview, loading, error };
}
