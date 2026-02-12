import { Transaction, TransactionFilters } from "@/features/transactions/types/transaction.types";

export function buildTransactionsQuery(filters: TransactionFilters) {
  const qs = new URLSearchParams();
  qs.set("limit", "50");

  const q = filters.q.trim();
  if (q) qs.set("q", q);
  if (filters.categoryId !== "all") qs.set("category_id", filters.categoryId);
  if (filters.period !== "all") qs.set("period", filters.period);
  if (filters.paid !== "all") qs.set("paid", filters.paid);
  if (filters.type !== "all") qs.set("kind", filters.type);

  return `?${qs.toString()}`;
}

export async function fetchTransactions(filters: TransactionFilters, signal?: AbortSignal) {
  const query = buildTransactionsQuery(filters);
  const res = await fetch(`/api/transactions${query}`, {
    cache: "no-store",
    signal,
  });

  if (res.status === 401) return { status: 401 as const, data: [] as Transaction[] };
  return { status: res.status, data: (await res.json()) as Transaction[] };
}
