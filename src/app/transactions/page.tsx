"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  TransactionCreateForm,
  TransactionFilters,
  TransactionStats,
  TransactionTable,
  type Transaction,
  type TransactionPayload,
  useCreateTransaction,
  useUpdateTransaction,
  useTransactions,
  useDeleteTransaction,
  defaultTransactionFilters,
  type TransactionFiltersType as Filters,
} from "@/features/transactions";
import { useCards } from "@/features/cards";
import { usePayments } from "@/features/payments";

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [filters, setFilters] = useState<Filters>(defaultTransactionFilters);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [classificationNotice, setClassificationNotice] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const clearFilters = () => setFilters(defaultTransactionFilters);
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);
  const { createTransaction, loading: creating, error: createError } = useCreateTransaction({
    onUnauthorized: handleUnauthorized,
  });
  const { updateTransaction, loading: updating, error: updateError } = useUpdateTransaction({
    onUnauthorized: handleUnauthorized,
  });
  const { deleteTransaction, loading: deleting, error: deleteError } = useDeleteTransaction({
    onUnauthorized: handleUnauthorized,
  });
  const handleViewTransaction = useCallback((tx: Transaction) => {
    console.info("view transaction", tx.id);
  }, []);
  const handleEditTransaction = useCallback((tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  }, []);
  const handleReviewClassification = useCallback((tx: Transaction) => {
    const suggestionId = tx.classification?.suggestion?.id;
    if (suggestionId) {
      router.push(`/suggestions?suggestion=${suggestionId}`);
      return;
    }

    router.push("/suggestions");
  }, [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { items, loading, error: transactionsError, refetch } = useTransactions({
    filters,
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });
  const hasStatementFilters = filters.cardId !== "all" && filters.cardId !== "none" && filters.month !== "all" && filters.year !== "all";
  const selectedMonth = filters.month === "all" ? new Date().getMonth() + 1 : Number(filters.month);
  const selectedYear = filters.year === "all" ? new Date().getFullYear() : Number(filters.year);
  const {
    overview: paymentsOverview,
    loading: statementLoading,
    error: statementError,
    refetch: refetchPayments,
  } = usePayments({
    month: selectedMonth,
    year: selectedYear,
    enabled: auth.status === "authenticated" && hasStatementFilters,
    onUnauthorized: handleUnauthorized,
  });
  const selectedStatement = useMemo(() => {
    if (!hasStatementFilters || !paymentsOverview) return null;

    const cardId = Number(filters.cardId);
    return [
      ...paymentsOverview.statements,
      ...paymentsOverview.ignored_payments.statements,
    ].find((statement) => statement.card.id === cardId) ?? null;
  }, [filters.cardId, hasStatementFilters, paymentsOverview]);
  const handleCreateTransaction = useCallback(
    async (payload: TransactionPayload) => {
      const created = await createTransaction(payload);
      if (created) {
        if (created.kind === "installment_group") {
          setClassificationNotice(
            `Parcelamento criado com ${created.transactions.length} parcelas. Revise a classificação se alguma parcela aparecer com sugestão pendente.`
          );
        } else if (created.transaction.classification?.status === "suggestion_pending") {
          setClassificationNotice(
            `A transação "${created.transaction.description}" ficou com sugestão pendente para revisão.`
          );
        } else {
          setClassificationNotice(null);
        }

        refetch();
        if (hasStatementFilters) void refetchPayments();
        setEditingTransaction(null);
        setIsTransactionModalOpen(false);
      }
    },
    [createTransaction, hasStatementFilters, refetch, refetchPayments]
  );
  const handleUpdateTransaction = useCallback(
    async (payload: TransactionPayload) => {
      if (!editingTransaction) return;

      const updated = await updateTransaction(editingTransaction.id, payload);
      if (updated) {
        setClassificationNotice(null);
        setEditingTransaction(null);
        refetch();
        if (hasStatementFilters) void refetchPayments();
        setIsTransactionModalOpen(false);
      }
    },
    [editingTransaction, hasStatementFilters, refetch, refetchPayments, updateTransaction]
  );
  const handleDeleteTransaction = useCallback(
    async (tx: Transaction) => {
      const confirmed = window.confirm(
        `Arquivar a transação "${tx.description}"? Ela deixará de aparecer nas listagens e cálculos ativos.`
      );
      if (!confirmed) return;

      const ok = await deleteTransaction(tx.id);
      if (ok) {
        refetch();
        if (hasStatementFilters) void refetchPayments();
      }
    },
    [deleteTransaction, hasStatementFilters, refetch, refetchPayments]
  );
  const { cards, error: cardsError } = useCards({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const summaryNotice = useMemo(() => {
    if (classificationNotice) return classificationNotice;

    const pendingCount = items.filter((item) => item.classification?.status === "suggestion_pending").length;
    if (pendingCount === 0) return null;

    return pendingCount === 1
      ? "Você tem 1 transação com sugestão pendente de classificação."
      : `Você tem ${pendingCount} transações com sugestão pendente de classificação.`;
  }, [classificationNotice, items]);

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <>
      <AppLayout
        onNewTransactionClick={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
      >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Transações</h1>
                <p className="mt-1 text-neutral-500">
                  Gerencie suas despesas (receitas em construção)
                </p>
              </div>

              <div className="text-sm text-neutral-500">
                {loading ? "Carregando..." : `${items.length} itens`}
              </div>
            </div>

            {summaryNotice && (
              <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                {summaryNotice}
              </p>
            )}

            <TransactionStats items={items} statement={selectedStatement} />
            {hasStatementFilters && statementLoading && (
              <p className="text-xs text-neutral-500">Atualizando saldo da fatura...</p>
            )}
            {hasStatementFilters && statementError && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {statementError}
              </p>
            )}
            <TransactionFilters
              filters={filters}
              cards={cards.map((card) => ({ id: String(card.id), name: card.name }))}
              onChange={setFilters}
              onClear={clearFilters}
            />
            {cardsError && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {cardsError}
              </p>
            )}
            {deleteError && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {deleteError}
              </p>
            )}

            <TransactionTable
              items={items}
              loading={loading}
              error={transactionsError}
              onView={handleViewTransaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onReviewClassification={handleReviewClassification}
            />
            {deleting && <p className="text-xs text-neutral-500">Arquivando transação...</p>}
      </AppLayout>

      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 px-4 py-4 sm:py-4">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {editingTransaction ? "Editar Transação" : "Nova Transação"}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {editingTransaction
                      ? "Ajuste a transação selecionada sem reescrever automaticamente o restante do grupo parcelado."
                      : "Adicione uma nova receita ou despesa e deixe a classificação automática sugerir a categoria."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(false);
                  }}
                  disabled={creating || updating}
                >
                  Fechar
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5 sm:px-6">
              <TransactionCreateForm
                cards={cards}
                mode={editingTransaction ? "edit" : "create"}
                initialTransaction={editingTransaction}
                loading={creating || updating}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                onCancel={() => {
                  setEditingTransaction(null);
                  setIsTransactionModalOpen(false);
                }}
              />

              {(createError || updateError) && (
                <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createError || updateError}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
