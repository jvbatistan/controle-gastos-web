"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { logout } from "@/lib/auth";

import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { FinanceDashboard } from "@/components/FinanceDashboard";
import { PlaceholderCard } from "@/components/PlaceholderCard";


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (auth.status === "loading") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  if (auth.status === "unauthenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="flex">
        <Navigation />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <FinanceDashboard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlaceholderCard
                title="Receitas vs Despesas"
                description="Gráfico mensal de entradas e saídas"
              />
              <PlaceholderCard
                title="Despesas por Categoria"
                description="Distribuição das despesas no mês"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
