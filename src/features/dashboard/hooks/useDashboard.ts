"use client";

import { useEffect, useState } from "react";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";
import { fetchDashboard } from "@/features/dashboard/services/dashboard.service";

type UseDashboardParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useDashboard({ enabled, onUnauthorized }: UseDashboardParams) {
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
        const result = await fetchDashboard(controller.signal);

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
  }, [enabled, onUnauthorized]);

  return { overview, loading, error };
}
