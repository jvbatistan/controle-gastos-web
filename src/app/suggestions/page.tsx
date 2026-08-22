"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { useAuth } from "@/lib/useAuth";
import { useCategories } from "@/features/categories";
import {
  applyClassificationSuggestion,
  rejectClassificationSuggestion,
  useClassificationSuggestions,
  type ClassificationSuggestion,
} from "@/features/classification-suggestions";

function formatDateBR(dateISO: string) {
  const [year, month, day] = dateISO.split("-");

  return `${day}/${month}/${year}`;
}

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function installmentLabel(suggestion: ClassificationSuggestion) {
  const transaction = suggestion.financial_transaction;
  if (!transaction.installment_number || !transaction.installments_count) return null;
  return `${transaction.installment_number}/${transaction.installments_count}`;
}

function selectedCategoryIdFor(suggestion: ClassificationSuggestion, selectedBySuggestion: Record<number, string>) {
  return selectedBySuggestion[suggestion.id] ?? (suggestion.suggested_category ? String(suggestion.suggested_category.id) : "");
}

function SuggestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [message, setMessage] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [submittingAction, setSubmittingAction] = useState<"apply" | "learn" | "reject" | null>(null);
  const [selectedCategoryIdBySuggestion, setSelectedCategoryIdBySuggestion] = useState<Record<number, string>>({});

  const selectedSuggestionId = Number(searchParams.get("suggestion") || "0") || null;
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { suggestions, pagination = { page, per_page: 25, total_count: 0, total_pages: 0 }, loading, error, refetch } = useClassificationSuggestions({
    page,
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const { categories } = useCategories({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Escolha a categoria correta" },
      ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ],
    [categories]
  );

  const orderedSuggestions = useMemo(() => {
    if (!selectedSuggestionId) return suggestions;

    return [...suggestions].sort((a, b) => {
      if (a.id === selectedSuggestionId) return -1;
      if (b.id === selectedSuggestionId) return 1;
      return 0;
    });
  }, [selectedSuggestionId, suggestions]);

  const runAction = useCallback(
    async (
      suggestionId: number,
      actionKind: "apply" | "learn" | "reject",
      action: () => Promise<unknown>,
      successMessage: string
    ) => {
      try {
        setSubmittingId(suggestionId);
        setSubmittingAction(actionKind);
        setMessage(null);
        await action();
        setMessage(successMessage);
        await refetch();
      } catch (err) {
        console.error(err);
        setMessage(err instanceof Error ? err.message : "Não foi possível atualizar a sugestão.");
      } finally {
        setSubmittingId(null);
        setSubmittingAction(null);
      }
    },
    [refetch]
  );

  const handleReject = useCallback(
    (suggestion: ClassificationSuggestion) =>
      runAction(
        suggestion.id,
        "reject",
        () => rejectClassificationSuggestion(suggestion.id),
        "Sugestão recusada."
      ),
    [runAction]
  );

  const handleApply = useCallback(
    (suggestion: ClassificationSuggestion, learn: boolean) => {
      const selectedCategoryId = Number(selectedCategoryIdFor(suggestion, selectedCategoryIdBySuggestion) || "0");
      if (!selectedCategoryId) {
        setMessage("Escolha uma categoria antes de aplicar a sugestão.");
        return Promise.resolve();
      }

      return runAction(
        suggestion.id,
        learn ? "learn" : "apply",
        () => applyClassificationSuggestion(suggestion.id, selectedCategoryId, learn),
        learn
          ? "Finch aprendeu esta categoria para próximas compras semelhantes."
          : "Categoria aplicada somente nesta compra."
      );
    },
    [runAction, selectedCategoryIdBySuggestion]
  );

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <AppLayout>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Sugestões</h1>
                <p className="mt-1 text-neutral-500">Revise as transações que ainda precisam de confirmação de categoria.</p>
              </div>
              <div className="text-sm text-neutral-500">
                {loading ? "Carregando..." : `${pagination.total_count} sugestões`}
              </div>
            </div>

            {message && (
              <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">{message}</p>
            )}

            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}

            {!error && !loading && orderedSuggestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-neutral-900">Nenhuma sugestão pendente</h2>
                  <p className="mt-2 text-sm text-neutral-500">Quando a API não conseguir classificar uma transação sozinha, ela vai aparecer aqui para revisão.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {orderedSuggestions.map((suggestion) => {
                const transaction = suggestion.financial_transaction;
                const isSelected = selectedSuggestionId === suggestion.id;
                const installment = installmentLabel(suggestion);
                const isSubmitting = submittingId === suggestion.id;
                const selectedCategoryId = selectedCategoryIdFor(suggestion, selectedCategoryIdBySuggestion);
                const canApply = Boolean(selectedCategoryId);

                return (
                  <Card key={suggestion.id} className={isSelected ? "border-sky-300 shadow-md" : undefined}>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle className="text-lg">{transaction.description}</CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                            <span>{formatDateBR(transaction.date)}</span>
                            <span>{formatBRL(transaction.value)}</span>
                            {installment && <Badge variant="outline">Parcela {installment}</Badge>}
                            {transaction.installment_group_id && <Badge variant="outline">Grupo parcelado</Badge>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Origem: {suggestion.source === "alias" ? "Alias" : "Regra"}</Badge>
                          <Badge variant="outline">Confiança: {(suggestion.confidence * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <p className="text-sm font-medium text-neutral-800">Categoria sugerida</p>
                          <p className="mt-2 text-base text-neutral-900">{suggestion.suggested_category?.name ?? "Sem categoria sugerida"}</p>
                          <p className="mt-2 text-sm text-neutral-500">Se esta transação fizer parte de um parcelamento, a decisão será reaproveitada no grupo.</p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                          <p className="text-sm font-medium text-neutral-800">Categoria a aplicar</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Use a sugestão ou escolha outra categoria antes de decidir se o Finch deve aprender.
                          </p>
                          <div className="mt-3 space-y-3">
                            <Select
                              value={selectedCategoryId}
                              onValueChange={(value) =>
                                setSelectedCategoryIdBySuggestion((current) => ({ ...current, [suggestion.id]: value }))
                              }
                            >
                              <SelectTriggerHTML placeholder="Escolha a categoria" options={categoryOptions} />
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                        <p className="text-sm font-medium text-sky-950">O que você quer fazer?</p>
                        <p className="mt-1 text-sm text-sky-800">
                          Aplique apenas nesta compra quando for uma exceção. Ensine o Finch quando próximas compras parecidas devem usar a mesma categoria.
                        </p>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting || !canApply}
                            onClick={() => void handleApply(suggestion, false)}
                            className="h-auto justify-start border-sky-200 bg-white px-4 py-3 text-left text-sky-900 hover:bg-sky-50"
                          >
                            <Check className="mr-3 h-4 w-4 shrink-0" />
                            <span>
                              <span className="block font-medium">
                                {isSubmitting && submittingAction === "apply" ? "Aplicando..." : "Aplicar só nesta compra"}
                              </span>
                              <span className="block text-xs font-normal text-sky-700">Não cria regra para o futuro.</span>
                            </span>
                          </Button>
                          <Button
                            type="button"
                            disabled={isSubmitting || !canApply}
                            onClick={() => void handleApply(suggestion, true)}
                            className="h-auto justify-start bg-emerald-600 px-4 py-3 text-left text-white hover:bg-emerald-700"
                          >
                            <Sparkles className="mr-3 h-4 w-4 shrink-0" />
                            <span>
                              <span className="block font-medium">
                                {isSubmitting && submittingAction === "learn" ? "Ensinando..." : "Ensinar o Finch"}
                              </span>
                              <span className="block text-xs font-normal text-emerald-50">Usa esta categoria em próximas compras semelhantes.</span>
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                          onClick={() => void handleReject(suggestion)}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          {isSubmitting && submittingAction === "reject" ? "Rejeitando..." : "Rejeitar sugestão"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button variant="outline" disabled={loading || page <= 1} onClick={() => router.push(`/suggestions?page=${page - 1}`)}>Anterior</Button>
                <span className="text-sm text-neutral-600">Página {page} de {pagination.total_pages}</span>
                <Button variant="outline" disabled={loading || page >= pagination.total_pages} onClick={() => router.push(`/suggestions?page=${page + 1}`)}>Próxima</Button>
              </div>
            )}
    </AppLayout>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <SuggestionsPageContent />
    </Suspense>
  );
}
