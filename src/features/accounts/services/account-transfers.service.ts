import type { AccountTransfer, CreateAccountTransferPayload } from "@/features/accounts/types/account-transfer.types";
import { api } from "@/lib/api";

export async function fetchAccountTransfers(options: { signal?: AbortSignal } = {}) {
  try {
    const data = (await api("/api/account_transfers", {
      cache: "no-store",
      signal: options.signal,
    })) as AccountTransfer[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as AccountTransfer[] };
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
