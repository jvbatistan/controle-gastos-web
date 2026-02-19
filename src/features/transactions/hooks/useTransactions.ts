"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTransactions } from "@/features/transactions/services/transactions.service";
import {
  Transaction,
  TransactionFilters,
} from "@/features/transactions/types/transaction.types";

type UseTransactionsParams = {
  filters: TransactionFilters;
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useTransactions({ filters, enabled, onUnauthorized }: UseTransactionsParams) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchTransactions(filters, controller.signal);

        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setItems(result.data);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
          setItems([]);
          setError("Não foi possível carregar as transações. Tente novamente.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [enabled, filters, onUnauthorized, reloadToken]);

  return { items, loading, error, refetch };
}
