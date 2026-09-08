import { api } from "@/lib/api";
import { fetchDataEnvironment, switchDataEnvironment } from "@/lib/data-environment";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const apiMock = vi.mocked(api);

describe("data environment service", () => {
  beforeEach(() => apiMock.mockReset());

  it("loads the current environment without cache", async () => {
    apiMock.mockResolvedValue({ environment: "local" });

    await fetchDataEnvironment();

    expect(apiMock).toHaveBeenCalledWith("/api/data_environment", { cache: "no-store" });
  });

  it("sends only the selected environment when switching", async () => {
    apiMock.mockResolvedValue({ environment: "supabase", reauthentication_required: true });

    await switchDataEnvironment("supabase");

    expect(apiMock).toHaveBeenCalledWith("/api/data_environment/switch", {
      method: "POST",
      headers: { "X-Finch-Data-Environment-Switch": "confirmed" },
      body: JSON.stringify({ environment: "supabase" }),
      cache: "no-store",
    });
  });
});
