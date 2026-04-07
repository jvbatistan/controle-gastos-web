import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import type { Transaction } from "@/features/transactions/types/transaction.types";

const baseTransaction: Transaction = {
  id: 1,
  description: "UBER TRIP 1234",
  value: 32.9,
  date: "2026-03-23",
  kind: "expense",
  source: "cash",
  paid: false,
  category: null,
  card: null,
  classification: {
    status: "suggestion_pending",
    category: null,
    suggestion: {
      id: 99,
      confidence: 0.6,
      source: "rule",
      suggested_category: null,
    },
  },
};

describe("TransactionTable", () => {
  it("renders the classification badge for a pending suggestion", () => {
    render(<TransactionTable items={[baseTransaction]} loading={false} />);

    expect(screen.getAllByText("Sugestão pendente").length).toBeGreaterThan(0);
  });

  it("shows the review action and calls the callback for pending transactions", async () => {
    const user = userEvent.setup();
    const onReviewClassification = vi.fn();

    render(
      <TransactionTable
        items={[baseTransaction]}
        loading={false}
        onReviewClassification={onReviewClassification}
      />
    );

    const triggers = screen.getAllByRole("button");
    await user.click(triggers[0]);
    await user.click(screen.getByRole("menuitem", { name: /Revisar classificação/i }));

    expect(onReviewClassification).toHaveBeenCalledWith(baseTransaction);
  });

  it("shows the archive action when deletion is available", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TransactionTable items={[baseTransaction]} loading={false} onDelete={onDelete} />);

    await user.click(screen.getAllByRole("button")[0]);

    expect(screen.getByRole("menuitem", { name: /Arquivar/i })).toBeInTheDocument();
  });
});
