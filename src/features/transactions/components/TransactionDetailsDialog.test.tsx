import { render, screen } from "@testing-library/react";
import { TransactionDetailsDialog } from "@/features/transactions/components/TransactionDetailsDialog";
import type { Transaction } from "@/features/transactions/types/transaction.types";

const transaction: Transaction = {
  id: 1,
  description: "INTERNET",
  value: 150,
  original_value: 160,
  date: "2026-08-18",
  purchase_date: "2026-08-10",
  settled_on: "2026-08-22",
  settled_value: 149.26,
  kind: "expense",
  source: "bank",
  paid: true,
  category: { id: 2, name: "Casa" },
  account: { id: 3, name: "Conta Corrente" },
  card: null,
};

describe("TransactionDetailsDialog", () => {
  it("shows origin, obligation, settlement and the negative payment difference without rewriting values", () => {
    render(<TransactionDetailsDialog transaction={transaction} onClose={vi.fn()} />);

    expect(screen.getByText("Descrição").parentElement).toHaveTextContent("INTERNET");
    expect(screen.getByText("Origem").parentElement).toHaveTextContent("Conta bancária");
    expect(screen.getByText("Account").parentElement).toHaveTextContent("Conta Corrente");
    expect(screen.getByText("Data original da compra").parentElement).toHaveTextContent("10/08/2026");
    expect(screen.getByText("Data da obrigação").parentElement).toHaveTextContent("18/08/2026");
    expect(screen.getByText("Data efetiva do pagamento").parentElement).toHaveTextContent("22/08/2026");
    expect(screen.getByText("Valor original").parentElement).toHaveTextContent(/R\$\s*160,00/);
    expect(screen.getByText("Valor devido").parentElement).toHaveTextContent(/R\$\s*150,00/);
    expect(screen.getByText("Valor efetivamente pago").parentElement).toHaveTextContent(/R\$\s*149,26/);
    expect(screen.getByText("Diferença no pagamento").parentElement).toHaveTextContent(/-R\$\s*0,74 — Menor que o valor devido/);
  });

  it.each([
    [158.43, /\+R\$\s*8,43 — Maior que o valor devido/],
    [150, "Sem diferença"],
  ])("describes a neutral payment difference", (settledValue, expected) => {
    render(<TransactionDetailsDialog transaction={{ ...transaction, settled_value: settledValue }} onClose={vi.fn()} />);

    expect(screen.getByText("Diferença no pagamento").parentElement).toHaveTextContent(expected);
  });

  it("keeps card details free of settlement-specific fields", () => {
    render(
      <TransactionDetailsDialog
        transaction={{ ...transaction, source: "card", account: null, card: { id: 7, name: "NUBANK" } }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Cartão", { selector: "dt" }).parentElement).toHaveTextContent("NUBANK");
    expect(screen.queryByText("Diferença no pagamento")).not.toBeInTheDocument();
  });
});
