"use client";

import { useState } from "react";
import { createTransaction } from "@/features/transactions/services/transactions.service";
import { Transaction, TransactionPayload } from "@/features/transactions/types/transaction.types";

type UseCreateTransactionParams = {
  onUnauthorized: () => void;
};

export function useCreateTransaction({ onUnauthorized }: UseCreateTransactionParams) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(payload: TransactionPayload): Promise<Transaction | null> {
    try {
      setLoading(true);
      setError(null);

      const result = await createTransaction(payload);
      if (result.status === 401) {
        onUnauthorized();
        return null;
      }

      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar transação.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createTransaction: mutate, loading, error };
}
