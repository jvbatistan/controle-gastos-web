import { api } from "@/lib/api";
import type { ClassificationSuggestion } from "@/features/classification-suggestions/types/classification-suggestion.types";

export async function fetchClassificationSuggestions(page = 1, signal?: AbortSignal) {
  try {
    const data = (await api(`/api/classification_suggestions?page=${page}&per_page=25`, {
      cache: "no-store",
      signal,
    })) as { suggestions: ClassificationSuggestion[]; pagination: { page: number; per_page: number; total_count: number; total_pages: number } };

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: { suggestions: [] as ClassificationSuggestion[], pagination: { page: 1, per_page: 25, total_count: 0, total_pages: 0 } } };
    }
    throw err;
  }
}

export async function rejectClassificationSuggestion(id: number) {
  return api(`/api/classification_suggestions/${id}/reject`, {
    method: "POST",
    cache: "no-store",
  }) as Promise<ClassificationSuggestion>;
}

export async function applyClassificationSuggestion(id: number, categoryId: number, learn: boolean) {
  return api(`/api/classification_suggestions/${id}/apply`, {
    method: "POST",
    body: JSON.stringify({
      category_id: categoryId,
      learn,
    }),
    cache: "no-store",
  }) as Promise<ClassificationSuggestion>;
}
