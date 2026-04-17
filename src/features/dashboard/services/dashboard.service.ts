import { api } from "@/lib/api";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

export async function fetchDashboard(signal?: AbortSignal) {
  try {
    const data = (await api("/api/dashboard", {
      cache: "no-store",
      signal,
    })) as DashboardOverview;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as DashboardOverview | null };
    }

    throw err;
  }
}
