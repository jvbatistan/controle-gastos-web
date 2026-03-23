"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import {
  CATEGORY_ICON_OPTIONS,
  createCategory,
  deleteCategory,
  getCategoryIconOption,
  updateCategory,
  useCategories,
  type Category,
} from "@/features/categories";
import { useAuth } from "@/lib/useAuth";

const initialForm = { name: "", icon: "pie-chart" };

export default function CategoriesPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const { categories, loading, error, refetch } = useCategories({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });

  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const categoriesWithCustomIcon = useMemo(
    () => sortedCategories.filter((category) => category.icon && category.icon !== "pie-chart").length,
    [sortedCategories]
  );

  const categoriesWithDefaultIcon = sortedCategories.length - categoriesWithCustomIcon;
  const previewOption = getCategoryIconOption(form.icon);
  const PreviewIcon = previewOption.icon;

  function resetForm() {
    setForm(initialForm);
    setEditingCategory(null);
    setIsDialogOpen(false);
  }

  function openCreateDialog() {
    setEditingCategory(null);
    setForm(initialForm);
    setActionError(null);
    setMessage(null);
    setIsDialogOpen(true);
  }

  function startEdit(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      icon: category.icon ?? "pie-chart",
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
        icon: form.icon || undefined,
      };

      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage(`Categoria "${result.data?.name}" atualizada com sucesso.`);
      } else {
        const result = await createCategory(payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage(`Categoria "${result.data?.name}" criada com sucesso.`);
      }

      resetForm();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível salvar a categoria.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Excluir a categoria "${category.name}"?`);
    if (!confirmed) return;

    setActionError(null);
    setMessage(null);

    try {
      const result = await deleteCategory(category.id);
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage(`Categoria "${category.name}" removida com sucesso.`);
      if (editingCategory?.id === category.id) resetForm();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível remover a categoria.");
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
                <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Categorias</h1>
                <p className="mt-1 text-sm text-neutral-500 sm:text-base">
                  Organize as categorias usadas nas transações e nas sugestões de classificação.
                </p>
              </div>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Total de Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 sm:text-3xl">{sortedCategories.length}</div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {categoriesWithCustomIcon} ícones personalizados · {categoriesWithDefaultIcon} padrão
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Com ícone escolhido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 sm:text-3xl">{categoriesWithCustomIcon}</div>
                  <p className="mt-1 text-xs text-neutral-500">Categorias com visual mais específico na interface</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Usando ícone padrão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 sm:text-3xl">{categoriesWithDefaultIcon}</div>
                  <p className="mt-1 text-xs text-neutral-500">Ótimo ponto de partida para deixar tudo mais visual</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Todas as categorias</CardTitle>
                <p className="mt-1 text-sm text-neutral-500">
                  Edite nomes e ícones, e remova o que não estiver mais em uso.
                </p>
              </CardHeader>
              <CardContent>
                {sortedCategories.length === 0 && !loading ? (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
                    Nenhuma categoria cadastrada ainda.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {sortedCategories.map((category) => {
                        const iconOption = getCategoryIconOption(category.icon);
                        const Icon = iconOption.icon;

                        return (
                          <div key={category.id} className="rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconOption.tone}`}>
                                  <Icon className={`h-5 w-5 ${iconOption.iconTone}`} />
                                </div>
                                <div>
                                  <div className="font-medium text-neutral-900">{category.name}</div>
                                  <div className="text-sm text-neutral-500">{iconOption.label}</div>
                                </div>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                Ativa
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => startEdit(category)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => void handleDelete(category)}
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
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Categoria</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Ícone</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCategories.map((category) => {
                            const iconOption = getCategoryIconOption(category.icon);
                            const Icon = iconOption.icon;

                            return (
                              <tr key={category.id} className="border-b last:border-0 hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconOption.tone}`}>
                                      <Icon className={`h-5 w-5 ${iconOption.iconTone}`} />
                                    </div>
                                    <span className="font-medium text-neutral-900">{category.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">{iconOption.label}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    Ativa
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(category)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => void handleDelete(category)}
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
            </Card>
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
                      {editingCategory ? "Editar categoria" : "Nova categoria"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Crie categorias para alinhar o fluxo de classificação e organização das transações.
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
                    <input
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      placeholder="Ex: Transporte"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Ícone</label>
                    <Select value={form.icon} onValueChange={(value) => setForm((current) => ({ ...current, icon: value }))}>
                      <SelectTriggerHTML
                        placeholder="Escolha um ícone"
                        options={CATEGORY_ICON_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                      />
                    </Select>
                    <p className="text-xs text-neutral-500">
                      Selecione um ícone principal para facilitar a visualização da categoria.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Preview</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${previewOption.tone}`}>
                        <PreviewIcon className={`h-6 w-6 ${previewOption.iconTone}`} />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{form.name || "Nome da categoria"}</div>
                        <div className="text-sm text-neutral-500">{previewOption.label}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-700">
                      {submitting ? "Salvando..." : editingCategory ? "Salvar Alterações" : "Criar Categoria"}
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
