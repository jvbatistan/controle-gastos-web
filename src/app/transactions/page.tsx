"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  TransactionCreateForm,
  TransactionFilters,
  TransactionStats,
  TransactionTable,
  type Transaction,
  type TransactionPayload,
  useCreateTransaction,
  useTransactions,
  useDeleteTransaction,
  defaultTransactionFilters,
  type TransactionFiltersType as Filters,
} from "@/features/transactions";
import { useCards } from "@/features/cards";

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [filters, setFilters] = useState<Filters>(defaultTransactionFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [classificationNotice, setClassificationNotice] = useState<string | null>(null);

  const clearFilters = () => setFilters(defaultTransactionFilters);
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);
  const { createTransaction, loading: creating, error: createError } = useCreateTransaction({
    onUnauthorized: handleUnauthorized,
  });
  const { deleteTransaction, loading: deleting, error: deleteError } = useDeleteTransaction({
    onUnauthorized: handleUnauthorized,
  });
  const handleViewTransaction = useCallback((tx: Transaction) => {
    console.info("view transaction", tx.id);
  }, []);
  const handleEditTransaction = useCallback((tx: Transaction) => {
    console.info("edit transaction", tx.id);
  }, []);
  const handleReviewClassification = useCallback((tx: Transaction) => {
    if (tx.classification?.status === "suggestion_pending") {
      setClassificationNotice(
        `A transação "${tx.description}" está com sugestão pendente. O próximo passo é ligar essa ação à tela de sugestões.`
      );
      return;
    }

    setClassificationNotice(
      `A transação "${tx.description}" ainda não foi classificada. O próximo passo é ligar essa ação à tela de sugestões.`
    );
  }, []);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { items, loading, error: transactionsError, refetch } = useTransactions({
    filters,
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });
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
        setIsCreateModalOpen(false);
      }
    },
    [createTransaction, refetch]
  );
  const handleDeleteTransaction = useCallback(
    async (tx: Transaction) => {
      const confirmed = window.confirm(`Excluir a transação "${tx.description}"?`);
      if (!confirmed) return;

      const ok = await deleteTransaction(tx.id);
      if (ok) refetch();
    },
    [deleteTransaction, refetch]
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
    <div className="min-h-screen bg-neutral-50">
      <Header
        onMenuClick={() => setIsMobileNavOpen(true)}
        onNewTransactionClick={() => setIsCreateModalOpen(true)}
      />

      <div className="flex">
        <Navigation isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
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

            <TransactionStats items={items} />
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
            {deleting && <p className="text-xs text-neutral-500">Excluindo transação...</p>}
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 px-4 py-4 sm:py-4">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Nova Transação</h2>
                  <p className="mt-1 text-sm text-neutral-500">Adicione uma nova receita ou despesa e deixe a classificação automática sugerir a categoria.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={creating}>
                  Fechar
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5 sm:px-6">
              <TransactionCreateForm
                cards={cards}
                loading={creating}
                onSubmit={handleCreateTransaction}
                onCancel={() => setIsCreateModalOpen(false)}
              />

              {createError && (
                <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createError}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
