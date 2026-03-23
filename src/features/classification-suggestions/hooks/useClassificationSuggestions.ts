"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchClassificationSuggestions } from "@/features/classification-suggestions/services/classification-suggestions.service";
import type { ClassificationSuggestion } from "@/features/classification-suggestions/types/classification-suggestion.types";

type UseClassificationSuggestionsParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useClassificationSuggestions({ enabled, onUnauthorized }: UseClassificationSuggestionsParams) {
  const [suggestions, setSuggestions] = useState<ClassificationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchClassificationSuggestions(signal);
        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setSuggestions(result.data);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
        setError("Não foi possível carregar as sugestões.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [onUnauthorized]
  );

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void refetch(controller.signal);
    return () => controller.abort();
  }, [enabled, refetch]);

  return { suggestions, loading, error, refetch };
}
