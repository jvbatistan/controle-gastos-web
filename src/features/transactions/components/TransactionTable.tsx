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
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Sparkles,
} from "lucide-react";
import type {
  Transaction,
  TransactionClassificationStatus,
} from "@/features/transactions/types/transaction.types";

type TransactionTableProps = {
  items: Transaction[];
  loading: boolean;
  error?: string | null;
  onView?: (tx: Transaction) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onReviewClassification?: (tx: Transaction) => void;
};

type BadgeTone = {
  label: string;
  className: string;
  style: {
    backgroundColor: string;
    color: string;
    borderColor?: string;
  };
};

function formatDateBR(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const paymentStatusColors: Record<"paid" | "open", BadgeTone> = {
  paid: {
    label: "Pago",
    className: "border-transparent",
    style: { backgroundColor: "#d1fae5", color: "#047857" },
  },
  open: {
    label: "Em aberto",
    className: "border-transparent",
    style: { backgroundColor: "#fef3c7", color: "#b45309" },
  },
};

const classificationConfig: Record<TransactionClassificationStatus, BadgeTone> = {
  classified: {
    label: "Classificada",
    className: "border-transparent",
    style: { backgroundColor: "#dcfce7", color: "#166534" },
  },
  suggestion_pending: {
    label: "Sugestão pendente",
    className: "border-transparent",
    style: { backgroundColor: "#e0f2fe", color: "#075985" },
  },
  unclassified: {
    label: "Sem classificação",
    className: "border",
    style: { backgroundColor: "#f5f5f5", color: "#525252", borderColor: "#d4d4d4" },
  },
};

function getClassificationStatus(transaction: Transaction): TransactionClassificationStatus {
  return transaction.classification?.status ?? (transaction.category ? "classified" : "unclassified");
}

function getClassificationBadge(transaction: Transaction) {
  return classificationConfig[getClassificationStatus(transaction)];
}

function canReviewClassification(transaction: Transaction) {
  const status = getClassificationStatus(transaction);
  return status === "suggestion_pending" || status === "unclassified";
}

function renderInstallmentLabel(transaction: Transaction) {
  if (!transaction.installment_number || !transaction.installments_count) return null;
  return `(${transaction.installment_number}/${transaction.installments_count})`;
}

function TransactionActions({
  transaction,
  onView,
  onEdit,
  onDelete,
  onReviewClassification,
}: {
  transaction: Transaction;
  onView?: (tx: Transaction) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onReviewClassification?: (tx: Transaction) => void;
}) {
  const shouldShowReviewAction = canReviewClassification(transaction);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView?.(transaction)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        {shouldShowReviewAction && (
          <DropdownMenuItem disabled={!onReviewClassification} onClick={() => onReviewClassification?.(transaction)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Revisar classificação
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled={!onEdit} onClick={() => onEdit?.(transaction)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar (em breve)
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!onDelete}
          onClick={() => onDelete?.(transaction)}
          className="text-rose-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Arquivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionTable({
  items,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onReviewClassification,
}: TransactionTableProps) {
  const emptyState = error ? (
    <div className="py-10 text-center text-rose-600">{error}</div>
  ) : !loading && items.length === 0 ? (
    <div className="py-10 text-center text-neutral-500">Nenhuma transação encontrada.</div>
  ) : null;

  return (
    <Card>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Todas as Transações</CardTitle>
          <div className="text-sm text-neutral-500">
            {loading ? "Carregando..." : `${items.length} ${items.length === 1 ? "transação" : "transações"}`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-3 md:hidden">
          {emptyState}

          {!emptyState &&
            items.map((t) => {
              const isExpense = t.kind === "expense";
              const paymentStatus = paymentStatusColors[t.paid ? "paid" : "open"];
              const classificationBadge = getClassificationBadge(t);
              const installmentLabel = renderInstallmentLabel(t);

              return (
                <div key={t.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={[
                          "mt-0.5 rounded-full p-2",
                          isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600",
                        ].join(" ")}
                        title={isExpense ? "Despesa" : "Receita"}
                      >
                        {isExpense ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">
                          {t.description} {installmentLabel}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">{formatDateBR(t.date)}</p>
                      </div>
                    </div>

                    <TransactionActions
                      transaction={t}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReviewClassification={onReviewClassification}
                    />
                  </div>

                  {(t.note || t.card?.name) && (
                    <div className="mt-3 space-y-1">
                      {t.note && <p className="text-sm text-neutral-600">{t.note}</p>}
                      {t.card?.name && <p className="text-xs text-neutral-500">Cartão: {t.card.name}</p>}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.category?.name ? (
                      <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                        {t.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sem categoria</Badge>
                    )}

                    <Badge variant="outline" className={classificationBadge.className} style={classificationBadge.style}>
                      {classificationBadge.label}
                    </Badge>

                    <Badge variant="outline" className={paymentStatus.className} style={paymentStatus.style}>
                      {paymentStatus.label}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-sm text-neutral-500">{t.card?.name ?? "Sem cartão"}</span>
                    <span className={["text-lg font-bold", isExpense ? "text-rose-600" : "text-emerald-600"].join(" ")}>
                      {isExpense ? "-" : "+"} {formatBRL(t.value)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="hidden overflow-x-auto rounded-md border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {error && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!error && !loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-neutral-500">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}

              {items.map((t) => {
                const isExpense = t.kind === "expense";
                const paymentStatus = paymentStatusColors[t.paid ? "paid" : "open"];
                const classificationBadge = getClassificationBadge(t);
                const installmentLabel = renderInstallmentLabel(t);

                return (
                  <TableRow key={t.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{formatDateBR(t.date)}</TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={[
                            "rounded-full p-1.5",
                            isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600",
                          ].join(" ")}
                          title={isExpense ? "Despesa" : "Receita"}
                        >
                          {isExpense ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        </div>

                        <div>
                          <div className="font-medium text-neutral-900">
                            {t.description} {installmentLabel}
                          </div>
                          <div className="mt-0.5 text-xs text-neutral-500">{t.note}</div>
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

                    <TableCell>
                      <Badge variant="outline" className={classificationBadge.className} style={classificationBadge.style}>
                        {classificationBadge.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-neutral-600">{t.card?.name ?? "—"}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className={paymentStatus.className} style={paymentStatus.style}>
                        {paymentStatus.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className={["font-bold", isExpense ? "text-rose-600" : "text-emerald-600"].join(" ")}>
                        {isExpense ? "-" : "+"} {formatBRL(t.value)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <TransactionActions
                        transaction={t}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onReviewClassification={onReviewClassification}
                      />
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
