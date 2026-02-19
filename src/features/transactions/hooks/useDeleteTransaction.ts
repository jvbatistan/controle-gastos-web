"use client";

import { useState } from "react";
import { deleteTransaction } from "@/features/transactions/services/transactions.service";

type UseDeleteTransactionParams = {
  onUnauthorized: () => void;
};

export function useDeleteTransaction({ onUnauthorized }: UseDeleteTransactionParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(id: number): Promise<boolean> {
    try {
      setLoading(true);
      setError(null);

      const result = await deleteTransaction(id);
      if (result.status === 401) {
        onUnauthorized();
        return false;
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir transação.";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { deleteTransaction: mutate, loading, error };
}
