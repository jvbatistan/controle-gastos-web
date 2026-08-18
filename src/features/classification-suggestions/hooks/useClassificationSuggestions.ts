"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchClassificationSuggestions } from "@/features/classification-suggestions/services/classification-suggestions.service";
import type { ClassificationSuggestion } from "@/features/classification-suggestions/types/classification-suggestion.types";

type UseClassificationSuggestionsParams = {
  page: number;
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useClassificationSuggestions({ page, enabled, onUnauthorized }: UseClassificationSuggestionsParams) {
  const [suggestions, setSuggestions] = useState<ClassificationSuggestion[]>([]);
  const [pagination, setPagination] = useState({ page, per_page: 25, total_count: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchClassificationSuggestions(page, signal);
        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setSuggestions(result.data.suggestions);
        setPagination(result.data.pagination);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
          setSuggestions([]);
          setError("Não foi possível carregar as sugestões.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [onUnauthorized, page]
  );

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void refetch(controller.signal);
    return () => controller.abort();
  }, [enabled, refetch]);

  return { suggestions, pagination, loading, error, refetch };
}
