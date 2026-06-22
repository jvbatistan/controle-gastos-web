"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, Calendar, CircleDollarSign, Receipt, TrendingUp, Wallet } from "lucide-react";
import type { PaymentStatement } from "@/features/payments";

type Tx = {
  id: number;
  description: string;
  value: number;
  signed_value?: number;
  refund?: boolean;
  date: string;
  kind: "income" | "expense";
  paid: boolean;
  category?: { id: number; name: string } | null;
  card?: { id: number; name: string } | null;
};

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

function signedValue(transaction: Tx) {
  if (transaction.signed_value != null) return Number(transaction.signed_value);
  return transaction.refund ? -Math.abs(Number(transaction.value || 0)) : Number(transaction.value || 0);
}

export function TransactionStats({ items, statement }: { items: Tx[]; statement?: PaymentStatement | null }) {
  const total = items.length;
  const expenses = items.filter((t) => t.kind === "expense");
  const expenseCount = expenses.length;
  const expenseSum = expenses.reduce((acc, t) => acc + signedValue(t), 0);
  const avg = total > 0 ? expenseSum / total : 0;

  if (statement) {
    const payments = statement.payments ?? [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Saldo da fatura</p>
                  <p className="mt-1 text-2xl font-bold text-neutral-950">{formatBRL(statement.remaining_amount)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Wallet className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Valor principal em aberto</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Total de despesas</p>
                  <p className="mt-1 text-2xl font-bold text-rose-600">{formatBRL(statement.total_amount)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  <Receipt className="h-6 w-6 text-rose-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Compras menos estornos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Pagamentos</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{formatBRL(statement.paid_amount)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <CircleDollarSign className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Abatimentos registrados</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Lançamentos</p>
                  <p className="mt-1 text-2xl font-bold">{statement.transactions_count}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <Calendar className="h-6 w-6 text-neutral-700" />
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">Compras e estornos da fatura</div>
            </CardContent>
          </Card>
        </div>

        {payments.length > 0 && (
          <section className="rounded-md border border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-emerald-950">Pagamentos e abatimentos</h2>
              <span className="text-xs text-emerald-800">{payments.length} registro(s)</span>
            </div>
            <div className="divide-y divide-emerald-200/70">
              {payments.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-1 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium text-emerald-950">{payment.description || "Pagamento da fatura"}</span>
                    <span className="ml-2 text-xs text-emerald-800">{formatDateBR(payment.paid_at)}</span>
                  </div>
                  <span className="font-bold text-emerald-800 tabular-nums">- {formatBRL(payment.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Total de Transações</p>
              <p className="text-2xl font-bold mt-1">{total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-xs text-neutral-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Indicador simples (sem comparação ainda)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Receitas</p>
              <p className="text-2xl font-bold mt-1 text-neutral-400">—</p>
            </div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-neutral-400" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-2">Em construção</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Despesas</p>
              <p className="text-2xl font-bold mt-1 text-rose-600">{expenseCount}</p>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-2">{formatBRL(expenseSum)} no total</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Ticket Médio</p>
              <p className="text-2xl font-bold mt-1">{formatBRL(avg)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-2">Por transação</div>
        </CardContent>
      </Card>
    </div>
  );
}
