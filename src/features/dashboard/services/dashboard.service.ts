import { api } from "@/lib/api";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

export type DashboardCompetence = {
  month: number;
  year: number;
};

export async function fetchDashboard(competence?: DashboardCompetence, signal?: AbortSignal) {
  const query = competence ? `?month=${competence.month}&year=${competence.year}` : "";

  try {
    const data = (await api(`/api/dashboard${query}`, {
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
