import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionsPage from "@/app/transactions/page";

const push = vi.fn();
const replace = vi.fn();
const refetch = vi.fn();
const createTransaction = vi.fn();
const updateTransaction = vi.fn();
const deleteTransaction = vi.fn();
const exportTransactionsCsv = vi.fn();
const useTransactions = vi.fn();
const useCreateTransaction = vi.fn();
const useUpdateTransaction = vi.fn();
const useDeleteTransaction = vi.fn();
const useCards = vi.fn();
const useAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/components/Header", () => ({
  Header: ({ onNewTransactionClick }: { onNewTransactionClick?: () => void }) => (
    <button onClick={onNewTransactionClick}>Nova transacao</button>
  ),
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

vi.mock("@/features/cards", () => ({
  useCards: () => useCards(),
}));

vi.mock("@/features/transactions", async () => {
  const actual = await vi.importActual<typeof import("@/features/transactions")>("@/features/transactions");

  return {
    ...actual,
    useTransactions: () => useTransactions(),
    useCreateTransaction: () => useCreateTransaction(),
    useUpdateTransaction: () => useUpdateTransaction(),
    useDeleteTransaction: () => useDeleteTransaction(),
    exportTransactionsCsv: (...args: unknown[]) => exportTransactionsCsv(...args),
    TransactionStats: () => <div>Stats</div>,
    TransactionFilters: ({ onChange }: { onChange: (filters: unknown) => void }) => (
      <button
        type="button"
        onClick={() => onChange({ cardId: "7", month: "3", year: "2026", limit: "100" })}
      >
        Filters
      </button>
    ),
  };
});

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:finch-csv"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  push.mockReset();
  replace.mockReset();
  refetch.mockReset().mockResolvedValue(undefined);
  createTransaction.mockReset();
  updateTransaction.mockReset().mockResolvedValue({
    id: 1,
    description: "SUPERMERCADO NOVO",
  });
  deleteTransaction.mockReset().mockResolvedValue(true);
  exportTransactionsCsv.mockReset().mockResolvedValue({
    status: 200,
    data: { blob: new Blob(["csv"], { type: "text/csv" }), filename: "finch-transacoes-2026-06-29.csv" },
  });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useCards.mockReturnValue({
    cards: [{ id: 7, name: "NUBANK" }],
    error: null,
  });
  useTransactions.mockReturnValue({
    items: [
      {
        id: 1,
        description: "SUPERMERCADO",
        value: 89.9,
        date: "2026-03-18",
        kind: "expense",
        source: "card",
        paid: false,
        note: "Compra do mes",
        card: { id: 7, name: "NUBANK" },
        category: null,
        classification: null,
      },
    ],
    loading: false,
    error: null,
    refetch,
  });
  useCreateTransaction.mockReturnValue({
    createTransaction,
    loading: false,
    error: null,
  });
  useUpdateTransaction.mockReturnValue({
    updateTransaction,
    loading: false,
    error: null,
  });
  useDeleteTransaction.mockReturnValue({
    deleteTransaction,
    loading: false,
    error: null,
  });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function getFirstActionTrigger() {
  return screen.getAllByRole("button").find((button) => button.getAttribute("aria-expanded") === "false");
}

describe("TransactionsPage", () => {
  it("opens the edit modal and updates the selected transaction", async () => {
    const user = userEvent.setup();

    render(<TransactionsPage />);

    await user.click(getFirstActionTrigger()!);
    await user.click(screen.getByRole("menuitem", { name: /Editar/i }));

    expect(screen.getByText("Editar Transação")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("SUPERMERCADO"), { target: { value: "Supermercado novo" } });
    await user.click(screen.getByRole("button", { name: /Salvar alterações/i }));

    await waitFor(() => {
      expect(updateTransaction).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          description: "Supermercado novo",
          value: 89.9,
          source: "card",
          card_id: 7,
        })
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("archives the transaction when the user confirms", async () => {
    const user = userEvent.setup();

    render(<TransactionsPage />);

    await user.click(getFirstActionTrigger()!);
    await user.click(screen.getByRole("menuitem", { name: /Arquivar/i }));

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith(1);
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("shows the CSV export button and downloads using the current filters", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:finch-csv");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<TransactionsPage />);

    expect(screen.getByRole("button", { name: /Exportar CSV/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    await waitFor(() => {
      expect(exportTransactionsCsv).toHaveBeenCalledWith({
        cardId: "7",
        month: "3",
        year: "2026",
        limit: "100",
      });
      expect(createObjectURL).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:finch-csv");
    });
  });

  it("shows loading while exporting CSV", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    let resolveExport: (value: unknown) => void = () => undefined;
    exportTransactionsCsv.mockReturnValue(
      new Promise((resolve) => {
        resolveExport = resolve;
      })
    );

    render(<TransactionsPage />);

    await user.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    expect(screen.getByRole("button", { name: /Exportando/i })).toBeDisabled();

    resolveExport({
      status: 200,
      data: { blob: new Blob(["csv"], { type: "text/csv" }), filename: "finch-transacoes-2026-06-29.csv" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Exportar CSV/i })).not.toBeDisabled();
    });
  });

  it("shows a friendly error if CSV export fails", async () => {
    const user = userEvent.setup();
    exportTransactionsCsv.mockRejectedValue(new Error("boom"));

    render(<TransactionsPage />);

    await user.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    expect(await screen.findByText(/Não foi possível exportar as transações/i)).toBeInTheDocument();
  });
});
