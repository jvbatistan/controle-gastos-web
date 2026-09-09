describe("API proxy", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("API_URL", "http://backend.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("forwards the explicit data-environment switch header to Rails", async () => {
    const backendFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ environment: "supabase" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const { NextRequest } = await import("next/server");
    const { POST } = await import("@/app/api/[...path]/route");
    const request = new NextRequest("http://frontend.example.test/api/data_environment/switch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-finch-data-environment-switch": "confirmed",
      },
      body: JSON.stringify({ environment: "supabase" }),
    });

    await POST(request, { params: Promise.resolve({ path: ["data_environment", "switch"] }) });

    expect(backendFetch).toHaveBeenCalledWith(
      new URL("http://backend.example.test/api/data_environment/switch"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({}),
      })
    );
    const requestInit = backendFetch.mock.calls[0][1];
    expect(new Headers(requestInit?.headers).get("x-finch-data-environment-switch")).toBe("confirmed");
  });
});
