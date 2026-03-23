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

export async function acceptClassificationSuggestion(id: number) {
  return api(`/api/classification_suggestions/${id}/accept`, {
    method: "POST",
    cache: "no-store",
  }) as Promise<ClassificationSuggestion>;
}

export async function rejectClassificationSuggestion(id: number) {
  return api(`/api/classification_suggestions/${id}/reject`, {
    method: "POST",
    cache: "no-store",
  }) as Promise<ClassificationSuggestion>;
}

export async function correctClassificationSuggestion(id: number, categoryId: number) {
  return api(`/api/classification_suggestions/${id}/correct`, {
    method: "POST",
    body: JSON.stringify({
      classification_suggestion: { category_id: categoryId },
    }),
    cache: "no-store",
  }) as Promise<ClassificationSuggestion>;
}
