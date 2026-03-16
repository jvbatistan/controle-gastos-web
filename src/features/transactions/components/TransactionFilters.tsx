"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import type { TransactionFilters as Filters } from "@/features/transactions/types/transaction.types";

const MONTHS = [
  { value: "1", label: "01" },
  { value: "2", label: "02" },
  { value: "3", label: "03" },
  { value: "4", label: "04" },
  { value: "5", label: "05" },
  { value: "6", label: "06" },
  { value: "7", label: "07" },
  { value: "8", label: "08" },
  { value: "9", label: "09" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
];

interface Props {
  filters: Filters;
  cards: Array<{ id: string; name: string }>;
  onChange: (next: Filters) => void;
  onClear: () => void;
}

export function TransactionFilters({ filters, cards, onChange, onClear }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: Math.max(currentYear - 2023 + 2, 1) }, (_, index) => {
    return String(currentYear + 1 - index);
  });

  const activeCount =
    (filters.cardId !== "all" ? 1 : 0) +
    (filters.month !== "all" ? 1 : 0) +
    (filters.year !== "all" ? 1 : 0) +
    (filters.limit !== "50" ? 1 : 0);

  return (
    <Card>
      <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filters.cardId} onValueChange={(v) => onChange({ ...filters, cardId: v as Filters["cardId"] })}>
            <SelectTriggerHTML
              placeholder="Cartão"
              options={[
                { value: "all", label: "Todos os cartões" },
                { value: "none", label: "Sem cartão" },
                ...cards.map((c) => ({ value: c.id, label: c.name.toUpperCase().charAt(0) + c.name.toLowerCase().slice(1) })),
              ]}
            />
          </Select>

          <Select value={filters.month} onValueChange={(v) => onChange({ ...filters, month: v })}>
            <SelectTriggerHTML
              placeholder="Mês"
              options={[
                { value: "all", label: "Todos os meses" },
                ...MONTHS,
              ]}
            />
          </Select>

          <Select value={filters.year} onValueChange={(v) => onChange({ ...filters, year: v })}>
            <SelectTriggerHTML
              placeholder="Ano"
              options={[
                { value: "all", label: "Todos os anos" },
                ...years.map((year) => ({ value: year, label: year })),
              ]}
            />
          </Select>

          <Select
            value={filters.limit}
            onValueChange={(v) => onChange({ ...filters, limit: v as Filters["limit"] })}
          >
            <SelectTriggerHTML
              placeholder="Itens"
              options={[
                { value: "50", label: "50 itens" },
                { value: "100", label: "100 itens" },
                { value: "200", label: "200 itens" },
              ]}
            />
          </Select>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center text-sm text-neutral-600">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filtros ativos: {activeCount}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClear} disabled={activeCount === 0} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
