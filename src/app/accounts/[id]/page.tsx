"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays, CreditCard, Landmark, RefreshCcw, Wallet } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAccountStatement,
  type AccountKind,
  type AccountStatementResponse,
  type StatementEntry,
  type StatementMovementType,
} from "@/features/accounts";
import { useAuth } from "@/lib/useAuth";

const accountKindLabels: Record<AccountKind, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  wallet: "Carteira",
  digital_wallet: "Carteira digital",
  other: "Outra",
};

const movementLabels: Record<StatementMovementType, string> = {
  initial_balance: "Saldo inicial",
  income: "Entrada",
  expense: "Saída",
  card_statement_payment: "Pagamento de fatura",
  transfer_in: "Transferência recebida",
  transfer_out: "Transferência enviada",
};

const sourceLabels: Record<string, string> = {
  cash: "Dinheiro",
  bank: "Banco",
  card: "Cartão",
};

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatSignedBRL(value: number | string, direction: "credit" | "debit") {
  const prefix = direction === "credit" ? "+" : "-";

  return `${prefix} ${formatBRL(value)}`;
}

function formatDateBR(dateISO: string | null | undefined) {
  if (!dateISO) return "Sem data";

  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("pt-BR");
}

function kindLabel(kind: AccountKind) {
  return accountKindLabels[kind] ?? kind;
}

function errorMessageFor(err: unknown) {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (message.includes("404") || message.includes("not found") || message.includes("não encontrado")) {
      return "Conta não encontrada.";
    }

    return err.message;
  }

  return "Não foi possível carregar o extrato.";
}

export default function AccountStatementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();
  const accountId = Number(params.id);
  const [statement, setStatement] = useState<AccountStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  const updateUrl = useCallback((nextStartDate: string, nextEndDate: string, nextPage: number) => {
    const searchParams = new URLSearchParams();
    if (nextStartDate) searchParams.set("start_date", nextStartDate);
    if (nextEndDate) searchParams.set("end_date", nextEndDate);
    if (nextPage > 1) searchParams.set("page", String(nextPage));

    const query = searchParams.toString();
    router.push(`/accounts/${accountId}${query ? `?${query}` : ""}`);
  }, [accountId, router]);

  const loadStatement = useCallback(async ({
    nextStartDate,
    nextEndDate,
    nextPage,
    signal,
  }: {
    nextStartDate: string;
    nextEndDate: string;
    nextPage: number;
    signal?: AbortSignal;
  }) => {
    if (!Number.isFinite(accountId) || accountId <= 0) {
      setError("Conta não encontrada.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchAccountStatement(accountId, {
        startDate: nextStartDate || undefined,
        endDate: nextEndDate || undefined,
        page: nextPage,
        perPage: 25,
        signal,
      });

      if (result.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!result.data) {
        setError("Não foi possível carregar o extrato.");
        return;
      }

      setStatement(result.data);
      setAppliedStartDate(nextStartDate);
      setAppliedEndDate(nextEndDate);
      setStartDate(result.data.period.start_date ?? nextStartDate);
      setEndDate(result.data.period.end_date ?? nextEndDate);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error(err);
        setError(errorMessageFor(err));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [accountId, handleUnauthorized]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  useEffect(() => {
    if (auth.status !== "authenticated") return;

    const searchParams = new URLSearchParams(window.location.search);
    const initialStartDate = searchParams.get("start_date") ?? "";
    const initialEndDate = searchParams.get("end_date") ?? "";
    const initialPage = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const controller = new AbortController();

    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setAppliedStartDate(initialStartDate);
    setAppliedEndDate(initialEndDate);

    void loadStatement({
      nextStartDate: initialStartDate,
      nextEndDate: initialEndDate,
      nextPage: initialPage,
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [auth.status, loadStatement]);

  function handleApplyPeriod(event: React.FormEvent) {
    event.preventDefault();
    setPeriodError(null);

    if (startDate && endDate && startDate > endDate) {
      setPeriodError("A data inicial deve ser anterior ou igual à data final.");
      return;
    }

    updateUrl(startDate, endDate, 1);
    void loadStatement({ nextStartDate: startDate, nextEndDate: endDate, nextPage: 1 });
  }

  function handleClearPeriod() {
    setPeriodError(null);
    setStartDate("");
    setEndDate("");
    updateUrl("", "", 1);
    void loadStatement({ nextStartDate: "", nextEndDate: "", nextPage: 1 });
  }

  function handlePageChange(nextPage: number) {
    updateUrl(appliedStartDate, appliedEndDate, nextPage);
    void loadStatement({ nextStartDate: appliedStartDate, nextEndDate: appliedEndDate, nextPage });
  }

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  const account = statement?.account;
  const pagination = statement?.pagination;
  const isArchived = Boolean(account?.archived_at);
  const blockingLoading = loading && !statement;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link href="/accounts" className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-950">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para contas
        </Link>

        {error && !statement ? (
          <Card>
            <CardContent className="py-10 text-center">
              <h1 className="text-xl font-bold text-neutral-950">{error}</h1>
              <p className="mt-2 text-sm text-neutral-500">Não conseguimos abrir o extrato desta conta.</p>
              <Button type="button" className="mt-5" onClick={() => router.push("/accounts")}>
                Voltar para contas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              {loading && !statement ? (
                        <p className="text-sm text-neutral-500">Carregando extrato...</p>
              ) : account ? (
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-neutral-950 sm:text-3xl">{account.name}</h1>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isArchived ? "bg-neutral-100 text-neutral-600" : "bg-emerald-50 text-emerald-700"}`}>
                          {isArchived ? "Arquivada" : "Ativa"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">{kindLabel(account.kind)}</p>
                      {isArchived && (
                        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          Esta conta está arquivada. O extrato está disponível apenas para consulta.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4 text-left lg:min-w-64">
                    <p className="text-sm text-neutral-500">Saldo atual</p>
                    <p className={`mt-1 text-3xl font-bold tabular-nums ${balanceTextClass(Number(account.current_balance))}`}>
                      {formatBRL(account.current_balance)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Calculado pela API de Accounts</p>
                  </div>
                </div>
              ) : null}
            </section>

            {statement && (
              <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SummaryCard title="Entradas" value={statement.summary.credits_total} tone="credit" />
                  <SummaryCard title="Saídas" value={statement.summary.debits_total} tone="debit" />
                  <SummaryCard title="Variação líquida" value={statement.summary.net_total} tone={Number(statement.summary.net_total) >= 0 ? "credit" : "debit"} />
                </section>

                <Card>
                  <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <p className="mt-1 text-sm text-neutral-500">Filtre o extrato por período. Tipo e direção ficam para a próxima fase.</p>
                  </CardHeader>
                  <CardContent>
                    <form aria-label="Filtros de período" onSubmit={handleApplyPeriod} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-800" htmlFor="start-date">Data inicial</label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          disabled={blockingLoading}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-800" htmlFor="end-date">Data final</label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(event) => setEndDate(event.target.value)}
                          disabled={blockingLoading}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <Button type="submit" disabled={blockingLoading} className="h-11 rounded-xl bg-neutral-900 text-white">
                        {loading ? "Aplicando..." : "Aplicar"}
                      </Button>
                      <Button type="button" variant="outline" disabled={blockingLoading} onClick={handleClearPeriod} className="h-11 rounded-xl">
                        Limpar
                      </Button>
                    </form>
                    {periodError && <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{periodError}</p>}
                    {error && statement && <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Extrato</CardTitle>
                      <p className="mt-1 text-sm text-neutral-500">
                        Movimentação patrimonial da conta. Não é o dashboard por competência.
                      </p>
                    </div>
                    {loading && statement && <span className="text-sm text-neutral-500">Atualizando...</span>}
                  </CardHeader>
                  <CardContent>
                    {statement.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
                        <CalendarDays className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
                        <h2 className="text-lg font-semibold text-neutral-950">Nenhuma movimentação encontrada neste período.</h2>
                        <p className="mt-2 text-sm text-neutral-500">Tente ajustar o período selecionado.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {statement.items.map((item) => (
                          <StatementItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}

                    {pagination && (
                      <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-neutral-500">
                          Página {pagination.page} de {Math.max(pagination.total_pages, 1)} · {pagination.total_count} movimentações
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={blockingLoading || pagination.page <= 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                          >
                            Anterior
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={blockingLoading || pagination.page >= pagination.total_pages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({ title, value, tone }: { title: string; value: string; tone: "credit" | "debit" }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold tabular-nums sm:text-3xl ${tone === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
          {formatBRL(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function StatementItemCard({ item }: { item: StatementEntry }) {
  const credit = item.direction === "credit";

  return (
    <article className="rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${credit ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {iconForMovement(item)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-neutral-950">{item.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${credit ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {movementLabels[item.movement_type]}
                </span>
                <span>{credit ? "Crédito" : "Débito"}</span>
                <span>{formatDateBR(item.occurred_on)}</span>
              </div>
            </div>
          </div>

          {item.description && <p className="mt-3 text-sm text-neutral-700">{item.description}</p>}
          <MetadataLine item={item} />
        </div>

        <p className={`text-lg font-bold tabular-nums sm:text-xl ${credit ? "text-emerald-600" : "text-rose-600"}`}>
          {formatSignedBRL(item.amount, item.direction)}
        </p>
      </div>
    </article>
  );
}

function MetadataLine({ item }: { item: StatementEntry }) {
  const parts: string[] = [];

  if (item.metadata.category?.name) parts.push(`Categoria: ${item.metadata.category.name}`);
  if (item.metadata.source) parts.push(`Origem: ${sourceLabels[item.metadata.source] ?? item.metadata.source}`);
  if (item.metadata.card?.name) parts.push(`Cartão: ${item.metadata.card.name}`);
  if (item.metadata.billing_statement) parts.push(`Fatura: ${formatDateBR(item.metadata.billing_statement)}`);
  if (item.metadata.counterparty_account?.name) parts.push(`Contraparte: ${item.metadata.counterparty_account.name}`);
  if (item.metadata.note) parts.push(`Obs.: ${item.metadata.note}`);

  if (parts.length === 0) return null;

  return <p className="mt-3 text-sm text-neutral-500">{parts.join(" · ")}</p>;
}

function iconForMovement(item: StatementEntry) {
  if (item.movement_type === "card_statement_payment") return <CreditCard className="h-4 w-4" />;
  if (item.movement_type === "transfer_in" || item.movement_type === "transfer_out") return <RefreshCcw className="h-4 w-4" />;
  if (item.movement_type === "initial_balance") return <Landmark className="h-4 w-4" />;
  if (item.direction === "credit") return <ArrowDownLeft className="h-4 w-4" />;

  return <ArrowUpRight className="h-4 w-4" />;
}

function balanceTextClass(value: number) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";

  return "text-neutral-700";
}
