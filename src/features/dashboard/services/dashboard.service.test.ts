import { fetchDashboard } from "@/features/dashboard/services/dashboard.service";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: vi.fn() }));

const apiMock = vi.mocked(api);

describe("dashboard service", () => {
  beforeEach(() => apiMock.mockReset());

  it("sends the selected competence to the API", async () => {
    apiMock.mockResolvedValueOnce({ period: { month: 9, year: 2026 } });

    await fetchDashboard({ month: 9, year: 2026 });

    expect(apiMock).toHaveBeenCalledWith("/api/dashboard?month=9&year=2026", {
      cache: "no-store",
      signal: undefined,
    });
  });

  it("keeps the legacy request when no competence is supplied", async () => {
    apiMock.mockResolvedValueOnce({});

    await fetchDashboard();

    expect(apiMock).toHaveBeenCalledWith("/api/dashboard", {
      cache: "no-store",
      signal: undefined,
    });
  });
});
