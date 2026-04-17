import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const push = vi.fn();
const replace = vi.fn();
const useAuth = vi.fn();
const useDashboard = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
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
    overview: {
      period: { month: 4, year: 2026, label: "abril/2026" },
      summary: {
        expenses_total: 260,
        open_total: 140,
        paid_total: 120,
        transactions_count: 3,
      },
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
    },
  });
});

describe("DashboardPage", () => {
  it("renders real expense data and marks revenue-dependent sections as under construction", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Despesas do mês")).toBeInTheDocument();
    expect(screen.getAllByText("Em aberto").length).toBeGreaterThan(0);
    expect(screen.getByText("Pagas")).toBeInTheDocument();
    expect(screen.getByText("Totais por cartão")).toBeInTheDocument();
    expect(screen.getByText("Totais por categoria")).toBeInTheDocument();
    expect(screen.getByText("Últimas despesas cadastradas")).toBeInTheDocument();
    expect(screen.getByText("Faturas e cartões")).toBeInTheDocument();
    expect(screen.getAllByText("Em construção").length).toBeGreaterThan(0);
    expect(screen.getByText(/Receitas ainda não entram no dashboard/i)).toBeInTheDocument();
  });
});
