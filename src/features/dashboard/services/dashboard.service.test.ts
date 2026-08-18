import { describe, expect, it, vi } from "vitest";
import { fetchDashboard } from "@/features/dashboard/services/dashboard.service";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: vi.fn() }));

describe("fetchDashboard", () => {
  it("requests the selected competence", async () => {
    vi.mocked(api).mockResolvedValueOnce({ period: { month: 9, year: 2026 } });

    await fetchDashboard(9, 2026);

    expect(api).toHaveBeenCalledWith("/api/dashboard?month=9&year=2026", expect.objectContaining({ cache: "no-store" }));
  });
});
