import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountsPage from "@/app/accounts/page";

const push = vi.fn();
const replace = vi.fn();
const refetchActive = vi.fn();
const refetchArchived = vi.fn();
const createAccount = vi.fn();
const updateAccount = vi.fn();
const archiveAccount = vi.fn();
const restoreAccount = vi.fn();
const useAccounts = vi.fn();
const useAuth = vi.fn();

const activeAccounts = [
  {
    id: 1,
    name: "Nubank",
    kind: "checking" as const,
    initial_balance: "2000.0",
    initial_balance_date: "2026-07-01",
    current_balance: "2250.0",
    archived_at: null,
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
  {
    id: 2,
    name: "Carteira",
    kind: "wallet" as const,
    initial_balance: "100.0",
    initial_balance_date: "2026-07-01",
    current_balance: "-20.0",
    archived_at: null,
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
  {
    id: 4,
    name: "Inter",
    kind: "savings" as const,
    initial_balance: "0.0",
    initial_balance_date: "2026-07-10",
    current_balance: "0.0",
    archived_at: null,
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
];

const archivedAccounts = [
  {
    id: 3,
    name: "PicPay",
    kind: "digital_wallet" as const,
    initial_balance: "50.0",
    initial_balance_date: "2026-06-01",
    current_balance: "65.0",
    archived_at: "2026-07-01T10:00:00Z",
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

vi.mock("@/features/accounts", () => ({
  useAccounts: (...args: unknown[]) => useAccounts(...args),
  createAccount: (...args: unknown[]) => createAccount(...args),
  updateAccount: (...args: unknown[]) => updateAccount(...args),
  archiveAccount: (...args: unknown[]) => archiveAccount(...args),
  restoreAccount: (...args: unknown[]) => restoreAccount(...args),
}));

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  refetchActive.mockReset().mockResolvedValue(undefined);
  refetchArchived.mockReset().mockResolvedValue(undefined);
  createAccount.mockReset().mockResolvedValue({ status: 201, data: { id: 4, name: "Inter" } });
  updateAccount.mockReset().mockResolvedValue({ status: 200, data: { id: 1, name: "Inter" } });
  archiveAccount.mockReset().mockResolvedValue({ status: 200, data: { id: 1, name: "Nubank" } });
  restoreAccount.mockReset().mockResolvedValue({ status: 200, data: { id: 3, name: "PicPay" } });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useAccounts.mockImplementation((params: { archived?: boolean }) => {
    if (params.archived) {
      return { accounts: archivedAccounts, loading: false, error: null, refetch: refetchArchived };
    }

    return { accounts: activeAccounts, loading: false, error: null, refetch: refetchActive };
  });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccountsPage", () => {
  it("renders active and archived accounts with available types", async () => {
    const user = userEvent.setup();

    render(<AccountsPage />);

    expect(screen.getByText("Contas")).toBeInTheDocument();
    expect(screen.getByText("Gerencie onde seu dinheiro está.")).toBeInTheDocument();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
    expect(screen.getAllByText("Carteira").length).toBeGreaterThan(0);
    expect(screen.getByText("Inter")).toBeInTheDocument();
    expect(screen.getByText("PicPay")).toBeInTheDocument();
    expect(screen.getByText("Patrimônio disponível")).toBeInTheDocument();
    expect(screen.getByText("Soma dos saldos atuais das contas ativas")).toBeInTheDocument();
    expect(screen.getByText("R$ 2.230,00")).toBeInTheDocument();
    expect(screen.getByText("-R$ 20,00")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 0,00").length).toBeGreaterThan(0);
    expect(screen.getByText("R$ 65,00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Nova conta/i }));

    expect(screen.getByDisplayValue("Conta corrente")).toBeInTheDocument();
    expect(screen.getAllByText("Carteira digital").length).toBeGreaterThan(0);
  });

  it("creates an account and refreshes active and archived lists", async () => {
    const user = userEvent.setup();

    render(<AccountsPage />);

    await user.click(screen.getByRole("button", { name: /Nova conta/i }));
    await user.type(screen.getByPlaceholderText("Ex: Nubank"), "Inter");
    fireEvent.change(screen.getByDisplayValue("Conta corrente"), { target: { value: "savings" } });
    fireEvent.change(screen.getByDisplayValue("0"), { target: { value: "1500,50" } });

    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(createAccount).toHaveBeenCalledWith({
        name: "Inter",
        kind: "savings",
        initial_balance: 1500.5,
        initial_balance_date: expect.any(String),
      });
      expect(refetchActive).toHaveBeenCalled();
      expect(refetchArchived).toHaveBeenCalled();
      expect(screen.getByText("Conta criada com sucesso.")).toBeInTheDocument();
    });
  });

  it("edits an account", async () => {
    const user = userEvent.setup();

    render(<AccountsPage />);

    await user.click(screen.getAllByRole("button", { name: /Editar/i })[0]);
    fireEvent.change(screen.getByDisplayValue("Nubank"), { target: { value: "Nubank Principal" } });

    await user.click(screen.getByRole("button", { name: /Salvar alterações/i }));

    await waitFor(() => {
      expect(updateAccount).toHaveBeenCalledWith(1, {
        name: "Nubank Principal",
        kind: "checking",
        initial_balance: 2000,
        initial_balance_date: "2026-07-01",
      });
      expect(screen.getByText("Conta atualizada com sucesso.")).toBeInTheDocument();
    });
  });

  it("archives an account after confirmation", async () => {
    const user = userEvent.setup();

    render(<AccountsPage />);

    await user.click(screen.getAllByRole("button", { name: /Arquivar/i })[0]);

    await waitFor(() => {
      expect(archiveAccount).toHaveBeenCalledWith(1);
      expect(refetchActive).toHaveBeenCalled();
      expect(refetchArchived).toHaveBeenCalled();
      expect(screen.getByText("Conta arquivada com sucesso.")).toBeInTheDocument();
    });
  });

  it("restores an archived account", async () => {
    const user = userEvent.setup();

    render(<AccountsPage />);

    await user.click(screen.getByRole("button", { name: /Restaurar/i }));

    await waitFor(() => {
      expect(restoreAccount).toHaveBeenCalledWith(3);
      expect(refetchActive).toHaveBeenCalled();
      expect(refetchArchived).toHaveBeenCalled();
      expect(screen.getByText("Conta restaurada com sucesso.")).toBeInTheDocument();
    });
  });

  it("shows a friendly error when saving fails", async () => {
    const user = userEvent.setup();
    createAccount.mockRejectedValueOnce(new Error("Nome já está em uso"));

    render(<AccountsPage />);

    await user.click(screen.getByRole("button", { name: /Nova conta/i }));
    await user.type(screen.getByPlaceholderText("Ex: Nubank"), "Nubank");
    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    expect(await screen.findByText("Nome já está em uso")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    useAccounts.mockImplementation((params: { archived?: boolean }) => ({
      accounts: [],
      loading: true,
      error: null,
      refetch: params.archived ? refetchArchived : refetchActive,
    }));

    render(<AccountsPage />);

    expect(screen.getByText("Carregando contas...")).toBeInTheDocument();
    expect(screen.getByText("Carregando contas arquivadas...")).toBeInTheDocument();
  });
});
