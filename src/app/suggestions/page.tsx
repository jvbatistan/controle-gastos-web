"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { useAuth } from "@/lib/useAuth";
import { useCategories } from "@/features/categories";
import {
  acceptClassificationSuggestion,
  correctClassificationSuggestion,
  rejectClassificationSuggestion,
  useClassificationSuggestions,
  type ClassificationSuggestion,
} from "@/features/classification-suggestions";

function formatDateBR(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

function formatBRL(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function installmentLabel(suggestion: ClassificationSuggestion) {
  const transaction = suggestion.financial_transaction;
  if (!transaction.installment_number || !transaction.installments_count) return null;
  return `${transaction.installment_number}/${transaction.installments_count}`;
}

function SuggestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [selectedCategoryIdBySuggestion, setSelectedCategoryIdBySuggestion] = useState<Record<number, string>>({});

  const selectedSuggestionId = Number(searchParams.get("suggestion") || "0") || null;

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { suggestions, loading, error, refetch } = useClassificationSuggestions({
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
    async (suggestionId: number, action: () => Promise<unknown>, successMessage: string) => {
      try {
        setSubmittingId(suggestionId);
        setMessage(null);
        await action();
        setMessage(successMessage);
        await refetch();
      } catch (err) {
        console.error(err);
        setMessage(err instanceof Error ? err.message : "Não foi possível atualizar a sugestão.");
      } finally {
        setSubmittingId(null);
      }
    },
    [refetch]
  );

  const handleAccept = useCallback(
    (suggestion: ClassificationSuggestion) =>
      runAction(
        suggestion.id,
        () => acceptClassificationSuggestion(suggestion.id),
        "Sugestão aplicada com sucesso."
      ),
    [runAction]
  );

  const handleReject = useCallback(
    (suggestion: ClassificationSuggestion) =>
      runAction(
        suggestion.id,
        () => rejectClassificationSuggestion(suggestion.id),
        "Sugestão recusada."
      ),
    [runAction]
  );

  const handleCorrect = useCallback(
    (suggestion: ClassificationSuggestion) => {
      const selectedCategoryId = Number(selectedCategoryIdBySuggestion[suggestion.id] || "0");
      if (!selectedCategoryId) {
        setMessage("Escolha uma categoria antes de corrigir a sugestão.");
        return Promise.resolve();
      }

      return runAction(
        suggestion.id,
        () => correctClassificationSuggestion(suggestion.id, selectedCategoryId),
        "Correção aplicada com sucesso."
      );
    },
    [runAction, selectedCategoryIdBySuggestion]
  );

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header
        onMenuClick={() => setIsMobileNavOpen(true)}
        onNewTransactionClick={() => router.push("/transactions")}
      />

      <div className="flex">
        <Navigation isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Sugestões</h1>
                <p className="mt-1 text-neutral-500">Revise as transações que ainda precisam de confirmação de categoria.</p>
              </div>
              <div className="text-sm text-neutral-500">
                {loading ? "Carregando..." : `${orderedSuggestions.length} pendências`}
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
                          <p className="text-sm font-medium text-neutral-800">Corrigir manualmente</p>
                          <div className="mt-3 space-y-3">
                            <Select
                              value={selectedCategoryIdBySuggestion[suggestion.id] ?? ""}
                              onValueChange={(value) =>
                                setSelectedCategoryIdBySuggestion((current) => ({ ...current, [suggestion.id]: value }))
                              }
                            >
                              <SelectTriggerHTML placeholder="Escolha a categoria correta" options={categoryOptions} />
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() => void handleCorrect(suggestion)}
                              className="w-full"
                            >
                              Corrigir categoria
                            </Button>
                          </div>
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
                          Rejeitar
                        </Button>
                        <Button
                          type="button"
                          disabled={isSubmitting || !suggestion.suggested_category}
                          onClick={() => void handleAccept(suggestion)}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aceitar sugestão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <SuggestionsPageContent />
    </Suspense>
  );
}
