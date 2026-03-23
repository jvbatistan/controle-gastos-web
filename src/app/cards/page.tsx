"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CreditCard, Landmark, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card as SurfaceCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import { createCard, deleteCard, updateCard, useCards, type Card } from "@/features/cards";
import { useAuth } from "@/lib/useAuth";

const dayOptions = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  return { value: String(day), label: `Dia ${day}` };
});

const initialForm = { name: "", due_day: "15", closing_day: "8", limit: "" };

const cardThemes = [
  {
    solid: "#2563eb",
    panel: "bg-blue-100",
    icon: "text-blue-600",
    gradient: "from-blue-600 via-sky-500 to-cyan-400",
  },
  {
    solid: "#7c3aed",
    panel: "bg-violet-100",
    icon: "text-violet-600",
    gradient: "from-violet-600 via-fuchsia-500 to-purple-400",
  },
  {
    solid: "#0f766e",
    panel: "bg-teal-100",
    icon: "text-teal-700",
    gradient: "from-teal-700 via-emerald-600 to-green-400",
  },
  {
    solid: "#ea580c",
    panel: "bg-orange-100",
    icon: "text-orange-600",
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
  },
  {
    solid: "#db2777",
    panel: "bg-pink-100",
    icon: "text-pink-600",
    gradient: "from-pink-600 via-rose-500 to-red-400",
  },
  {
    solid: "#334155",
    panel: "bg-slate-200",
    icon: "text-slate-700",
    gradient: "from-slate-700 via-slate-600 to-slate-400",
  },
];

function formatLimit(limit: number | null) {
  if (limit == null) return "Sem limite informado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(limit);
}

function cardThemeFor(seed: string) {
  const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % cardThemes.length;
  return cardThemes[index];
}

export default function CardsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { cards, loading, error, refetch } = useCards({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const sortedCards = useMemo(
    () => cards.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [cards]
  );

  const cardsWithLimit = useMemo(
    () => sortedCards.filter((card) => card.limit != null).length,
    [sortedCards]
  );

  const totalLimit = useMemo(
    () => sortedCards.reduce((sum, card) => sum + (card.limit ?? 0), 0),
    [sortedCards]
  );

  const soonestClosingDay = useMemo(() => {
    if (sortedCards.length === 0) return null;
    return Math.min(...sortedCards.map((card) => card.closing_day));
  }, [sortedCards]);

  const previewTheme = cardThemeFor(form.name.trim() || "preview-card");

  function resetForm() {
    setForm(initialForm);
    setEditingCard(null);
    setIsDialogOpen(false);
  }

  function openCreateDialog() {
    setEditingCard(null);
    setForm(initialForm);
    setActionError(null);
    setMessage(null);
    setIsDialogOpen(true);
  }

  function startEdit(card: Card) {
    setEditingCard(card);
    setForm({
      name: card.name,
      due_day: String(card.due_day),
      closing_day: String(card.closing_day),
      limit: card.limit == null ? "" : String(card.limit),
    });
    setActionError(null);
    setMessage(null);
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        due_day: Number(form.due_day),
        closing_day: Number(form.closing_day),
        ...(form.limit.trim() ? { limit: Number(form.limit) } : {}),
      };

      if (editingCard) {
        const result = await updateCard(editingCard.id, payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage(`Cartão "${result.data?.name}" atualizado com sucesso.`);
      } else {
        const result = await createCard(payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage(`Cartão "${result.data?.name}" criado com sucesso.`);
      }

      resetForm();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível salvar o cartão.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(card: Card) {
    const confirmed = window.confirm(`Excluir o cartão "${card.name}"?`);
    if (!confirmed) return;

    setActionError(null);
    setMessage(null);

    try {
      const result = await deleteCard(card.id);
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`Cartão "${card.name}" removido com sucesso.`);
      if (editingCard?.id === card.id) resetForm();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível remover o cartão.");
    }
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
                <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Cartões de Crédito</h1>
                <p className="mt-1 text-sm text-neutral-500 sm:text-base">
                  Cadastre seus cartões e defina corretamente o dia de fechamento e o dia de vencimento.
                </p>
              </div>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Cartão
              </Button>
            </div>

            {message && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
            )}

            {actionError && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>
            )}

            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <SurfaceCard>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Total de Cartões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 sm:text-3xl">{sortedCards.length}</div>
                  <p className="mt-1 text-xs text-neutral-500">{cardsWithLimit} com limite informado</p>
                </CardContent>
              </SurfaceCard>

              <SurfaceCard>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Limite Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 sm:text-3xl">{formatLimit(totalLimit)}</div>
                  <p className="mt-1 text-xs text-neutral-500">Soma dos limites cadastrados no sistema</p>
                </CardContent>
              </SurfaceCard>

              <SurfaceCard>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Próximo Fechamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 sm:text-3xl">{soonestClosingDay ? `Dia ${soonestClosingDay}` : "-"}</div>
                  <p className="mt-1 text-xs text-neutral-500">Menor dia de fechamento entre os cartões cadastrados</p>
                </CardContent>
              </SurfaceCard>
            </div>

            <SurfaceCard>
              <CardHeader>
                <CardTitle>Todos os cartões</CardTitle>
                <p className="mt-1 text-sm text-neutral-500">
                  Ajuste o ciclo de cada cartão com precisão para manter o lançamento das faturas consistente.
                </p>
              </CardHeader>
              <CardContent>
                {sortedCards.length === 0 && !loading ? (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                    <h3 className="mb-2 text-lg font-medium text-neutral-900">Nenhum cartão cadastrado</h3>
                    <p className="mb-4 text-neutral-500">Comece adicionando seu primeiro cartão de crédito.</p>
                    <Button type="button" onClick={openCreateDialog} className="bg-neutral-900 text-white hover:bg-neutral-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cartão
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {sortedCards.map((card) => {
                        const theme = cardThemeFor(`${card.id}-${card.name}`);

                        return (
                          <div key={card.id} className="rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                                  style={{ backgroundColor: theme.solid }}
                                >
                                  <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-lg font-medium text-neutral-900">{card.name}</div>
                                  <div className="text-sm text-neutral-500">Fecha dia {card.closing_day} · Vence dia {card.due_day}</div>
                                </div>
                              </div>
                            </div>
                            <div className="mb-3 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-600">
                              <div className="text-xs uppercase tracking-wide text-neutral-400">Limite</div>
                              <div className="mt-1 text-lg font-medium text-neutral-900">{formatLimit(card.limit)}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => startEdit(card)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => void handleDelete(card)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Cartão</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Ciclo</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Limite</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCards.map((card) => {
                            const theme = cardThemeFor(`${card.id}-${card.name}`);

                            return (
                              <tr key={card.id} className="border-b last:border-0 hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                                      style={{ backgroundColor: theme.solid }}
                                    >
                                      <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-medium text-neutral-900">{card.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">Fecha dia {card.closing_day} · Vence dia {card.due_day}</td>
                                <td className="px-4 py-3 font-medium text-neutral-900">{formatLimit(card.limit)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(card)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => void handleDelete(card)}
                                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </SurfaceCard>
          </div>
        </main>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mx-auto flex min-h-full w-full max-w-xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {editingCard ? "Editar cartão" : "Novo cartão"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Cadastre o dia correto de fechamento e o dia de vencimento para evitar problemas no cálculo da fatura.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={submitting}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5 sm:px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Nome</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      placeholder="Ex: Nubank"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <CalendarDays className="h-4 w-4" />
                        Dia do fechamento
                      </label>
                      <Select value={form.closing_day} onValueChange={(value) => setForm((current) => ({ ...current, closing_day: value }))}>
                        <SelectTriggerHTML placeholder="Selecione o fechamento" options={dayOptions} />
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <CalendarDays className="h-4 w-4" />
                        Dia do vencimento
                      </label>
                      <Select value={form.due_day} onValueChange={(value) => setForm((current) => ({ ...current, due_day: value }))}>
                        <SelectTriggerHTML placeholder="Selecione o vencimento" options={dayOptions} />
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                      <Landmark className="h-4 w-4" />
                      Limite
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={form.limit}
                      onChange={(e) => setForm((current) => ({ ...current, limit: e.target.value }))}
                      placeholder="Ex: 5000"
                    />
                    <p className="text-xs text-neutral-500">Informe o limite total disponível do cartão, se quiser acompanhar isso no sistema.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Preview</label>
                    <div className={`rounded-3xl bg-gradient-to-br ${previewTheme.gradient} p-5 text-white shadow-lg`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-2xl font-bold">{form.name || "Nome do cartão"}</div>
                          <div className="mt-1 text-sm text-white/85">Fecha dia {form.closing_day || "-"} · Vence dia {form.due_day || "-"}</div>
                        </div>
                        <CreditCard className="h-8 w-8 text-white/90" />
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3 text-sm">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-white/95">
                          <CalendarDays className="h-4 w-4" />
                          Ciclo configurado
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-white/95">
                          <Landmark className="h-4 w-4" />
                          {form.limit.trim() ? formatLimit(Number(form.limit)) : "Sem limite informado"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-700">
                      {submitting ? "Salvando..." : editingCard ? "Salvar Alterações" : "Criar Cartão"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
