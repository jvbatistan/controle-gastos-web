"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownRight, MoreVertical, Pencil, Trash2, Eye, Copy } from "lucide-react";
import type { Transaction } from "@/features/transactions/types/transaction.types";

type TransactionTableProps = {
  items: Transaction[];
  loading: boolean;
  error?: string | null;
  onView?: (tx: Transaction) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
};

function formatDateBR(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusColors: Record<"paid" | "open", string> = {
  paid: "bg-emerald-100 text-emerald-700",
  open: "bg-amber-100 text-amber-700",
};

export function TransactionTable({
  items,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Todas as Transações</CardTitle>
          <div className="text-sm text-neutral-500">
            {loading ? "Carregando..." : `Mostrando ${items.length} transações`}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {error && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!error && !loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}

              {items.map((t) => {
                const isExpense = t.kind === "expense";
                const statusKey = t.paid ? "paid" : "open";

                return (
                  <TableRow key={t.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{formatDateBR(t.date)}</TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={[
                            "p-1.5 rounded-full",
                            isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600",
                          ].join(" ")}
                          title={isExpense ? "Despesa" : "Receita"}
                        >
                          <ArrowDownRight className="h-3 w-3" />
                        </div>

                        <div>
                          <div className="font-medium text-neutral-900">{t.description} {t.installment_number && t.installments_count ? `(${t.installment_number}/${t.installments_count})` : ""}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {isExpense ? "Despesa" : "Receita (em construção)"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {t.category?.name ? (
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                          {t.category.name}
                        </Badge>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-neutral-600">{t.card?.name ?? "—"}</TableCell>

                    <TableCell>
                      <Badge variant="secondary" className={statusColors[statusKey]}>
                        {t.paid ? "Pago" : "Em aberto"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className={["font-bold", isExpense ? "text-rose-600" : "text-emerald-600"].join(" ")}>
                        {isExpense ? "-" : "+"} {formatBRL(t.value)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(t)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={!onEdit} onClick={() => onEdit?.(t)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar (em breve)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!onDelete}
                            onClick={() => onDelete?.(t)}
                            className="text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
