"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useCategories } from "@/features/categories";

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [filters, setFilters] = useState<Filters>(defaultTransactionFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // proteção: se não autenticado, manda pro login
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
  const { categories, error: categoriesError } = useCategories({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onNewTransactionClick={() => setIsCreateModalOpen(true)} />

      <div className="flex">
        <Navigation />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Transações</h1>
                <p className="text-neutral-500 mt-1">
                  Gerencie suas despesas (receitas em construção)
                </p>
              </div>

              <div className="text-sm text-neutral-500">
                {loading ? "Carregando..." : `${items.length} itens`}
              </div>
            </div>

            <TransactionStats items={items} />
            <TransactionFilters
              filters={filters}
              categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
              onChange={setFilters}
              onClear={clearFilters}
            />
            {categoriesError && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                {categoriesError}
              </p>
            )}
            {deleteError && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
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
            />
            {deleting && <p className="text-xs text-neutral-500">Excluindo transação...</p>}
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nova Transação</h2>
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={creating}>
                Fechar
              </Button>
            </div>

            <TransactionCreateForm
              categories={categories}
              loading={creating}
              onSubmit={handleCreateTransaction}
            />

            {createError && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {createError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
