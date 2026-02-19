"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import type { TransactionFilters as Filters } from "@/features/transactions/types/transaction.types";

const TYPE_VALUES: Filters["type"][] = ["all", "expense", "income"];
const PAID_VALUES: Filters["paid"][] = ["all", "0", "1"];

function toFilterType(value: string): Filters["type"] {
  const normalized = value || "all";
  return TYPE_VALUES.includes(normalized as Filters["type"])
    ? (normalized as Filters["type"])
    : "all";
}

function toPaidValue(value: string): Filters["paid"] {
  return PAID_VALUES.includes(value as Filters["paid"])
    ? (value as Filters["paid"])
    : "all";
}

interface Props {
  filters: Filters;
  categories: Array<{ id: string; name: string }>;
  onChange: (next: Filters) => void;
  onClear: () => void;
}

export function TransactionFilters({ filters, categories, onChange, onClear }: Props) {
  const activeCount =
    (filters.q.trim() ? 1 : 0) +
    (filters.type !== "all" ? 1 : 0) +
    (filters.categoryId !== "all" ? 1 : 0) +
    (filters.period !== "all" ? 1 : 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar transações..."
              className="pl-9"
              value={filters.q}
              onChange={(e) => onChange({ ...filters, q: e.target.value })}
            />
          </div>

          <Select
            value={filters.type === "all" ? "" : filters.type}
            onValueChange={(v) => onChange({ ...filters, type: toFilterType(v) })}
          >
            <SelectTriggerHTML
              placeholder="Tipo"
              options={[
                { value: "all", label: "Todos" },
                { value: "expense", label: "Despesas" },
                { value: "income", label: "Receitas (em construção)", disabled: true },
              ]}
            />
          </Select>

          <Select
            value={filters.categoryId}
            onValueChange={(v) => onChange({ ...filters, categoryId: v })}
          >
            <SelectTriggerHTML
              placeholder="Categoria"
              options={[
                { value: "all", label: "Todas" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Select>

          <Select
            value={filters.period}
            onValueChange={(v) =>
              onChange({ ...filters, period: v as Filters["period"] })
            }
          >
            <SelectTriggerHTML
              placeholder="Período"
              options={[
                { value: "all", label: "Todo período" },
                { value: "today", label: "Hoje" },
                { value: "week", label: "Esta semana" },
                { value: "month", label: "Este mês" },
                { value: "last-month", label: "Mês passado" },
              ]}
            />
          </Select>

          <Select
            value={filters.paid}
            onValueChange={(v) => onChange({ ...filters, paid: toPaidValue(v) })}
          >
            <SelectTriggerHTML
              placeholder="Status"
              options={[
                { value: "all", label: "Todos" },
                { value: "0", label: "Em aberto" },
                { value: "1", label: "Pago" },
              ]}
            />
          </Select>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center text-sm text-neutral-600">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtros ativos: {activeCount}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClear} disabled={activeCount === 0}>
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
