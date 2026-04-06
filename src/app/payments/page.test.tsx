import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentsPage from "@/app/payments/page";

const push = vi.fn();
const replace = vi.fn();
const refetch = vi.fn();
const payCardStatement = vi.fn();
const ignoreCardStatement = vi.fn();
const payLooseExpense = vi.fn();
const payLooseExpenses = vi.fn();
const usePayments = vi.fn();
const useAuth = vi.fn();

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

vi.mock("@/features/payments", () => ({
  usePayments: (...args: unknown[]) => usePayments(...args),
  payCardStatement: (...args: unknown[]) => payCardStatement(...args),
  ignoreCardStatement: (...args: unknown[]) => ignoreCardStatement(...args),
  payLooseExpense: (...args: unknown[]) => payLooseExpense(...args),
  payLooseExpenses: (...args: unknown[]) => payLooseExpenses(...args),
}));

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  refetch.mockReset().mockResolvedValue(undefined);
  payCardStatement.mockReset().mockResolvedValue({ status: 200, data: { card: { name: "NUBANK" } } });
  ignoreCardStatement.mockReset().mockResolvedValue({ status: 200, data: { id: 1, ignored_at: "2026-03-12T10:00:00Z" } });
  payLooseExpense.mockReset().mockResolvedValue({
    status: 200,
    data: { id: 1, description: "MERCADO", value: 80, date: "2026-03-10", source: "cash", paid: true },
  });
  payLooseExpenses.mockReset().mockResolvedValue({ status: 200, data: { paid_transactions_count: 2, total_amount: 120 } });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  usePayments.mockReturnValue({
    loading: false,
    error: null,
    refetch,
    overview: {
      period: { month: 3, year: 2026 },
      statements: [
        {
          id: 1,
          card: { id: 1, name: "NUBANK" },
          billing_statement: "2026-03-01",
          total_amount: 300,
          paid_amount: 0,
          remaining_amount: 300,
          paid: false,
          due_day: 15,
          closing_day: 8,
          transactions_count: 4,
        },
      ],
      loose_expenses: {
        period_label: "03/2026",
        transactions_count: 2,
        total_amount: 120,
        paid: false,
        transactions: [
          { id: 1, description: "MERCADO", value: 80, date: "2026-03-10", source: "cash", paid: false },
          { id: 2, description: "UBER", value: 40, date: "2026-03-11", source: "bank", paid: false },
        ],
      },
    },
  });
});

describe("PaymentsPage", () => {
  it("pays a card statement and refreshes the overview", async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Pagar fatura/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento da fatura/i }));

    await waitFor(() => {
      expect(payCardStatement).toHaveBeenCalledWith(1);
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText('Fatura do cartão "NUBANK" quitada com sucesso.')).toBeInTheDocument();
    });
  });

  it("allows ignoring a statement for the selected period", async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Não pagar/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar não pagamento/i }));

    await waitFor(() => {
      expect(ignoreCardStatement).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Number));
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText(/removida do fluxo de pagamento/i)).toBeInTheDocument();
    });
  });

  it("opens a confirmation modal before paying a loose expense", async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Avulsas/i }));
    await user.click(screen.getAllByRole("button", { name: /Pagar despesa/i })[0]);

    expect(screen.getByText(/Essa ação altera o status de pagamento/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar pagamento da despesa/i })).toBeInTheDocument();
    expect(payLooseExpense).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(screen.queryByRole("button", { name: /Confirmar pagamento da despesa/i })).not.toBeInTheDocument();
    expect(payLooseExpense).not.toHaveBeenCalled();
  });

  it("switches to loose expenses and pays one expense at a time", async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Avulsas/i }));
    await user.click(screen.getAllByRole("button", { name: /Pagar despesa/i })[0]);
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento da despesa/i }));

    await waitFor(() => {
      expect(payLooseExpense).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Number));
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText('Despesa "MERCADO" marcada como paga.')).toBeInTheDocument();
    });
  });

  it("switches to loose expenses and pays all expenses in batch", async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Avulsas/i }));
    await user.click(screen.getByRole("button", { name: /Pagar todas as despesas/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento em lote/i }));

    await waitFor(() => {
      expect(payLooseExpenses).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText("2 despesas avulsas marcadas como pagas.")).toBeInTheDocument();
    });
  });

  it("blocks loose-expense actions while a loose-expense request is in flight", async () => {
    payLooseExpense.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByRole("button", { name: /Avulsas/i }));
    const batchButton = screen.getByRole("button", { name: /Pagar todas as despesas/i });
    const itemButtons = screen.getAllByRole("button", { name: /Pagar despesa/i });

    expect(batchButton).toBeEnabled();
    expect(itemButtons[0]).toBeEnabled();
    expect(itemButtons[1]).toBeEnabled();

    await user.click(itemButtons[0]);
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento da despesa/i }));

    await waitFor(() => {
      expect(payLooseExpense).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Number));
      expect(batchButton).toBeDisabled();
      expect(itemButtons[0]).toBeDisabled();
      expect(itemButtons[1]).toBeDisabled();
    });
  });
});
