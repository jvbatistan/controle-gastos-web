import {
  Transaction,
  TransactionFilters,
  TransactionPayload,
} from "@/features/transactions/types/transaction.types";

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

async function parseErrorMessage(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
    return data?.error || data?.message || `HTTP ${res.status}`;
  }

  const text = await res.text().catch(() => "");
  return text || `HTTP ${res.status}`;
}

export async function createTransaction(payload: TransactionPayload) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: payload }),
    cache: "no-store",
  });

  if (res.status === 401) return { status: 401 as const, data: null as Transaction | null };
  if (!res.ok) throw new Error(await parseErrorMessage(res));

  return { status: res.status, data: (await res.json()) as Transaction };
}

export async function updateTransaction(id: number, payload: TransactionPayload) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: payload }),
    cache: "no-store",
  });

  if (res.status === 401) return { status: 401 as const, data: null as Transaction | null };
  if (!res.ok) throw new Error(await parseErrorMessage(res));

  return { status: res.status, data: (await res.json()) as Transaction };
}

export async function deleteTransaction(id: number) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (res.status === 401) return { status: 401 as const };
  if (!res.ok) throw new Error(await parseErrorMessage(res));

  return { status: res.status };
}
