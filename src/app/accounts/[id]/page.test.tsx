import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountStatementPage from "@/app/accounts/[id]/page";

const push = vi.fn();
const replace = vi.fn();
const routerMock = { push, replace };
const fetchAccountStatement = vi.fn();
const useAuth = vi.fn();
const useParams = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useParams: () => useParams(),
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

vi.mock("@/features/accounts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/accounts")>();

  return {
    ...actual,
    fetchAccountStatement: (...args: unknown[]) => fetchAccountStatement(...args),
  };
});

const statement = {
  account: {
    id: 1,
    name: "Nubank",
    kind: "checking" as const,
    initial_balance: "1000.0",
    initial_balance_date: "2026-07-01",
    archived_at: null,
    current_balance: "1500.0",
  },
  period: {
    start_date: "2026-07-01",
    end_date: "2026-07-31",
  },
  filters: {
    movement_type: null,
    direction: null,
  },
  summary: {
    credits_total: "3000.0",
    debits_total: "1200.0",
    net_total: "1800.0",
  },
  pagination: {
    page: 1,
    per_page: 25,
    total_count: 6,
    total_pages: 2,
  },
  items: [
    {
      id: "initial-balance-1",
      source_type: "account",
      source_id: 1,
      movement_type: "initial_balance" as const,
      direction: "credit" as const,
      amount: "1000.0",
      occurred_on: "2026-07-01",
      title: "Saldo inicial",
      description: "Saldo informado ao criar a conta",
      status: "posted",
      metadata: {},
    },
    {
      id: "transaction-1",
      source_type: "transaction",
      source_id: 1,
      movement_type: "income" as const,
      direction: "credit" as const,
      amount: "2000.0",
      occurred_on: "2026-07-05",
      title: "SALÁRIO",
      description: "Pagamento mensal",
      status: "posted",
      metadata: { category: { id: 1, name: "Salário" }, source: "bank" },
    },
    {
      id: "transaction-2",
      source_type: "transaction",
      source_id: 2,
      movement_type: "expense" as const,
      direction: "debit" as const,
      amount: "120.0",
      occurred_on: "2026-07-06",
      title: "MERCADO",
      description: null,
      status: "posted",
      metadata: { category: { id: 2, name: "Mercado" }, source: "cash" },
    },
    {
      id: "card-statement-payment-1",
      source_type: "card_statement_payment",
      source_id: 1,
      movement_type: "card_statement_payment" as const,
      direction: "debit" as const,
      amount: "500.0",
      occurred_on: "2026-07-10",
      title: "Pagamento de fatura",
      description: "Pagamento cartão",
      status: "posted",
      metadata: { card: { id: 9, name: "NUBANK VISA" }, billing_statement: "2026-07-01" },
    },
    {
      id: "account-transfer-1-in",
      source_type: "account_transfer",
      source_id: 1,
      movement_type: "transfer_in" as const,
      direction: "credit" as const,
      amount: "250.0",
      occurred_on: "2026-07-11",
      title: "Transferência de Reserva",
      description: "Retorno",
      status: "posted",
      metadata: { counterparty_account: { id: 2, name: "Reserva" }, note: "Reserva mensal" },
    },
    {
      id: "account-transfer-2-out",
      source_type: "account_transfer",
      source_id: 2,
      movement_type: "transfer_out" as const,
      direction: "debit" as const,
      amount: "300.0",
      occurred_on: "2026-07-12",
      title: "Transferência para Carteira",
      description: null,
      status: "posted",
      metadata: { counterparty_account: { id: 3, name: "Carteira" } },
    },
  ],
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  fetchAccountStatement.mockReset().mockResolvedValue({ status: 200, data: statement });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useParams.mockReturnValue({ id: "1" });
  window.history.pushState({}, "", "/accounts/1");
});

describe("AccountStatementPage", () => {
  it("renders account header, summary and all supported movement types", async () => {
    render(<AccountStatementPage />);

    expect(screen.getByText("Carregando extrato...")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "Nubank" })).toBeInTheDocument();
    expect(screen.getByText("Conta corrente")).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
    expect(screen.getByText("Saldo atual")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
    expect(screen.getByText("Entradas")).toBeInTheDocument();
    expect(screen.getByText("Saídas")).toBeInTheDocument();
    expect(screen.getByText("Variação líquida")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.200,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.800,00")).toBeInTheDocument();

    expect(screen.getAllByText("Saldo inicial").length).toBeGreaterThan(0);
    expect(screen.getByText("SALÁRIO")).toBeInTheDocument();
    expect(screen.getByText("MERCADO")).toBeInTheDocument();
    expect(screen.getAllByText("Pagamento de fatura").length).toBeGreaterThan(0);
    expect(screen.getByText("Transferência de Reserva")).toBeInTheDocument();
    expect(screen.getByText("Transferência para Carteira")).toBeInTheDocument();
    expect(screen.getByText("+ R$ 1.000,00")).toBeInTheDocument();
    expect(screen.getByText("+ R$ 2.000,00")).toBeInTheDocument();
    expect(screen.getByText("- R$ 120,00")).toBeInTheDocument();
    expect(screen.getByText("- R$ 500,00")).toBeInTheDocument();
    expect(screen.getByText("+ R$ 250,00")).toBeInTheDocument();
    expect(screen.getByText("- R$ 300,00")).toBeInTheDocument();
    expect(screen.getByText(/Categoria: Salário/)).toBeInTheDocument();
    expect(screen.getByText(/Cartão: NUBANK VISA/)).toBeInTheDocument();
    expect(screen.getByText(/Contraparte: Reserva/)).toBeInTheDocument();
    expect(screen.getByText(/Contraparte: Carteira/)).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 2 · 6 movimentações")).toBeInTheDocument();
  });

  it("shows archived account as read-only", async () => {
    fetchAccountStatement.mockResolvedValueOnce({
      status: 200,
      data: {
        ...statement,
        account: {
          ...statement.account,
          archived_at: "2026-07-20T10:00:00Z",
        },
      },
    });

    render(<AccountStatementPage />);

    expect(await screen.findByText("Arquivada")).toBeInTheDocument();
    expect(screen.getByText("Esta conta está arquivada. O extrato está disponível apenas para consulta.")).toBeInTheDocument();
  });

  it("applies period filters, resets to page one and updates the URL", async () => {
    render(<AccountStatementPage />);

    await screen.findByRole("heading", { name: "Nubank" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Aplicar" })).toBeEnabled());

    fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-07-10" } });
    fireEvent.change(screen.getByLabelText("Data final"), { target: { value: "2026-07-20" } });
    fireEvent.submit(screen.getByRole("form", { name: "Filtros de período" }));

    await waitFor(() => {
      expect(fetchAccountStatement).toHaveBeenLastCalledWith(1, {
        startDate: "2026-07-10",
        endDate: "2026-07-20",
        page: 1,
        perPage: 25,
        signal: undefined,
      });
      expect(push).toHaveBeenCalledWith("/accounts/1?start_date=2026-07-10&end_date=2026-07-20");
    });
  });

  it("validates invalid period before calling the API", async () => {
    render(<AccountStatementPage />);

    await screen.findByRole("heading", { name: "Nubank" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Aplicar" })).toBeEnabled());
    fetchAccountStatement.mockClear();

    fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-07-20" } });
    fireEvent.change(screen.getByLabelText("Data final"), { target: { value: "2026-07-10" } });
    fireEvent.submit(screen.getByRole("form", { name: "Filtros de período" }));

    expect(screen.getByText("A data inicial deve ser anterior ou igual à data final.")).toBeInTheDocument();
    expect(fetchAccountStatement).not.toHaveBeenCalled();
  });

  it("clears period filters and reloads the default statement", async () => {
    window.history.pushState({}, "", "/accounts/1?start_date=2026-07-01&end_date=2026-07-31&page=2");
    render(<AccountStatementPage />);

    await screen.findByRole("heading", { name: "Nubank" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Aplicar" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    await waitFor(() => {
      expect(fetchAccountStatement).toHaveBeenLastCalledWith(1, {
        startDate: undefined,
        endDate: undefined,
        page: 1,
        perPage: 25,
        signal: undefined,
      });
      expect(push).toHaveBeenCalledWith("/accounts/1");
    });
  });

  it("navigates through pagination and disables unavailable directions", async () => {
    render(<AccountStatementPage />);

    await screen.findByRole("heading", { name: "Nubank" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Aplicar" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Próxima" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    await waitFor(() => {
      expect(fetchAccountStatement).toHaveBeenLastCalledWith(1, {
        startDate: undefined,
        endDate: undefined,
        page: 2,
        perPage: 25,
        signal: undefined,
      });
      expect(push).toHaveBeenCalledWith("/accounts/1?page=2");
    });
  });

  it("shows empty state when there are no statement items", async () => {
    fetchAccountStatement.mockResolvedValueOnce({
      status: 200,
      data: {
        ...statement,
        items: [],
        pagination: { page: 1, per_page: 25, total_count: 0, total_pages: 0 },
      },
    });

    render(<AccountStatementPage />);

    expect(await screen.findByText("Nenhuma movimentação encontrada neste período.")).toBeInTheDocument();
    expect(screen.getByText("Tente ajustar o período selecionado.")).toBeInTheDocument();
  });

  it("shows not found errors with a return action", async () => {
    fetchAccountStatement.mockRejectedValue(new Error("HTTP 404"));

    render(<AccountStatementPage />);

    expect(await screen.findByText("Conta não encontrada.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Voltar para contas" }));

    expect(push).toHaveBeenCalledWith("/accounts");
  });

  it("redirects unauthenticated users", () => {
    useAuth.mockReturnValue({ status: "unauthenticated", user: null });

    render(<AccountStatementPage />);

    expect(replace).toHaveBeenCalledWith("/login");
  });
});
