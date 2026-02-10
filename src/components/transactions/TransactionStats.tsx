"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, Calendar, TrendingUp } from "lucide-react";

type Tx = {
  id: number;
  description: string;
  value: number;
  date: string;
  kind: "income" | "expense";
  paid: boolean;
  category?: { id: number; name: string } | null;
  card?: { id: number; name: string } | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function TransactionStats({ items }: { items: Tx[] }) {
  const total = items.length;
  const expenses = items.filter((t) => t.kind === "expense");
  const expenseCount = expenses.length;
  const expenseSum = expenses.reduce((acc, t) => acc + Number(t.value || 0), 0);
  const avg = total > 0 ? expenseSum / total : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
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
