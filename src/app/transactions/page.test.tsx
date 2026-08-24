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
const useAccounts = vi.fn();
const useAuth = vi.fn();
const useSearchParams = vi.fn();
const usePayments = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => useSearchParams(),
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

vi.mock("@/features/accounts", () => ({
  useAccounts: () => useAccounts(),
}));

vi.mock("@/features/transactions", async () => {
  const actual = await vi.importActual<typeof import("@/features/transactions")>("@/features/transactions");

  return {
    ...actual,
    useTransactions: (...args: unknown[]) => useTransactions(...args),
    useCreateTransaction: () => useCreateTransaction(),
    useUpdateTransaction: () => useUpdateTransaction(),
    useDeleteTransaction: () => useDeleteTransaction(),
    exportTransactionsCsv: (...args: unknown[]) => exportTransactionsCsv(...args),
    TransactionStats: () => <div>Stats</div>,
    TransactionFilters: ({ filters, onChange }: { filters: { cardId: string; month: string; year: string; page: number; perPage: "25" | "50" | "100" }; onChange: (filters: unknown) => void }) => (
      <>
        <button
          type="button"
          onClick={() => onChange({ cardId: "7", month: "3", year: "2026", page: filters.page, perPage: "100" })}
        >
          Filters
        </button>
        <button type="button" onClick={() => onChange({ ...filters, cardId: "7" })}>Filtrar cartão</button>
      </>
    ),
  };
});

vi.mock("@/features/payments", () => ({
  usePayments: () => usePayments(),
}));

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
  useSearchParams.mockReturnValue(new URLSearchParams());
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
  useAccounts.mockReturnValue({
    accounts: [{ id: 3, name: "Conta Corrente" }],
    error: null,
  });
  usePayments.mockReturnValue({ overview: null, loading: false, error: null, refetch: vi.fn() });
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
    pagination: { page: 1, per_page: 25, total_count: 1, total_pages: 1 },
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
  it("requests the next and previous pages while preserving filters in the URL", async () => {
    const user = userEvent.setup();
    useSearchParams.mockReturnValue(new URLSearchParams("card_id=7&month=3&year=2026"));
    useTransactions.mockReturnValue({
      ...useTransactions(),
      pagination: { page: 1, per_page: 25, total_count: 51, total_pages: 3 },
    });

    render(<TransactionsPage />);

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(push).toHaveBeenLastCalledWith("/transactions?card_id=7&month=3&year=2026&page=2");

    useTransactions.mockReturnValue({
      ...useTransactions(),
      pagination: { page: 2, per_page: 25, total_count: 51, total_pages: 3 },
    });
    useSearchParams.mockReturnValue(new URLSearchParams("card_id=7&month=3&year=2026&page=2"));
    render(<TransactionsPage />);
    await user.click(screen.getAllByRole("button", { name: "Anterior" }).at(-1)!);
    expect(push).toHaveBeenLastCalledWith("/transactions?card_id=7&month=3&year=2026");
  });

  it("disables the next button on the last page and displays the backend total", () => {
    useSearchParams.mockReturnValue(new URLSearchParams("page=3"));
    useTransactions.mockReturnValue({
      ...useTransactions(),
      pagination: { page: 3, per_page: 25, total_count: 51, total_pages: 3 },
    });

    render(<TransactionsPage />);

    expect(screen.getByText("51 transações")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  it("keeps the existing empty-state message for an empty collection or a filtered page without results", () => {
    useTransactions.mockReturnValue({
      ...useTransactions(),
      items: [],
      pagination: { page: 1, per_page: 25, total_count: 0, total_pages: 0 },
    });

    const { rerender } = render(<TransactionsPage />);
    expect(screen.getAllByText("Nenhuma transação encontrada.").length).toBeGreaterThan(0);

    useTransactions.mockReturnValue({
      ...useTransactions(),
      items: [],
      pagination: { page: 3, per_page: 25, total_count: 51, total_pages: 3 },
    });
    rerender(<TransactionsPage />);
    expect(screen.getAllByText("Nenhuma transação encontrada.").length).toBeGreaterThan(0);
  });

  it("hydrates page and filters from the URL and resets to page one after a filter change", async () => {
    const user = userEvent.setup();
    useSearchParams.mockReturnValue(new URLSearchParams("card_id=7&month=3&year=2026&page=3&per_page=50"));
    useTransactions.mockReturnValue({
      ...useTransactions(),
      pagination: { page: 3, per_page: 50, total_count: 76, total_pages: 2 },
    });

    render(<TransactionsPage />);

    expect(useTransactions).toHaveBeenLastCalledWith(expect.objectContaining({
      filters: expect.objectContaining({ cardId: "7", month: "3", year: "2026", page: 3, perPage: "50" }),
    }));
    await user.click(screen.getByRole("button", { name: "Filtrar cartão" }));
    expect(push).toHaveBeenLastCalledWith("/transactions?card_id=7&month=3&year=2026&per_page=50");
  });

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

  it("opens transaction details with the recorded due and settled values", async () => {
    const user = userEvent.setup();
    useTransactions.mockReturnValue({
      ...useTransactions(),
      items: [{
        ...useTransactions().items[0],
        source: "bank",
        card: null,
        account: { id: 3, name: "Conta Corrente" },
        value: 150,
        original_value: 160,
        purchase_date: "2026-03-10",
        settled_on: "2026-03-20",
        settled_value: 149.26,
        paid: true,
      }],
    });

    render(<TransactionsPage />);

    await user.click(getFirstActionTrigger()!);
    await user.click(screen.getByRole("menuitem", { name: /Ver detalhes/i }));

    expect(screen.getByRole("dialog", { name: "Detalhes da Transação" })).toBeInTheDocument();
    expect(screen.getByText("Valor devido").parentElement).toHaveTextContent(/R\$\s*150,00/);
    expect(screen.getByText("Valor efetivamente pago").parentElement).toHaveTextContent(/R\$\s*149,26/);
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
        page: 1,
        perPage: "100",
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

  it("creates a cash or bank expense from the transaction modal with account_id", async () => {
    const user = userEvent.setup();
    createTransaction.mockResolvedValue({
      kind: "single",
      transaction: {
        id: 23,
        description: "PIX MERCADO",
        value: 150,
        date: "2026-06-30",
        kind: "expense",
        source: "bank",
        paid: false,
        account: { id: 3, name: "Conta Corrente" },
        card: null,
        category: null,
        classification: { status: "unclassified", category: null, suggestion: null },
      },
    });

    render(<TransactionsPage />);

    await user.click(screen.getByText("Nova transacao"));
    await user.type(screen.getByPlaceholderText("Ex: Compra no supermercado"), "Pix mercado");
    await user.type(screen.getByPlaceholderText("0,00"), "15000");
    fireEvent.change(screen.getByDisplayValue("Dinheiro"), { target: { value: "bank" } });
    fireEvent.change(screen.getByDisplayValue("Selecione a conta para o pagamento"), { target: { value: "3" } });
    await user.click(screen.getByRole("button", { name: "Salvar despesa" }));

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Pix mercado",
          value: 150,
          kind: "expense",
          source: "bank",
          card_id: null,
          account_id: 3,
        })
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("creates an income from the transaction modal and shows a success message", async () => {
    const user = userEvent.setup();
    createTransaction.mockResolvedValue({
      kind: "single",
      transaction: {
        id: 22,
        description: "SALARIO MENSAL",
        value: 3500,
        date: "2026-06-30",
        kind: "income",
        source: "bank",
        paid: true,
        account: { id: 3, name: "Conta Corrente" },
        card: null,
        category: null,
        classification: { status: "unclassified", category: null, suggestion: null },
      },
    });

    render(<TransactionsPage />);

    await user.click(screen.getByText("Nova transacao"));
    await user.click(screen.getByRole("button", { name: "Receita" }));
    await user.type(screen.getByPlaceholderText("Ex: Salário mensal"), "Salario mensal");
    await user.type(screen.getByPlaceholderText("0,00"), "350000");
    fireEvent.change(screen.getByDisplayValue("Dinheiro"), { target: { value: "bank" } });
    fireEvent.change(screen.getByDisplayValue("Selecione a conta onde o dinheiro entrou"), { target: { value: "3" } });
    await user.click(screen.getByRole("button", { name: "Salvar receita" }));

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Salario mensal",
          value: 3500,
          kind: "income",
          source: "bank",
          paid: true,
          refund: false,
          card_id: null,
          account_id: 3,
          installment_number: null,
          installments_count: null,
        })
      );
      expect(refetch).toHaveBeenCalled();
    });

    expect(await screen.findByText("Receita cadastrada com sucesso.")).toBeInTheDocument();
  });

  it("shows the API error message when income creation fails", async () => {
    const user = userEvent.setup();
    useCreateTransaction.mockReturnValue({
      createTransaction,
      loading: false,
      error: "Não foi possível cadastrar a receita.",
    });

    render(<TransactionsPage />);

    await user.click(screen.getByText("Nova transacao"));

    expect(screen.getByText("Não foi possível cadastrar a receita.")).toBeInTheDocument();
  });
});
