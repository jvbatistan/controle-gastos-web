import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountStatementPrintPage from "@/app/accounts/[id]/statement/print/page";

const push = vi.fn();
const replace = vi.fn();
const routerMock = { push, replace };
const fetchAccountStatementForPrint = vi.fn();
const useAuth = vi.fn();
const useParams = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useParams: () => useParams(),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/features/accounts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/accounts")>();
  return {
    ...actual,
    fetchAccountStatementForPrint: (...args: unknown[]) => fetchAccountStatementForPrint(...args),
  };
});

const statement = {
  account: {
    id: 1,
    name: "Nubank",
    kind: "checking" as const,
    archived_at: null,
    current_balance: "1500.0",
  },
  period: { start_date: "2026-07-01", end_date: "2026-07-31" },
  filters: { movement_type: "income" as const, direction: "credit" as const },
  balances: { opening_balance: "1000.0", closing_balance: "2800.0" },
  summary: { credits_total: "3000.0", debits_total: "1200.0", net_total: "1800.0" },
  pagination: { page: 1, per_page: 25, total_count: 3, total_pages: 1 },
  items: [
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
      id: "account-transfer-3-out",
      source_type: "account_transfer",
      source_id: 3,
      movement_type: "transfer_out" as const,
      direction: "debit" as const,
      amount: "300.0",
      occurred_on: "2026-07-07",
      title: "Transferência para Reserva",
      description: null,
      status: "posted",
      metadata: { counterparty_account: { id: 2, name: "Reserva" } },
    },
  ],
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  fetchAccountStatementForPrint.mockReset().mockResolvedValue({ status: 200, data: statement });
  useParams.mockReturnValue({ id: "1" });
  useAuth.mockReturnValue({ status: "authenticated", user: { id: 1 } });
  Object.defineProperty(window, "print", { configurable: true, value: vi.fn() });
  window.history.pushState({}, "", "/accounts/1/statement/print?start_date=2026-07-01&end_date=2026-07-31&movement_type=income&direction=credit&page=3");
});

describe("AccountStatementPrintPage", () => {
  it("renders the complete financial document with human filters and all movements", async () => {
    render(<AccountStatementPrintPage />);

    expect(screen.getByText("Carregando documento para impressão...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Extrato por Account" })).toBeInTheDocument();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
    expect(screen.getByText("Tipo: Entrada · Direção: Entrada")).toBeInTheDocument();
    expect(screen.getByText("Saldo de fechamento do período")).toBeInTheDocument();
    expect(screen.getByText("3 movimentações no período")).toBeInTheDocument();
    expect(screen.getByText("SALÁRIO")).toBeInTheDocument();
    expect(screen.getByText("MERCADO")).toBeInTheDocument();
    expect(screen.getByText("Transferência para Reserva")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 2.000,00").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Imprimir" })).toBeInTheDocument();
    expect(fetchAccountStatementForPrint).toHaveBeenCalledWith(1, expect.objectContaining({
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      movementType: "income",
      direction: "credit",
    }));
  });

  it("prints only after explicit user action", async () => {
    const user = userEvent.setup();
    render(<AccountStatementPrintPage />);

    await screen.findByRole("heading", { name: "Extrato por Account" });
    await user.click(screen.getByRole("button", { name: "Imprimir" }));

    expect(window.print).toHaveBeenCalledOnce();
  });

  it("supports archived accounts and periods without movements", async () => {
    fetchAccountStatementForPrint.mockResolvedValueOnce({
      status: 200,
      data: {
        ...statement,
        account: { ...statement.account, archived_at: "2026-07-20T10:00:00Z" },
        items: [],
        pagination: { ...statement.pagination, total_count: 0, total_pages: 0 },
        summary: { credits_total: "0.0", debits_total: "0.0", net_total: "0.0" },
      },
    });

    render(<AccountStatementPrintPage />);

    expect(await screen.findByText("Arquivada")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma movimentação no período.")).toBeInTheDocument();
    expect(screen.getByText("0 movimentações no período")).toBeInTheDocument();
    expect(screen.getByText("Saldo de abertura")).toBeInTheDocument();
    expect(screen.getByText("Saldo de fechamento do período")).toBeInTheDocument();
  });

  it("shows a retry path when loading fails", async () => {
    fetchAccountStatementForPrint.mockRejectedValueOnce(new Error("HTTP 404"));
    render(<AccountStatementPrintPage />);

    expect(await screen.findByText("Conta não encontrada.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users", () => {
    useAuth.mockReturnValue({ status: "unauthenticated", user: null });
    render(<AccountStatementPrintPage />);

    expect(replace).toHaveBeenCalledWith("/login");
  });
});
