"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAccounts } from "@/features/accounts/services/accounts.service";
import type { Account } from "@/features/accounts/types/account.types";

type UseAccountsParams = {
  enabled: boolean;
  onUnauthorized: () => void;
  archived?: boolean;
};

export function useAccounts({ enabled, onUnauthorized, archived = false }: UseAccountsParams) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAccounts({ archived, signal });

      if (result.status === 401) {
        onUnauthorized();
        return;
      }

      setAccounts(result.data);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error(err);
        setAccounts([]);
        setError(archived ? "Não foi possível carregar as contas arquivadas." : "Não foi possível carregar as contas.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [archived, onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void loadAccounts(controller.signal);

    return () => controller.abort();
  }, [enabled, loadAccounts]);

  const refetch = useCallback(async () => {
    await loadAccounts();
  }, [loadAccounts]);

  return { accounts, loading, error, refetch };
}
