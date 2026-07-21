import type { AccountStatementResponse, FetchAccountStatementParams } from "@/features/accounts/types/account-statement.types";
import { api } from "@/lib/api";

export async function fetchAccountStatement(accountId: number, params: FetchAccountStatementParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.set("start_date", params.startDate);
  if (params.endDate) searchParams.set("end_date", params.endDate);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.perPage) searchParams.set("per_page", String(params.perPage));

  const query = searchParams.toString();
  const path = `/api/accounts/${accountId}/statement${query ? `?${query}` : ""}`;

  try {
    const data = (await api(path, {
      cache: "no-store",
      signal: params.signal,
    })) as AccountStatementResponse;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as AccountStatementResponse | null };
    }
    throw err;
  }
}
