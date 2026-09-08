"use client";

import { Database, ShieldAlert } from "lucide-react";
import { useDataEnvironment } from "@/lib/data-environment-context";

export function DataEnvironmentBadge() {
  const dataEnvironment = useDataEnvironment();

  if (dataEnvironment.status !== "ready") return null;

  const isSupabase = dataEnvironment.data.environment === "supabase";

  return (
    <div
      className={[
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-bold uppercase tracking-[0.08em] sm:px-2.5 sm:text-xs",
        isSupabase
          ? "border-red-300 bg-red-50 text-red-800"
          : "border-amber-300 bg-amber-50 text-amber-800",
      ].join(" ")}
      role="status"
      aria-label="Ambiente de dados atual"
    >
      {isSupabase ? <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> : <Database className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{isSupabase ? "DADOS REAIS · SUPABASE" : "LOCAL · TESTE"}</span>
    </div>
  );
}
