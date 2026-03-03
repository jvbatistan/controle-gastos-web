import {
  Transaction,
  TransactionFilters,
  TransactionPayload,
} from "@/features/transactions/types/transaction.types";
import { api } from "@/lib/api";

export function buildTransactionsQuery(filters: TransactionFilters) {
  const qs = new URLSearchParams();
  qs.set("limit", "50");

  if (filters.cardId !== "all") qs.set("card_id", filters.cardId);
  if (filters.month !== "all" && filters.year !== "all") {
    qs.set("month", filters.month);
    qs.set("year", filters.year);
  }

  return `?${qs.toString()}`;
}

export async function fetchTransactions(filters: TransactionFilters, signal?: AbortSignal) {
  const query = buildTransactionsQuery(filters);
  try {
    const data = (await api(`/api/transactions${query}`, {
      cache: "no-store",
      signal,
    })) as Transaction[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as Transaction[] };
    }
    throw err;
  }
}

export async function createTransaction(payload: TransactionPayload) {
  try {
    const data = (await api("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ transaction: payload }),
      cache: "no-store",
    })) as Transaction;

    return { status: 201 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Transaction | null };
    }
    throw err;
  }
}

export async function updateTransaction(id: number, payload: TransactionPayload) {
  try {
    const data = (await api(`/api/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ transaction: payload }),
      cache: "no-store",
    })) as Transaction;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Transaction | null };
    }
    throw err;
  }
}

export async function deleteTransaction(id: number) {
  try {
    await api(`/api/transactions/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
    return { status: 204 as const };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const };
    }
    throw err;
  }
}
