"use client";

import { useState } from "react";
import { updateTransaction } from "@/features/transactions/services/transactions.service";
import { Transaction, TransactionPayload } from "@/features/transactions/types/transaction.types";

type UseUpdateTransactionParams = {
  onUnauthorized: () => void;
};

export function useUpdateTransaction({ onUnauthorized }: UseUpdateTransactionParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(id: number, payload: TransactionPayload): Promise<Transaction | null> {
    try {
      setLoading(true);
      setError(null);

      const result = await updateTransaction(id, payload);
      if (result.status === 401) {
        onUnauthorized();
        return null;
      }

      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar transação.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { updateTransaction: mutate, loading, error };
}
