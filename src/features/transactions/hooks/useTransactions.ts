"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await fetchTransactions(filters, controller.signal);

        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setItems(result.data);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [enabled, filters, onUnauthorized]);

  return { items, loading };
}
