"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import type { TransactionPayload } from "@/features/transactions/types/transaction.types";

type CategoryOption = {
  id: number;
  name: string;
};

type TransactionCreateFormProps = {
  categories: CategoryOption[];
  loading?: boolean;
  onSubmit: (payload: TransactionPayload) => Promise<void> | void;
};

export function TransactionCreateForm({
  categories,
  loading = false,
  onSubmit,
}: TransactionCreateFormProps) {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("all");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [{ value: "all", label: "Sem categoria" }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))],
    [categories]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedDescription = description.trim();
    const normalizedValue = Number(value);

    if (!normalizedDescription || !date || !(normalizedValue > 0)) {
      setError("Preencha descrição, valor e data corretamente.");
      return;
    }

    setError(null);

    await onSubmit({
      description: normalizedDescription,
      value: normalizedValue,
      date,
      kind: "expense",
      source: "cash",
      paid,
      category_id: categoryId === "all" ? null : Number(categoryId),
    });

    setDescription("");
    setValue("");
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId("all");
    setPaid(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            disabled={loading}
          />

          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor"
            disabled={loading}
          />

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTriggerHTML placeholder="Categoria" options={categoryOptions} />
          </Select>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              disabled={loading}
            />
            Pago
          </label>

          <div className="md:col-span-2 lg:col-span-5 flex items-center justify-between gap-3">
            <span className="text-sm text-rose-700">{error ?? " "}</span>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
