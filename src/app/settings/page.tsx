"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { switchDataEnvironment, type DataEnvironmentName } from "@/lib/data-environment";
import { useDataEnvironment } from "@/lib/data-environment-context";
import { useAuth } from "@/lib/useAuth";

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuth();
  const dataEnvironment = useDataEnvironment();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  async function handleSwitch(target: DataEnvironmentName) {
    if (
      target === "supabase" &&
      !window.confirm("Você está entrando no ambiente de DADOS REAIS do Supabase. Deseja continuar?")
    ) {
      return;
    }

    setSwitching(true);
    setError(null);

    try {
      await switchDataEnvironment(target);
      dataEnvironment.reset();
      auth.setUnauthenticated();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível trocar o ambiente de dados.");
      setSwitching(false);
    }
  }

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <AppLayout maxWidth="max-w-4xl" showNewTransaction={false}>
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Configurações</h1>
        <p className="mt-1 text-neutral-500">Preferências internas e segurança do ambiente.</p>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-neutral-100 p-2 text-neutral-700">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">Ambiente de dados</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Cada ambiente possui usuários e dados independentes. Toda troca exige um novo login.
            </p>
          </div>
        </div>

        {dataEnvironment.status === "loading" || dataEnvironment.status === "idle" ? (
          <div className="mt-6 h-32 animate-pulse rounded-2xl bg-neutral-100" />
        ) : dataEnvironment.status === "error" ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Não foi possível consultar o ambiente de dados atual.
            <Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => void dataEnvironment.refresh()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div
              className={[
                "rounded-2xl border p-5",
                dataEnvironment.data.environment === "supabase"
                  ? "border-red-300 bg-red-50"
                  : "border-amber-300 bg-amber-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 font-semibold text-neutral-950">
                {dataEnvironment.data.environment === "supabase" ? (
                  <ShieldAlert className="h-5 w-5 text-red-700" />
                ) : (
                  <Database className="h-5 w-5 text-amber-700" />
                )}
                <span>
                  {dataEnvironment.data.environment === "supabase"
                    ? "Supabase — dados reais"
                    : "Local — desenvolvimento e QA"}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-neutral-500">Conexão</dt>
                  <dd className="font-medium text-neutral-900">
                    {dataEnvironment.data.connection_status === "available" ? "Disponível" : "Indisponível"}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Schema</dt>
                  <dd className="font-medium text-neutral-900">
                    {dataEnvironment.data.schema_compatible ? "Compatível" : "Incompatível"}
                  </dd>
                </div>
              </dl>
            </div>

            {dataEnvironment.data.can_switch_data_environment && (
              <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-neutral-950">
                    Trocar para {dataEnvironment.data.environment === "local" ? "Supabase" : "Local"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    A API validará conexão e migrations antes de encerrar esta sessão.
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={switching}
                  className={dataEnvironment.data.environment === "local" ? "bg-red-700 hover:bg-red-800" : "bg-blue-600 hover:bg-blue-700"}
                  onClick={() => void handleSwitch(dataEnvironment.data.environment === "local" ? "supabase" : "local")}
                >
                  {switching ? "Validando..." : `Usar ${dataEnvironment.data.environment === "local" ? "dados reais" : "ambiente local"}`}
                </Button>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
