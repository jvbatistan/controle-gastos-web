import type { AccountTransfer, CreateAccountTransferPayload } from "@/features/accounts/types/account-transfer.types";
import { api } from "@/lib/api";

export async function fetchAccountTransfers(options: { signal?: AbortSignal; page?: number; perPage?: number } = {}) {
  try {
    const data = (await api(`/api/account_transfers?page=${options.page ?? 1}&per_page=${options.perPage ?? 10}`, {
      cache: "no-store",
      signal: options.signal,
    })) as { transfers: AccountTransfer[]; pagination: { page: number; per_page: number; total_count: number; total_pages: number } };

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: { transfers: [] as AccountTransfer[], pagination: { page: 1, per_page: 10, total_count: 0, total_pages: 0 } } };
    }
    throw err;
  }
}

export async function createAccountTransfer(payload: CreateAccountTransferPayload) {
  try {
    const data = (await api("/api/account_transfers", {
      method: "POST",
      body: JSON.stringify({ account_transfer: payload }),
      cache: "no-store",
    })) as AccountTransfer;

    return { status: 201 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as AccountTransfer | null };
    }
    throw err;
  }
}

export async function reverseAccountTransfer(id: number) {
  try {
    const data = (await api(`/api/account_transfers/${id}/reverse`, {
      method: "PATCH",
      cache: "no-store",
    })) as AccountTransfer;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as AccountTransfer | null };
    }
    throw err;
  }
}
