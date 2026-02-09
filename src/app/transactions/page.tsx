"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";

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

export default function TransactionsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  useEffect(() => {
    if (auth.status !== "authenticated") return;

    (async () => {
      setLoading(true);
      const res = await fetch("/api/transactions", { cache: "no-store" });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await res.json()) as Tx[];
      setItems(data);
      setLoading(false);
    })();
  }, [auth.status, router]);

  if (auth.status !== "authenticated") return <div className="min-h-screen bg-neutral-50" />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex">
        <Navigation />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Transações</h2>
              <p className="text-sm text-neutral-500">Listagem básica (mock real da API)</p>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <p className="text-sm text-neutral-600">
                  {loading ? "Carregando..." : `${items.length} itens`}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Data</th>
                      <th className="text-left px-6 py-3 font-medium">Descrição</th>
                      <th className="text-left px-6 py-3 font-medium">Categoria</th>
                      <th className="text-left px-6 py-3 font-medium">Cartão</th>
                      <th className="text-right px-6 py-3 font-medium">Valor</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {items.map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-3 whitespace-nowrap text-neutral-600">
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-neutral-900">{t.description}</div>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span
                              className={[
                                "px-2 py-0.5 rounded-full font-medium",
                                t.kind === "income"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700",
                              ].join(" ")}
                            >
                              {t.kind === "income" ? "Receita" : "Despesa"}
                            </span>

                            <span className="text-neutral-500">
                              {t.paid ? "Pago" : "Em aberto"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-neutral-700">
                          {t.category?.name ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-neutral-700">
                          {t.card?.name ?? "—"}
                        </td>
                        <td
                          className={[
                            "px-6 py-3 text-right font-semibold whitespace-nowrap",
                            t.kind === "income" ? "text-emerald-600" : "text-rose-600",
                          ].join(" ")}
                        >
                          {t.kind === "income" ? "+" : "-"}{" "}
                          {Number(t.value).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                      </tr>
                    ))}

                    {!loading && items.length === 0 && (
                      <tr>
                        <td className="px-6 py-10 text-center text-neutral-500" colSpan={5}>
                          Nenhuma transação encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
