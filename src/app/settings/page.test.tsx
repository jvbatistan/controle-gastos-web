import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

const replace = vi.fn();
const refresh = vi.fn();
const switchDataEnvironment = vi.fn();
const useAuth = vi.fn();
const useDataEnvironment = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh, push: vi.fn() }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/lib/data-environment-context", () => ({
  useDataEnvironment: () => useDataEnvironment(),
}));

vi.mock("@/lib/data-environment", () => ({
  switchDataEnvironment: (...args: unknown[]) => switchDataEnvironment(...args),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

describe("SettingsPage", () => {
  const auth = {
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "operator@example.com", active: true },
    setUnauthenticated: vi.fn(),
  };
  const environment = {
    status: "ready",
    data: {
      environment: "local",
      connection_status: "available",
      schema_compatible: true,
      can_switch_data_environment: true,
    },
    reset: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    switchDataEnvironment.mockReset();
    auth.setUnauthenticated.mockReset();
    environment.reset.mockReset();
    environment.refresh.mockReset();
    useAuth.mockReturnValue(auth);
    useDataEnvironment.mockReturnValue(environment);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the current local environment and health", () => {
    render(<SettingsPage />);

    expect(screen.getByText("Local — desenvolvimento e QA")).toBeInTheDocument();
    expect(screen.getByText("Disponível")).toBeInTheDocument();
    expect(screen.getByText("Compatível")).toBeInTheDocument();
  });

  it("hides switch controls when the backend denies permission", () => {
    useDataEnvironment.mockReturnValue({
      ...environment,
      data: { ...environment.data, can_switch_data_environment: false },
    });

    render(<SettingsPage />);

    expect(screen.queryByRole("button", { name: "Usar dados reais" })).not.toBeInTheDocument();
  });

  it("requires confirmation before requesting Supabase", async () => {
    const user = userEvent.setup();
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<SettingsPage />);
    await user.click(screen.getByRole("button", { name: "Usar dados reais" }));

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("DADOS REAIS"));
    expect(switchDataEnvironment).not.toHaveBeenCalled();
  });

  it("clears authenticated state and redirects to login after a successful switch", async () => {
    const user = userEvent.setup();
    switchDataEnvironment.mockResolvedValue({ environment: "supabase", reauthentication_required: true });

    render(<SettingsPage />);
    await user.click(screen.getByRole("button", { name: "Usar dados reais" }));

    await waitFor(() => {
      expect(switchDataEnvironment).toHaveBeenCalledWith("supabase");
      expect(environment.reset).toHaveBeenCalledTimes(1);
      expect(auth.setUnauthenticated).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/login");
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps current state and displays the API error when switching fails", async () => {
    const user = userEvent.setup();
    switchDataEnvironment.mockRejectedValue(new Error("O ambiente de destino está indisponível."));

    render(<SettingsPage />);
    await user.click(screen.getByRole("button", { name: "Usar dados reais" }));

    expect(await screen.findByText("O ambiente de destino está indisponível.")).toBeInTheDocument();
    expect(environment.reset).not.toHaveBeenCalled();
    expect(auth.setUnauthenticated).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
