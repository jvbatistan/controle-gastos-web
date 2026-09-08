"use client";

import { Database, ShieldAlert } from "lucide-react";
import { useDataEnvironment } from "@/lib/data-environment-context";

export function DataEnvironmentBanner() {
  const dataEnvironment = useDataEnvironment();

  if (dataEnvironment.status !== "ready") return null;

  const isSupabase = dataEnvironment.data.environment === "supabase";

  return (
    <div
      className={[
        "flex min-h-7 items-center justify-center gap-2 px-4 py-1 text-center text-xs font-bold uppercase tracking-[0.12em] text-white",
        isSupabase ? "bg-red-700" : "bg-amber-500",
      ].join(" ")}
      role="status"
      aria-label="Ambiente de dados atual"
    >
      {isSupabase ? <ShieldAlert className="h-4 w-4" /> : <Database className="h-4 w-4" />}
      <span>{isSupabase ? "DADOS REAIS — SUPABASE" : "AMBIENTE DE TESTE — LOCAL"}</span>
    </div>
  );
}
