import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const push = vi.fn();
const replace = vi.fn();
const useAuth = vi.fn();
const useDashboard = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams("month=9&year=2026"),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/features/dashboard", () => ({
  useDashboard: (...args: unknown[]) => useDashboard(...args),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

const dashboardOverview = {
  period: { month: 4, year: 2026, label: "abril/2026" },
  summary: {
    incomes_total: 1200,
    expenses_total: 260,
    balance_total: 940,
    open_total: 140,
    paid_total: 120,
    transactions_count: 4,
  },
  monthly_trend: [
    { month: 10, year: 2025, label: "out", total_amount: 0, transactions_count: 0 },
    { month: 11, year: 2025, label: "nov", total_amount: 0, transactions_count: 0 },
    { month: 12, year: 2025, label: "dez", total_amount: 0, transactions_count: 0 },
    { month: 1, year: 2026, label: "jan", total_amount: 0, transactions_count: 0 },
    { month: 2, year: 2026, label: "fev", total_amount: 0, transactions_count: 0 },
    { month: 3, year: 2026, label: "mar", total_amount: 50, transactions_count: 1 },
    { month: 4, year: 2026, label: "abr", total_amount: 260, transactions_count: 3 },
  ],
  by_card: [
    {
      id: 1,
      name: "NUBANK",
      total_amount: 180,
      open_amount: 60,
      paid_amount: 120,
      transactions_count: 2,
    },
  ],
  by_category: [
    {
      id: 1,
      name: "Alimentação",
      total_amount: 80,
      transactions_count: 1,
    },
  ],
  recent_expenses: [
    {
      id: 1,
      description: "MERCADO",
      value: 80,
      date: "2026-04-10",
      paid: false,
      category: { id: 1, name: "Alimentação" },
      card: null,
      installment_number: null,
      installments_count: null,
    },
  ],
  statements: [
    {
      id: 1,
      card: { id: 1, name: "NUBANK" },
      billing_statement: "2026-04-01",
      total_amount: 180,
      paid_amount: 120,
      remaining_amount: 60,
      paid: false,
      due_day: 15,
      closing_day: 8,
      transactions_count: 2,
    },
  ],
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useDashboard.mockReturnValue({
    loading: false,
    error: null,
    overview: dashboardOverview,
  });
});

describe("DashboardPage", () => {
  it("passes the month and year from the URL to the dashboard hook", () => {
    render(<DashboardPage />);

    expect(useDashboard).toHaveBeenCalledWith(expect.objectContaining({ month: 9, year: 2026 }));
  });

  it("renders income, expense and balance data in the financial dashboard", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Receitas do mês")).toBeInTheDocument();
    expect(screen.getByText("Despesas do mês")).toBeInTheDocument();
    expect(screen.getAllByText("Saldo do mês").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R$ 940,00").length).toBeGreaterThan(0);
    expect(screen.getByText("Evolução mensal de despesas")).toBeInTheDocument();
    expect(screen.getByText("Receitas vs despesas")).toBeInTheDocument();
    expect(screen.getByText("Despesas por categoria")).toBeInTheDocument();
    expect(screen.getByText("Últimas despesas cadastradas")).toBeInTheDocument();
    expect(screen.getByText("Faturas e cartões")).toBeInTheDocument();
    expect(screen.getByText("Status das despesas")).toBeInTheDocument();
    expect(screen.queryByText("Em construção")).not.toBeInTheDocument();
  });

  it("explains when the monthly balance is negative", () => {
    useDashboard.mockReturnValue({
      loading: false,
      error: null,
      overview: {
        ...dashboardOverview,
        summary: {
          ...dashboardOverview.summary,
          incomes_total: 100,
          expenses_total: 260,
          balance_total: -160,
        },
      },
    });

    render(<DashboardPage />);

    expect(screen.getAllByText(/160,00/).length).toBeGreaterThan(0);
    expect(screen.getByText("As despesas superaram as receitas do período.")).toBeInTheDocument();
  });
});
