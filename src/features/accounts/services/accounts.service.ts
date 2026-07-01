import type { Account, AccountPayload } from "@/features/accounts/types/account.types";
import { api } from "@/lib/api";

export async function fetchAccounts(options: { archived?: boolean; signal?: AbortSignal } = {}) {
  const query = options.archived ? "?archived=true" : "";

  try {
    const data = (await api(`/api/accounts${query}`, {
      cache: "no-store",
      signal: options.signal,
    })) as Account[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as Account[] };
    }
    throw err;
  }
}

export async function createAccount(payload: AccountPayload) {
  try {
    const data = (await api("/api/accounts", {
      method: "POST",
      body: JSON.stringify({ account: payload }),
      cache: "no-store",
    })) as Account;

    return { status: 201 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Account | null };
    }
    throw err;
  }
}

export async function updateAccount(id: number, payload: AccountPayload) {
  try {
    const data = (await api(`/api/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ account: payload }),
      cache: "no-store",
    })) as Account;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Account | null };
    }
    throw err;
  }
}

export async function archiveAccount(id: number) {
  try {
    const data = (await api(`/api/accounts/${id}`, {
      method: "DELETE",
      cache: "no-store",
    })) as Account;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Account | null };
    }
    throw err;
  }
}

export async function restoreAccount(id: number) {
  try {
    const data = (await api(`/api/accounts/${id}/restore`, {
      method: "PATCH",
      cache: "no-store",
    })) as Account;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Account | null };
    }
    throw err;
  }
}
