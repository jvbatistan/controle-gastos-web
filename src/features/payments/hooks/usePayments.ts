"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPayments } from "@/features/payments/services/payments.service";
import type { PaymentsOverview } from "@/features/payments/types/payment.types";

type UsePaymentsParams = {
  month: number;
  year: number;
  enabled: boolean;
  onUnauthorized: () => void;
};

export function usePayments({ month, year, enabled, onUnauthorized }: UsePaymentsParams) {
  const [overview, setOverview] = useState<PaymentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPayments(month, year, signal);

      if (result.status === 401) {
        onUnauthorized();
        return;
      }

      setOverview(result.data);
    } catch (err) {
      console.error(err);
      setOverview(null);
      setError("Não foi possível carregar os pagamentos.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [month, onUnauthorized, year]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void loadPayments(controller.signal);

    return () => controller.abort();
  }, [enabled, loadPayments]);

  const refetch = useCallback(async () => {
    await loadPayments();
  }, [loadPayments]);

  return { overview, loading, error, refetch };
}
