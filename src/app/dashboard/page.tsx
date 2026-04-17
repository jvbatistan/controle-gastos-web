"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Hammer, TrendingUp } from "lucide-react";

import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { FinanceDashboard } from "@/components/FinanceDashboard";
import { PlaceholderCard } from "@/components/PlaceholderCard";
import { useDashboard } from "@/features/dashboard";


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { overview, loading, error } = useDashboard({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  if (auth.status === "loading") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  if (auth.status === "unauthenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} onNewTransactionClick={() => router.push("/transactions")} />

      <div className="flex">
        <Navigation isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
                <p className="mt-1 text-neutral-500">
                  Panorama real das despesas, faturas e lançamentos recentes.
                </p>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {loading || !overview ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[148px] animate-pulse rounded-2xl border border-neutral-200 bg-white shadow-sm" />
                ))}
              </div>
            ) : (
              <FinanceDashboard overview={overview} />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PlaceholderCard
                title="Receitas vs despesas"
                description="Este comparativo será ativado quando o módulo de receitas estiver implementado no sistema."
              />
              <PlaceholderCard
                title="Saldo e economia mensal"
                description="Saldo líquido, economia do mês e indicadores de entrada ainda dependem do módulo de receitas."
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Hammer className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Receitas ainda não entram no dashboard</h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Os cards antigos de saldo total, receitas e economia mensal usavam números fictícios. Eles foram removidos para evitar leituras enganosas e voltarão quando o módulo de receitas existir de verdade.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Dashboard consolidado apenas com despesas reais
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
