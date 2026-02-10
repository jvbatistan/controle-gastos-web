"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionStats } from "@/components/transactions/TransactionStats";
import { TransactionTable } from "@/components/transactions/TransactionTable";

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

type Category = {
  id: number;
  name: string;
};

type Filters = {
  q: string;
  type: "all" | "expense" | "income";
  categoryId: "all" | string;
  period: "all" | "today" | "week" | "month" | "last-month";
  paid: "all" | "0" | "1";
};

function buildQuery(filters: Filters) {
  const qs = new URLSearchParams();

  // sempre manda limit
  qs.set("limit", "50");

  const q = filters.q.trim();
  if (q) qs.set("q", q);

  if (filters.categoryId !== "all") qs.set("category_id", filters.categoryId);

  if (filters.period !== "all") qs.set("period", filters.period);

  if (filters.paid !== "all") qs.set("paid", filters.paid);

  if (filters.type !== "all") qs.set("kind", filters.type); // expense | income

  return `?${qs.toString()}`;
}

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();

  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    q: "",
    type: "all",
    categoryId: "all",
    period: "all",
    paid: "all",
  });

  const clearFilters = () =>
    setFilters({ q: "", type: "all", categoryId: "all", period: "all", paid: "all" });

  // proteção: se não autenticado, manda pro login
  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  // buscar transações SEMPRE que filters mudar
  useEffect(() => {
    if (auth.status !== "authenticated") return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const query = buildQuery(filters);
        const res = await fetch(`/api/transactions${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await res.json()) as Tx[];
        setItems(data);
      } catch (err: any) {
        // normal: quando muda filtro rápido, aborta request anterior
        if (err?.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [auth.status, router, filters]);

  // buscar categorias (uma vez após autenticar)
  useEffect(() => {
    if (auth.status !== "authenticated") return;

    (async () => {
      try {
        setCategoriesLoading(true);

        const res = await fetch("/api/categories", { cache: "no-store" });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await res.json()) as Category[];
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, [auth.status, router]);

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
