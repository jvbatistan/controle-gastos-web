"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  DollarSign,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { ignoreCardStatement, payCardStatement, payLooseExpense, payLooseExpenses, usePayments } from "@/features/payments";
import { useAuth } from "@/lib/useAuth";

const monthOptions = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index).map((year) => ({
  value: String(year),
  label: String(year),
}));

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("pt-BR");
}

function periodLabel(month: string, year: string) {
  const monthLabel = monthOptions.find((option) => option.value === month)?.label ?? month;
  return `${monthLabel}/${year}`;
}

type PaymentConfirmation =
  | { kind: "statement"; statementId: number; cardName: string; amount: number }
  | { kind: "ignore-statement"; statementId: number; cardName: string; amount: number; period: string }
  | { kind: "loose-expense"; transactionId: number; description: string; amount: number }
  | { kind: "loose-expenses"; count: number; totalAmount: number; period: string };

function statementGradient(name: string) {
  const gradients = [
    "from-violet-600 to-fuchsia-500",
    "from-blue-600 to-cyan-500",
    "from-emerald-600 to-teal-500",
    "from-orange-600 to-amber-500",
  ];
  const index = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

export default function PaymentsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"statements" | "loose">("statements");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear));
  const [message, setMessage] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { overview, loading, error, refetch } = usePayments({
    month: Number(month),
    year: Number(year),
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const statements = useMemo(() => overview?.statements ?? [], [overview]);
  const looseExpenses = overview?.loose_expenses;

  const outstandingStatements = useMemo(
    () => statements.filter((statement) => !statement.paid),
    [statements]
  );

  const totalOpenStatements = useMemo(
    () => outstandingStatements.reduce((sum, statement) => sum + Number(statement.remaining_amount), 0),
    [outstandingStatements]
  );

  const totalLooseExpenses = Number(looseExpenses?.total_amount ?? 0);
  const isSubmittingLooseExpenses = submittingKey === "loose-expenses" || submittingKey?.startsWith("loose-expense-") === true;

  async function submitPayStatement(statementId: number) {
    try {
      setSubmittingKey(`statement-${statementId}`);
      setMessage(null);
      const result = await payCardStatement(statementId);
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`Fatura do cartão "${result.data?.card.name}" quitada com sucesso.`);
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível registrar o pagamento da fatura.");
    } finally {
      setSubmittingKey(null);
    }
  }

  async function submitIgnoreStatement(statementId: number, cardName: string) {
    try {
      setSubmittingKey(`ignore-statement-${statementId}`);
      setMessage(null);
      const result = await ignoreCardStatement(statementId, Number(month), Number(year));
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`Fatura do cartão "${cardName}" removida do fluxo de pagamento de ${periodLabel(month, year)}.`);
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível remover a fatura do fluxo de pagamento.");
    } finally {
      setSubmittingKey(null);
    }
  }

  async function submitPayLooseExpense(transactionId: number, description: string) {
    try {
      setSubmittingKey(`loose-expense-${transactionId}`);
      setMessage(null);
      const result = await payLooseExpense(transactionId, Number(month), Number(year));
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`Despesa "${description}" marcada como paga.`);
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível quitar a despesa avulsa.");
    } finally {
      setSubmittingKey(null);
    }
  }

  async function submitPayLooseExpenses() {
    try {
      setSubmittingKey("loose-expenses");
      setMessage(null);
      const result = await payLooseExpenses(Number(month), Number(year));
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`${result.data?.paid_transactions_count ?? 0} despesas avulsas marcadas como pagas.`);
      await refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível quitar as despesas avulsas.");
    } finally {
      setSubmittingKey(null);
    }
  }

  async function handleConfirmPayment() {
    if (!confirmation) return;

    const current = confirmation;
    setConfirmation(null);

    if (current.kind === "statement") {
      await submitPayStatement(current.statementId);
      return;
    }

    if (current.kind === "ignore-statement") {
      await submitIgnoreStatement(current.statementId, current.cardName);
      return;
    }

    if (current.kind === "loose-expense") {
      await submitPayLooseExpense(current.transactionId, current.description);
      return;
    }

    await submitPayLooseExpenses();
  }

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} onNewTransactionClick={() => router.push("/transactions")} />

      <div className="flex">
        <Navigation isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Pagamentos</h1>
                <p className="mt-1 text-sm text-neutral-500 sm:text-base">
                  Acompanhe suas faturas e quite despesas avulsas sem precisar editar transação por transação.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTriggerHTML placeholder="Mês" options={monthOptions} className="w-full sm:w-[140px]" />
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTriggerHTML placeholder="Ano" options={yearOptions} className="w-full sm:w-[110px]" />
                </Select>
              </div>
            </div>

            {message && (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">{message}</p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Faturas em aberto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 sm:text-3xl">{outstandingStatements.length}</div>
                  <p className="mt-1 text-xs text-neutral-500">No período {periodLabel(month, year)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Total em aberto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 sm:text-3xl">{formatBRL(totalOpenStatements)}</div>
                  <p className="mt-1 text-xs text-neutral-500">Somatória total das faturas não pagas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Despesas avulsas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 sm:text-3xl">{formatBRL(totalLooseExpenses)}</div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {looseExpenses?.transactions_count ?? 0} despesa(s) sem cartão no período
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="inline-flex w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("statements")}
                className={[
                  "flex-1 rounded-xl px-4 py-2 text-sm transition",
                  activeTab === "statements"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100",
                ].join(" ")}
              >
                Faturas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("loose")}
                className={[
                  "flex-1 rounded-xl px-4 py-2 text-sm transition",
                  activeTab === "loose"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100",
                ].join(" ")}
              >
                Avulsas
              </button>
            </div>

            {activeTab === "statements" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Faturas do período</CardTitle>
                  <p className="mt-1 text-sm text-neutral-500">
                    Quite o cartão inteiro de uma vez. O sistema marca as transações da fatura como pagas automaticamente.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-neutral-500">Carregando faturas...</p>
                  ) : statements.length === 0 ? (
                    <div className="py-12 text-center">
                      <CreditCard className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                      <h3 className="mb-2 text-lg font-medium text-neutral-900">Nenhuma fatura encontrada</h3>
                      <p className="text-neutral-500">Não há faturas para o período selecionado.</p>
                    </div>
                  ) : (
                    statements.map((statement) => {
                      const isSubmitting = submittingKey === `statement-${statement.id}`;
                      const isIgnoring = submittingKey === `ignore-statement-${statement.id}`;
                      const isPaid = statement.paid;
                      const gradient = statementGradient(statement.card.name);

                      return (
                        <div
                          key={statement.id}
                          className="rounded-2xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 md:p-6"
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                                <CreditCard className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-neutral-900">{statement.card.name}</div>
                                <div className="text-sm text-neutral-500">
                                  Fecha dia {statement.closing_day} • Vence dia {statement.due_day}
                                </div>
                              </div>
                            </div>

                            <div
                              className={[
                                "flex items-center gap-2 rounded-full px-3 py-1 text-sm",
                                isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                              ].join(" ")}
                            >
                              {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              <span>{isPaid ? "Paga" : "Em aberto"}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Fecha dia {statement.closing_day}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Vence dia {statement.due_day}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>{statement.transactions_count} transações</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                              <div className={`min-w-[220px] rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white`}>
                                <div className="mb-1 text-xs opacity-90">Saldo da fatura</div>
                                <div className="text-2xl font-bold">{formatBRL(statement.remaining_amount)}</div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-90">
                                  <span>Total: {formatBRL(statement.total_amount)}</span>
                                  <span>•</span>
                                  <span>Pago: {formatBRL(statement.paid_amount)}</span>
                                </div>
                              </div>

                              {isPaid ? (
                                <Button variant="outline" className="w-full sm:w-auto" disabled>
                                  Fatura quitada
                                </Button>
                              ) : (
                                <div className="flex w-full flex-col gap-2 sm:w-auto">
                                  <Button
                                    onClick={() => setConfirmation({
                                      kind: "statement",
                                      statementId: statement.id,
                                      cardName: statement.card.name,
                                      amount: Number(statement.remaining_amount),
                                    })}
                                    disabled={isSubmitting || isIgnoring}
                                    className="w-full bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto"
                                  >
                                    {isSubmitting ? "Registrando pagamento..." : "Pagar fatura"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setConfirmation({
                                      kind: "ignore-statement",
                                      statementId: statement.id,
                                      cardName: statement.card.name,
                                      amount: Number(statement.remaining_amount),
                                      period: periodLabel(month, year),
                                    })}
                                    disabled={isSubmitting || isIgnoring}
                                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 sm:w-auto"
                                  >
                                    {isIgnoring ? "Atualizando..." : "Não pagar"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Despesas avulsas</CardTitle>
                  <p className="mt-1 text-sm text-neutral-500">
                    Pague uma despesa por vez quando precisar ou quite tudo de uma vez quando já tiver o valor completo.
                  </p>
                </CardHeader>
                <CardContent>
                  {!loading && looseExpenses && looseExpenses.transactions_count > 0 && (
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-6 text-white">
                      <div className="mb-2 text-sm opacity-90">Somatória das despesas avulsas</div>
                      <div className="mb-3 text-3xl font-bold">{formatBRL(totalLooseExpenses)}</div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-2 text-sm opacity-90">
                          <DollarSign className="h-4 w-4" />
                          <span>{looseExpenses.transactions_count} despesa(s) no período</span>
                        </div>
                        <div className="flex flex-col gap-3 sm:items-end">
                          <p className="text-sm opacity-90">Você pode marcar cada despesa individualmente ou quitar tudo de uma vez.</p>
                          <Button
                            variant="outline"
                            onClick={() => setConfirmation({
                              kind: "loose-expenses",
                              count: looseExpenses.transactions_count,
                              totalAmount: totalLooseExpenses,
                              period: periodLabel(month, year),
                            })}
                            disabled={isSubmittingLooseExpenses}
                            className="border-white/70 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            {submittingKey === "loose-expenses" ? "Marcando tudo..." : "Pagar todas as despesas"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <p className="text-sm text-neutral-500">Carregando despesas avulsas...</p>
                  ) : !looseExpenses || looseExpenses.transactions_count === 0 ? (
                    <div className="py-12 text-center">
                      <CircleDollarSign className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                      <h3 className="mb-2 text-lg font-medium text-neutral-900">Nenhuma despesa avulsa</h3>
                      <p className="text-neutral-500">Não há despesas avulsas para o período selecionado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mb-2 text-sm font-medium text-neutral-500">Descrição / Data</div>
                      {looseExpenses.transactions.map((transaction) => {
                        const isSubmitting = submittingKey === `loose-expense-${transaction.id}`;

                        return (
                          <div
                            key={transaction.id}
                            className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-neutral-900">{transaction.description}</div>
                              <div className="mt-1 text-sm text-neutral-500">{formatDateBR(transaction.date)}</div>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              <div className="text-lg font-bold text-neutral-900">{formatBRL(transaction.value)}</div>
                              <Button
                                size="sm"
                                onClick={() => setConfirmation({
                                  kind: "loose-expense",
                                  transactionId: transaction.id,
                                  description: transaction.description,
                                  amount: Number(transaction.value),
                                })}
                                disabled={isSubmittingLooseExpenses}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                {isSubmitting ? "Registrando..." : "Pagar despesa"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {confirmation && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mx-auto flex min-h-full w-full max-w-lg items-center justify-center">
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {confirmation.kind === "statement"
                        ? "Confirmar pagamento da fatura"
                        : confirmation.kind === "ignore-statement"
                          ? "Confirmar não pagamento da fatura"
                          : confirmation.kind === "loose-expense"
                            ? "Confirmar pagamento da despesa"
                            : "Confirmar pagamento em lote"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {confirmation.kind === "statement"
                        ? `Você está prestes a quitar a fatura do cartão ${confirmation.cardName} no valor de ${formatBRL(confirmation.amount)}.`
                        : confirmation.kind === "ignore-statement"
                          ? `Você está prestes a retirar a fatura do cartão ${confirmation.cardName} do fluxo de pagamento de ${confirmation.period}. Ela deixará de compor os totais desse período sem ser marcada como paga.`
                          : confirmation.kind === "loose-expense"
                            ? `Você está prestes a marcar a despesa ${confirmation.description} como paga no valor de ${formatBRL(confirmation.amount)}.`
                            : `Você está prestes a quitar ${confirmation.count} despesa(s) avulsa(s) pendentes de ${confirmation.period}, totalizando ${formatBRL(confirmation.totalAmount)}.`}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirmation(null)} disabled={submittingKey !== null}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Essa ação altera o status de pagamento e deve ser confirmada com atenção.
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setConfirmation(null)} disabled={submittingKey !== null}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={() => void handleConfirmPayment()} disabled={submittingKey !== null} className="bg-neutral-900 text-white hover:bg-neutral-800">
                    {confirmation.kind === "statement"
                      ? "Confirmar pagamento da fatura"
                      : confirmation.kind === "ignore-statement"
                        ? "Confirmar não pagamento"
                        : confirmation.kind === "loose-expense"
                          ? "Confirmar pagamento da despesa"
                          : "Confirmar pagamento em lote"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
