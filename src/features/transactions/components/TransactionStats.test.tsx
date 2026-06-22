import { render, screen } from "@testing-library/react";
import { TransactionStats } from "@/features/transactions/components/TransactionStats";
import type { PaymentStatement } from "@/features/payments";

const statement: PaymentStatement = {
  id: 35,
  card: { id: 2, name: "NUBANK" },
  billing_statement: "2026-07-15",
  total_amount: 1581.04,
  paid_amount: 30,
  remaining_amount: 1551.04,
  paid: false,
  payments: [
    {
      id: 1,
      amount: 30,
      paid_at: "2026-06-18T00:00:00-03:00",
      description: "PAGAMENTO",
      source: "converted_transaction",
      original_transaction_id: 641,
    },
  ],
  due_day: 15,
  closing_day: 3,
  transactions_count: 40,
};

describe("TransactionStats", () => {
  it("uses the remaining statement amount as the primary value and shows payments separately", () => {
    render(<TransactionStats items={[]} statement={statement} />);

    expect(screen.getByText("Saldo da fatura")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.551,04")).toBeInTheDocument();
    expect(screen.getByText("Total de despesas")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.581,04")).toBeInTheDocument();
    expect(screen.getByText("Pagamentos")).toBeInTheDocument();
    expect(screen.getAllByText(/R\$ 30,00/).length).toBeGreaterThan(0);
    expect(screen.getByText("Pagamentos e abatimentos")).toBeInTheDocument();
    expect(screen.getByText("PAGAMENTO")).toBeInTheDocument();
  });
});
