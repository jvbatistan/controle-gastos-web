import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionCreateForm } from "@/features/transactions/components/TransactionCreateForm";
import type { Transaction } from "@/features/transactions/types/transaction.types";

describe("TransactionCreateForm", () => {
  it("shows installment fields only when the checkbox is enabled", async () => {
    const user = userEvent.setup();

    render(<TransactionCreateForm cards={[]} onSubmit={vi.fn()} />);

    expect(screen.queryByPlaceholderText("Parcela atual")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("10")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Compra parcelada"));

    expect(screen.getByPlaceholderText("1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("10")).toBeInTheDocument();
  });

  it("formats the currency input and submits the normalized payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TransactionCreateForm
        cards={[{ id: 7, name: "Nubank" }]}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByPlaceholderText("Ex: Compra no supermercado"), "Uber Trip");

    const amountInput = screen.getByPlaceholderText("0,00");
    await user.type(amountInput, "1234");
    expect(amountInput).toHaveValue("12,34");

    fireEvent.change(screen.getByDisplayValue("Dinheiro"), { target: { value: "card" } });
    fireEvent.change(screen.getByDisplayValue("Selecione um cartão"), { target: { value: "7" } });

    await user.click(screen.getByLabelText("Compra parcelada"));
    await user.clear(screen.getByPlaceholderText("1"));
    await user.type(screen.getByPlaceholderText("1"), "2");
    await user.clear(screen.getByPlaceholderText("10"));
    await user.type(screen.getByPlaceholderText("10"), "6");

    await user.click(screen.getByRole("button", { name: "Salvar despesa" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Uber Trip",
          value: 12.34,
          source: "card",
          card_id: 7,
          installment_number: 2,
          installments_count: 6,
        })
      );
    });
  });

  it("loads initial values in edit mode and submits an update payload without installment fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const transaction: Transaction = {
      id: 15,
      description: "MERCADO",
      value: 89.9,
      date: "2026-03-18",
      kind: "expense",
      source: "card",
      paid: true,
      note: "Compra do mes",
      card: { id: 7, name: "Nubank" },
      installment_group_id: "grp-1",
      installment_number: 2,
      installments_count: 6,
      category: null,
      classification: null,
    };

    render(
      <TransactionCreateForm
        mode="edit"
        initialTransaction={transaction}
        cards={[{ id: 7, name: "Nubank" }]}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByDisplayValue("MERCADO")).toBeInTheDocument();
    expect(screen.getByDisplayValue("89,90")).toBeInTheDocument();
    expect(screen.getByText(/Esta edição afeta apenas a parcela selecionada/i)).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Ex: Compra no supermercado"));
    await user.type(screen.getByPlaceholderText("Ex: Compra no supermercado"), "Mercado novo");
    await user.click(screen.getByRole("button", { name: /Salvar alterações/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Mercado novo",
          value: 89.9,
          source: "card",
          card_id: 7,
          paid: true,
          note: "Compra do mes",
          installment_number: null,
          installments_count: null,
        })
      );
    });
  });
});
