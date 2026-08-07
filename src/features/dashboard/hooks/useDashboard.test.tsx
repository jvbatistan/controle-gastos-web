import { act, renderHook, waitFor } from "@testing-library/react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { fetchDashboard } from "@/features/dashboard/services/dashboard.service";

vi.mock("@/features/dashboard/services/dashboard.service", () => ({
  fetchDashboard: vi.fn(),
}));

const fetchDashboardMock = vi.mocked(fetchDashboard);
const overview = {
  period: { month: 8, year: 2026, label: "agosto/2026" },
  summary: { incomes_total: 0, expenses_total: 0, balance_total: 0, open_total: 0, paid_total: 0, transactions_count: 0 },
  monthly_trend: [],
  by_card: [],
  by_category: [],
  recent_expenses: [],
  statements: [],
};

describe("useDashboard", () => {
  beforeEach(() => fetchDashboardMock.mockReset().mockResolvedValue({ status: 200, data: overview }));

  it("loads once after the selected competence stabilizes and reloads once when it changes", async () => {
    const onUnauthorized = vi.fn();
    const { result, rerender } = renderHook(
      ({ competence }) => useDashboard({ enabled: true, onUnauthorized, competence }),
      { initialProps: { competence: { month: 8, year: 2026 } } }
    );

    await waitFor(() => expect(result.current.overview).toEqual(overview));
    await act(async () => { await Promise.resolve(); });
    expect(fetchDashboardMock).toHaveBeenCalledTimes(1);
    expect(fetchDashboardMock).toHaveBeenLastCalledWith({ month: 8, year: 2026 }, expect.any(AbortSignal));

    rerender({ competence: { month: 8, year: 2026 } });
    await act(async () => { await Promise.resolve(); });
    expect(fetchDashboardMock).toHaveBeenCalledTimes(1);

    rerender({ competence: { month: 9, year: 2026 } });
    await waitFor(() => expect(fetchDashboardMock).toHaveBeenCalledTimes(2));
    expect(fetchDashboardMock).toHaveBeenLastCalledWith({ month: 9, year: 2026 }, expect.any(AbortSignal));
  });
});
