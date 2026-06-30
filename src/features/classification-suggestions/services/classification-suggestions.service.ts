import { api } from "@/lib/api";
import type { ClassificationSuggestion } from "@/features/classification-suggestions/types/classification-suggestion.types";

export async function fetchClassificationSuggestions(signal?: AbortSignal) {
  try {
    const data = (await api("/api/classification_suggestions", {
      cache: "no-store",
      signal,
    })) as ClassificationSuggestion[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as ClassificationSuggestion[] };
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
