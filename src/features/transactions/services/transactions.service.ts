import {
  CreateTransactionResponse,
  Transaction,
  TransactionFilters,
  TransactionPayload,
  TransactionsPage,
} from "@/features/transactions/types/transaction.types";
import { api } from "@/lib/api";

export function buildTransactionsQuery(filters: TransactionFilters) {
  const qs = new URLSearchParams();
  qs.set("page", String(filters.page));
  qs.set("per_page", filters.perPage);

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
    })) as TransactionsPage;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: { transactions: [], pagination: { page: filters.page, per_page: Number(filters.perPage), total_count: 0, total_pages: 0 } } as TransactionsPage };
    }
    throw err;
  }
}

function filenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? null;
}

export async function exportTransactionsCsv(filters: TransactionFilters) {
  const query = buildTransactionsQuery(filters);

  try {
    const response = await fetch(`/api/transactions/export_csv${query}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      const message = response.status === 401 ? "HTTP 401" : "Não foi possível exportar as transações.";
      throw new Error(message);
    }

    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(response.headers.get("content-disposition")) ??
      `finch-transacoes-${new Date().toISOString().slice(0, 10)}.csv`;

    return { status: 200 as const, data: { blob, filename } };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as { blob: Blob; filename: string } | null };
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
    })) as Transaction | { installment_group_id: string; transactions: Transaction[] };

    const normalized: CreateTransactionResponse = "transactions" in data
      ? {
          kind: "installment_group",
          installment_group_id: data.installment_group_id,
          transactions: data.transactions,
        }
      : {
          kind: "single",
          transaction: data,
        };

    return { status: 201 as const, data: normalized };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as CreateTransactionResponse | null };
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
