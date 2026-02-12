"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import {
  TransactionFilters,
  TransactionStats,
  TransactionTable,
  useTransactions,
  defaultTransactionFilters,
  type TransactionFiltersType as Filters,
} from "@/features/transactions";
import { useCategories } from "@/features/categories";

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [filters, setFilters] = useState<Filters>(defaultTransactionFilters);

  const clearFilters = () => setFilters(defaultTransactionFilters);
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  // proteção: se não autenticado, manda pro login
  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { items, loading } = useTransactions({
    filters,
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });
  const { categories } = useCategories({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

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

            <TransactionTable items={items} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
