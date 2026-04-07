"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import type { Transaction, TransactionPayload } from "@/features/transactions/types/transaction.types";

type CardOption = {
  id: number;
  name: string;
};

type TransactionCreateFormProps = {
  cards: CardOption[];
  mode?: "create" | "edit";
  initialTransaction?: Transaction | null;
  loading?: boolean;
  onSubmit: (payload: TransactionPayload) => Promise<void> | void;
  onCancel?: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-neutral-800">{children}</label>;
}

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const amount = Number(digits || "0") / 100;

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function toCurrencyInput(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "";

  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildFormState(initialTransaction?: Transaction | null) {
  return {
    kind: initialTransaction?.kind ?? ("expense" as const),
    description: initialTransaction?.description ?? "",
    value: toCurrencyInput(initialTransaction?.value),
    date: initialTransaction?.date ?? new Date().toISOString().slice(0, 10),
    source: initialTransaction?.source ?? ("cash" as const),
    cardId: initialTransaction?.card?.id ? String(initialTransaction.card.id) : "none",
    paid: initialTransaction?.paid ?? false,
    note: initialTransaction?.note ?? "",
    hasInstallments: Boolean(initialTransaction?.installment_group_id),
    installmentNumber: String(initialTransaction?.installment_number ?? 1),
    installmentsCount: String(initialTransaction?.installments_count ?? 2),
  };
}

export function TransactionCreateForm({
  cards,
  mode = "create",
  initialTransaction = null,
  loading = false,
  onSubmit,
  onCancel,
}: TransactionCreateFormProps) {
  const [kind, setKind] = useState<"expense" | "income">(buildFormState(initialTransaction).kind);
  const [description, setDescription] = useState(buildFormState(initialTransaction).description);
  const [value, setValue] = useState(buildFormState(initialTransaction).value);
  const [date, setDate] = useState(buildFormState(initialTransaction).date);
  const [source, setSource] = useState<"cash" | "card" | "bank">(buildFormState(initialTransaction).source);
  const [cardId, setCardId] = useState(buildFormState(initialTransaction).cardId);
  const [paid, setPaid] = useState(buildFormState(initialTransaction).paid);
  const [hasInstallments, setHasInstallments] = useState(buildFormState(initialTransaction).hasInstallments);
  const [installmentNumber, setInstallmentNumber] = useState(buildFormState(initialTransaction).installmentNumber);
  const [installmentsCount, setInstallmentsCount] = useState(buildFormState(initialTransaction).installmentsCount);
  const [note, setNote] = useState(buildFormState(initialTransaction).note);
  const [error, setError] = useState<string | null>(null);
  const isEditing = mode === "edit";
  const isInstallmentTransaction = Boolean(initialTransaction?.installment_group_id);

  const sourceOptions = useMemo(
    () => [
      { value: "cash", label: "Dinheiro" },
      { value: "bank", label: "Banco" },
      { value: "card", label: "Cartão" },
    ],
    []
  );

  const cardOptions = useMemo(
    () => [{ value: "none", label: "Selecione um cartão" }, ...cards.map((card) => ({ value: String(card.id), label: card.name }))],
    [cards]
  );

  useEffect(() => {
    const nextState = buildFormState(initialTransaction);
    setKind(nextState.kind);
    setDescription(nextState.description);
    setValue(nextState.value);
    setDate(nextState.date);
    setSource(nextState.source);
    setCardId(nextState.cardId);
    setPaid(nextState.paid);
    setHasInstallments(nextState.hasInstallments);
    setInstallmentNumber(nextState.installmentNumber);
    setInstallmentsCount(nextState.installmentsCount);
    setNote(nextState.note);
    setError(null);
  }, [initialTransaction, mode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedDescription = description.trim();
    const normalizedValue = parseCurrencyInput(value);
    const normalizedInstallmentNumber = Number(installmentNumber);
    const normalizedInstallmentsCount = Number(installmentsCount);
    const requiresCard = source === "card";

    if (!normalizedDescription || !date || !(normalizedValue > 0)) {
      setError("Preencha descrição, valor e data corretamente.");
      return;
    }

    if (requiresCard && cardId === "none") {
      setError("Selecione um cartão para transações no cartão.");
      return;
    }

    if (
      hasInstallments &&
      (!Number.isInteger(normalizedInstallmentNumber) ||
        !Number.isInteger(normalizedInstallmentsCount) ||
        normalizedInstallmentNumber < 1 ||
        normalizedInstallmentsCount < 2 ||
        normalizedInstallmentNumber > normalizedInstallmentsCount)
    ) {
      setError("Preencha os campos de parcelamento corretamente.");
      return;
    }

    setError(null);

    await onSubmit({
      description: normalizedDescription,
      value: normalizedValue,
      date,
      kind,
      source,
      paid,
      note: note.trim() || undefined,
      card_id: source === "card" && cardId !== "none" ? Number(cardId) : null,
      installment_number: !isEditing && hasInstallments ? normalizedInstallmentNumber : null,
      installments_count: !isEditing && hasInstallments ? normalizedInstallmentsCount : null,
    });

    if (!isEditing) {
      const nextState = buildFormState(null);
      setKind(nextState.kind);
      setDescription(nextState.description);
      setValue(nextState.value);
      setDate(nextState.date);
      setSource(nextState.source);
      setCardId(nextState.cardId);
      setPaid(nextState.paid);
      setHasInstallments(nextState.hasInstallments);
      setInstallmentNumber(nextState.installmentNumber);
      setInstallmentsCount(nextState.installmentsCount);
      setNote(nextState.note);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 sm:p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-neutral-900">Dados principais</h3>
          <p className="text-sm text-neutral-500">Cadastre a transação e deixe a classificação automática fazer o resto.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <FieldLabel>Tipo de transação</FieldLabel>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-neutral-200">
              <button
                type="button"
                onClick={() => setKind("expense")}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  kind === "expense" ? "bg-rose-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100",
                ].join(" ")}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setKind("income")}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  kind === "income" ? "bg-emerald-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100",
                ].join(" ")}
                disabled={true}
              >
                Receita
                <small> (Em construção)</small>
              </button>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <FieldLabel>Descrição</FieldLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Compra no supermercado"
              disabled={loading}
              className="h-11 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Valor (R$)</FieldLabel>
            <Input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(formatCurrencyInput(e.target.value))}
              placeholder="0,00"
              disabled={loading}
              className="h-11 rounded-xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Data</FieldLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="h-11 rounded-xl bg-white"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-neutral-900">Pagamento</h3>
          <p className="text-sm text-neutral-500">Escolha a origem da transação e informe o cartão apenas quando fizer sentido.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Origem</FieldLabel>
            <Select value={source} onValueChange={(value) => setSource(value as "cash" | "card" | "bank")}>
              <SelectTriggerHTML placeholder="Selecione a origem" options={sourceOptions} className="h-11 rounded-xl bg-white" />
            </Select>
          </div>

          <div className="space-y-2">
            <FieldLabel>Cartão</FieldLabel>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTriggerHTML
                placeholder="Selecione um cartão"
                options={cardOptions}
                className={["h-11 rounded-xl bg-white", source !== "card" ? "opacity-60" : ""].join(" ")}
              />
            </Select>
          </div>

          <label className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Marcar como paga
          </label>
        </div>
      </section>

      {!isEditing ? (
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-900">Parcelamento</h3>
              <p className="text-sm text-neutral-500">Ative apenas quando a compra precisar gerar múltiplas parcelas.</p>
            </div>

            <label className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={hasInstallments}
                onChange={(e) => setHasInstallments(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-neutral-300"
              />
              Compra parcelada
            </label>
          </div>

          {hasInstallments && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Parcela atual</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={installmentNumber}
                  onChange={(e) => setInstallmentNumber(e.target.value)}
                  placeholder="1"
                  disabled={loading}
                  className="h-11 rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel>Total de parcelas</FieldLabel>
                <Input
                  type="number"
                  min="2"
                  step="1"
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(e.target.value)}
                  placeholder="10"
                  disabled={loading}
                  className="h-11 rounded-xl bg-white"
                />
              </div>
            </div>
          )}
        </section>
      ) : isInstallmentTransaction ? (
        <section className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
          <h3 className="text-base font-semibold text-amber-900">Parcela vinculada a um grupo</h3>
          <p className="text-sm text-amber-800">
            Esta edição afeta apenas a parcela selecionada. O restante do grupo parcelado permanece como está.
          </p>
        </section>
      ) : null}

      <section className="space-y-2">
        <FieldLabel>Observações</FieldLabel>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Adicione observações sobre esta transação..."
          rows={4}
          disabled={loading}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </section>

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-h-5 text-sm text-rose-700">{error ?? ""}</span>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
            {loading ? "Salvando..." : isEditing ? "Salvar alterações" : kind === "expense" ? "Salvar despesa" : "Salvar receita"}
          </Button>
        </div>
      </div>
    </form>
  );
}
