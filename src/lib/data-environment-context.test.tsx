import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataEnvironmentProvider, useDataEnvironment } from "@/lib/data-environment-context";
import { fetchDataEnvironment } from "@/lib/data-environment";

const useAuth = vi.fn();

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/lib/data-environment", () => ({
  fetchDataEnvironment: vi.fn(),
}));

const fetchDataEnvironmentMock = vi.mocked(fetchDataEnvironment);

function Consumer() {
  const context = useDataEnvironment();
  return (
    <div>
      <span>{context.status === "ready" ? context.data.environment : context.status}</span>
      <button type="button" onClick={context.reset}>Reset</button>
    </div>
  );
}

describe("DataEnvironmentProvider", () => {
  beforeEach(() => {
    fetchDataEnvironmentMock.mockReset();
  });

  it("loads the environment once authentication is available and can discard it", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ status: "authenticated", user: { id: 1 } });
    fetchDataEnvironmentMock.mockResolvedValue({
      environment: "supabase",
      connection_status: "available",
      schema_compatible: true,
      can_switch_data_environment: true,
    });

    render(
      <DataEnvironmentProvider>
        <Consumer />
      </DataEnvironmentProvider>
    );

    expect(await screen.findByText("supabase")).toBeInTheDocument();
    expect(fetchDataEnvironmentMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(screen.getByText("idle")).toBeInTheDocument());
  });

  it("does not query the protected endpoint while unauthenticated", async () => {
    useAuth.mockReturnValue({ status: "unauthenticated" });

    render(
      <DataEnvironmentProvider>
        <Consumer />
      </DataEnvironmentProvider>
    );

    await waitFor(() => expect(screen.getByText("idle")).toBeInTheDocument());
    expect(fetchDataEnvironmentMock).not.toHaveBeenCalled();
  });

  it("does not restore stale environment data after reset", async () => {
    let resolveRequest: ((value: {
      environment: "supabase";
      connection_status: "available";
      schema_compatible: true;
      can_switch_data_environment: true;
    }) => void) | undefined;
    useAuth.mockReturnValue({ status: "authenticated", user: { id: 1 } });
    fetchDataEnvironmentMock.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const user = userEvent.setup();

    render(
      <DataEnvironmentProvider>
        <Consumer />
      </DataEnvironmentProvider>
    );

    expect(await screen.findByText("loading")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    resolveRequest?.({
      environment: "supabase",
      connection_status: "available",
      schema_compatible: true,
      can_switch_data_environment: true,
    });

    await waitFor(() => expect(screen.getByText("idle")).toBeInTheDocument());
    expect(screen.queryByText("supabase")).not.toBeInTheDocument();
  });
});
